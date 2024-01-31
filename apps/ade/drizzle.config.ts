import type { Config } from "drizzle-kit"

export default {
  schema: "./server/db/schema.ts",
  out: "./server/db/drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./server/db/sqlite.db",
  },
  strict: true,
} satisfies Config
