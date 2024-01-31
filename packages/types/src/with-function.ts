import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import {
  ActionMetadata,
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TActionUserData,
} from "."
import { TActionAuth, TAuthArg } from "./auth"
import { TPassThroughComponent } from "./with-void-output"

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
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  protected metadata: ActionMetadata
  protected inputSchema: TInput
  private submissionSchema?: TSubmission
  protected outputSchema: TOutput
  protected authConfig: TAuth
  protected actionFunction: TActionFunction<TInput, TOutput, TAuth, TSubmission>
  protected component: TPassThroughComponent<TInput, TOutput, TSubmission>
  protected exampleInput: z.infer<TInput> | null

  constructor({
    metadata,
    inputSchema,
    outputSchema,
    authConfig,
    actionFunction,
    component,
    submissionSchema = undefined,
    exampleInput = null,
  }: {
    metadata: ActionMetadata
    inputSchema: TInput
    outputSchema: TOutput
    authConfig: TAuth
    submissionSchema?: TSubmission
    actionFunction: TActionFunction<TInput, TOutput, TAuth, TSubmission>
    component: TPassThroughComponent<TInput, TOutput, TSubmission>
    exampleInput?: z.infer<TInput> | null
  }) {
    this.metadata = metadata
    this.inputSchema = inputSchema
    this.outputSchema = outputSchema
    this.authConfig = authConfig
    this.actionFunction = actionFunction
    this.component = component
    this.exampleInput = exampleInput
    this.submissionSchema = submissionSchema
  }

  setExampleInput(exampleInput: z.infer<TInput>) {
    this.exampleInput = exampleInput
    return this
  }

  getExampleInput() {
    return this.exampleInput
  }

  getMetadata() {
    return this.metadata.getMetadata()
  }

  getAuthConfig() {
    return this.authConfig
  }

  getInputSchema() {
    return this.inputSchema
  }

  getActionFunction() {
    return this.actionFunction
  }

  getOutputSchema() {
    return this.outputSchema
  }

  getInputJSONSchema() {
    return zodToJsonSchema(this.inputSchema)
  }

  getOutputJSONSchema() {
    return zodToJsonSchema(this.outputSchema)
  }

  getComponent() {
    return this.component
  }
}
