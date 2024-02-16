import z from "zod"
import { TActionInput, TActionOutput } from "."
import { TActionData } from "./action-data"
import { ActionBuilderWithOutput } from "./with-output"
import { ActionBuilderWithVoidOutput } from "./with-void-output"

export type TActionBuilderWithInputData<
  TId extends string,
  TInput extends TActionInput,
> = Pick<
  TActionData<TId, TInput, any, any, any>,
  "metadata" | "inputSchema" | "id"
>

export class ActionBuilderWithInput<
  TId extends string,
  TInput extends TActionInput,
> {
  private actionData: TActionBuilderWithInputData<TId, TInput>

  constructor({
    actionData,
  }: {
    actionData: TActionBuilderWithInputData<TId, TInput>
  }) {
    this.actionData = actionData
  }

  /**
   * Spark has two options for outputs:
   *
   * 1.`JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   *
   * 2.`React Component` that asks for confirmation for the action. This is typically the output for actions that `POST data`. If this is the case, you should specify a React component that asks for confirmation for the action. The output will be `void`.
   */
  setOutputSchema(type: z.ZodVoid): ActionBuilderWithVoidOutput<TId, TInput> // eslint-disable-line @typescript-eslint/no-unused-vars
  setOutputSchema<TOutput extends z.ZodObject<any>>(
    type: TOutput // eslint-disable-line @typescript-eslint/no-unused-vars
  ): ActionBuilderWithOutput<TId, TInput, TOutput>

  setOutputSchema(output: TActionOutput) {
    if (output instanceof z.ZodVoid) {
      return new ActionBuilderWithVoidOutput({
        actionData: this.actionData,
      })
    } else {
      return new ActionBuilderWithOutput({
        actionData: {
          ...this.actionData,
          submissionSchema: undefined,
          outputSchema: output,
          component: null,
        },
      })
    }
  }
}
