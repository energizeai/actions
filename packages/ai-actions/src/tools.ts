import Anthropic from "@anthropic-ai/sdk"
import {
  ToolUseBlockParam,
  ToolsBetaContentBlock,
  ToolsBetaMessageParam,
} from "@anthropic-ai/sdk/resources/beta/tools/messages.mjs"
import OpenAI from "openai"
import { ChatCompletionTool } from "openai/resources/index.mjs"
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
import { TActionsWithRender, setupActionsWithRender } from "./render"
import { ActionBuilderWithHandler } from "./with-handler"

type TProviderOptions = "openai" | "anthropic" | undefined
type TProviderTools<TProvider extends TProviderOptions> =
  TProvider extends "anthropic"
    ? Anthropic.Beta.Tools.Tool[]
    : ChatCompletionTool[]

type TProviderToolCallMessage<TProvider extends TProviderOptions> =
  TProvider extends "anthropic"
    ? ToolsBetaContentBlock[]
    : OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]

type TProviderToolResultMessages<TProvider extends TProviderOptions> =
  TProvider extends "anthropic"
    ? ToolsBetaMessageParam[]
    : OpenAI.Chat.Completions.ChatCompletionToolMessageParam[]

type TProviderMessages<TProvider extends TProviderOptions> =
  TProvider extends "anthropic"
    ? ToolsBetaMessageParam[]
    : OpenAI.Chat.Completions.ChatCompletionMessageParam[]

/**
 * Given an action registry, generate the tools for the LLM.
 */
export const generateLLMTools = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithHandler<any>
  }>,
  U extends (keyof T)[] | undefined,
  TProvider extends TProviderOptions = undefined,
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
    provider?: TProvider
  }
): TProviderTools<TProvider> => {
  const registryIds: (keyof T)[] =
    args?.inArray || (Object.keys(registry) as (keyof T)[])

  const seen = new Set()
  const tools: TProviderTools<TProvider> = []

  for (const id of registryIds) {
    if (seen.has(id)) continue
    seen.add(id)

    const action = registry[id]
    if (!action) continue // should never happen

    if (args?.provider === "anthropic") {
      tools.push(action.getAnthropicTool() as any)
    } else {
      tools.push(action.getChatCompletionTool() as any)
    }
  }

  return tools
}

interface TToolCallHandler<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined,
  TProvider extends TProviderOptions = undefined,
> {
  (toolCalls: TProviderToolCallMessage<TProvider>): Promise<{
    toolCallMessages: TProviderToolResultMessages<TProvider>
    results: TCallerResults<T, TActionRegistrySubset<T, U>>
  }>
}

export type TFewShotExampleCalls<
  TRegistry extends TAnyActionRegistry,
  U extends keyof TRegistry,
> = ValuesOf<{
  [K in U]: {
    name: TRegistry[K]["functionName"]
    arguments: z.input<TRegistry[K]["inputSchema"]>
  } & (Awaited<ReturnType<TRegistry[K]["handler"]>> extends void
    ? {}
    : {
        response: Awaited<ReturnType<TRegistry[K]["handler"]>>
      })
}>

interface TCreateFewShotToolCallMessages<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined,
  TProvider extends TProviderOptions = undefined,
> {
  (
    examples: {
      userMessageContent?: string
      assistantMessageContent?: string
      thinkingStep?: string
      tool_calls?: TFewShotExampleCalls<
        TRegistry,
        TActionRegistrySubset<TRegistry, U>
      >[]
    }[]
  ): TProviderMessages<TProvider>
}

/**
 * Helper type to infer the few shot of tool calls
 */
export type inferFewShotToolCallMessages<
  TRegistry extends TAnyActionRegistry,
  U extends keyof TRegistry | undefined = undefined,
> = Parameters<
  TCreateFewShotToolCallMessages<
    TRegistry,
    U extends keyof TRegistry ? U[] : undefined
  >
>[0]

interface TChooseTool<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined = undefined,
> {
  (
    name: TRegistry[TActionRegistrySubset<TRegistry, U>]["functionName"]
  ): OpenAI.Chat.Completions.ChatCompletionToolChoiceOption
}

export const setupToolCalling = <
  TActionData extends TAnyActionData,
  const T extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithHandler<TActionData>
  }>,
  U extends (keyof T)[] | undefined = undefined,
  TProvider extends TProviderOptions = undefined,
>(
  /**
   * The registry of actions.
   */
  registry: T,

  args: TFunctionCallingArgs<T, U> & {
    /**
     * Whether to include throw on errors, defaults to including the error back in the tool call messages.
     */
    throwOnError?: boolean
    provider?: TProvider
  }
): {
  tools: TProviderTools<TProvider>
  toolCallsHandler: TToolCallHandler<T, U, TProvider>
  chooseTool: TChooseTool<T, U>
  createFewShotToolCallMessages: TCreateFewShotToolCallMessages<T, U, TProvider>
  toolsWithRender: TActionsWithRender<T, U>
} => {
  const { inArray, provider } = args

  const actionIds: (keyof T)[] =
    inArray || (Object.keys(registry) as (keyof T)[])

  const validActionIds = new Set(actionIds)

  const functionNameToActionIdMap: Record<string, keyof T> = {}
  for (const actionId of actionIds) {
    const action = registry[actionId]
    if (!action) continue
    functionNameToActionIdMap[action.functionName] = actionId
  }

  const tools = generateLLMTools(registry, {
    inArray: actionIds,
    provider: provider,
  })

  const toolCallsHandler: TToolCallHandler<T, U, TProvider> = async (
    toolCalls
  ) => {
    const { actionCaller } = setupActionCaller(registry, args)

    const parsedToolCalls =
      "content" in toolCalls
        ? (toolCalls.content as ToolUseBlockParam[])
        : (toolCalls as OpenAI.Chat.Completions.ChatCompletionMessageToolCall[])

    const results = await actionCaller(
      parsedToolCalls
        .filter((toolCall) => {
          const actionId =
            functionNameToActionIdMap[
              "function" in toolCall ? toolCall.function.name : toolCall.name
            ]
          return actionId && validActionIds.has(actionId)
        })
        .map(
          (toolCall) =>
            ({
              name:
                "function" in toolCall ? toolCall.function.name : toolCall.name,
              arguments:
                "function" in toolCall
                  ? JSON.parse(toolCall.function.arguments)
                  : toolCall.input,
              id: toolCall.id,
            }) as TActionCallerInput<T, TActionRegistrySubset<T, U>>
        )
    )

    const toolCallMessages: TProviderToolResultMessages<TProvider> = []

    for (const result of results) {
      if (result.status === "error" && args.throwOnError) {
        throw new Error(result.message)
      }

      const openAiMessage: OpenAI.Chat.Completions.ChatCompletionToolMessageParam =
        {
          role: "tool",
          tool_call_id: result.id,
          content:
            result.status === "error"
              ? JSON.stringify({
                  status: "error",
                  message: result.message,
                })
              : JSON.stringify(result.data ? result.data : {}),
        }

      const anthropicMessageResult: Anthropic.Beta.Tools.ToolResultBlockParam =
        {
          type: "tool_result",
          tool_use_id: result.id,
          is_error: result.status === "error" ? true : undefined,
          content:
            result.status === "error"
              ? [
                  {
                    type: "text",
                    text: result.message,
                  },
                ]
              : !result.data
                ? undefined
                : [
                    {
                      type: "text",
                      text: JSON.stringify(result.data),
                    },
                  ],
        }

      const anthropicMessage: ToolsBetaMessageParam = {
        role: "user",
        content: [anthropicMessageResult],
      }

      toolCallMessages.push(
        provider === "anthropic" ? anthropicMessage : (openAiMessage as any)
      )
    }

    return {
      results,
      toolCallMessages,
    }
  }

  const createFewShotToolCallMessages: TCreateFewShotToolCallMessages<
    T,
    U,
    TProvider
  > = (examples) => {
    const messages: TProviderMessages<TProvider> = []

    for (const example of examples) {
      if (example.userMessageContent) {
        messages.push({
          role: "user",
          content: example.userMessageContent,
        })
      }

      const generateToolCallId = () => {
        const prefix = provider === "anthropic" ? "toolu_" : "call_"
        return prefix + Math.random().toString(36).substring(2, 12)
      }

      const toolCallIds = (example.tool_calls ?? []).map(() =>
        generateToolCallId()
      )

      if (example.tool_calls && example.tool_calls.length > 0) {
        const thinkingStep = example.thinkingStep
          ? example.thinkingStep.includes("<thinking>")
            ? example.thinkingStep
            : `<thinking>${example.thinkingStep}</thinking>`
          : undefined

        if (provider === "anthropic") {
          const content = example.tool_calls.map((toolCall, ix) => ({
            id: toolCallIds[ix]!,
            input: toolCall.arguments,
            name: toolCall.name,
            type: "tool_use",
          })) as Array<ToolsBetaContentBlock>

          if (thinkingStep) {
            content.unshift({
              type: "text",
              text: thinkingStep,
            })
          }

          const msg: ToolsBetaMessageParam = {
            role: "assistant",
            content,
          }

          messages.push(msg as any)
        } else {
          const msg: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
            role: "assistant",
            content: thinkingStep,
            tool_calls: example.tool_calls.map((toolCall, ix) => ({
              id: toolCallIds[ix]!,
              function: {
                name: toolCall.name,
                arguments: JSON.stringify(toolCall.arguments),
              },
              type: "function",
            })),
          }

          messages.push(msg as any)
        }
      }

      for (const [ix, toolCall] of (example.tool_calls ?? []).entries()) {
        const foundAction = Object.values(registry).find(
          (action) =>
            (action as (typeof registry)[string]).functionName === toolCall.name
        ) as (typeof registry)[string] | undefined

        if (!foundAction) {
          throw new Error(`Could not find action with name ${toolCall.name}`)
        }

        if (provider === "anthropic") {
          const resultMsg: Anthropic.Beta.Tools.ToolResultBlockParam = {
            type: "tool_result",
            tool_use_id: toolCallIds[ix]!,
            content:
              "response" in toolCall
                ? [
                    {
                      type: "text",
                      text: JSON.stringify(toolCall.response),
                    },
                  ]
                : undefined,
          }

          const fullMsg: ToolsBetaMessageParam = {
            role: "user",
            content: [resultMsg],
          }

          messages.push(fullMsg as any)
        } else {
          const resultMsg: OpenAI.Chat.Completions.ChatCompletionToolMessageParam =
            {
              role: "tool",
              tool_call_id: toolCallIds[ix]!,
              content:
                "response" in toolCall
                  ? JSON.stringify(toolCall.response)
                  : JSON.stringify({}),
            }

          messages.push(resultMsg as any)
        }
      }

      if (example.assistantMessageContent) {
        messages.push({
          role: "assistant",
          content: example.assistantMessageContent,
        })
      }
    }

    return messages
  }

  const chooseTool: TChooseTool<T, U> = (name) => {
    if (!actionIds.includes(functionNameToActionIdMap[name])) {
      throw new Error(`Action name "${name}" is not allowed.`)
    }
    return {
      type: "function",
      function: {
        name: registry[functionNameToActionIdMap[name]].functionName,
      },
    }
  }

  const toolsWithRender = setupActionsWithRender(registry, actionIds, args)

  return {
    tools,
    toolCallsHandler,
    createFewShotToolCallMessages,
    chooseTool,
    toolsWithRender,
  }
}
