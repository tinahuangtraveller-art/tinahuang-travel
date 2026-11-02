import type { APIRoute } from "astro";
// @ts-expect-error - cloudflare:workers is a runtime-only module
import { env } from "cloudflare:workers";
import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import config from "../../../../keystatic.config";

export const prerender = false;

export const ALL: APIRoute = async (context) => {
  console.log("[keystatic-api] env keys:", Object.keys(env || {}));
  console.log("[keystatic-api] has CLIENT_ID:", !!(env as any)?.KEYSTATIC_GITHUB_CLIENT_ID);
  console.log("[keystatic-api] has CLIENT_SECRET:", !!(env as any)?.KEYSTATIC_GITHUB_CLIENT_SECRET);
  console.log("[keystatic-api] has SECRET:", !!(env as any)?.KEYSTATIC_SECRET);
  console.log("[keystatic-api] has APP_SLUG:", !!(env as any)?.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);

  const handler = makeGenericAPIRouteHandler(
    {
      config,
      clientId: (env as any)?.KEYSTATIC_GITHUB_CLIENT_ID,
      clientSecret: (env as any)?.KEYSTATIC_GITHUB_CLIENT_SECRET,
      secret: (env as any)?.KEYSTATIC_SECRET,
    },
    { slugEnvName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG" }
  );
  const { body, status, headers } = await handler(context.request);
  return new Response(body, { status, headers: headers as HeadersInit });
};
