import type { APIRoute } from "astro";
// @ts-expect-error - cloudflare:workers is a runtime-only module
import { env } from "cloudflare:workers";
import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import config from "../../../../keystatic.config";

export const prerender = false;

export const ALL: APIRoute = async (context) => {
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
