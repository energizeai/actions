import { env } from "@/env/server.mjs"
import { getRevokeEndpoint } from "@/lib/oauth"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { InsertLinkedAccountSchema, linkedAccounts } from "@/server/db/schema"
import { extractErrorMessage, trpcBadRequestError } from "@/trpc/shared"
import { AuthType, ValuesOf } from "ai-actions"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const linkedAccountsRouter = createTRPCRouter({
  createLinkedAccountForTokenAuth: publicProcedure
    .input(
      InsertLinkedAccountSchema.extend({
        actionId: z.enum(
          Object.keys(ActionsRegistry) as [TActionId, ...TActionId[]]
        ),
        authType: z.nativeEnum(AuthType),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (env.NODE_ENV !== "development") {
        throw trpcBadRequestError("Only available in development for now")
      }

      // validate custom data
      const authConfig = ActionsRegistry[input.actionId].auth
      if (
        authConfig.type === AuthType.TOKEN &&
        authConfig.config.customDataSchema
      ) {
        try {
          authConfig.config.customDataSchema.parse(input.customData)
        } catch (e) {
          throw trpcBadRequestError(
            "Invalid custom data: " + extractErrorMessage(e)
          )
        }

        if (authConfig.config.validateToken) {
          const result = await authConfig.config.validateToken({
            auth: {
              accessToken: input.accessToken,
              // @ts-expect-error
              customData: input.customData,
            },
          })

          if (!result.isValid) {
            throw trpcBadRequestError("Invalid token: FAILED VERIFICATION")
          }
        }
      }

      // insert
      await ctx.db
        .insert(linkedAccounts)
        .values({
          ...input,
          actionId: input.actionId as TActionId,
          authType: input.authType as ValuesOf<typeof AuthType>,
        })
        .onConflictDoUpdate({
          target: linkedAccounts.actionId,
          set: {
            ...input,
          },
        })

      return { success: true }
    }),
  deleteLinkedAccount: publicProcedure
    .input(
      z.object({
        actionId: z.enum(
          Object.keys(ActionsRegistry) as [TActionId, ...TActionId[]]
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (env.NODE_ENV !== "development") {
        throw trpcBadRequestError("Only available in development for now")
      }

      const foundLinkedAccount = await ctx.db
        .select()
        .from(linkedAccounts)
        .where(eq(linkedAccounts.actionId, input.actionId))
        .then((res) => res[0])

      if (!foundLinkedAccount) {
        throw trpcBadRequestError("No linked account found for this action")
      }

      await ctx.db
        .delete(linkedAccounts)
        .where(eq(linkedAccounts.actionId, input.actionId))

      const action = ActionsRegistry[input.actionId]
      const authConfig = action.auth

      // if not OAuth, we're done
      if (authConfig.type !== AuthType.OAUTH) {
        return { success: true }
      }

      const revokeEndpoint = await getRevokeEndpoint(authConfig)

      // if no revoke endpoint, we're done
      if (!revokeEndpoint) {
        return { success: true }
      }

      // revoke the token
      await fetch(revokeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          token: foundLinkedAccount.accessToken,
        }),
      })

      return { success: true }
    }),
})
