import z from "zod"
import { ActionBuilder, TActionBuilderConstructorData } from "./action-builder"
import { TAnyRegistryData } from "./action-data"
import { ActionBuilderWithHandler } from "./with-handler"

export interface TActionsArray<TRegistryData extends TAnyRegistryData>
  extends Array<
    ReturnType<
      ActionBuilderWithHandler<any>["registryData"]
    > extends TRegistryData
      ? ActionBuilderWithHandler<any>
      : never
  > {}

type inferId<T extends TAnyActionRegistry[string]> = T["id"]

type TActionsRegistry<
  TRegistryData extends TAnyRegistryData,
  T extends TActionsArray<TRegistryData>,
> = {
  [K in T[number] as K["registryData"] extends TRegistryData
    ? inferId<K>
    : never]: K
}

export interface TAnyActionRegistry
  extends Readonly<{
    [key: string]: ActionBuilderWithHandler<any>
  }> {}

// string literal for the create actions registry function
type TCreateActionsRegistry<TRegistryData extends TAnyRegistryData> =
  `create${TRegistryData["namespace"]}ActionsRegistry`

// string literal for the create action function
type TCreateAction<TRegistryData extends TAnyRegistryData> =
  `create${TRegistryData["namespace"]}Action`

// function to create an action registry
export interface TCreateActionsRegistryFunction<
  TRegistryData extends TAnyRegistryData,
> {
  <const T extends TActionsArray<TRegistryData>>(
    registry: T
  ): TActionsRegistry<TRegistryData, T>
}

// function to create an action
export interface TCreateActionFunction<TRegistryData extends TAnyRegistryData> {
  <TId extends string, TFunctionName extends string = TId>(
    input: {
      id: TId
      functionName?: TFunctionName
    } & (TRegistryData["metadataSchema"] extends z.ZodType<any>
      ? { metadata: z.input<TRegistryData["metadataSchema"]> }
      : {})
  ): Omit<
    ActionBuilder<
      TActionBuilderConstructorData<TRegistryData, TId, TFunctionName>
    >,
    "_actionData" | "_description"
  >
}

// return type for the generated functions
type TGenerateFunctionsRet<TRegistryData extends TAnyRegistryData> = Readonly<
  {
    [K in TCreateActionsRegistry<TRegistryData>]: TCreateActionsRegistryFunction<TRegistryData>
  } & {
    [K in TCreateAction<TRegistryData>]: TCreateActionFunction<TRegistryData>
  }
>

/**
 * Generate the functions to create an action registry.
 *
 * @param args The arguments to generate the functions.
 * @returns The functions to create an action registry.
 *
 * @example
 * ```
 * const { createADEActionsRegistry, createADEAction } = generateActionRegistryFunctions({
 *   namespace: "ADE",
 *   metadataSchema: z.object({
 *     title: z.string(),
 *     description: z.string(),
 *   }),
 *   handlerContextSchema: z.object({
 *     userData: z.object({
 *       email: z.string().email(),
 *       name: z.string(),
 *     })
 *   }),
 * })
 * ```
 */
export const generateActionRegistryFunctions = <
  const TRegistryData extends TAnyRegistryData,
>(
  args: TRegistryData
): TGenerateFunctionsRet<TRegistryData> => {
  return {
    [`create${args.namespace}ActionsRegistry`]: <
      const T extends TActionsArray<TRegistryData>,
    >(
      registry: T
    ): TActionsRegistry<TRegistryData, T> => {
      type TId = T[number]["id"]
      const seenFunctionNames = new Set<string>()

      return Object.freeze(
        registry.reduce((acc, action) => {
          const id = action.id as TId

          if (acc[id]) {
            throw new Error(`Duplicate action id: ${id}`)
          }

          if (seenFunctionNames.has(action.functionName)) {
            throw new Error(`Duplicate function name: ${action.functionName}`)
          }

          seenFunctionNames.add(action.functionName)

          acc[id] = action
          return acc
        }, {} as any)
      ) as TActionsRegistry<TRegistryData, T>
    },
    [`create${args.namespace}Action`]: <
      TId extends string,
      TFunctionName extends string = TId,
    >(input: {
      /**
       * The metadata for the action. This is used to validate the arguments passed to the action.
       */
      metadata: typeof args.metadataSchema extends z.ZodType<any>
        ? z.input<typeof args.metadataSchema>
        : never
      /**
       * The unique identifier for the action. This is used to reference the action in the registry.
       *
       * Guidelines for Creating IDs:
       * Prefix with Service: Start with a prefix that identifies the service (e.g., Google, Bing).
       * Action Description: Follow the service prefix with a short, descriptive action name.
       * Use Hyphens: Separate words with hyphens (e.g., google-searchEmailInbox).
       * Use Camel Case: Use camel case for action names (e.g., google-searchEmailInbox).
       *
       * @example
       * ```
       * id: "google-searchEmailInbox"
       * ```
       */
      id: TId

      /**
       * The name of the function to call for the action. This is used to reference the function in the registry.
       *
       * If you don't provide a function name, the action id will be used as the function name.
       *
       * @example
       * ```
       * functionName: "searchEmailInbox"
       * ```
       */
      functionName?: TFunctionName
    }) => {
      const { metadataSchema, ...rest } = args
      if (!metadataSchema) {
        return new ActionBuilder({
          id: input.id,
          functionName: input.functionName || input.id,
          registryData: {
            metadataSchema: undefined,
            ...rest,
          },
          metadata: undefined,
        })
      }

      const parsed = metadataSchema.safeParse(input.metadata)
      if (!parsed.success) {
        throw new Error(parsed.error.message)
      }

      return new ActionBuilder({
        id: input.id,
        registryData: {
          metadataSchema: metadataSchema,
          ...rest,
        },
        metadata: parsed.data,
        functionName: input.functionName || input.id,
      })
    },
  } as TGenerateFunctionsRet<TRegistryData>
}

// generate default action registry functions
const { createActionsRegistry, createAction } = generateActionRegistryFunctions(
  {
    namespace: "",
    metadataSchema: undefined,
    handlerContextSchema: undefined,
    tokenAuthMetadataSchema: undefined,
    oAuthMetadataSchema: undefined,
  }
)

/**
 * Helper type to infer the inputs of actions
 */
export type inferActionRegistryInputs<TRegistry extends TAnyActionRegistry> = {
  [K in keyof TRegistry]: z.input<TRegistry[K]["inputSchema"]>
}

/**
 * Helper type to infer the outputs of actions
 */
export type inferActionRegistryOutputs<TRegistry extends TAnyActionRegistry> = {
  [K in keyof TRegistry]: Awaited<ReturnType<TRegistry[K]["handler"]>>
}

/**
 * Helper type to infer the additional parameters of actions
 */
export type inferActionRegistryAdditionalParams<
  TRegistry extends TAnyActionRegistry,
> = {
  [K in keyof TRegistry as TRegistry[K]["additionalParamsSchema"] extends undefined
    ? never
    : K]: z.input<TRegistry[K]["additionalParamsSchema"]>
}

/**
 * Helper type to infer the context of actions
 */
export type inferActionRegistryContext<TRegistry extends TAnyActionRegistry> =
  TRegistry[keyof TRegistry]["registryData"]["handlerContextSchema"] extends undefined
    ? undefined
    : z.infer<
        TRegistry[keyof TRegistry]["registryData"]["handlerContextSchema"]
      >

/**
 * Helper type to infer the auth of actions
 */
export type inferActionRegistryAuth<TRegistry extends TAnyActionRegistry> = {
  [K in keyof TRegistry]: TRegistry[K]["auth"]
}

export { type TActionInput, type TActionMetadata } from "./action-data"
export { createAction, createActionsRegistry }
