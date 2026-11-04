import { defineMiddleware } from "astro:middleware";

const AUTO_RELOAD_SCRIPT = `
(function () {
  if (window.__keystaticAutoReloadInstalled) return;
  window.__keystaticAutoReloadInstalled = true;

  const RELOAD_DELAY_MS = 1500;
  const UNSAVED_RECHECK_MS = 300;

  function hasUnsavedIndicator() {
    // Keystatic shows a purple "Unsaved" badge in the editor header when the
    // form is dirty. We check for the exact label — both EN and potential ZH.
    const text = document.body.innerText || "";
    return /\\bUnsaved\\b/.test(text) || text.includes("未儲存");
  }

  function scheduleReloadIfClean() {
    setTimeout(() => {
      // Second check right before reload: if the user started typing again
      // after save, bail out silently.
      if (hasUnsavedIndicator()) {
        console.log(
          "[keystatic-auto-reload] skipped — user has unsaved edits"
        );
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

      // Peek body without consuming the original response.
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

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const url = new URL(context.request.url);

  // Only touch Keystatic UI HTML responses.
  if (!url.pathname.startsWith("/keystatic")) return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const injected = html.includes("</body>")
    ? html.replace(
        "</body>",
        `<script>${AUTO_RELOAD_SCRIPT}</script></body>`
      )
    : html + `<script>${AUTO_RELOAD_SCRIPT}</script>`;

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
