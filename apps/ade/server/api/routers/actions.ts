import { env } from "@/env/server.mjs"
import { getAccessToken } from "@/lib/linked-accounts"
import { linkedAccounts } from "@/server/db/schema"
import { trpcAuthorizationError, trpcBadRequestError } from "@/trpc/shared"
import { ActionsRegistry } from "@energizeai/registry"
import { TActionId } from "@energizeai/registry/types"
import { ActionUserDataSchema } from "@energizeai/types"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

const ActionIds = Object.keys(ActionsRegistry) as [TActionId, ...TActionId[]]

export const actionsRouter = createTRPCRouter({
  testActionFunction: publicProcedure
    .input(
      z.object({
        inputDataAsString: z.string(),
        actionId: z.enum(ActionIds),
        userData: ActionUserDataSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (env.NODE_ENV !== "development") {
        throw new Error("Only available in development for now")
      }

      // get the action
      const action = ActionsRegistry[input.actionId]

      // validate the input
      const inputDataSafe = action
        .getInputSchema()
        .safeParse(JSON.parse(input.inputDataAsString))

      if (!inputDataSafe.success) {
        throw trpcBadRequestError(inputDataSafe.error.message)
      }

      const inputData = inputDataSafe.data

      const authConfig = action.getAuthConfig()

      let accessToken: string | null = null
      let customDataSchema: any = null

      if (authConfig.type !== "None") {
        const linkedAccount = await ctx.db
          .select()
          .from(linkedAccounts)
          .where(eq(linkedAccounts.actionId, input.actionId))
          .then((res) => res[0])

        if (!linkedAccount) {
          throw trpcAuthorizationError(
            "No linked account found for this action"
          )
        }

        // make sure the custom data schema is correct
        if (authConfig.type === "Token" && authConfig.config.customDataSchema) {
          customDataSchema = authConfig.config.customDataSchema.parse(
            linkedAccount.customData
          )
        }

        accessToken = await getAccessToken(linkedAccount)
      }

      const authData =
        authConfig.type === "None"
          ? null
          : {
              accessToken,
              customData: customDataSchema,
            }

      // call the action that doesn't return anything
      if (action.getOutputSchema() instanceof z.ZodVoid) {
        await action.getActionFunction()({
          // TODO: fix this, but it works for now
          // @ts-expect-error
          input: inputData,
          // @ts-expect-error
          auth: authData,
          // @ts-expect-error
          userData: input.userData,
        })

        return {
          isSuccess: true,
        } as const
      }

      // get the output of the action
      const output = await action.getActionFunction()({
        // @ts-expect-error
        input: inputData,
        // @ts-expect-error
        auth: authData,
        // @ts-expect-error
        userData: input.userData,
      })

      return {
        isSuccess: true,
        outputDataAsString: JSON.stringify(
          action.getOutputSchema().parse(output)
        ),
      } as const
    }),
})
