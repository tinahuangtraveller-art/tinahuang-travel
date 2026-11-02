import type { APIRoute } from "astro";
import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
import config from "../../../../keystatic.config";

export const prerender = false;

export const ALL: APIRoute = async (context) => {
  const env = (context.locals as any)?.runtime?.env ?? {};
  const handler = makeGenericAPIRouteHandler(
    {
      config,
      clientId: env.KEYSTATIC_GITHUB_CLIENT_ID,
      clientSecret: env.KEYSTATIC_GITHUB_CLIENT_SECRET,
      secret: env.KEYSTATIC_SECRET,
    },
    { slugEnvName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG" }
  );
  const { body, status, headers } = await handler(context.request);
  return new Response(body, { status, headers: headers as HeadersInit });
};
