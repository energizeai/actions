import { env } from "@/env/server.mjs"
import { getAccessToken } from "@/lib/linked-accounts"
import { ActionsRegistry } from "@/registry"
import { ActionIds, TActionId } from "@/registry/_properties/types"
import { isClientAction } from "@/registry/client"
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
        localTimeZone: z.string(),
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
        context: {
          userData: {
            email: input.userData.email,
            name: input.userData.name,
          },
          localTimeZone: input.localTimeZone,
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
          name: ActionsRegistry[input.actionId].functionName,
          arguments: JSON.parse(input.inputDataAsString),
        },
      ])

      console.log(results)

      const result = results[0]

      if (!result) {
        throw trpcBadRequestError("No result found")
      }

      if (result.status === "error") {
        throw trpcBadRequestError(result.message)
      }

      if (isClientAction(input.actionId)) {
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
