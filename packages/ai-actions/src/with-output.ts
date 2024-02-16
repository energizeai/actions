import { TActionInput, TActionOnSubmit, TActionOutput } from "."
import { TActionData } from "./action-data"
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
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> = TActionBuilderWithInputData<TId, TInput> &
  Pick<
    TActionData<TId, TInput, TOutput, any, TSubmission>,
    "outputSchema" | "component" | "submissionSchema"
  >

export class ActionBuilderWithOutput<
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

  /**
   * The authentication type for the action. This is used to generate the authentication page for the action and get users authenticated.
   */
  setAuthType(
    type: typeof AuthType.NONE
  ): ActionBuilderWithAuth<TId, TInput, TOutput, TNoAuth, TSubmission>
  setAuthType(
    type: typeof AuthType.TOKEN
  ): ActionBuilderWithTokenType<TId, TInput, TOutput, TSubmission>
  setAuthType(
    type: typeof AuthType.OAUTH
  ): ActionBuilderWithOAuthType<TId, TInput, TOutput, TSubmission>

  setAuthType(
    type: TAuthType
  ):
    | ActionBuilderWithTokenType<TId, TInput, TOutput, TSubmission>
    | ActionBuilderWithAuth<TId, TInput, TOutput, TNoAuth, TSubmission>
    | ActionBuilderWithOAuthType<TId, TInput, TOutput, TSubmission> {
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
