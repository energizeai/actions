import z from "zod"
import { ValuesOf } from "."
import { TAnyRegistryData } from "./action-data"
import { TAuthType } from "./auth"
import {
  ActionBuilderWithFunction,
  TActionDataWithFunction,
} from "./with-function"

type TAnyActionRegistry = Readonly<{
  [key: string]: ActionBuilderWithFunction<any>
}>

export type TActionCallerInput<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined = undefined,
> = ValuesOf<{
  [K in keyof T as U extends undefined
    ? K
    : U extends (keyof T)[]
      ? K extends U[number]
        ? K
        : never
      : never]: {
    actionId: K
    arguments: z.input<ReturnType<T[K]["getInputSchema"]>>
  }
}>

export type TCallerSuccessResult<T extends ActionBuilderWithFunction<any>> = {
  status: "success"
  data: z.output<ReturnType<T["getOutputSchema"]>>
  actionId: ReturnType<T["getId"]>
  inputId: string
}

export type TCallerErrorResult<T extends ActionBuilderWithFunction<any>> = {
  status: "error"
  message: string
  cause?: Error
  actionId: ReturnType<T["getId"]>
  inputId: string
}

type KeySubset<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined = undefined,
> = U extends (keyof T)[] ? U[number] : keyof T

export type TCallerResults<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined = undefined,
> = ValuesOf<{
  [K in KeySubset<T, U>]: TCallerErrorResult<T[K]> | TCallerSuccessResult<T[K]>
}>[]

// infer the function extras needed based on the action registry
type inferExtras<
  TActionData extends TActionDataWithFunction,
  T extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithFunction<TActionData>
  }>,
> =
  ReturnType<ValuesOf<T>["getRegistryData"]> extends infer TRegistry
    ? TRegistry extends TAnyRegistryData
      ? TRegistry["actionFunctionExtrasSchema"] extends infer A
        ? A extends z.AnyZodObject
          ? { extras: z.input<A> }
          : {}
        : {}
      : {}
    : {}

// filter the action registry by the auth type and subset
type filterByAuthType<
  T extends TAnyActionRegistry,
  U extends TAuthType,
  TSubset extends (keyof T)[] | undefined,
  TSuccess,
> = {
  [K in keyof T as ReturnType<T[K]["getAuthConfig"]>["type"] extends U
    ? TSubset extends undefined
      ? K
      : TSubset extends (keyof T)[]
        ? K extends TSubset[number]
          ? K
          : never
        : never
    : never]: TSuccess
}

type TFetchOAuthAccessToken<T> = (
  actionId: T
) => Promise<{ accessToken: string }>

type inferOAuthFunction<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined,
> =
  filterByAuthType<T, "OAuth", U, 1> extends infer A
    ? keyof A extends never
      ? {}
      : {
          fetchOAuthAccessToken: TFetchOAuthAccessToken<keyof A>
        }
    : {}

type TFetchTokenAuthData<T> = (actionId: T) => Promise<{
  accessToken: string
  customData: z.AnyZodObject["_input"]
}>

type inferTokenFunction<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined,
> =
  filterByAuthType<T, "Token", U, 1> extends infer A
    ? keyof A extends never
      ? {}
      : {
          fetchTokenAuthData: TFetchTokenAuthData<keyof A>
        }
    : {}

export type TFunctionCallingArgs<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined = undefined,
> = {
  inArray?: U
  runInParallel?: boolean
} & inferExtras<TActionDataWithFunction, T> &
  inferOAuthFunction<T, U> &
  inferTokenFunction<T, U>

export const setupActionCaller = <
  TActionData extends TActionDataWithFunction,
  const T extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithFunction<TActionData>
  }>,
  U extends (keyof T)[] | undefined = undefined,
>(
  /**
   * The registry of actions.
   */
  registry: T,

  args: TFunctionCallingArgs<T, U>
): {
  /**
   * A function that calls the actions.
   *
   * Returns the results of the actions. Results are in the same order as the inputs and contain the status of the action, the data if the action was successful, and the action ID.
   *
   * @param inputs The inputs to the actions.
   * @returns The results of the actions.
   */
  actionCaller: (
    inputs: TActionCallerInput<T, U>[]
  ) => Promise<TCallerResults<T, U>>
} => {
  const { inArray } = args

  const actionIds: (keyof T)[] =
    inArray || (Object.keys(registry) as (keyof T)[])
  const runInParallel = args.runInParallel || false

  // get the extras
  let funcitonExtras: z.AnyZodObject["_output"] | undefined = undefined
  if (
    "extras" in args &&
    actionIds.length > 0 &&
    registry[actionIds[0]!] &&
    registry[actionIds[0]!]
  ) {
    const funcitonExtrasSchema =
      registry[actionIds[0]!]!.getRegistryData().actionFunctionExtrasSchema
    if (funcitonExtrasSchema) {
      const funcitonExtrasSafe = funcitonExtrasSchema.safeParse(args.extras)
      if (!funcitonExtrasSafe.success) {
        throw new Error(
          `The extras are invalid: ${funcitonExtrasSafe.error.message}`
        )
      }
      funcitonExtras = funcitonExtrasSafe.data
    }
  }

  const actionCaller = async (inputs: TActionCallerInput<T, U>[]) => {
    const results: TCallerResults<T, U> = []
    const promises: Promise<void>[] = []

    const inputIdOrdered: string[] = []
    const actionIdToAuthDataCache: Record<string, unknown> = {}

    for (const input of inputs) {
      const actionId =
        input.actionId as unknown as (typeof results)[number]["actionId"]

      const inputId = Math.random().toString(36).substring(7) // generate a random ID for ordering the results
      inputIdOrdered.push(inputId)

      if (!registry[actionId]) {
        results.push({
          status: "error",
          message: `The action with the ID ${JSON.stringify(actionId)} does not exist.`,
          cause: new Error(
            `The action with the ID ${JSON.stringify(actionId)} does not exist.`
          ),
          actionId,
          inputId,
        })
        continue
      }

      const action = registry[actionId]
      if (!action) continue

      // parse the input
      const submissionSchema = action.getSubmissionSchema()
      const schema = submissionSchema
        ? submissionSchema
        : action.getInputSchema()
      const functionArgs = schema.safeParse(input.arguments)

      // the input is invalid
      if (!functionArgs.success) {
        results.push({
          status: "error",
          cause: functionArgs.error,
          message: functionArgs.error.message,
          actionId,
          inputId,
        })
        continue
      }

      const actionFunction = action.getActionFunction()

      const runActionFunction = async () => {
        try {
          let authData = actionIdToAuthDataCache[actionId as string]
          let authConfig = action.getAuthConfig()

          // if there is no auth data, and the action requires OAuth, fetch the OAuth token
          if (!authData && authConfig.type === "OAuth") {
            if (!("fetchOAuthAccessToken" in args)) {
              results.push({
                status: "error",
                message: `The action with the ID ${JSON.stringify(actionId)} requires OAuth authentication, but no fetchOAuthAccessToken function was provided.`,
                actionId,
                inputId,
              })
              return
            }

            authData = await (
              args.fetchOAuthAccessToken as TFetchOAuthAccessToken<
                typeof actionId
              >
            )(actionId)
          } else if (!authData && authConfig.type === "Token") {
            // if there is no auth data, and the action requires Token, fetch the Token data
            if (!("fetchTokenAuthData" in args)) {
              results.push({
                status: "error",
                message: `The action with the ID ${JSON.stringify(actionId)} requires Token authentication, but no fetchTokenAuthData function was provided.`,
                actionId,
                inputId,
              })
              return
            }

            const tokenData = await (
              args.fetchTokenAuthData as TFetchTokenAuthData<typeof actionId>
            )(actionId)

            // if there is a custom data schema, parse the custom data
            tokenData.customData =
              (authConfig.config.customDataSchema
                ? authConfig.config.customDataSchema.parse(tokenData.customData)
                : tokenData.customData) || null

            authData = tokenData
          }

          // update the cache
          actionIdToAuthDataCache[actionId as string] = authData

          const output = await actionFunction({
            input: functionArgs.data,
            // @ts-expect-error
            auth: authData,
            extras: funcitonExtras,
          })

          const outputSchema = action.getOutputSchema()

          if (outputSchema !== z.void()) {
            const parsed = outputSchema.parse(output)

            results.push({
              status: "success",
              data: parsed,
              actionId,
              inputId,
            })
          } else {
            results.push({
              status: "success",
              data: undefined,
              actionId,
              inputId,
            })
          }
        } catch (error: unknown) {
          results.push({
            status: "error",
            cause: error as Error,
            message:
              error instanceof Object && "message" in error
                ? (error as unknown as { message: string })["message"]
                : "Unknown error",
            actionId,
            inputId,
          })
        }
      }

      if (runInParallel) {
        promises.push(runActionFunction())
        continue
      }

      await runActionFunction()
    }

    if (runInParallel) {
      await Promise.all(promises)
    }

    // sort the results by the input order
    results.sort((a, b) => {
      const aIndex = inputIdOrdered.indexOf(a.inputId)
      const bIndex = inputIdOrdered.indexOf(b.inputId)
      return aIndex - bIndex
    })

    return results
  }

  return {
    actionCaller,
  }
}
