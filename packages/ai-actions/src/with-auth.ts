import { TActionInput, TActionOnSubmit, TActionOutput } from "."
import { TActionData } from "./action-data"
import { TActionAuth } from "./auth"
import { ActionBuilderWithFunction, TActionFunction } from "./with-function"
import { TActionBuilderWithOutputData } from "./with-output"

export type TActionBuilderWithAuthData<
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = TActionBuilderWithOutputData<TId, TInput, TOutput, TSubmission> &
  Pick<TActionData<TId, TInput, TOutput, TAuth, TSubmission>, "authConfig">

export class ActionBuilderWithAuth<
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  protected actionData: TActionBuilderWithAuthData<
    TId,
    TInput,
    TOutput,
    TAuth,
    TSubmission
  >

  constructor({
    actionData,
  }: {
    actionData: TActionBuilderWithAuthData<
      TId,
      TInput,
      TOutput,
      TAuth,
      TSubmission
    >
  }) {
    this.actionData = actionData
  }

  /**
   * The function that gets called when the action is invoked. This function should return a promise that resolves to the output of the action.
   *
   * @param input The input to the action function. This is the input that the user provides when invoking the action.
   * @param auth The authentication information for the action. This is the authentication information that the user provides when invoking the action.
   *
   * @returns A promise that resolves to the output of the action.
   *
   * @example
   * The following action function is an example for a `send-email` action.
   * ```
   * async ({ input, auth }) => {
   *   const { subject, body, to } = input;
   *   const { accessToken } = auth;
   *   ...code to send email using the input...
   *   return;
   * }
   * ```
   *
   * @example
   * The following action function is an example for a `get-google-contact` action.
   * ```
   * async ({ input, auth }) => {
   *   const contact = ...code to get contact...
   *   return contact;
   * }
   * ```
   */

  setActionFunction(
    actionFunction: TActionFunction<TInput, TOutput, TAuth, TSubmission>
  ) {
    return new ActionBuilderWithFunction({
      actionData: {
        ...this.actionData,
        actionFunction,
        exampleInput: null,
      },
    })
  }
}
