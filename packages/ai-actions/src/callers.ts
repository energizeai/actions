import z from "zod"
import { ValuesOf } from "."
import { TAnyActionData, TAnyRegistryData, ValidZodSchema } from "./action-data"
import { TAuthType } from "./auth"
import { ActionBuilderWithFunction } from "./with-function"

type TAnyActionRegistry = Readonly<{
  [key: string]: ActionBuilderWithFunction<any>
}>

export type TActionCallerInput<
  TRegistry extends TAnyActionRegistry,
  TId extends keyof TRegistry,
> = ValuesOf<{
  [K in TId]: {
    name: ReturnType<TRegistry[K]["getFunctionName"]>
    arguments: z.input<ReturnType<TRegistry[K]["getInputSchema"]>>
    id?: string
  }
}>

export interface TCallerSuccessResult<
  TAction extends ActionBuilderWithFunction<any>,
> {
  status: "success"
  data: z.output<ReturnType<TAction["getOutputSchema"]>>
  actionId: ReturnType<TAction["getId"]>
  functionName: ReturnType<TAction["getFunctionName"]>
  id: string
  arguments: z.input<ReturnType<TAction["getInputSchema"]>>
  parsedArguments: z.output<ReturnType<TAction["getInputSchema"]>>
  isSuccess: true
  isError: false

  // for render functions
  $parsedContext?: any
  $auth?: any
}

export interface TCallerErrorResult<
  TAction extends ActionBuilderWithFunction<any>,
> {
  status: "error"
  message: string
  cause?: Error
  actionId: ReturnType<TAction["getId"]>
  data: undefined
  isError: true
  isSuccess: false
  id: string
  failedArguments: z.input<ReturnType<TAction["getInputSchema"]>>
  functionName: ReturnType<TAction["getFunctionName"]>
  failedParsedArguments: z.output<ReturnType<TAction["getInputSchema"]>> | null
}

export type TActionRegistrySubset<
  TRegistry extends TAnyActionRegistry,
  TSubset extends (keyof TRegistry)[] | undefined = undefined,
> = TSubset extends (keyof TRegistry)[] ? TSubset[number] : keyof TRegistry

export type TCallerResults<
  TRegistry extends TAnyActionRegistry,
  TId extends keyof TRegistry,
> = ValuesOf<{
  [K in TId]:
    | TCallerSuccessResult<TRegistry[K]>
    | TCallerErrorResult<TRegistry[K]>
}>[]

// infer the function context needed based on the action registry
type inferContext<
  TActionData extends TAnyActionData,
  T extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithFunction<TActionData>
  }>,
> =
  ReturnType<ValuesOf<T>["getRegistryData"]> extends infer TRegistry
    ? TRegistry extends TAnyRegistryData
      ? TRegistry["actionFunctionContextSchema"] extends infer A
        ? A extends ValidZodSchema
          ? { context: z.input<A> }
          : {}
        : {}
      : {}
    : {}

// filter the action registry by the auth type and subset
type filterByAuthType<
  T extends TAnyActionRegistry,
  U extends TAuthType,
  TId extends keyof T,
  TSuccess,
> = {
  [K in TId as ReturnType<T[K]["getAuthConfig"]>["type"] extends U
    ? K
    : never]: TSuccess
}

/**
 * A function that fetches the OAuth access token for an action.
 *
 * @param actionId The ID of the action to fetch the OAuth access token for.
 * @returns A promise that resolves to the OAuth access token as { accessToken: string }.
 *
 * @throws An error if the OAuth access token could not be fetched.
 *
 * @example
 * ```ts
 * async fetchOAuthAccessToken(actionId) {
 *    ...fetch the OAuth access token...
 *    return {
 *        accessToken: "the access token"
 *    }
 * }
 *
 */
export interface TFetchOAuthAccessToken<T> {
  (actionId: T): Promise<{ accessToken: string }>
}

type inferOAuthFunction<
  TRegistry extends TAnyActionRegistry,
  TId extends keyof TRegistry,
> =
  filterByAuthType<TRegistry, "OAuth", TId, 1> extends infer A
    ? keyof A extends never
      ? {}
      : {
          fetchOAuthAccessToken: TFetchOAuthAccessToken<keyof A>
        }
    : {}

export interface TFetchTokenAuthData<T> {
  (actionId: T): Promise<{
    accessToken: string
    customData: z.AnyZodObject["_input"]
  }>
}

type inferTokenFunction<
  TRegistry extends TAnyActionRegistry,
  TId extends keyof TRegistry,
> =
  filterByAuthType<TRegistry, "Token", TId, 1> extends infer A
    ? keyof A extends never
      ? {}
      : {
          fetchTokenAuthData: TFetchTokenAuthData<keyof A>
        }
    : {}

export interface TActionStarted<
  TRegistry extends TAnyActionRegistry,
  TId extends keyof TRegistry,
> {
  (
    result: Pick<
      TCallerSuccessResult<TRegistry[TId]>,
      "actionId" | "arguments" | "functionName" | "id"
    > & {
      timestamp: number
    }
  ): void
}

export interface TActionFinished<
  TRegistry extends TAnyActionRegistry,
  TId extends keyof TRegistry,
> {
  (
    result: TCallerResults<TRegistry, TId>[number] & {
      timestamp: number
    }
  ): void
}

export type TFunctionCallingArgs<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined = undefined,
> = {
  inArray?: U
  runInParallel?: boolean
  mode?: "renderFunction" | "actionFunction"
  onActionExecutionStarted?: TActionStarted<
    TRegistry,
    TActionRegistrySubset<TRegistry, U>
  >
  onActionExecutionFinished?: TActionFinished<
    TRegistry,
    TActionRegistrySubset<TRegistry, U>
  >
} & inferContext<TAnyActionData, TRegistry> &
  inferOAuthFunction<TRegistry, TActionRegistrySubset<TRegistry, U>> &
  inferTokenFunction<TRegistry, TActionRegistrySubset<TRegistry, U>>

interface TActionCaller<
  TActionData extends TAnyActionData,
  TRegistry extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithFunction<TActionData>
  }>,
  U extends (keyof TRegistry)[] | undefined = undefined,
> {
  (
    inputs: TActionCallerInput<TRegistry, TActionRegistrySubset<TRegistry, U>>[]
  ): Promise<TCallerResults<TRegistry, TActionRegistrySubset<TRegistry, U>>>
}

export const setupActionCaller = <
  TActionData extends TAnyActionData,
  const TRegistry extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithFunction<TActionData>
  }>,
  U extends (keyof TRegistry)[] | undefined = undefined,
>(
  /**
   * The registry of actions.
   */
  registry: TRegistry,

  args: TFunctionCallingArgs<TRegistry, U>
): {
  /**
   * A function that calls the actions.
   *
   * Returns the results of the actions. Results are in the same order as the inputs and contain the status of the action, the data if the action was successful, and the action ID.
   *
   * @param inputs The inputs to the actions.
   * @returns The results of the actions.
   */
  actionCaller: TActionCaller<TActionData, TRegistry, U>
} => {
  const { inArray } = args

  const actionIds: (keyof TRegistry)[] =
    inArray || (Object.keys(registry) as (keyof TRegistry)[])

  const functionNameToActionIdMap: Record<string, keyof TRegistry> = {}
  for (const actionId of actionIds) {
    const action = registry[actionId]
    if (!action) continue
    functionNameToActionIdMap[action.getFunctionName()] = actionId
  }

  const validActionIds = new Set(actionIds)

  const runInParallel = args.runInParallel || false
  const mode = args.mode || "actionFunction"
  const onActionExecutionFinished = args.onActionExecutionFinished
  const onActionExecutionStarted = args.onActionExecutionStarted

  // get the context
  let functionContext: ValidZodSchema["_output"] | undefined = undefined
  if (
    "context" in args &&
    actionIds.length > 0 &&
    registry[actionIds[0]!] &&
    registry[actionIds[0]!]
  ) {
    const funcitonContextSchema =
      registry[actionIds[0]!]!.getRegistryData().actionFunctionContextSchema
    if (funcitonContextSchema) {
      const funcitonContextSafe = funcitonContextSchema.safeParse(args.context)
      if (!funcitonContextSafe.success) {
        throw new Error(
          `The context is invalid: ${funcitonContextSafe.error.message}`
        )
      }
      functionContext = funcitonContextSafe.data
    }
  }

  type ActionCaller = TActionCaller<TActionData, TRegistry, U>

  const actionCaller: ActionCaller = async (inputs) => {
    const results: Awaited<ReturnType<ActionCaller>> = []
    const promises: Promise<void>[] = []

    const inputIdOrdered: string[] = []
    const actionIdToAuthDataCache: Record<string, unknown> = {}

    for (const input of inputs) {
      const functionName = input.name
      const actionId = functionNameToActionIdMap[
        functionName
      ] as (typeof results)[number]["actionId"]

      // ignore the input if the action ID is not valid
      if (!actionId || !validActionIds.has(actionId)) {
        continue
      }

      const inputId = input.id || Math.random().toString(36).substring(7)
      inputIdOrdered.push(inputId)

      if (!registry[actionId]) {
        continue
      }

      const action = registry[actionId]
      if (!action) continue

      // parse the input
      const schema = action.getInputSchema()
      const functionArgs = schema.safeParse(input.arguments)

      // the input is invalid
      if (!functionArgs.success) {
        results.push({
          status: "error",
          cause: functionArgs.error,
          message: functionArgs.error.message,
          actionId,
          functionName,
          id: inputId,
          failedArguments: input.arguments,
          failedParsedArguments: null,
          isError: true,
          isSuccess: false,
          data: undefined,
        })
        continue
      }

      const actionFunction = action.getActionFunction()

      const runActionFunction = async () => {
        if (onActionExecutionStarted) {
          onActionExecutionStarted({
            actionId,
            functionName,
            arguments: input.arguments,
            id: inputId,
            timestamp: Date.now(),
          })
        }

        const getResult: () => Promise<(typeof results)[number]> = async () => {
          try {
            let authData = actionIdToAuthDataCache[actionId as string]
            let authConfig = action.getAuthConfig()

            // if there is no auth data, and the action requires OAuth, fetch the OAuth token
            if (!authData && authConfig.type === "OAuth") {
              if (!("fetchOAuthAccessToken" in args)) {
                return {
                  status: "error",
                  message: `The action with the ID ${JSON.stringify(actionId)} requires OAuth authentication, but no fetchOAuthAccessToken function was provided.`,
                  actionId,
                  functionName,
                  isError: true,
                  isSuccess: false,
                  data: undefined,
                  id: inputId,
                  failedArguments: input.arguments,
                  failedParsedArguments: functionArgs.data,
                }
              }

              authData = await (
                args.fetchOAuthAccessToken as TFetchOAuthAccessToken<
                  typeof actionId
                >
              )(actionId)
            } else if (!authData && authConfig.type === "Token") {
              // if there is no auth data, and the action requires Token, fetch the Token data
              if (!("fetchTokenAuthData" in args)) {
                return {
                  status: "error",
                  message: `The action with the ID ${JSON.stringify(actionId)} requires Token authentication, but no fetchTokenAuthData function was provided.`,
                  actionId,
                  functionName,
                  id: inputId,
                  failedArguments: input.arguments,
                  failedParsedArguments: functionArgs.data,
                  isError: true,
                  isSuccess: false,
                  data: undefined,
                }
              }

              const tokenData = await (
                args.fetchTokenAuthData as TFetchTokenAuthData<typeof actionId>
              )(actionId)

              // if there is a custom data schema, parse the custom data
              tokenData.customData =
                (authConfig.config.customDataSchema
                  ? authConfig.config.customDataSchema.parse(
                      tokenData.customData
                    )
                  : tokenData.customData) || null

              authData = tokenData
            }

            // update the cache
            actionIdToAuthDataCache[actionId as string] = authData

            /**
             * If the mode is "renderFunction", return the parsed arguments and the auth data
             * We will deal with actually calling the action function in the render function
             */
            if (mode === "renderFunction") {
              return {
                status: "success",
                data: undefined,
                actionId,
                id: inputId,
                isSuccess: true,
                isError: false,
                functionName,
                parsedArguments: functionArgs.data,
                $parsedContext: functionContext,
                $auth: authData,
                arguments: input.arguments,
              }
            }

            const output = await actionFunction({
              input: functionArgs.data,
              // @ts-expect-error
              auth: authData,
              context: functionContext,
            })

            const outputSchema = action.getOutputSchema()

            return {
              status: "success",
              data:
                outputSchema === z.void()
                  ? undefined
                  : outputSchema.parse(output),
              actionId,
              id: inputId,
              isSuccess: true,
              isError: false,
              functionName,
              parsedArguments: functionArgs.data,
              arguments: input.arguments,
            }
          } catch (error: unknown) {
            return {
              status: "error",
              cause: error as Error,
              message:
                error instanceof Object && "message" in error
                  ? (error as unknown as { message: string })["message"]
                  : "Unknown error",
              actionId,
              isError: true,
              isSuccess: false,
              data: undefined,
              id: inputId,
              functionName,
              failedParsedArguments: functionArgs.data,
              failedArguments: input.arguments,
            }
          }
        }

        const result = await getResult()

        if (onActionExecutionFinished) {
          onActionExecutionFinished({ ...result, timestamp: Date.now() } as any)
        }

        results.push(result)

        return
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
      const aIndex = inputIdOrdered.indexOf(a.id)
      const bIndex = inputIdOrdered.indexOf(b.id)
      return aIndex - bIndex
    })

    return results
  }

  return {
    actionCaller,
  }
}
