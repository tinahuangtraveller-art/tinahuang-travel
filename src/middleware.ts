import { defineMiddleware } from "astro:middleware";

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

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const url = new URL(context.request.url);

  if (!url.pathname.startsWith("/keystatic")) return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const scripts = `<script>${AUTO_RELOAD_SCRIPT}</script><script>${COMPRESS_SCRIPT}</script>`;
  const injected = html.includes("</body>")
    ? html.replace("</body>", scripts + "</body>")
    : html + scripts;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
