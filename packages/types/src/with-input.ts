import z from "zod"
import { ActionMetadata, TActionInput, TActionOutput } from "."
import { ActionBuilderWithOutput } from "./with-output"
import { ActionBuilderWithVoidOutput } from "./with-void-output"

export class ActionBuilderWithInput<TInput extends TActionInput> {
  private metadata: ActionMetadata
  private inputSchema: TInput

  constructor({
    metadata,
    inputSchema,
  }: {
    metadata: ActionMetadata
    inputSchema: TInput
  }) {
    this.metadata = metadata
    this.inputSchema = inputSchema
  }

  /**
   * Spark has two options for outputs:
   *
   * 1.`JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   *
   * 2.`React Component` that asks for confirmation for the action. This is typically the output for actions that `POST data`. If this is the case, you should specify a React component that asks for confirmation for the action. The output will be `void`.
   */
  setOutputSchema(type: z.ZodVoid): ActionBuilderWithVoidOutput<TInput> // eslint-disable-line @typescript-eslint/no-unused-vars
  setOutputSchema<TOutput extends z.ZodObject<any>>(
    type: TOutput // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ActionBuilderWithOutput<TInput, TOutput>

  setOutputSchema(output: TActionOutput) {
    if (output instanceof z.ZodVoid) {
      return new ActionBuilderWithVoidOutput({
        metadata: this.metadata,
        inputSchema: this.inputSchema,
      })
    } else {
      return new ActionBuilderWithOutput({
        metadata: this.metadata,
        inputSchema: this.inputSchema,
        outputSchema: output,
        component: null,
      })
    }
  }
}
