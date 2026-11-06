import { defineMiddleware } from "astro:middleware";

// Poll GitHub for main's latest SHA. When it drifts from the SHA Keystatic
// loaded, auto-reload if the form is clean, or show a banner if it isn't.
// This covers the case where someone else (or a GitHub Action) pushes to
// main while the user has Keystatic open — Keystatic's internal cache
// becomes stale and the next save fails with "path does not exist for
// deletion" errors.
const STALE_DETECT_SCRIPT = `
(function () {
  if (window.__keystaticStaleDetectInstalled) return;
  window.__keystaticStaleDetectInstalled = true;

  const POLL_INTERVAL_MS = 15000;
  const HARD_BLOCK_AFTER_MS = 60000; // 60s stale → force full-screen block
  const REPO_OWNER = "tinahuangtraveller-art";
  const REPO_NAME = "tinahuang-travel";
  const BRANCH = "main";

  let sessionSha = null;
  let authHeader = null;
  let banner = null;
  let blocker = null;
  let polling = false;
  let staleSince = 0;

  function hasUnsavedIndicator() {
    const text = document.body.innerText || "";
    return /\\bUnsaved\\b/.test(text) || text.includes("未儲存");
  }

  function showStaleBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;z-index:9999;" +
      "background:#F2AB47;color:#3D210F;padding:10px 20px;" +
      "font:500 13px/1.4 system-ui;text-align:center;" +
      "box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;";
    banner.innerHTML =
      "⚠️ 遠端 main 已更新，現在存檔會失敗。點此刷新（你未存的改動會不見）";
    banner.addEventListener("click", () => window.location.reload());
    document.body.appendChild(banner);
  }

  function showHardBlock() {
    if (blocker) return;
    blocker = document.createElement("div");
    blocker.style.cssText =
      "position:fixed;inset:0;z-index:999999;" +
      "background:rgba(61,33,15,0.92);color:#FFF8F0;" +
      "display:flex;align-items:center;justify-content:center;" +
      "font:400 15px/1.6 system-ui;padding:20px;backdrop-filter:blur(4px);";
    blocker.innerHTML =
      '<div style="max-width:440px;background:#3D210F;border:2px solid #F2AB47;' +
      'border-radius:16px;padding:28px;text-align:center;">' +
      '<div style="font-size:40px;margin-bottom:12px;">⚠️</div>' +
      '<div style="font-size:18px;font-weight:600;margin-bottom:12px;">Session 已過期超過 1 分鐘</div>' +
      '<div style="opacity:.85;margin-bottom:24px;">' +
      '遠端 main 已有新 commit，你現在存檔一定會失敗（跳 deletion path 錯誤）。<br><br>' +
      '繼續編輯沒意義，要存就必須先刷新。' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-direction:column;">' +
      '<button id="__kreload" style="background:#F2AB47;color:#3D210F;border:none;' +
      'padding:12px 20px;border-radius:999px;font-weight:600;cursor:pointer;font-size:14px;">' +
      '✅ 丟掉未存改動，直接刷新（推薦）</button>' +
      '<button id="__kkeep" style="background:transparent;color:#FFF8F0;border:1px solid #FFF8F0;' +
      'padding:10px 20px;border-radius:999px;cursor:pointer;font-size:13px;opacity:.8;">' +
      '我手動把內容複製下來，之後自己刷新</button>' +
      '</div></div>';
    document.body.appendChild(blocker);
    document.getElementById("__kreload").addEventListener("click", () => window.location.reload());
    document.getElementById("__kkeep").addEventListener("click", () => {
      blocker.remove();
      blocker = null;
      showStaleBanner();
    });
  }

  async function checkSha() {
    if (polling) return;
    if (!sessionSha || !authHeader) return;
    polling = true;
    try {
      const r = await fetch(
        "https://api.github.com/repos/" +
          REPO_OWNER +
          "/" +
          REPO_NAME +
          "/commits/" +
          BRANCH,
        { headers: { Authorization: authHeader, Accept: "application/vnd.github+json" } }
      );
      if (!r.ok) return;
      const data = await r.json();
      const remoteSha = data.sha;
      if (!remoteSha) return;
      if (remoteSha === sessionSha) {
        staleSince = 0;
        return;
      }
      if (staleSince === 0) staleSince = Date.now();
      const staleFor = Date.now() - staleSince;
      console.log(
        "[keystatic-stale] drift detected: session=" +
          sessionSha.slice(0, 7) +
          " remote=" +
          remoteSha.slice(0, 7) +
          " stale for " +
          Math.round(staleFor / 1000) +
          "s"
      );
      if (!hasUnsavedIndicator()) {
        console.log("[keystatic-stale] clean form, auto-reloading");
        window.location.reload();
        return;
      }
      if (staleFor >= HARD_BLOCK_AFTER_MS) {
        showHardBlock();
      } else {
        showStaleBanner();
      }
    } catch (_e) {
      /* network blip, try again next tick */
    } finally {
      polling = false;
    }
  }

  // Capture Keystatic's auth + session SHA by watching every GitHub GraphQL
  // call. The GraphQL responses carry the oid of main, and the request
  // carries the Authorization header. We cache both and start polling.
  const origFetch = window.fetch;
  window.fetch = async function patchedFetch(...args) {
    const req = args[0];
    const init = args[1] || {};
    const url =
      typeof req === "string"
        ? req
        : req && typeof req === "object" && "url" in req
          ? req.url
          : "";

    // Capture auth header (Keystatic sends Bearer <token> to GitHub API)
    if (url && url.includes("api.github.com")) {
      const h = init.headers;
      let auth = null;
      if (h instanceof Headers) auth = h.get("authorization") || h.get("Authorization");
      else if (h && typeof h === "object") auth = h.authorization || h.Authorization;
      if (auth && !authHeader) {
        authHeader = auth;
        if (sessionSha) {
          setInterval(checkSha, POLL_INTERVAL_MS);
          setTimeout(checkSha, 2000);
        }
      }
    }

    const response = await origFetch.apply(this, args);

    // Peek for main SHA in GraphQL responses
    try {
      if (url && url.includes("api.github.com/graphql")) {
        const cloned = response.clone();
        const text = await cloned.text();
        // Grab the first commit.oid pointing to main that we see
        const m = text.match(/"oid"\\s*:\\s*"([a-f0-9]{40})"/);
        if (m && !sessionSha) {
          sessionSha = m[1];
          console.log("[keystatic-stale] session SHA captured: " + sessionSha.slice(0, 7));
          if (authHeader) {
            setInterval(checkSha, POLL_INTERVAL_MS);
            setTimeout(checkSha, 2000);
          }
        }
        // After a successful save, remember the new SHA so we don't treat
        // our own write as drift
        if (text.includes("createCommitOnBranch") && !text.includes('"errors"')) {
          const newOid = text.match(/"commit"\\s*:\\s*{\\s*"oid"\\s*:\\s*"([a-f0-9]{40})"/);
          if (newOid) sessionSha = newOid[1];
        }
      }
    } catch (_e) {
      /* noop */
    }
    return response;
  };
})();
`;

// Reload the Keystatic UI after a successful save mutation, but bail out if
// the user is still typing (Unsaved indicator present).
const AUTO_RELOAD_SCRIPT = `
(function () {
  if (window.__keystaticAutoReloadInstalled) return;
  window.__keystaticAutoReloadInstalled = true;

  const RELOAD_DELAY_MS = 1500;
  const UNSAVED_RECHECK_MS = 300;

  function hasUnsavedIndicator() {
    const text = document.body.innerText || "";
    return /\\bUnsaved\\b/.test(text) || text.includes("未儲存");
  }

  function scheduleReloadIfClean() {
    setTimeout(() => {
      if (hasUnsavedIndicator()) {
        console.log("[keystatic-auto-reload] skipped — user has unsaved edits");
        return;
      }
      console.log("[keystatic-auto-reload] reloading after successful save");
      window.location.reload();
    }, RELOAD_DELAY_MS);
  }

  const origFetch = window.fetch;
  window.fetch = async function patchedFetch(...args) {
    const response = await origFetch.apply(this, args);
    try {
      const req = args[0];
      const url =
        typeof req === "string"
          ? req
          : req && typeof req === "object" && "url" in req
            ? req.url
            : "";
      if (!url || !url.includes("api.github.com/graphql")) return response;

      const cloned = response.clone();
      const text = await cloned.text();
      if (
        text.includes("createCommitOnBranch") &&
        !text.includes('"errors"')
      ) {
        setTimeout(scheduleReloadIfClean, UNSAVED_RECHECK_MS);
      }
    } catch (_e) {
      /* noop */
    }
    return response;
  };
})();
`;

// Intercept Keystatic's <input type="file"> change events, compress any
// jpeg/png files to WebP via canvas, and hand the compressed File back to
// Keystatic before it reads the FileList. This keeps raw originals out of
// git history entirely (vs the CI action which compresses after the fact).
const COMPRESS_SCRIPT = `
(function () {
  if (window.__keystaticCompressInstalled) return;
  window.__keystaticCompressInstalled = true;

  const MAX_WIDTH = 1600;
  const QUALITY = 0.78;
  const RAW_RE = /^image\\/(jpe?g|png)$/i;
  const RAW_EXT_RE = /\\.(jpe?g|png)$/i;

  function showToast(text) {
    let el = document.getElementById("__keystaticToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "__keystaticToast";
      el.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
        "background:#3D210F;color:#FFF8F0;padding:10px 18px;border-radius:999px;" +
        "font:500 13px/1.4 system-ui;z-index:999999;box-shadow:0 4px 16px rgba(0,0,0,.2);" +
        "transition:opacity .3s;";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = "1";
    clearTimeout(el.__hideTimer);
    el.__hideTimer = setTimeout(() => (el.style.opacity = "0"), 2000);
  }

  async function compressToWebp(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY)
    );
    if (!blob) throw new Error("canvas.toBlob returned null");
    const newName = file.name.replace(RAW_EXT_RE, ".webp");
    return new File([blob], newName, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  }

  document.addEventListener(
    "change",
    async (e) => {
      const input = e.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;
      if (input.__keystaticCompressing) return;

      const files = input.files ? Array.from(input.files) : [];
      const needsWork = files.some(
        (f) => RAW_RE.test(f.type) || RAW_EXT_RE.test(f.name)
      );
      if (!needsWork) return;

      // Pause Keystatic's handler, do async compression, then re-dispatch
      // a fresh change event with the compressed file list.
      e.stopImmediatePropagation();
      e.preventDefault();
      input.__keystaticCompressing = true;

      const totalBefore = files.reduce((s, f) => s + f.size, 0);
      showToast(
        files.length === 1
          ? "壓縮中..."
          : "壓縮 " + files.length + " 張圖片中..."
      );

      try {
        const processed = await Promise.all(
          files.map(async (f) => {
            if (RAW_RE.test(f.type) || RAW_EXT_RE.test(f.name)) {
              try {
                return await compressToWebp(f);
              } catch (err) {
                console.warn("[keystatic-compress] failed, keeping original", err);
                return f;
              }
            }
            return f;
          })
        );
        const totalAfter = processed.reduce((s, f) => s + f.size, 0);

        const dt = new DataTransfer();
        processed.forEach((f) => dt.items.add(f));
        input.files = dt.files;

        const kb = (n) => (n / 1024).toFixed(0);
        showToast(
          "壓縮完成：" + kb(totalBefore) + "KB → " + kb(totalAfter) + "KB"
        );

        input.dispatchEvent(new Event("change", { bubbles: true }));
      } finally {
        input.__keystaticCompressing = false;
      }
    },
    true
  );
})();
`;

// EMERGENCY: all injected scripts disabled while investigating why Save
// button triggers no network request. Will re-enable after diagnosis.
export const onRequest = defineMiddleware(async (_context, next) => next());
