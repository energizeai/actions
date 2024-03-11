import z from "zod"
import { TActionBuilderData } from "./action-builder"
import {
  TActionData,
  TActionHandler,
  TActionInput,
  TActionOutput,
  TOptionalActionOutput,
} from "./action-data"
import { AuthType, TActionAuth, TTokenCustomData } from "./auth"
import { ActionBuilderWithHandler } from "./with-handler"
import { ActionBuilderWithOAuthType } from "./with-oauth"
import { ActionBuilderWithTokenType } from "./with-token"

type TActionBuilderWithInputData<
  TBuilderData extends TActionBuilderData,
  TInput extends TActionInput,
> = TBuilderData &
  Pick<TActionData<any, any, any, TInput, any, any, any>, "inputSchema">

export interface TActionDataWithInput
  extends TActionBuilderWithInputData<TActionBuilderData, TActionInput> {}

export type TOmitOnInputBase = "_actionData" | "_outputSchema" | "_authConfig"
export type TOmitOnInputWithOutput =
  | TOmitOnInputBase
  | "output"
  | "outputSameAsInput"
export type TOmitOnInputWithAuth<TOutput extends TOptionalActionOutput> =
  | TOmitOnInputWithOutput
  | (TOutput extends undefined ? "setAuthType" : "setAuthType" | "noHandler")

export class ActionBuilderWithInput<
  TLocalActionData extends TActionDataWithInput,
  TOutput extends TOptionalActionOutput,
  TAuth extends TActionAuth<TLocalActionData["registryData"], TTokenCustomData>,
> {
  _actionData: TLocalActionData
  _outputSchema: TOutput
  _authConfig: TAuth

  constructor({
    actionData,
    outputSchema,
    authConfig,
  }: {
    actionData: TLocalActionData
    outputSchema: TOutput
    authConfig: TAuth
  }) {
    this._actionData = {
      ...actionData,
    }
    this._outputSchema = outputSchema
    this._authConfig = authConfig
  }

  /**
   * `JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   */
  output<T extends TActionOutput | z.ZodRawShape>(
    output: T
  ): Omit<
    ActionBuilderWithInput<
      TLocalActionData,
      T extends z.ZodRawShape ? z.ZodObject<T> : T,
      TAuth
    >,
    TOmitOnInputWithOutput | "noHandler"
  > {
    if ("_def" in output && "parse" in output && "safeParse" in output) {
      const cast = output as TActionOutput
      // @ts-expect-error
      return new ActionBuilderWithInput({
        actionData: {
          ...this._actionData,
        },
        outputSchema: cast,
        authConfig: this._authConfig,
      })
    }

    const cast = output as z.ZodRawShape
    // @ts-expect-error
    return new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      outputSchema: z.object(cast),
      authConfig: this._authConfig,
    })
  }

  /**
   * Sets the output schema to be the same as the input schema.
   */
  outputSameAsInput(): Omit<
    ActionBuilderWithInput<
      TLocalActionData,
      TLocalActionData["inputSchema"],
      TAuth
    >,
    TOmitOnInputWithOutput
  > {
    return new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      outputSchema: this._actionData.inputSchema,
      authConfig: this._authConfig,
    })
  }

  /**
   * The authentication type for the action. This is used to generate the authentication page
   * for the action and get users authenticated.
   */
  authType(
    type: typeof AuthType.TOKEN
  ): Omit<
    ActionBuilderWithTokenType<TLocalActionData, TOutput>,
    "_actionData" | "_outputSchema"
  >
  authType(
    type: typeof AuthType.OAUTH
  ): Omit<
    ActionBuilderWithOAuthType<TLocalActionData, TOutput>,
    "_actionData" | "_outputSchema"
  >

  authType(type: typeof AuthType.TOKEN | typeof AuthType.OAUTH) {
    if (type === AuthType.TOKEN) {
      const ret = new ActionBuilderWithTokenType({
        actionData: this._actionData,
        outputSchema: this._outputSchema,
      })
      return ret as Omit<typeof ret, "_actionData" | "_outputSchema">
    }

    const ret = new ActionBuilderWithOAuthType({
      actionData: this._actionData,
      outputSchema: this._outputSchema,
    })

    return ret as Omit<typeof ret, "_actionData" | "_outputSchema">
  }

  /**
   * The handler that gets called when the action is invoked. This handler should return a promise that resolves to the output of the action.
   *
   * @param input The input to the action handler. This is the input that the user provides when invoking the action.
   * @param auth The authentication information for the action. This is the authentication information that the user provides when invoking the action.
   *
   * @returns A promise that resolves to the output of the action.
   *
   * @example
   * The following action handler is an example for a `send-email` action.
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
   * The following action handler is an example for a `get-google-contact` action.
   * ```
   * async ({ input, auth }) => {
   *   const contact = ...code to get contact...
   *   return contact;
   * }
   * ```
   */

  handler<
    THandlerRet extends TOutput extends infer TOutput
      ? TOutput extends TActionOutput
        ? Promise<z.input<TOutput>> | z.input<TOutput>
        : Promise<any> | any
      : Promise<any> | any,
  >(
    handler: TActionHandler<
      TLocalActionData["registryData"],
      TLocalActionData["inputSchema"],
      THandlerRet,
      TAuth
    >
  ) {
    return new ActionBuilderWithHandler({
      actionData: {
        ...this._actionData,
        outputSchema: this._outputSchema,
        handler: handler,
        exampleInput: null,
        actionType: "SERVER",
        authConfig: this._authConfig,
        render: undefined,
      },
    }) as unknown as ActionBuilderWithHandler<
      TActionData<
        TLocalActionData["registryData"],
        TLocalActionData["id"],
        TLocalActionData["functionName"],
        TLocalActionData["inputSchema"],
        TOutput,
        TAuth,
        THandlerRet
      >
    >
  }

  noHandler() {
    const temp = this.outputSameAsInput()
    // @ts-expect-error
    return temp.handler(({ input }) => input)
  }
}
