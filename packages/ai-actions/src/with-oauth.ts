import {
  TOAuthConfigWithInputMetadata,
  TOAuthConfigWithOutputMetadata,
} from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionDataWithOutput } from "./with-output"

export class ActionBuilderWithOAuthType<
  TLocalActionData extends TActionDataWithOutput,
> {
  _actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this._actionData = actionData
  }

  setOAuthData = (
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

    return new ActionBuilderWithAuth({
      actionData: {
        ...this._actionData,
        authConfig: {
          type: "OAuth",
          config: base,
        },
      },
    })
  }
}
