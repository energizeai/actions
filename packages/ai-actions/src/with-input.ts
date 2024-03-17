import z from "zod"
import { TActionBuilderData } from "./action-builder"
import {
  TActionData,
  TActionHandler,
  TActionInput,
  TActionOutput,
  TAdditionalParams,
  TOptionalActionOutput,
  TOptionalAdditionalParams,
} from "./action-data"
import { AuthType, TActionAuth, TTokenCustomData } from "./auth"
import { ActionBuilderWithHandler } from "./with-handler"
import { ActionBuilderWithOAuthType } from "./with-oauth"
import { ActionBuilderWithTokenType } from "./with-token"

type TActionBuilderWithInputData<
  TBuilderData extends TActionBuilderData,
  TInput extends TActionInput,
> = TBuilderData &
  Pick<TActionData<any, any, any, TInput, any, any, any, any>, "inputSchema">

export interface TActionDataWithInput
  extends TActionBuilderWithInputData<TActionBuilderData, TActionInput> {}

export type TOmitOnInputBase =
  | "_actionData"
  | "_outputSchema"
  | "_authConfig"
  | "_additionalParamsSchema"

export type TOmitOnInputWithOutput =
  | TOmitOnInputBase
  | "output"
  | "outputSameAsInput"
  | "additionalParams"

export type TOmitOnInputWithAdditionalParams =
  | TOmitOnInputBase
  | "additionalParams"

export type TOmitOnInputWithAuth<TOutput extends TOptionalActionOutput> =
  | TOmitOnInputWithOutput
  | TOmitOnInputWithAdditionalParams
  | (TOutput extends undefined ? "setAuthType" : "setAuthType" | "noHandler")

export class ActionBuilderWithInput<
  TLocalActionData extends TActionDataWithInput,
  TOutput extends TOptionalActionOutput,
  TAdditional extends TOptionalAdditionalParams,
  TAuth extends TActionAuth<TLocalActionData["registryData"], TTokenCustomData>,
> {
  _actionData: TLocalActionData
  _outputSchema: TOutput
  _authConfig: TAuth
  _additionalParamsSchema: TAdditional

  constructor({
    actionData,
    outputSchema,
    authConfig,
    additionalParamsSchema,
  }: {
    actionData: TLocalActionData
    outputSchema: TOutput
    authConfig: TAuth
    additionalParamsSchema: TAdditional
  }) {
    this._actionData = {
      ...actionData,
    }
    this._outputSchema = outputSchema
    this._authConfig = authConfig
    this._additionalParamsSchema = additionalParamsSchema
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
      TAdditional,
      TAuth
    >,
    TOmitOnInputWithOutput | "noHandler"
  > {
    if ("_def" in output && "parse" in output && "safeParse" in output) {
      const cast = output as TActionOutput
      return new ActionBuilderWithInput({
        actionData: {
          ...this._actionData,
        },
        outputSchema: cast,
        authConfig: this._authConfig,
        additionalParamsSchema: this._additionalParamsSchema,
      }) as any
    }

    const cast = output as z.ZodRawShape
    return new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      outputSchema: z.object(cast),
      authConfig: this._authConfig,
      additionalParamsSchema: this._additionalParamsSchema,
    }) as any
  }

  /**
   * Sets the output schema to be the same as the input schema.
   */
  outputSameAsInput() {
    return new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      outputSchema: this._actionData.inputSchema,
      authConfig: this._authConfig,
      additionalParamsSchema: this._additionalParamsSchema,
    }) as unknown as Omit<
      ActionBuilderWithInput<
        TLocalActionData,
        TLocalActionData["inputSchema"],
        TAdditional,
        TAuth
      >,
      TOmitOnInputWithOutput
    >
  }

  /**
   * The additional parameters for the action. This is useful to pass in additional data that the action needs to run.
   *
   * @param additionalParams The additional parameters for the action.
   * @returns The action builder with the additional parameters set.
   * @example
   */
  additionalParams<T extends TAdditionalParams | z.ZodRawShape>(
    additionalParams: T
  ): Omit<
    ActionBuilderWithInput<
      TLocalActionData,
      TOutput,
      T extends z.ZodRawShape ? z.ZodObject<T> : T,
      TAuth
    >,
    TOmitOnInputWithAdditionalParams
  > {
    if (
      "_def" in additionalParams &&
      "parse" in additionalParams &&
      "safeParse" in additionalParams
    ) {
      const cast = additionalParams as TAdditionalParams
      return new ActionBuilderWithInput({
        actionData: {
          ...this._actionData,
        },
        additionalParamsSchema: cast,
        authConfig: this._authConfig,
        outputSchema: this._outputSchema,
      }) as any
    }

    const cast = additionalParams as z.ZodRawShape
    return new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      additionalParamsSchema: z.object(cast),
      authConfig: this._authConfig,
      outputSchema: this._outputSchema,
    }) as any
  }

  /**
   * The authentication type for the action. This is used to generate the authentication page
   * for the action and get users authenticated.
   */
  authType(
    type: typeof AuthType.TOKEN
  ): Omit<
    ActionBuilderWithTokenType<TLocalActionData, TOutput, TAdditional>,
    "_actionData" | "_outputSchema"
  >
  authType(
    type: typeof AuthType.OAUTH
  ): Omit<
    ActionBuilderWithOAuthType<TLocalActionData, TOutput, TAdditional>,
    "_actionData" | "_outputSchema"
  >

  authType(type: typeof AuthType.TOKEN | typeof AuthType.OAUTH) {
    if (type === AuthType.TOKEN) {
      const ret = new ActionBuilderWithTokenType({
        actionData: this._actionData,
        outputSchema: this._outputSchema,
        additionalParamsSchema: this._additionalParamsSchema,
      })
      return ret as Omit<typeof ret, "_actionData" | "_outputSchema">
    }

    const ret = new ActionBuilderWithOAuthType({
      actionData: this._actionData,
      outputSchema: this._outputSchema,
      additionalParamsSchema: this._additionalParamsSchema,
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
      TAuth,
      TAdditional
    >
  ): ActionBuilderWithHandler<
    TActionData<
      TLocalActionData["registryData"],
      TLocalActionData["id"],
      TLocalActionData["functionName"],
      TLocalActionData["inputSchema"],
      TOutput,
      TAdditional,
      TAuth,
      TOutput extends TActionOutput
        ? THandlerRet extends Promise<z.input<TOutput>>
          ? Promise<z.output<TOutput>>
          : z.output<TOutput>
        : THandlerRet
    >
  > {
    const handlerWrapper = (params: any) => {
      let result = handler(params) as any
      if (this._outputSchema) {
        result = this._outputSchema.parse(result)
      }
      return result
    }

    const handlerWrapperAsync = async (params: any) => {
      let result = (await handler(params)) as any
      if (this._outputSchema) {
        result = this._outputSchema.parse(result)
      }
      return result
    }

    const isAsync = (func: Function): boolean => {
      return func.constructor.name === "AsyncFunction"
    }

    return new ActionBuilderWithHandler({
      actionData: {
        ...this._actionData,
        outputSchema: this._outputSchema,
        handler: isAsync(handler) ? handlerWrapperAsync : handlerWrapper,
        $unwrappedHandler: handler,
        exampleInput: null,
        additionalParamsSchema: this._additionalParamsSchema,
        authConfig: this._authConfig,
        render: undefined,
      },
    }) as any
  }

  noHandler() {
    const temp = this.outputSameAsInput()
    return temp.handler(
      ({ input }) => input as any
    ) as unknown as ActionBuilderWithHandler<
      TActionData<
        TLocalActionData["registryData"],
        TLocalActionData["id"],
        TLocalActionData["functionName"],
        TLocalActionData["inputSchema"],
        TLocalActionData["inputSchema"],
        TAdditional,
        TAuth,
        z.output<TLocalActionData["inputSchema"]>
      >
    >
  }
}
