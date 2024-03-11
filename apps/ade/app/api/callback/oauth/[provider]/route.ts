import {
  getClientIdEnvKey,
  getClientSecretEnvKey,
  getTokenEndpoint,
} from "@/lib/oauth"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { db } from "@/server/db"
import { linkedAccounts } from "@/server/db/schema"
import { NextResponse } from "next/server"
import z from "zod"

/**
 * This will be the callback route for OAuth providers. It will exchange the code for a token and save the token to the database.
 *
 * Note that we are not using the best practices for OAuth. ADE is meant to run only on localhost and is not meant to be used in production.
 *
 * DO NOT USE THIS CODE IN PRODUCTION.
 *
 * If you do want to run something similar in production and need help, contact ido@energize.ai
 *
 * Also note, on spark.energize.ai we are implementing ALL the necessary measures to make sure this is secure. This is only for localhost.
 */
export async function GET(
  request: Request,
  { params }: { params: { provider: TActionId } }
) {
  // find the provider in the directory
  const foundAction = ActionsRegistry[params.provider]

  if (!foundAction) {
    return new Response("Invalid provider", { status: 400 })
  }

  const authConfig = foundAction.auth

  if (authConfig.type !== "OAuth") {
    return new Response("Invalid provider [Auth Type]", { status: 400 })
  }

  // validate the correct query params are present
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  if (!code) {
    return new Response("Invalid request [Code]", { status: 400 })
  }

  let tokenEndpoint: string | null = await getTokenEndpoint(authConfig)

  if (!tokenEndpoint) {
    return new Response("Invalid provider [Token Endpoint]", { status: 400 })
  }

  const tokenParams: Record<string, string> = {
    client_id: process.env[getClientIdEnvKey(foundAction.metadata)] as string,
    client_secret: process.env[
      getClientSecretEnvKey(foundAction.metadata)
    ] as string,
    redirect_uri: `http://localhost:3000/api/callback/oauth/${params.provider}`,
    grant_type: `authorization_code`,
    code: code,
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    body: new URLSearchParams(tokenParams),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  const tokenData = await response.json()

  console.log(tokenData)

  const ExpectedSchema = z.object({
    access_token: z.string(),
    expires_in: z.number().nullish(),
    token_type: z.string().nullish(),
    scope: z.string(),
    refresh_token: z.string().nullish(),
  })

  // generate the new linked account
  const newLinkedAccountSafe = ExpectedSchema.safeParse(tokenData)

  if (!newLinkedAccountSafe.success) {
    return new Response(
      "Invalid response: " +
        newLinkedAccountSafe.error.message +
        " " +
        JSON.stringify(tokenData),
      { status: 400 }
    )
  }

  const newLinkedAccount = newLinkedAccountSafe.data

  const approvedScopes = newLinkedAccount.scope?.toLowerCase().split(" ")
  const requiredScopes = authConfig.config.scopes.map((s) => s.toLowerCase())

  // make sure all the required scopes are approved
  if (
    !approvedScopes ||
    !requiredScopes.every((s) => approvedScopes.includes(s))
  ) {
    return new Response("Not all required scopes are present", { status: 400 })
  }

  const expiresAt = newLinkedAccount.expires_in
    ? Math.floor(Date.now() / 1000) + newLinkedAccount.expires_in
    : null

  // save the token to the database
  await db.insert(linkedAccounts).values({
    actionId: params.provider,
    accessToken: newLinkedAccount.access_token,
    refreshToken: newLinkedAccount.refresh_token,
    expiresAt: expiresAt,
    authType: "OAuth",
    scope: newLinkedAccount.scope,
  })

  const redirectUrl = new URL(
    `/actions/${params.provider}/test`,
    "http://localhost:3000"
  ).toString()

  return NextResponse.redirect(redirectUrl)
}
