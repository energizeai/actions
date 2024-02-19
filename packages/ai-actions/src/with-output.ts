import {
  TActionData,
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { AuthType, TAuthType } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionBuilderWithInputData } from "./with-input"
import { ActionBuilderWithOAuthType } from "./with-oauth"
import { ActionBuilderWithTokenType } from "./with-token"

type TNoAuth = {
  type: typeof AuthType.NONE
  config: undefined
}

export type TActionBuilderWithOutputData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> = TActionBuilderWithInputData<TRegistry, TId, TInput> &
  Pick<
    TActionData<TRegistry, TId, TInput, TOutput, any, TSubmission>,
    "outputSchema" | "component" | "submissionSchema"
  >

export class ActionBuilderWithOutput<
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

  /**
   * The authentication type for the action. This is used to generate the authentication page for the action and get users authenticated.
   */
  setAuthType(
    type: typeof AuthType.NONE
  ): ActionBuilderWithAuth<
    TRegistry,
    TId,
    TInput,
    TOutput,
    TNoAuth,
    TSubmission
  >
  setAuthType(
    type: typeof AuthType.TOKEN
  ): ActionBuilderWithTokenType<TRegistry, TId, TInput, TOutput, TSubmission>
  setAuthType(
    type: typeof AuthType.OAUTH
  ): ActionBuilderWithOAuthType<TRegistry, TId, TInput, TOutput, TSubmission>

  setAuthType(type: TAuthType) {
    if (type === AuthType.NONE) {
      return new ActionBuilderWithAuth({
        actionData: {
          ...this.actionData,
          authConfig: {
            type: AuthType.NONE,
            config: undefined,
          },
        },
      })
    }
    if (type === AuthType.TOKEN) {
      return new ActionBuilderWithTokenType({
        actionData: this.actionData,
      })
    }
    if (type === AuthType.OAUTH) {
      return new ActionBuilderWithOAuthType({
        actionData: this.actionData,
      })
    }
    throw new Error("Invalid authentication type")
  }
}
