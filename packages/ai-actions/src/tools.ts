import OpenAI from "openai"
import z from "zod"
import {
  TActionCallerInput,
  TActionRegistrySubset,
  TAnyActionRegistry,
  TCallerResults,
  TFunctionCallingArgs,
  ValuesOf,
  setupActionCaller,
} from "."
import { TAnyActionData } from "./action-data"
import { ActionBuilderWithFunction } from "./with-function"

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

    tools.push(action.getChatCompletionTool())
  }

  return tools
}

type TToolCallHandler<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined,
> = (
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
) => Promise<{
  toolCallMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[]
  results: TCallerResults<T, TActionRegistrySubset<T, U>>
}>

type TCreateFewShotToolCallMessages<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined,
> = (
  examples: {
    userMessageContent: string
    tool_calls: ValuesOf<{
      [K in TActionRegistrySubset<TRegistry, U>]: {
        name: ReturnType<TRegistry[K]["getFunctionName"]>
        arguments: z.input<ReturnType<TRegistry[K]["getInputSchema"]>>
      } & (ReturnType<TRegistry[K]["getActionType"]> extends "ECHO"
        ? {}
        : ReturnType<TRegistry[K]["getOutputSchema"]> extends z.ZodVoid
        ? {}
        : { response: z.output<ReturnType<TRegistry[K]["getOutputSchema"]>> })
    }>[]
  }[]
) => OpenAI.Chat.Completions.ChatCompletionMessageParam[]


type TChooseTool<TRegistry extends TAnyActionRegistry, U extends (keyof TRegistry)[] | undefined = undefined> = (
  name: ReturnType<TRegistry[TActionRegistrySubset<TRegistry, U>]["getFunctionName"]>
) => OpenAI.Chat.Completions.ChatCompletionToolChoiceOption;


export const setupFunctionCalling = <
  TActionData extends TAnyActionData,
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
  chooseTool: TChooseTool<T, U>;
  createFewShotToolCallMessages: TCreateFewShotToolCallMessages<T, U>
} => {
  const { inArray } = args

  const actionIds: (keyof T)[] =
    inArray || (Object.keys(registry) as (keyof T)[])

  const validActionIds = new Set(actionIds)

  const functionNameToActionIdMap: Record<string, keyof T> = {}
  for (const actionId of actionIds) {
    const action = registry[actionId]
    if (!action) continue
    functionNameToActionIdMap[action.getFunctionName()] = actionId
  }

  const tools = generateLLMTools(registry, {
    inArray: actionIds,
  })

  const includeErrorsInToolCallMessages =
    args.includeErrorsInToolCallMessages || false

  const toolCallsHandler: TToolCallHandler<T, U> = async (toolCalls) => {
    const { actionCaller } = setupActionCaller(registry, args)

    const results = await actionCaller(
      toolCalls
        .filter((toolCall) => {
          const actionId = functionNameToActionIdMap[toolCall.function.name]
          return actionId && validActionIds.has(actionId)
        })
        .map(
          (toolCall) =>
            ({
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
              id: toolCall.id,
            }) as TActionCallerInput<T, TActionRegistrySubset<T, U>>
        )
    )

    const toolCallMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] =
      []

    for (const result of results) {
      if (result.status === "error" && !includeErrorsInToolCallMessages)
        continue

      const message: OpenAI.Chat.Completions.ChatCompletionToolMessageParam = {
        role: "tool",
        tool_call_id: result.id,
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

  const createFewShotToolCallMessages: TCreateFewShotToolCallMessages<T, U> = (
    examples
  ) => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    for (const example of examples) {
      messages.push({
        role: "user",
        content: example.userMessageContent,
      })

      const generateToolCallId = () => {
        return "call_" + Math.random().toString(36).substring(2, 12)
      }

      const toolCallIds = example.tool_calls.map(() => generateToolCallId())

      messages.push({
        role: "assistant",
        tool_calls: example.tool_calls.map((toolCall, ix) => ({
          id: toolCallIds[ix]!,
          function: {
            name: toolCall.name,
            arguments: JSON.stringify(toolCall.arguments),
          },
          type: "function",
        })),
      })

      for (const [ix, toolCall] of example.tool_calls.entries()) {
        const foundAction = Object.values(registry).find(
          (action) =>
            (action as (typeof registry)[string]).getFunctionName() ===
            toolCall.name
        ) as (typeof registry)[string] | undefined

        if (!foundAction) {
          throw new Error(`Could not find action with name ${toolCall.name}`)
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCallIds[ix]!,
          content:
            "response" in toolCall
              ? JSON.stringify(toolCall.response)
              : foundAction.getActionType() === "ECHO"
                ? JSON.stringify(toolCall.arguments)
                : JSON.stringify({}),
        })
      }
    }

    return messages
  }

  const chooseTool: TChooseTool<T, U> = (name) => {
    if (!actionIds.includes(name as keyof T)) {
      throw new Error(`Action name "${name}" is not allowed.`);
    }
    return {
      type: 'function',
      function: { name: registry[name].getFunctionName() },
    };
  };

  return {
    tools,
    toolCallsHandler,
    createFewShotToolCallMessages,
    chooseTool,
  }
}
