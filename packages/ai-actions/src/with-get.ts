import z from "zod"
import { TActionDataWithInput } from "./with-input"
import { ActionBuilderWithOutput } from "./with-output"

export class ActionBuilderWithGet<
  TLocalActionData extends TActionDataWithInput,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.actionData = actionData
  }

  /**
   * `JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   */

  setOutputSchema<T extends z.ZodObject<any>>(output: T) {
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
