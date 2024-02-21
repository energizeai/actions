import OpenAI from "openai"
import { zodToJsonSchema } from "zod-to-json-schema"
import {
  TActionCallerInput,
  TActionRegistrySubset,
  TCallerResults,
  TFunctionCallingArgs,
  setupActionCaller,
} from "."
import {
  ActionBuilderWithFunction,
  TActionDataWithFunction,
} from "./with-function"

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
    [key: string]: ActionBuilderWithFunction<any>
  }>,
  U extends (keyof T)[] | undefined,
>(
  /**
   * The registry of actions.
   */
  registry: T,
  /**
   * The id(s) of the action(s) to generate tools for. Can be a single id or an array of ids.
   */
  args?: {
    inArray?: U
  }
): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  const registryIds: (keyof T)[] =
    args?.inArray || (Object.keys(registry) as (keyof T)[])

  const seen = new Set()
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = []

  for (const id of registryIds) {
    if (seen.has(id)) continue
    seen.add(id)

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

type TToolCallHandler<
  T extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any>
  }>,
  U extends (keyof T)[] | undefined,
> = (
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
) => Promise<{
  toolCallMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[]
  results: TCallerResults<T, TActionRegistrySubset<T, U>>
}>

export const setupFunctionCalling = <
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

  args: TFunctionCallingArgs<T, U> & {
    /**
     * Whether to include errors in the tool call messages.
     */
    includeErrorsInToolCallMessages?: boolean
  }
): {
  tools: OpenAI.Chat.Completions.ChatCompletionTool[]
  toolCallsHandler: TToolCallHandler<T, U>
} => {
  const { inArray } = args

  const actionIds: (keyof T)[] =
    inArray || (Object.keys(registry) as (keyof T)[])

  const validActionIds = new Set(actionIds)

  const tools = generateLLMTools(registry, {
    inArray: actionIds,
  })

  const includeErrorsInToolCallMessages =
    args.includeErrorsInToolCallMessages || false

  const toolCallsHandler: TToolCallHandler<T, U> = async (toolCalls) => {
    const { actionCaller } = setupActionCaller(registry, args)

    const results = await actionCaller(
      toolCalls
        .filter((toolCall) => validActionIds.has(toolCall.function.name))
        .map(
          (toolCall) =>
            ({
              actionId: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
            }) as TActionCallerInput<T, TActionRegistrySubset<T, U>>
        )
    )

    const toolCallMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] =
      []

    for (const [ix, result] of results.entries()) {
      if (result.status === "error" && !includeErrorsInToolCallMessages)
        continue

      const toolCall = toolCalls[ix]
      if (!toolCall) continue // should never happen

      const message: OpenAI.Chat.Completions.ChatCompletionToolMessageParam = {
        role: "tool",
        tool_call_id: toolCall.id,
        content:
          result.status === "error"
            ? JSON.stringify({
                status: "error",
                message: result.message,
              })
            : JSON.stringify(result.data),
      }

      toolCallMessages.push(message)
    }

    return {
      results,
      toolCallMessages,
    }
  }

  return {
    tools,
    toolCallsHandler,
  }
}
