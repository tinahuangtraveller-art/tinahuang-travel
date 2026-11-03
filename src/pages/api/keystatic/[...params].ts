import type { APIRoute } from "astro";
import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import config from "../../../../keystatic.config";

export const prerender = false;

export const ALL: APIRoute = async (context) => {
  if (import.meta.env.DEV) {
    return new Response(
      "Keystatic admin is disabled in local dev. Use the production URL.",
      { status: 503 }
    );
  }

  const { env } = await import(/* @vite-ignore */ "cloudflare:workers");
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
