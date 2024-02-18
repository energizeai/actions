import OpenAI from "openai"
import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import { ActionBuilder } from "./action-builder"
import {
  TActionFunctionExtras,
  TActionInput,
  TActionMetadata,
  TActionOnSubmit,
} from "./action-data"
import { TAuthType } from "./auth"
import { ActionBuilderWithFunction } from "./with-function"
import { TActionComponent } from "./with-post"

type TActionsRegistry<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
  T extends Array<
    ActionBuilderWithFunction<
      any,
      TNamespace,
      TMetadata,
      TExtras,
      any,
      any,
      any,
      any
    >
  >,
> = T extends [infer A, ...infer R]
  ? A extends ActionBuilderWithFunction<
      infer Id,
      TNamespace,
      TMetadata,
      TExtras,
      any,
      any,
      any,
      any
    >
    ? R extends ActionBuilderWithFunction<
        any,
        TNamespace,
        TMetadata,
        TExtras,
        any,
        any,
        any,
        any
      >[]
      ? Readonly<{ [K in Id]: A }> &
          TActionsRegistry<TNamespace, TMetadata, TExtras, R>
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
    [key: string]: ActionBuilderWithFunction<any, any, any, any, any, any, any>
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

/**
 * Given an action registry, generate the tools for the LLM.
 *
 * @param registry The registry of actions.
 * @param toolId The id(s) of the action(s) to generate tools for. Can be a single id or an array of ids.
 *
 * @returns The tools for the LLM. In the format of `OpenAI.Chat.Completions.ChatCompletionTool[]`. The name of the tool is the ID of the action.
 *
 * @example
 */
export const generateLLMTools = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any, any, any, any, any, any, any>
  }>,
  U extends [keyof T, ...(keyof T)[]] | keyof T,
>(
  registry: T,
  toolId: U
): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  type TIds = [keyof T, ...(keyof T)[]]
  const registryIds: TIds = Array.isArray(toolId) ? toolId : ([toolId] as TIds)

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = []

  for (const id of registryIds) {
    const action = registry[id]
    if (!action) continue // should never happen

    const jsonSchema = zodToJsonSchema(action.getInputSchema()) as any
    let description = `${
      jsonSchema["description"] || "No description was provided."
    }`

    delete jsonSchema["$schema"]
    delete jsonSchema["$ref"]
    delete jsonSchema["additionalProperties"]
    delete jsonSchema["description"]

    tools.push({
      type: "function",
      function: {
        name: action.getId(),
        description,
        parameters: jsonSchema,
      },
    })
  }

  return tools
}

type TCreateActionsRegistry<T extends string> = `create${T}ActionsRegistry`
type TCreateAction<T extends string> = `create${T}Action`

type TCreateActionsRegistryFunction<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
> = <
  const T extends Array<
    ActionBuilderWithFunction<
      string,
      TNamespace,
      TMetadata,
      TExtras,
      any,
      any,
      any,
      any
    >
  >,
>(
  registry: T
) => TActionsRegistry<TNamespace, TMetadata, TExtras, T>

type TCreateActionFunction<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
> = <TId extends string>(
  input: {
    id: TId
  } & (TMetadata extends z.AnyZodObject ? { metadata: z.input<TMetadata> } : {})
) => ActionBuilder<TId, TNamespace, TMetadata, TExtras>

type TGenerateFunctionsRet<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
> = Readonly<
  {
    [K in TCreateActionsRegistry<TNamespace>]: TCreateActionsRegistryFunction<
      TNamespace,
      TMetadata,
      TExtras
    >
  } & {
    [K in TCreateAction<TNamespace>]: TCreateActionFunction<
      TNamespace,
      TMetadata,
      TExtras
    >
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
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
>(args: {
  /**
   * The namespace for the actions registry. Useful if you have multiple action registries.
   *
   * @example "ADE"
   */
  namespace: TNamespace
  /**
   * The schema for the metadata of the action. This is used to validate the metadata passed to the action.
   *
   * If you don't have metadata, you can pass `undefined`.
   *
   * @example
   * ```typescript
   * z.object({
   *   title: z.string(),
   *   description: z.string(),
   * })
   * ```
   */
  metadataSchema: TMetadata
  /**
   * Sometimes you may want to pass extra data to each action function (on top of input and auth). This is useful for things like user data, local time zone, etc.
   *
   * If you don't have any extra data, you can pass `undefined`.
   *
   * @example
   * ```typescript
   * z.object({
   *  userData: z.object({
   *   email: z.string().email(),
   *   name: z.string(),
   *  })
   * })
   * ```
   */
  actionFunctionExtras: TExtras
}): TGenerateFunctionsRet<TNamespace, TMetadata, TExtras> => {
  return {
    [`create${args.namespace}ActionsRegistry`]: <
      const T extends Array<
        ActionBuilderWithFunction<
          string,
          TNamespace,
          TMetadata,
          TExtras,
          any,
          any,
          any,
          any
        >
      >,
    >(
      registry: T
    ): TActionsRegistry<TNamespace, TMetadata, TExtras, T> => {
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
      ) as TActionsRegistry<TNamespace, TMetadata, TExtras, T>
    },
    [`create${args.namespace}Action`]: <TId extends string>(input: {
      /**
       * The metadata for the action. This is used to validate the arguments passed to the action.
       */
      metadata: TMetadata extends z.AnyZodObject ? z.input<TMetadata> : never
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
      if (!args.metadataSchema) {
        return new ActionBuilder({
          id: input.id,
          namespace: args.namespace,
          metadata: undefined,
          actionFunctionExtrasSchema: args.actionFunctionExtras,
        })
      }

      const parsed = args.metadataSchema.safeParse(input.metadata)
      if (!parsed.success) {
        throw new Error(parsed.error.message)
      }
      return new ActionBuilder({
        id: input.id,
        namespace: args.namespace,
        metadata: parsed.data,
        actionFunctionExtrasSchema: args.actionFunctionExtras,
      })
    },
  } as TGenerateFunctionsRet<TNamespace, TMetadata, TExtras>
}

const { createActionsRegistry, createAction } = generateActionRegistryFunctions(
  {
    namespace: "",
    metadataSchema: undefined,
    actionFunctionExtras: undefined,
  }
)

export type inferActionComponent<
  T extends TCreateActionFunction<any, any, any>,
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> =
  T extends TCreateActionFunction<any, infer TMetadata, any>
    ? TActionComponent<TMetadata, TInput, TOnSubmitValues>
    : never

export { createAction, createActionsRegistry }
