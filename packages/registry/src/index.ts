// <|GENERATOR|> import new action here

import { ActionBuilderWithFunction } from "@energizeai/types"
import { GoogleSendMailAction } from "./google-send-mail"
import { NoauthAction } from "./noauth-action"
import { TokenAction } from "./token-action"

const ActionsRegistry = {
  GoogleSendMailAction: GoogleSendMailAction,
  NoAuthAction: NoauthAction,
  TokenAction: TokenAction,
  // <|GENERATOR|> add new action here
} as const satisfies Record<
  string,
  ActionBuilderWithFunction<any, any, any, any>
>

export { ActionsRegistry }
