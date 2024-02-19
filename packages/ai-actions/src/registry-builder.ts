import OpenAI from "openai"
import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import { ActionBuilder } from "./action-builder"
import { TActionInput, TActionOnSubmit, TAnyRegistryData } from "./action-data"
import { TAuthType } from "./auth"
import { ActionBuilderWithFunction } from "./with-function"
import { TActionComponent } from "./with-post"

type TActionsRegistry<
  TRegistry extends TAnyRegistryData,
  T extends Array<ActionBuilderWithFunction<TRegistry, any, any, any, any>>,
> = T extends [infer A, ...infer R]
  ? A extends ActionBuilderWithFunction<
      infer TInferRegistry,
      infer Id,
      any,
      any,
      any
    >
    ? R extends ActionBuilderWithFunction<TInferRegistry, any, any, any, any>[]
      ? Readonly<{ [K in Id]: A }> & TActionsRegistry<TInferRegistry, R>
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
    [key: string]: ActionBuilderWithFunction<any, any, any, any, any>
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
    [key: string]: ActionBuilderWithFunction<any, any, any, any, any>
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

type TCreateActionsRegistryFunction<TRegistry extends TAnyRegistryData> = <
  const T extends Array<
    ActionBuilderWithFunction<TRegistry, string, any, any, any, any>
  >,
>(
  registry: T
) => TActionsRegistry<TRegistry, T>

type TCreateActionFunction<TRegistry extends TAnyRegistryData> = <
  TId extends string,
>(
  input: {
    id: TId
  } & (TRegistry["metadataSchema"] extends z.AnyZodObject
    ? { metadata: z.input<TRegistry["metadataSchema"]> }
    : {})
) => ActionBuilder<TRegistry, TId>

type TGenerateFunctionsRet<TRegistry extends TAnyRegistryData> = Readonly<
  {
    [K in TCreateActionsRegistry<
      TRegistry["namespace"]
    >]: TCreateActionsRegistryFunction<TRegistry>
  } & {
    [K in TCreateAction<
      TRegistry["namespace"]
    >]: TCreateActionFunction<TRegistry>
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
  const TRegistry extends TAnyRegistryData,
>(
  args: TRegistry
): TGenerateFunctionsRet<TRegistry> => {
  return {
    [`create${args.namespace}ActionsRegistry`]: <
      const T extends Array<
        ActionBuilderWithFunction<TRegistry, string, any, any, any, any>
      >,
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
      const { metadataSchema, namespace, actionFunctionExtrasSchema } = args
      if (!metadataSchema) {
        return new ActionBuilder({
          id: input.id,
          registryData: {
            namespace: namespace,
            metadataSchema: undefined,
            actionFunctionExtrasSchema: actionFunctionExtrasSchema,
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
          namespace: namespace,
          metadataSchema: metadataSchema,
          actionFunctionExtrasSchema: actionFunctionExtrasSchema,
        },
        metadata: parsed.data,
      })
    },
  } as TGenerateFunctionsRet<TRegistry>
}

const { createActionsRegistry, createAction } = generateActionRegistryFunctions(
  {
    namespace: "",
    metadataSchema: undefined,
    actionFunctionExtrasSchema: undefined,
  }
)

export type inferActionComponent<
  T extends TCreateActionFunction<any>,
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> =
  T extends TCreateActionFunction<infer TRegistry>
    ? TActionComponent<TRegistry["metadataSchema"], TInput, TOnSubmitValues>
    : never

export { createAction, createActionsRegistry }
