import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    SPOTIFY_CLIENT_ID: z.string().min(1),
    SPOTIFY_CLIENT_SECRET: z.string().min(1),
    OPENAI_KEY: z.string().min(1),
    HELICONE_KEY: z.string().min(1),
    URL: z.string().min(1).default("https://mixmate.vercel.app"),
    SPOTIFY_MIXMATE_ACCESS_TOKEN: z.string().min(1),
    SPOTIFY_MIXMATE_REFRESH_TOKEN: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    OPENAI_KEY: process.env.OPENAI_API_KEY,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    HELICONE_KEY: process.env.HELICONE_KEY,
    URL: process.env.URL,
    SPOTIFY_MIXMATE_ACCESS_TOKEN: process.env.SPOTIFY_MIXMATE_ACCESS_TOKEN,
    SPOTIFY_MIXMATE_REFRESH_TOKEN: process.env.SPOTIFY_MIXMATE_REFRESH_TOKEN,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
});
