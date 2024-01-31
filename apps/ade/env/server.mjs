import { createEnv } from "@t3-oss/env-nextjs";
import { z } from 'zod'

export const env = createEnv({
  server: {
    VERCEL_ENV: z
      .enum(['development', 'preview', 'production'])
      .optional()
      .default('development'),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .optional()
      .default('development'),

  },
  runtimeEnv: process.env,
})
