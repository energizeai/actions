import z from "zod"
import { ActionBuilder, TActionBuilderConstructorData } from "./action-builder"
import {
  TActionMetadata,
  TAnyRegistryData,
  ValidZodSchema,
} from "./action-data"
import { ActionBuilderWithFunction } from "./with-function"

interface TActionsArray<TRegistry extends TAnyRegistryData>
  extends Array<
    ReturnType<
      ActionBuilderWithFunction<any>["getRegistryData"]
    > extends TRegistry
      ? ActionBuilderWithFunction<any>
      : never
  > {}

type TActionsRegistry<
  TRegistry extends TAnyRegistryData,
  T extends TActionsArray<TRegistry>,
> = T extends [infer A, ...infer R]
  ? A extends ActionBuilderWithFunction<any>
    ? ReturnType<A["getRegistryData"]> extends infer ARegistryData
      ? ARegistryData extends TRegistry
        ? ReturnType<A["getId"]> extends infer TId
          ? TId extends string
            ? R extends TActionsArray<TRegistry>
              ? Readonly<{ [K in TId]: A }> & TActionsRegistry<TRegistry, R>
              : never
            : never
          : never
        : never
      : never
    : never
  : Readonly<{}>

export interface TAnyActionRegistry
  extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any>
  }> {}

// string literal for the create actions registry function
type TCreateActionsRegistry<T extends string> = `create${T}ActionsRegistry`

// string literal for the create action function
type TCreateAction<T extends string> = `create${T}Action`

// function to create an action registry
type TCreateActionsRegistryFunction<TRegistry extends TAnyRegistryData> = <
  const T extends TActionsArray<TRegistry>,
>(
  registry: T
) => TActionsRegistry<TRegistry, T>

// function to create an action
type TCreateActionFunction<TRegistry extends TAnyRegistryData> =
  TRegistry["metadataSchema"] extends infer TMetadataSchema
    ? TMetadataSchema extends TActionMetadata | unknown
      ? <TId extends string, TFunctionName extends string = TId>(
          input: {
            id: TId
            functionName?: TFunctionName
          } & (TMetadataSchema extends ValidZodSchema
            ? { metadata: z.input<TMetadataSchema> }
            : {})
        ) => ActionBuilder<
          TActionBuilderConstructorData<TRegistry, TId, TFunctionName>
        >
      : never
    : never

// return type for the generated functions
type TGenerateFunctionsRet<TRegistry extends TAnyRegistryData> =
  TRegistry["namespace"] extends infer TNamespace
    ? TNamespace extends string
      ? Readonly<
          {
            [K in TCreateActionsRegistry<TNamespace>]: TCreateActionsRegistryFunction<TRegistry>
          } & {
            [K in TCreateAction<TNamespace>]: TCreateActionFunction<TRegistry>
          }
        >
      : never
    : never

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
 *   actionFunctionContextSchema: z.object({
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
      type TId = ReturnType<T[number]["getId"]>
      const seenFunctionNames = new Set<string>()

      return Object.freeze(
        registry.reduce((acc, action) => {
          const id = action.getId() as TId

          if (acc[id]) {
            throw new Error(`Duplicate action id: ${id}`)
          }

          if (seenFunctionNames.has(action.getFunctionName())) {
            throw new Error(
              `Duplicate function name: ${action.getFunctionName()}`
            )
          }

          seenFunctionNames.add(action.getFunctionName())

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
    actionFunctionContextSchema: undefined,
    tokenAuthMetadataSchema: undefined,
    oAuthMetadataSchema: undefined,
  }
)

export type inferAcitonMetadataSchema<T> =
  T extends TCreateActionFunction<infer TRegistry>
    ? TRegistry["metadataSchema"] extends infer TMetadata
      ? TMetadata extends TActionMetadata
        ? TMetadata
        : never
      : never
    : never

export { createAction, createActionsRegistry }

export { type TActionInput, type TActionMetadata } from "./action-data"
