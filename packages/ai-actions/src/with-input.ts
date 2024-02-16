import { TActionInput } from "."
import { TActionData } from "./action-data"
import { ActionBuilderWithGet } from "./with-get"
import { ActionBuilderWithPost } from "./with-post"

export type TActionBuilderWithInputData<
  TId extends string,
  TInput extends TActionInput,
> = Pick<
  TActionData<TId, TInput, any, any, any>,
  "metadata" | "inputSchema" | "id"
>

type TActionType = "GET" | "POST"

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
   * Spark has two options for actions:
   *
   * 1.`JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   *
   * 2.`React Component` that asks for confirmation for the action. This is typically the output for actions that `POST data`. If this is the case, you should specify a React component that asks for confirmation for the action. The output will be `void`.
   */
  setActionType(type: "GET"): ActionBuilderWithGet<TId, TInput>
  setActionType(type: "POST"): ActionBuilderWithPost<TId, TInput>

  setActionType(output: TActionType) {
    if (output === "POST") {
      return new ActionBuilderWithPost({
        actionData: this.actionData,
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
