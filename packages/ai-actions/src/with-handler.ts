import OpenAI from "openai"
import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import { TAnyActionData } from "./action-data"

export class ActionBuilderWithHandler<TLocalActionData extends TAnyActionData> {
  id: TLocalActionData["id"]
  functionName: TLocalActionData["functionName"]
  metadata: TLocalActionData["metadata"]
  registryData: TLocalActionData["registryData"]
  exampleInput: z.input<TLocalActionData["inputSchema"]>
  inputSchema: TLocalActionData["inputSchema"]
  outputSchema: TLocalActionData["outputSchema"]

  _def: {
    authConfig: TLocalActionData["authConfig"]
    render: TLocalActionData["render"]
    handler: TLocalActionData["handler"]
  }

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.id = actionData.id
    this.functionName = actionData.functionName
    this.metadata = actionData.metadata
    this.registryData = actionData.registryData
    this.exampleInput = actionData.exampleInput
    this.inputSchema = actionData.inputSchema
    this.outputSchema = actionData.outputSchema

    this._def = {
      authConfig: actionData.authConfig,
      render: actionData.render,
      handler: actionData.handler,
    }
  }

  setExampleInput(exampleInput: z.input<TLocalActionData["inputSchema"]>) {
    this.exampleInput = exampleInput
    return this
  }

  render(renderFunction: TLocalActionData["render"]) {
    if (this._def.render) {
      throw new Error(`Render function already set for Action ${this.id}`)
    }
    this._def.render = renderFunction
    return this
  }

  getInputJSONSchema() {
    return zodToJsonSchema(this.inputSchema)
  }

  getOutputJSONSchema() {
    if (!this.outputSchema) {
      return zodToJsonSchema(z.object({}))
    }
    return zodToJsonSchema(this.outputSchema)
  }

  getChatCompletionTool(): OpenAI.Chat.Completions.ChatCompletionTool {
    const jsonSchema = zodToJsonSchema(this.inputSchema)
    let description = `${
      jsonSchema["description"] || "No description was provided."
    }`

    delete jsonSchema["$schema"]
    delete jsonSchema["description"]

    // @ts-expect-error
    delete jsonSchema["$ref"]
    // @ts-expect-error
    delete jsonSchema["additionalProperties"]

    return {
      type: "function",
      function: {
        name: this.functionName,
        description,
        parameters: jsonSchema,
      },
    }
  }
}
