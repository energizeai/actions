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
  _actionData: TLocalActionData
  _actionType: TType

  constructor({
    actionData,
    actionType,
  }: {
    actionData: TLocalActionData
    actionType: TType
  }) {
    this._actionData = actionData
    this._actionType = actionType
  }

  /**
   * `JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   */
  setOutputSchema<T extends TActionOutput>(output: T) {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this._actionData,
        outputSchema: output,
        actionType: this._actionType,
      },
    })
  }

  setOutputAsVoid() {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this._actionData,
        actionType: this._actionType,
        outputSchema: z.void(),
      },
    })
  }

  setOutputSchemaAsInputSchema() {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this._actionData,
        actionType: this._actionType,
        outputSchema: this._actionData.inputSchema,
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
