import z from "zod"
import { ActionBuilder, TActionBuilderConstructorData } from "./action-builder"
import {
  TActionInput,
  TActionMetadata,
  TActionOnSubmit,
  TAnyRegistryData,
} from "./action-data"
import { TAuthType } from "./auth"
import { ActionBuilderWithFunction } from "./with-function"
import { TActionType } from "./with-input"
import { TActionComponent } from "./with-post"

type TActionsArray<TRegistry extends TAnyRegistryData> = Array<
  ReturnType<
    ActionBuilderWithFunction<any>["getRegistryData"]
  > extends TRegistry
    ? ActionBuilderWithFunction<any>
    : never
>

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

/**
 * Filter the action registry by the auth type.
 *
 * @param registry The registry of actions.
 * @param authType The auth type to filter by.
 *
 * @returns The filtered registry of actions.
 */
export const filterActionRegistryByAuthType = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any>
  }>,
  U extends TAuthType,
>(
  registry: T,
  authType: U
): {
  [K in keyof T as ReturnType<T[K]["getAuthConfig"]>["type"] extends U
    ? K
    : never]: T[K]
} => {
  return Object.entries(registry).reduce((acc, [id, action]) => {
    if (action.getAuthConfig().type === authType) {
      acc[id] = action
    }
    return acc
  }, {} as any)
}

export const generateActionIdMap = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any>
  }>,
>(
  registry: T
): Readonly<{ [K in keyof T]: K }> => {
  return Object.freeze(
    Object.keys(registry).reduce((acc, id) => ({ ...acc, [id]: id }), {})
  ) as Readonly<{ [K in keyof T]: K }>
}

/**
 * Filter the action registry by the action type.
 *
 * @param registry The registry of actions.
 * @param authType The auth type to filter by.
 *
 * @returns The filtered registry of actions.
 */
export const filterActionRegistryByActionType = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any>
  }>,
  U extends TActionType,
>(
  registry: T,
  actionType: U
): {
  [K in keyof T as U extends "POST"
    ? ReturnType<T[K]["getOutputSchema"]> extends z.ZodVoid
      ? K
      : never
    : ReturnType<T[K]["getOutputSchema"]> extends z.AnyZodObject
      ? K
      : never]: T[K]
} => {
  return Object.entries(registry).reduce((acc, [id, action]) => {
    if (actionType === "GET" && action.getOutputSchema() === z.void()) {
      acc[id] = action
    } else if (actionType === "POST" && action.getOutputSchema() !== z.void()) {
      acc[id] = action
    }
    return acc
  }, {} as any)
}

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
    ? TMetadataSchema extends TActionMetadata
      ? <TId extends string>(
          input: {
            id: TId
          } & (TMetadataSchema extends z.AnyZodObject
            ? { metadata: z.input<TMetadataSchema> }
            : {})
        ) => ActionBuilder<TActionBuilderConstructorData<TRegistry, TId>>
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
 *   actionFunctionExtras: z.object({
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
      return Object.freeze(
        registry.reduce((acc, action) => {
          const id = action.getId() as TId

          if (acc[id]) {
            throw new Error(`Duplicate action id: ${id}`)
          }

          acc[id] = action
          return acc
        }, {} as any)
      ) as TActionsRegistry<TRegistry, T>
    },
    [`create${args.namespace}Action`]: <TId extends string>(input: {
      /**
       * The metadata for the action. This is used to validate the arguments passed to the action.
       */
      metadata: typeof args.metadataSchema extends z.AnyZodObject
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
    }) => {
      const { metadataSchema, ...rest } = args
      if (!metadataSchema) {
        return new ActionBuilder({
          id: input.id,
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
      })
    },
  } as TGenerateFunctionsRet<TRegistry>
}

// generate default action registry functions
const { createActionsRegistry, createAction } = generateActionRegistryFunctions(
  {
    namespace: "",
    metadataSchema: undefined,
    actionFunctionExtrasSchema: undefined,
    tokenAuthMetadataSchema: undefined,
    oAuthMetadataSchema: undefined,
  }
)

type inferMetadataSchema<T> =
  T extends TCreateActionFunction<infer TRegistry>
    ? TRegistry["metadataSchema"] extends infer TMetadata
      ? TMetadata extends TActionMetadata
        ? TMetadata
        : never
      : never
    : never

// helper type to infer the action component
export type inferActionComponent<
  T,
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = TActionComponent<inferMetadataSchema<T>, TInput, TOnSubmitValues>

export { createAction, createActionsRegistry }
