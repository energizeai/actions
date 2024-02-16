import { TActionInput, TActionOnSubmit, TActionOutput } from "."
import { TTokenAuthConfig, TTokenCustomData } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionBuilderWithOutputData } from "./with-output"

export class ActionBuilderWithTokenType<
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  private actionData: TActionBuilderWithOutputData<
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

  setTokenData = <T extends TTokenCustomData>(data: TTokenAuthConfig<T>) => {
    return new ActionBuilderWithAuth({
      actionData: {
        ...this.actionData,
        authConfig: {
          type: "Token",
          config: data,
        },
      },
    })
  }
}
