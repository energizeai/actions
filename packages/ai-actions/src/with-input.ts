import { TActionBuilderData } from "./action-builder"
import { TActionData, TActionInput } from "./action-data"
import { ActionBuilderWithGet } from "./with-get"
import { ActionBuilderWithPost } from "./with-post"

type TActionBuilderWithInputData<
  TBuilderData extends TActionBuilderData,
  TInput extends TActionInput,
> = TBuilderData &
  Pick<TActionData<any, any, TInput, any, any, any>, "inputSchema">

export type TActionDataWithInput = TActionBuilderWithInputData<
  TActionBuilderData,
  TActionInput
>

export type TActionType = "GET" | "POST"

export class ActionBuilderWithInput<
  TLocalActionData extends TActionDataWithInput,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.actionData = {
      ...actionData,
    }
  }

  /**
   * Spark has two options for actions:
   *
   * 1.`JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   *
   * 2.`React Component` that asks for confirmation for the action. This is typically the output for actions that `POST data`. If this is the case, you should specify a React component that asks for confirmation for the action. The output will be `void`.
   */
  setActionType(type: "GET"): ActionBuilderWithGet<TLocalActionData>
  setActionType(
    type: "POST"
  ): ActionBuilderWithPost<TLocalActionData, undefined>

  setActionType(output: TActionType) {
    if (output === "POST") {
      return new ActionBuilderWithPost({
        actionData: this.actionData,
        submissionSchema: undefined,
      })
    } else {
      return new ActionBuilderWithGet({
        actionData: {
          ...this.actionData,
        },
      })
    }
  }
}
