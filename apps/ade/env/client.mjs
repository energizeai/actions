import { createEnv } from "@t3-oss/env-nextjs";
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
  },
  shared: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .optional()
      .default('development'),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  }
})
