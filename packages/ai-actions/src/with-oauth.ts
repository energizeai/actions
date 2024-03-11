import { TOptionalActionOutput } from "./action-data"
import {
  TOAuthConfigWithInputMetadata,
  TOAuthConfigWithOutputMetadata,
} from "./auth"
import {
  ActionBuilderWithInput,
  TActionDataWithInput,
  TOmitOnInputWithAuth,
} from "./with-input"

export class ActionBuilderWithOAuthType<
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

  oAuthData = (
    data: TOAuthConfigWithInputMetadata<TLocalActionData["registryData"]>
  ) => {
    let base: TOAuthConfigWithOutputMetadata<TLocalActionData["registryData"]> =
      { ...data }

    const schema = this._actionData.registryData.oAuthMetadataSchema
    if (schema) {
      const safeParsed = schema.safeParse(base)
      if (!safeParsed.success) {
        throw new Error(
          `Invalid token data: ${JSON.stringify(safeParsed.error, null, 2)}`
        )
      }
      base = { ...base, ...safeParsed.data }
    }

    const ret = new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
      },
      authConfig: {
        type: "OAuth",
        config: base,
      },
      outputSchema: this._outputSchema,
    })

    return ret as Omit<typeof ret, TOmitOnInputWithAuth<TOutput>>
  }
}
