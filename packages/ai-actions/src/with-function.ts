import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import {
  TActionData,
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { TActionAuth } from "./auth"

export class ActionBuilderWithFunction<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  actionData: TActionData<TRegistry, TId, TInput, TOutput, TAuth, TSubmission>

  constructor({
    actionData,
  }: {
    actionData: TActionData<TRegistry, TId, TInput, TOutput, TAuth, TSubmission>
  }) {
    this.actionData = actionData
  }

  setExampleInput(exampleInput: z.infer<TInput>) {
    this.actionData.exampleInput = exampleInput
    return this
  }

  getId(): TId {
    return this.actionData.id
  }

  getExampleInput() {
    return this.actionData.exampleInput
  }

  getNamespace() {
    return this.actionData.registryData.namespace
  }

  getMetadata() {
    return this.actionData.metadata
  }

  getAuthConfig() {
    return this.actionData.authConfig
  }

  getInputSchema() {
    return this.actionData.inputSchema
  }

  getSubmissionSchema() {
    return this.actionData.submissionSchema
  }

  getActionFunction() {
    return this.actionData.actionFunction
  }

  getOutputSchema() {
    return this.actionData.outputSchema
  }

  getInputJSONSchema() {
    return zodToJsonSchema(this.actionData.inputSchema)
  }

  getOutputJSONSchema() {
    return zodToJsonSchema(this.actionData.outputSchema)
  }

  getComponent() {
    return this.actionData.component
  }
}
