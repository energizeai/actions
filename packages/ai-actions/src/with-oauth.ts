import {
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { TOAuthConfig } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionBuilderWithOutputData } from "./with-output"

export class ActionBuilderWithOAuthType<
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
