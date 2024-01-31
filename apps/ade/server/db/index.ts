import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { once } from "lodash"

const sqlite = new Database("./server/db/sqlite.db")
export const db = drizzle(sqlite)

once(() => {
  console.log("Migrating database...")
  migrate(db, { migrationsFolder: "./server/db/drizzle" })
})()

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type DBType = typeof db
