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
import { TAnyActionData, TStreamable } from "./action-data"
import { ActionBuilderWithHandler } from "./with-handler"

/**
 * Given an action registry, generate the tools for the LLM.
 */
export const generateLLMTools = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithHandler<any>
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

interface TToolCallHandler<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined,
> {
  (
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  ): Promise<{
    toolCallMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[]
    results: TCallerResults<T, TActionRegistrySubset<T, U>>
  }>
}

export type TFewShotExampleCalls<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined,
> = ValuesOf<{
  [K in TActionRegistrySubset<TRegistry, U>]: {
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
> {
  (
    examples: {
      userMessageContent?: string
      assistantMessageContent?: string
      tool_calls: TFewShotExampleCalls<TRegistry, U>[]
    }[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[]
}

interface TChooseTool<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined = undefined,
> {
  (
    name: TRegistry[TActionRegistrySubset<TRegistry, U>]["functionName"]
  ): OpenAI.Chat.Completions.ChatCompletionToolChoiceOption
}

type TToolsWithRender<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined = undefined,
> = {
  [K in TActionRegistrySubset<TRegistry, U>]: {
    description?: string | undefined
    parameters: TRegistry[K]["inputSchema"]
    render: (
      props: z.output<TRegistry[K]["inputSchema"]>
    ) => AsyncGenerator<TStreamable, TStreamable, void>
  }
}

export const setupToolCalling = <
  TActionData extends TAnyActionData,
  const T extends Readonly<{
    [K in TActionData["id"]]: ActionBuilderWithHandler<TActionData>
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
  chooseTool: TChooseTool<T, U>
  createFewShotToolCallMessages: TCreateFewShotToolCallMessages<T, U>
  toolsWithRender: TToolsWithRender<T, U>
} => {
  const { inArray } = args

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
            : JSON.stringify(result.data ? result.data : {}),
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
      if (example.userMessageContent) {
        messages.push({
          role: "user",
          content: example.userMessageContent,
        })
      }

      const generateToolCallId = () => {
        return "call_" + Math.random().toString(36).substring(2, 12)
      }

      const toolCallIds = example.tool_calls.map(() => generateToolCallId())

      if (example.tool_calls.length > 0) {
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
      }

      for (const [ix, toolCall] of example.tool_calls.entries()) {
        const foundAction = Object.values(registry).find(
          (action) =>
            (action as (typeof registry)[string]).functionName === toolCall.name
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
              : JSON.stringify({}),
        })
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

  const toolsWithRender: TToolsWithRender<T, U> = ({} = {} as any)

  for (const id of actionIds) {
    const action = registry[id]
    if (!action) continue // should never happen

    const renderFn = action._render
    if (!renderFn) continue

    toolsWithRender[action.functionName] = {
      description: action.inputSchema.description,
      parameters: action.inputSchema,
      render: async function* (props: any) {
        const { actionCaller } = setupActionCaller(registry, {
          ...args,
          onActionExecutionFinished: undefined, // we call this later
          mode: "render",
        })

        const results = await actionCaller([
          {
            name: action.functionName,
            arguments: props,
          },
        ])

        const result = results[0]

        if (!result || result.isError) {
          throw new Error("Expected 1 result")
        }

        const renderProps = {
          input: result.parsedArguments,
          context: result.$parsedContext,
          additionalParams: result.parsedAdditionalParams,
          auth: result.$auth,
          handler: action.handler,
        } as const satisfies Parameters<typeof renderFn>[0]

        function isGeneratorFunction(func: any) {
          const constructor = func.constructor

          if (!constructor) return false
          if (
            "GeneratorFunction" === constructor.name ||
            "GeneratorFunction" === constructor.displayName ||
            "AsyncGeneratorFunction" === constructor.name ||
            "AsyncGeneratorFunction" === constructor.displayName
          )
            return true
          return false
        }

        const handleFinished = () => {
          if (args.onActionExecutionFinished) {
            args.onActionExecutionFinished({
              ...result,
              timestamp: Date.now(),
            } as any)
          }
        }

        if (isGeneratorFunction(renderFn)) {
          // @ts-expect-error
          const yieldResult = yield* renderFn(renderProps)

          handleFinished()

          return yieldResult
        }

        handleFinished()

        const renderResult = await renderFn(renderProps)
        return renderResult
      },
    }
  }

  return {
    tools,
    toolCallsHandler,
    createFewShotToolCallMessages,
    chooseTool,
    toolsWithRender,
  }
}
