import { createRequestHandler } from "react-router";
import { appRouter } from "../app/trpc/router";
import { createCallerFactory, createTRPCContext } from "../app/trpc";
import { createAuth, type Auth } from "@/auth/server";
import { createGeminiClient } from "@/lib/gemini";
import type { GenerativeModel } from "@google/generative-ai";

const createCaller = createCallerFactory(appRouter);

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    trpc: ReturnType<typeof createCaller>;
    auth: Auth;
    gemini: GenerativeModel | null;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export { ExampleWorkflow } from "../workflows/example";

export default {
  async fetch(request, env, ctx) {
    const trpcContext = await createTRPCContext({
      headers: request.headers,
      cfContext: env,
    });

    const trpcCaller = createCaller(trpcContext);

    // Create Gemini client if API key is configured
    const gemini = env.GEMINI_API_KEY
      ? createGeminiClient(env.GEMINI_API_KEY)
      : null;

    return requestHandler(request, {
      cloudflare: { env, ctx },
      trpc: trpcCaller,
      auth: await createAuth(env.DATABASE, env.BETTER_AUTH_SECRET),
      gemini,
    });
  },
} satisfies ExportedHandler<Env>;
