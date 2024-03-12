import { TOptionalActionOutput, TOptionalAdditionalParams } from "./action-data"
import {
  TTokenAuth,
  TTokenAuthConfigWithInputMetadata,
  TTokenCustomData,
} from "./auth"
import {
  ActionBuilderWithInput,
  TActionDataWithInput,
  TOmitOnInputWithAuth,
} from "./with-input"

export class ActionBuilderWithTokenType<
  TLocalActionData extends TActionDataWithInput,
  TOutput extends TOptionalActionOutput,
  TAdditional extends TOptionalAdditionalParams,
> {
  _actionData: TLocalActionData
  _outputSchema: TOutput
  _additionalParamsSchema: TAdditional

  constructor({
    actionData,
    outputSchema,
    additionalParamsSchema,
  }: {
    actionData: TLocalActionData
    outputSchema: TOutput
    additionalParamsSchema: TAdditional
  }) {
    this._actionData = actionData
    this._outputSchema = outputSchema
    this._additionalParamsSchema = additionalParamsSchema
  }

  tokenData = <T extends TTokenCustomData>(
    data: TTokenAuthConfigWithInputMetadata<T, TLocalActionData["registryData"]>
  ) => {
    let base = { ...data }

    const schema = this._actionData.registryData.tokenAuthMetadataSchema
    if (schema) {
      const safeParsed = schema.safeParse(base)
      if (!safeParsed.success) {
        throw new Error(
          `Invalid token data: ${JSON.stringify(safeParsed.error, null, 2)}`
        )
      }

      base = { ...base, ...safeParsed.data }
    }

    const authConfig: TTokenAuth<T, TLocalActionData["registryData"]> = {
      type: "Token",
      config: base,
    }

    const ret = new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      authConfig,
      outputSchema: this._outputSchema,
      additionalParamsSchema: this._additionalParamsSchema,
    })

    return ret as Omit<typeof ret, TOmitOnInputWithAuth<TOutput>>
  }
}
