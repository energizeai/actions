import z from "zod"
import { TActionInput } from "."
import { TActionBuilderWithInputData } from "./with-input"
import { ActionBuilderWithOutput } from "./with-output"

export class ActionBuilderWithGet<
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
   * `JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   */
  setOutputSchema(output: z.ZodObject<any>) {
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
