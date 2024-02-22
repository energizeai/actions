import { env } from "@/env/server.mjs"
import { getAccessToken } from "@/lib/linked-accounts"
import { ActionsRegistry } from "@/registry"
import { ActionIds, TActionId } from "@/registry/_properties/types"
import { linkedAccounts } from "@/server/db/schema"
import { trpcBadRequestError } from "@/trpc/shared"
import { setupActionCaller } from "ai-actions"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const actionsRouter = createTRPCRouter({
  testActionFunction: publicProcedure
    .input(
      z.object({
        inputDataAsString: z.string(),
        actionId: z.nativeEnum(ActionIds),
        userData: z.object({
          email: z.string().email(),
          name: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (env.NODE_ENV !== "development") {
        throw new Error("Only available in development for now")
      }

      const getLinkedAccountForActionId = async (actionId: TActionId) => {
        const linkedAccount = await ctx.db
          .select()
          .from(linkedAccounts)
          .where(eq(linkedAccounts.actionId, actionId))
          .then((res) => res[0])

        if (!linkedAccount) {
          throw new Error("No linked account found for this action")
        }

        return linkedAccount
      }

      const { actionCaller } = setupActionCaller(ActionsRegistry, {
        extras: {
          userData: {
            email: input.userData.email,
            name: input.userData.name,
          },
        },
        async fetchOAuthAccessToken(actionId) {
          const linkedAccount = await getLinkedAccountForActionId(actionId)
          return {
            accessToken: await getAccessToken(linkedAccount),
          }
        },
        async fetchTokenAuthData(actionId) {
          const linkedAccount = await getLinkedAccountForActionId(actionId)
          return {
            accessToken: await getAccessToken(linkedAccount),
            customData: linkedAccount.customData,
          }
        },
      })

      const results = await actionCaller([
        {
          name: ActionsRegistry[input.actionId].getFunctionName(),
          arguments: JSON.parse(input.inputDataAsString),
        },
      ])

      const result = results[0]

      if (!result) {
        throw trpcBadRequestError("No result found")
      }

      if (result.status === "error") {
        throw trpcBadRequestError(result.message)
      }

      if (ActionsRegistry[input.actionId].getOutputSchema() === z.void()) {
        return {
          isSuccess: true,
        } as const
      }

      return {
        isSuccess: true,
        outputDataAsString: JSON.stringify(result.data),
      } as const
    }),
})
