import z from "zod"
import { ActionBuilder, TActionBuilderConstructorData } from "./action-builder"
import { TAnyRegistryData, ValidZodSchema } from "./action-data"
import { ActionBuilderWithHandler } from "./with-handler"

export interface TActionsArray<TRegistry extends TAnyRegistryData>
  extends Array<
    ReturnType<ActionBuilderWithHandler<any>["registryData"]> extends TRegistry
      ? ActionBuilderWithHandler<any>
      : never
  > {}

type inferId<T extends TAnyActionRegistry[string]> = T["id"]

type TActionsRegistry<
  TRegistry extends TAnyRegistryData,
  T extends TActionsArray<TRegistry>,
> = {
  [K in T[number] as K["registryData"] extends TRegistry
    ? inferId<K>
    : never]: K
}

export interface TAnyActionRegistry
  extends Readonly<{
    [key: string]: ActionBuilderWithHandler<any>
  }> {}

// string literal for the create actions registry function
type TCreateActionsRegistry<TRegistry extends TAnyRegistryData> =
  `create${TRegistry["namespace"]}ActionsRegistry`

// string literal for the create action function
type TCreateAction<TRegistry extends TAnyRegistryData> =
  `create${TRegistry["namespace"]}Action`

// function to create an action registry
export interface TCreateActionsRegistryFunction<
  TRegistry extends TAnyRegistryData,
> {
  <const T extends TActionsArray<TRegistry>>(
    registry: T
  ): TActionsRegistry<TRegistry, T>
}

// function to create an action
export interface TCreateActionFunction<TRegistry extends TAnyRegistryData> {
  <TId extends string, TFunctionName extends string = TId>(
    input: {
      id: TId
      functionName?: TFunctionName
    } & (TRegistry["metadataSchema"] extends ValidZodSchema
      ? { metadata: z.input<TRegistry["metadataSchema"]> }
      : {})
  ): ActionBuilder<TActionBuilderConstructorData<TRegistry, TId, TFunctionName>>
}

// return type for the generated functions
type TGenerateFunctionsRet<TRegistry extends TAnyRegistryData> = Readonly<
  {
    [K in TCreateActionsRegistry<TRegistry>]: TCreateActionsRegistryFunction<TRegistry>
  } & {
    [K in TCreateAction<TRegistry>]: TCreateActionFunction<TRegistry>
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
  const TRegistry extends TAnyRegistryData,
>(
  args: TRegistry
): TGenerateFunctionsRet<TRegistry> => {
  return {
    [`create${args.namespace}ActionsRegistry`]: <
      const T extends TActionsArray<TRegistry>,
    >(
      registry: T
    ): TActionsRegistry<TRegistry, T> => {
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
      ) as TActionsRegistry<TRegistry, T>
    },
    [`create${args.namespace}Action`]: <
      TId extends string,
      TFunctionName extends string = TId,
    >(input: {
      /**
       * The metadata for the action. This is used to validate the arguments passed to the action.
       */
      metadata: typeof args.metadataSchema extends ValidZodSchema
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
  } as TGenerateFunctionsRet<TRegistry>
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

export type inferActionRegistryInputs<TRegistry extends TAnyActionRegistry> = {
  [K in keyof TRegistry]: z.output<TRegistry[K]["inputSchema"]>
}

export type inferActionRegistryOutputs<TRegistry extends TAnyActionRegistry> = {
  [K in keyof TRegistry]: Awaited<ReturnType<TRegistry[K]["handler"]>>
}

export { type TActionInput, type TActionMetadata } from "./action-data"
export { createAction, createActionsRegistry }
