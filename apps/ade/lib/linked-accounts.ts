"server-only"

import { ActionsRegistry } from "@/registry"
import { db } from "@/server/db"
import { LinkedAccount, linkedAccounts } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"
import z from "zod"
import {
  getClientIdEnvKey,
  getClientSecretEnvKey,
  getRefreshEndpoint,
} from "./oauth"

export const refreshTokenIfNeeded = async (
  linkedAccount: LinkedAccount
): Promise<string | null> => {
  const expiresAt = linkedAccount.expiresAt
  const now = Math.floor(Date.now() / 1000)

  const needsRefresh = expiresAt && now > expiresAt

  // if the token is still valid, return it
  if (!needsRefresh) {
    return linkedAccount.accessToken
  }

  console.log("needs refresh", needsRefresh, expiresAt, now)

  const action = ActionsRegistry[linkedAccount.actionId]
  const authConfig = action._def.authConfig

  // if the action doesn't use OAuth, return null
  if (authConfig.type !== "OAuth") {
    return null
  }

  const refreshTokenEndpoint = await getRefreshEndpoint(authConfig)

  if (!linkedAccount.refreshToken || !refreshTokenEndpoint) {
    // no way to refresh the token
    await db
      .delete(linkedAccounts)
      .where(and(eq(linkedAccounts.actionId, linkedAccount.actionId)))

    return null
  }

  // send the refresh request
  const response = await fetch(refreshTokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: linkedAccount.refreshToken,
      client_id: process.env[getClientIdEnvKey(action.metadata)] || "ERROR",
      client_secret:
        process.env[getClientSecretEnvKey(action.metadata)] || "ERROR",
      grant_type: "refresh_token",
    }),
  })

  const refreshData = await response.json()

  const ExpectedSchema = z.object({
    access_token: z.string(),
    expires_in: z.number(),
  })

  const parsedBody = ExpectedSchema.parse(refreshData)

  const newExpiresAt = Math.floor(Date.now() / 1000) + parsedBody.expires_in

  // save the token to the database
  await db
    .update(linkedAccounts)
    .set({
      accessToken: parsedBody.access_token,
      expiresAt: newExpiresAt,
    })
    .where(and(eq(linkedAccounts.actionId, linkedAccount.actionId)))

  console.log("refreshed access token", parsedBody.access_token)

  return parsedBody.access_token
}

export const getAccessToken = async (linkedAccount: LinkedAccount) => {
  const authConfig = ActionsRegistry[linkedAccount.actionId]._def.authConfig

  if (authConfig.type === "None") {
    throw new Error("Action does not require authentication")
  }

  const token = await refreshTokenIfNeeded(linkedAccount)

  if (!token) {
    throw new Error("Could not get access token for action")
  }

  return token
}
