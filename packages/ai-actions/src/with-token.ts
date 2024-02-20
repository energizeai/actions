import {
  TTokenAuth,
  TTokenAuthConfigWithInputMetadata,
  TTokenCustomData,
} from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TActionDataWithOutput } from "./with-output"

export class ActionBuilderWithTokenType<
  TLocalActionData extends TActionDataWithOutput,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.actionData = actionData
  }

  setTokenData = <T extends TTokenCustomData>(
    data: TTokenAuthConfigWithInputMetadata<T, TLocalActionData["registryData"]>
  ) => {
    let base = { ...data }

    const schema = this.actionData.registryData.tokenAuthMetadataSchema
    if (schema) {
      const safeParsed = schema.safeParse(base)
      if (!safeParsed.success) {
        throw new Error(
          `Invalid token data: ${JSON.stringify(safeParsed.error, null, 2)}`
        )
      }

      base = { ...base, ...safeParsed.data }
    }

    const authConfig = {
      type: "Token",
      config: base,
    } as TTokenAuth<T, TLocalActionData["registryData"]>

    return new ActionBuilderWithAuth({
      actionData: {
        ...this.actionData,
        authConfig,
      },
    })
  }
}
