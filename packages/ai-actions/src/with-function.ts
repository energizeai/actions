import OpenAI from "openai"
import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import { TAnyActionData } from "./action-data"

export class ActionBuilderWithFunction<
  TLocalActionData extends TAnyActionData,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.actionData = actionData
  }

  setExampleInput(exampleInput: z.input<TLocalActionData["inputSchema"]>) {
    this.actionData.exampleInput = exampleInput
    return this
  }

  getId(): TLocalActionData["id"] {
    return this.actionData.id
  }

  getExampleInput(): TLocalActionData["exampleInput"] {
    return this.actionData.exampleInput
  }

  getNamespace(): TLocalActionData["registryData"]["namespace"] {
    return this.actionData.registryData.namespace
  }

  getMetadata(): TLocalActionData["metadata"] {
    return this.actionData.metadata
  }

  getAuthConfig(): TLocalActionData["authConfig"] {
    return this.actionData.authConfig
  }

  getInputSchema(): TLocalActionData["inputSchema"] {
    return this.actionData.inputSchema
  }

  getActionFunction(): TLocalActionData["actionFunction"] {
    return this.actionData.actionFunction
  }

  getOutputSchema(): TLocalActionData["outputSchema"] {
    return this.actionData.outputSchema
  }

  getInputJSONSchema() {
    return zodToJsonSchema(this.actionData.inputSchema)
  }

  getOutputJSONSchema() {
    return zodToJsonSchema(this.actionData.outputSchema)
  }

  getActionType(): TLocalActionData["actionType"] {
    return this.actionData.actionType
  }

  getRegistryData(): TLocalActionData["registryData"] {
    return this.actionData.registryData
  }

  getFunctionName(): TLocalActionData["functionName"] {
    return this.actionData.functionName
  }

  getChatCompletionTool(): OpenAI.Chat.Completions.ChatCompletionTool {
    const jsonSchema = zodToJsonSchema(this.getInputSchema()) as any
    let description = `${
      jsonSchema["description"] || "No description was provided."
    }`

    delete jsonSchema["$schema"]
    delete jsonSchema["$ref"]
    delete jsonSchema["additionalProperties"]
    delete jsonSchema["description"]

    return {
      type: "function",
      function: {
        name: this.getFunctionName(),
        description,
        parameters: jsonSchema,
      },
    }
  }
}
