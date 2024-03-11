import { TOptionalActionOutput } from "./action-data"
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
> {
  _actionData: TLocalActionData
  _outputSchema: TOutput

  constructor({
    actionData,
    outputSchema,
  }: {
    actionData: TLocalActionData
    outputSchema: TOutput
  }) {
    this._actionData = actionData
    this._outputSchema = outputSchema
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
    })

    return ret as Omit<typeof ret, TOmitOnInputWithAuth<TOutput>>
  }
}
