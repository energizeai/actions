"server-only"

import { ActionsRegistry } from "@/registry"
import { TAction, TActionId, TOAuthAction } from "@/registry/_properties/types"

export const getResourceStringForOAuth = (resource: string) => {
  return resource.toUpperCase().replaceAll(" ", "_")
}

export const getClientIdEnvKey = (actionMetadata: TAction["metadata"]) => {
  return `${getResourceStringForOAuth(actionMetadata.resource)}_CLIENT_ID`
}

export const getClientSecretEnvKey = (actionMetadata: TAction["metadata"]) => {
  return `${getResourceStringForOAuth(actionMetadata.resource)}_CLIENT_SECRET`
}

export const getAuthorizationEndpoint = async (
  actionId: TActionId,
  authConfig: TOAuthAction["auth"]
) => {
  let authorizationEndpoint = null

  if (authConfig.config.discoveryEndpoint) {
    const discovery = await fetch(authConfig.config.discoveryEndpoint).then(
      (res) => res.json()
    )

    authorizationEndpoint = discovery.authorization_endpoint
  } else if ("authorizationEndpoint" in authConfig.config) {
    authorizationEndpoint = authConfig.config.authorizationEndpoint
  }

  if (!authorizationEndpoint) return null

  const clientIdKey = getClientIdEnvKey(ActionsRegistry[actionId].metadata)

  const link = new URL(authorizationEndpoint)
  link.searchParams.append("client_id", process.env[clientIdKey] ?? "ERROR")
  link.searchParams.append(
    "redirect_uri",
    `http://localhost:3000/api/callback/oauth/${actionId}`
  )
  link.searchParams.append("response_type", "code")
  link.searchParams.append("scope", authConfig.config.scopes.join(" "))
  link.searchParams.append("access_type", "offline")
  link.searchParams.append("prompt", "consent")

  return link.toString()
}

export const getTokenEndpoint = async (authConfig: TOAuthAction["auth"]) => {
  let tokenEndpoint = null

  if (authConfig.config.discoveryEndpoint) {
    const discovery = await fetch(authConfig.config.discoveryEndpoint).then(
      (res) => res.json()
    )

    tokenEndpoint = discovery.token_endpoint
  } else if ("tokenEndpoint" in authConfig.config) {
    tokenEndpoint = authConfig.config.tokenEndpoint
  }

  return tokenEndpoint
}

export const getRevokeEndpoint = async (authConfig: TOAuthAction["auth"]) => {
  let revokeEndpoint = null

  if (authConfig.config.discoveryEndpoint) {
    const discovery = await fetch(authConfig.config.discoveryEndpoint).then(
      (res) => res.json()
    )

    revokeEndpoint = discovery.revocation_endpoint
  } else if ("revokeEndpoint" in authConfig.config) {
    revokeEndpoint = authConfig.config.revokeEndpoint
  }

  return revokeEndpoint
}

export const getRefreshEndpoint = async (authConfig: TOAuthAction["auth"]) => {
  let refreshEndpoint = null

  if (authConfig.config.discoveryEndpoint) {
    const discovery = await fetch(authConfig.config.discoveryEndpoint).then(
      (res) => res.json()
    )

    refreshEndpoint = discovery.token_endpoint
  } else if ("refreshEndpoint" in authConfig.config) {
    refreshEndpoint = authConfig.config.refreshEndpoint
  }

  return refreshEndpoint
}
