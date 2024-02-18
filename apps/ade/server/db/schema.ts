import { TActionId, TAuthType } from "@/registry/_properties/types"
import { sql } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

// ====================
// Linked Accounts
// ====================

// define table
export const linkedAccounts = sqliteTable("linked_accounts", {
  actionId: text("id").$type<TActionId>().primaryKey(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token").notNull(),
  customData: text("text", { mode: "json" }).$type<any>(),
  expiresAt: int("expires_at"),
  authType: text("auth_type").$type<TAuthType>().notNull(),
  scope: text("scope", { length: 255 }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// define types
export type LinkedAccount = typeof linkedAccounts.$inferSelect
export type NewLinkedAccount = typeof linkedAccounts.$inferInsert
export const InsertLinkedAccountSchema = createInsertSchema(linkedAccounts)
export const SelectLinkedAccountSchema = createSelectSchema(linkedAccounts)
