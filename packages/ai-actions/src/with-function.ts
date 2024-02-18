import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import {
  TActionData,
  TActionFunctionExtras,
  TActionInput,
  TActionMetadata,
  TActionOnSubmit,
  TActionOutput,
} from "./action-data"
import { TActionAuth } from "./auth"

export class ActionBuilderWithFunction<
  TId extends string,
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  actionData: TActionData<
    TId,
    TNamespace,
    TMetadata,
    TExtras,
    TInput,
    TOutput,
    TAuth,
    TSubmission
  >

  constructor({
    actionData,
  }: {
    actionData: TActionData<
      TId,
      TNamespace,
      TMetadata,
      TExtras,
      TInput,
      TOutput,
      TAuth,
      TSubmission
    >
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
    return this.actionData.namespace
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
