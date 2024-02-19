import {
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { TTokenAuthConfig, TTokenCustomData } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionBuilderWithOutputData } from "./with-output"

export class ActionBuilderWithTokenType<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  actionData: TActionBuilderWithOutputData<
    TRegistry,
    TId,
    TInput,
    TOutput,
    TSubmission
  >

  constructor({
    actionData,
  }: {
    actionData: TActionBuilderWithOutputData<
      TRegistry,
      TId,
      TInput,
      TOutput,
      TSubmission
    >
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
