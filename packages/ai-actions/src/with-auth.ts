import {
  TActionData,
  TActionFunction,
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { TActionAuth } from "./auth"
import { ActionBuilderWithFunction } from "./with-function"
import { TActionBuilderWithOutputData } from "./with-output"

export type TActionBuilderWithAuthData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = TActionBuilderWithOutputData<TRegistry, TId, TInput, TOutput, TSubmission> &
  Pick<
    TActionData<TRegistry, TId, TInput, TOutput, TAuth, TSubmission>,
    "authConfig"
  >

export class ActionBuilderWithAuth<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  actionData: TActionBuilderWithAuthData<
    TRegistry,
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
      TRegistry,
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
    actionFunction: TActionFunction<
      TRegistry["actionFunctionExtrasSchema"],
      TInput,
      TOutput,
      TAuth,
      TSubmission
    >
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
