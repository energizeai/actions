import {
  TActionFunctionExtras,
  TActionInput,
  TActionMetadata,
  TActionOnSubmit,
  TActionOutput,
} from "./action-data"
import { TOAuthConfig } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionBuilderWithOutputData } from "./with-output"

export class ActionBuilderWithOAuthType<
  TId extends string,
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  actionData: TActionBuilderWithOutputData<
    TId,
    TNamespace,
    TMetadata,
    TExtras,
    TInput,
    TOutput,
    TSubmission
  >

  constructor({
    actionData,
  }: {
    actionData: TActionBuilderWithOutputData<
      TId,
      TNamespace,
      TMetadata,
      TExtras,
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
