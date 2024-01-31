import { getAuthorizationEndpoint } from "@/lib/oauth"
import { ActionsRegistry } from "@energizeai/registry"
import { TActionId } from "@energizeai/registry/types"
import OAuthForm from "./oauth-form"
import TokenForm from "./token-form"

export const ActionAuthForm = async ({ actionId }: { actionId: TActionId }) => {
  const action = ActionsRegistry[actionId]
  const authConfig = action.getAuthConfig()

  if (authConfig.type === "None") return null

  if (authConfig.type === "Token") {
    return <TokenForm actionId={actionId} />
  }

  let authorizationEndpoint = await getAuthorizationEndpoint(
    actionId,
    authConfig
  )

  return (
    <OAuthForm
      authConfig={authConfig}
      actionId={actionId}
      authorizationEndpoint={authorizationEndpoint}
    />
  )
}
