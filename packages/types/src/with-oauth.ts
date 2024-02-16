import { TActionInput, TActionOnSubmit, TActionOutput } from "."
import { TOAuthConfig } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionBuilderWithOutputData } from "./with-output"

export class ActionBuilderWithOAuthType<
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  protected actionData: TActionBuilderWithOutputData<
    TId,
    TInput,
    TOutput,
    TSubmission
  >

  constructor({
    actionData,
  }: {
    actionData: TActionBuilderWithOutputData<TId, TInput, TOutput, TSubmission>
  }) {
    this.actionData = actionData
  }

  setOAuthData = (data: TOAuthConfig) => {
    return new ActionBuilderWithAuth({
      actionData: {
        ...this.actionData,
        authConfig: {
          type: "OAuth",
          config: data,
        },
      },
    })
  }
}
