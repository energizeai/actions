import { createTRPCRouter } from "@/server/api/trpc"
import { actionsRouter } from "./routers/actions"
import { linkedAccountsRouter } from "./routers/linked-accounts"
import { pingRouter } from "./routers/ping"
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ping: pingRouter,
  actions: actionsRouter,
  linkedAccounts: linkedAccountsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
