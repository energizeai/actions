import { TActionData, TActionFunction } from "./action-data"
import { TActionAuth, TAnyActionAuth, TTokenCustomData } from "./auth"
import { ActionBuilderWithFunction } from "./with-function"
import { TActionDataWithOutput } from "./with-output"

export type TActionBuilderWithAuthData<
  TOutputActionData extends TActionDataWithOutput,
  TAuth extends TActionAuth<
    TOutputActionData["registryData"],
    TTokenCustomData
  >,
> = TOutputActionData & { authConfig: TAuth }

export type TActionDataWithAuth = TActionBuilderWithAuthData<
  TActionDataWithOutput,
  TAnyActionAuth
>

export class ActionBuilderWithAuth<
  TLocalActionData extends TActionDataWithAuth,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
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
      TLocalActionData["registryData"],
      TLocalActionData["inputSchema"],
      TLocalActionData["outputSchema"],
      TLocalActionData["authConfig"]
    >
  ) {
    return new ActionBuilderWithFunction({
      actionData: {
        ...this.actionData,
        actionFunction,
        exampleInput: null,
      },
    }) as unknown as ActionBuilderWithFunction<
      TActionData<
        TLocalActionData["registryData"],
        TLocalActionData["id"],
        TLocalActionData["functionName"],
        TLocalActionData["inputSchema"],
        TLocalActionData["outputSchema"],
        TLocalActionData["authConfig"],
        TLocalActionData["actionType"]
      >
    >
  }
}
