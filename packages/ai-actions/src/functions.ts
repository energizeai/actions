import OpenAI from "openai"
import {
  TActionRegistrySubset,
  TAnyActionRegistry,
  TCallerResults,
  TFewShotExampleCalls,
  TFunctionCallingArgs,
  generateLLMTools,
  setupActionCaller,
} from "."
import { TAnyActionData } from "./action-data"
import { ActionBuilderWithHandler } from "./with-handler"

/**
 * Given an action registry, generate the functions for the LLM.
 */
export const generateLLMFunctions = <
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
): OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] => {
  const tools = generateLLMTools(registry, args)
  return tools.map((tool) => tool.function)
}

interface TFunctionCallHandler<
  T extends TAnyActionRegistry,
  U extends (keyof T)[] | undefined,
> {
  (functionCall: {
    name: string
    arguments: Record<string, unknown> | string
  }): Promise<{
    functionCallMessage: OpenAI.Chat.Completions.ChatCompletionFunctionMessageParam
    results: TCallerResults<T, TActionRegistrySubset<T, U>>
  }>
}

interface TCreateFewShotFunctionCallMessages<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined,
> {
  (
    examples: {
      userMessageContent?: string
      assistantMessageContent?: string
      function_call: TFewShotExampleCalls<TRegistry, U>
    }[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[]
}

interface TChooseFunction<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined = undefined,
> {
  (
    name: TRegistry[TActionRegistrySubset<TRegistry, U>]["functionName"]
  ): OpenAI.Chat.Completions.ChatCompletionFunctionCallOption
}

export const setupFunctionCalling = <
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

  args: TFunctionCallingArgs<T, U>
): {
  functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[]
  chooseFunction: TChooseFunction<T, U>
  createFewShotFunctionCallMessages: TCreateFewShotFunctionCallMessages<T, U>
  functionCallHandler: TFunctionCallHandler<T, U>
} => {
  const { inArray } = args

  const actionIds: (keyof T)[] =
    inArray || (Object.keys(registry) as (keyof T)[])

  const functionNameToActionIdMap: Record<string, keyof T> = {}
  for (const actionId of actionIds) {
    const action = registry[actionId]
    if (!action) continue
    functionNameToActionIdMap[action.functionName] = actionId
  }

  const functions = generateLLMFunctions(registry, {
    inArray: actionIds,
  })

  const functionCallHandler: TFunctionCallHandler<T, U> = async (
    functionCall
  ) => {
    const { actionCaller } = setupActionCaller(registry, args)

    // parse the arguments if they are a string
    if (typeof functionCall.arguments === "string") {
      functionCall.arguments = JSON.parse(functionCall.arguments)
    }

    const results = await actionCaller([functionCall as any])

    for (const result of results) {
      if (result.isError) continue

      const message: OpenAI.Chat.Completions.ChatCompletionFunctionMessageParam =
        {
          role: "function",
          name: result.functionName,
          content: JSON.stringify(result.data ? result.data : {}),
        }

      return {
        results,
        functionCallMessage: message,
      }
    }

    return {
      results,
      functionCallMessage: {
        role: "function",
        name: functionCall.name,
        content:
          results[0] && results[0].isError
            ? JSON.stringify(results[0].message)
            : "Unknown error",
      },
    }
  }

  const createFewShotFunctionCallMessages: TCreateFewShotFunctionCallMessages<
    T,
    U
  > = (examples) => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    for (const example of examples) {
      if (example.userMessageContent) {
        messages.push({
          role: "user",
          content: example.userMessageContent,
        })
      }

      messages.push({
        role: "assistant",
        function_call: {
          name: example.function_call.name,
          arguments: JSON.stringify(example.function_call.arguments),
        },
      })

      if ("response" in example.function_call) {
        messages.push({
          role: "function",
          name: example.function_call.name,
          content: JSON.stringify(example.function_call.response),
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

  const chooseFunction: TChooseFunction<T, U> = (name) => {
    if (!actionIds.includes(functionNameToActionIdMap[name])) {
      throw new Error(`Action name "${name}" is not allowed.`)
    }
    return {
      name: registry[functionNameToActionIdMap[name]].functionName,
    }
  }

  return {
    chooseFunction,
    functions,
    createFewShotFunctionCallMessages,
    functionCallHandler,
  }
}
