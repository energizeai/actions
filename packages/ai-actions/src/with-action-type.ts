import z from "zod"
import { TActionOutput, TActionType } from "./action-data"
import { TActionDataWithInput } from "./with-input"
import {
  ActionBuilderWithOutput,
  TActionBuilderWithOutputData,
} from "./with-output"

export class ActionBuilderWithActionType<
  TType extends TActionType,
  TLocalActionData extends TActionDataWithInput,
> {
  actionData: TLocalActionData
  private actionType: TType

  constructor({
    actionData,
    actionType,
  }: {
    actionData: TLocalActionData
    actionType: TType
  }) {
    this.actionData = actionData
    this.actionType = actionType
  }

  /**
   * `JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   */
  setOutputSchema<T extends TActionOutput>(output: T) {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this.actionData,
        outputSchema: output,
        actionType: this.actionType,
      },
    })
  }

  setOutputAsVoid() {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this.actionData,
        actionType: this.actionType,
        outputSchema: z.void(),
      },
    })
  }

  setOutputSchemaAsInputSchema() {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this.actionData,
        actionType: this.actionType,
        outputSchema: this.actionData.inputSchema,
      },
    }) as ActionBuilderWithOutput<
      TActionBuilderWithOutputData<
        TLocalActionData,
        TLocalActionData["inputSchema"],
        TType
      >
    >
  }
}
