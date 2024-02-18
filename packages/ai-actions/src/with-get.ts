import z from "zod"
import {
  TActionFunctionExtras,
  TActionInput,
  TActionMetadata,
} from "./action-data"
import { TActionBuilderWithInputData } from "./with-input"
import { ActionBuilderWithOutput } from "./with-output"

export class ActionBuilderWithGet<
  TId extends string,
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
  TInput extends TActionInput,
> {
  actionData: TActionBuilderWithInputData<
    TId,
    TNamespace,
    TMetadata,
    TExtras,
    TInput
  >

  constructor({
    actionData,
  }: {
    actionData: TActionBuilderWithInputData<
      TId,
      TNamespace,
      TMetadata,
      TExtras,
      TInput
    >
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
