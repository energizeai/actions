import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import {
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TActionUserData,
} from "."
import { TActionData } from "./action-data"
import { TActionAuth, TAuthArg } from "./auth"

export type TActionFunction<
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = (_: {
  input: z.infer<TSubmission extends undefined ? TInput : TSubmission>
  auth: TAuthArg<TAuth>
  userData: TActionUserData
}) => Promise<z.infer<TOutput>>

export class ActionBuilderWithFunction<
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  protected actionData: TActionData<TId, TInput, TOutput, TAuth, TSubmission>

  constructor({
    actionData,
  }: {
    actionData: TActionData<TId, TInput, TOutput, TAuth, TSubmission>
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

  getMetadata() {
    return this.actionData.metadata.getMetadata()
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
