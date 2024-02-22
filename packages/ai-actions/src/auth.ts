import z from "zod"
import { TAnyRegistryData } from "./action-data"
import { ValuesOf } from "./utility"

/**
 * The type of authentication.
 */
export const AuthType = {
  NONE: "None",
  TOKEN: "Token",
  OAUTH: "OAuth",
} as const
export type TAuthType = ValuesOf<typeof AuthType>

// extract the input metadata from the registry data
export type TAuthInputMetadata<
  TRegistry extends TAnyRegistryData,
  K extends "tokenAuthMetadataSchema" | "oAuthMetadataSchema",
> = TRegistry[K] extends infer U
  ? U extends z.AnyZodObject
    ? z.input<U>
    : {}
  : {}

// extract the output metadata from the registry data
export type TAuthOutputMetadata<
  TRegistry extends TAnyRegistryData,
  K extends "tokenAuthMetadataSchema" | "oAuthMetadataSchema",
> = TRegistry[K] extends infer U
  ? U extends z.AnyZodObject
    ? z.output<U>
    : {}
  : {}

const OAuthConfigBase = z.object({
  /**
   * An non-empty array of scopes required for the OAuth authentication.
   *
   * @example
   * The following scopes are used for the `Google Contacts` authentication.
   * ```
   * ["https://www.googleapis.com/auth/contacts.other.readonly", "https://www.googleapis.com/auth/contacts.readonly"]
   * ```
   */
  scopes: z.array(z.string()).min(1),
})

const OAuthConfigSchema = z.union([
  OAuthConfigBase.extend({
    /**
     * The URL of the OAuth 2.0 Discovery Endpoint.
     *
     * @example
     * For google, this is `https://accounts.google.com/.well-known/openid-configuration`.
     */
    discoveryEndpoint: z.string(),
  }),
  OAuthConfigBase.extend({
    discoveryEndpoint: z.undefined(),

    /**
     * The URL of the authorization endpoint for OAuth.
     *
     * @example
     * For google, this is `https://accounts.google.com/o/oauth2/v2/auth`.
     */
    authorizationEndpoint: z.string(),

    /**
     * The URL of the token endpoint for obtaining access and refresh tokens.
     *
     * @example
     * For google, this is `https://oauth2.googleapis.com/token`.
     */
    tokenEndpoint: z.string(),

    /**
     * The URL of the refresh endpoint for refreshing access tokens.
     *
     * @example
     * For google, this is `https://oauth2.googleapis.com/token`.
     */
    refreshEndpoint: z.string().optional(),

    /**
     * The URL of the revoke endpoint for revoking access tokens.
     *
     * @example
     * For google, this is `https://oauth2.googleapis.com/revoke`.
     */
    revokeEndpoint: z.string().optional(),

    /**
     * The code challenge method used for PKCE. It can either be 'S256' or null.
     */
    codeChallengeMethod: z.literal("S256").nullable(),
  }),
])

type TOAuthConfig = z.infer<typeof OAuthConfigSchema>

export type TOAuthConfigWithOutputMetadata<TRegistry extends TAnyRegistryData> =
  TOAuthConfig & TAuthOutputMetadata<TRegistry, "oAuthMetadataSchema">

export type TOAuthConfigWithInputMetadata<TRegistry extends TAnyRegistryData> =
  TOAuthConfig & TAuthInputMetadata<TRegistry, "oAuthMetadataSchema">

export type TTokenCustomData = z.ZodObject<any> | null

/**
 * Configuration for authenticating with an access token that users must generate themselves.
 *
 * This is useful for resources that don't support OAuth, but do support API keys.
 */
type TTokenAuthConfig<TCustomData extends TTokenCustomData> = {
  /**
   * Optional schema for custom data to be stored in the user's account that is needed to use the action.
   *
   * @example
   * For the Canvas LTS action, we also need to collect the user's Canvas domain (e.g. `https://canvas.calpoly.edu`).
   * ```
   * z.object({
   *  canvasDomain: z.string().url().refine((url) => url.startsWith("https://"), {
   *   message: "Canvas domain must start with https://",
   *  }),
   * })
   * ```
   */
  customDataSchema: TCustomData

  /**
   * An optional function to validate the access token and custom data upon submission.
   *
   * @example
   * For the Canvas LTS action, we need to validate the access token and custom data by making a request to the Canvas API.
   *
   * ```typescript
   * validateToken: async ({ auth }) => {
   *  const response = await fetch(`${auth.customData.canvasDomain}/api/v1/users/self`, {
   *   headers: {
   *    Authorization: `Bearer ${auth.accessToken}`,
   *   },
   *  })
   *
   *  return { isValid: response.ok }
   * }
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  validateToken?: (_: {
    auth: {
      customData: TCustomData extends z.ZodObject<any>
        ? z.infer<TCustomData>
        : null
      accessToken: string
    }
  }) => Promise<{ isValid: boolean }>
}

export type TTokenAuthConfigWithInputMetadata<
  TCustomData extends TTokenCustomData,
  TRegistry extends TAnyRegistryData,
> = TTokenAuthConfig<TCustomData> &
  TAuthInputMetadata<TRegistry, "tokenAuthMetadataSchema">

export type TTokenAuthConfigWithOutputMetadata<
  TCustomData extends TTokenCustomData,
  TRegistry extends TAnyRegistryData,
> = TTokenAuthConfig<TCustomData> &
  TAuthOutputMetadata<TRegistry, "tokenAuthMetadataSchema">

export type TNoAuth = {
  type: typeof AuthType.NONE
  config: undefined
}

export type TTokenAuth<
  TCustomData extends TTokenCustomData,
  TRegistry extends TAnyRegistryData,
> = {
  type: typeof AuthType.TOKEN
  config: TTokenAuthConfigWithOutputMetadata<TCustomData, TRegistry>
}

type TOAuth<TRegistry extends TAnyRegistryData> = {
  type: typeof AuthType.OAUTH
  config: TOAuthConfigWithOutputMetadata<TRegistry>
}

/**
 * The authentication configuration for an action.
 */
export type TActionAuth<
  TRegistry extends TAnyRegistryData,
  TCustomData extends TTokenCustomData,
> = TNoAuth | TTokenAuth<TCustomData, TRegistry> | TOAuth<TRegistry>

export type TAnyActionAuth = TActionAuth<TAnyRegistryData, TTokenCustomData>

/**
 * Generic type for getting the auth argument in the action input function.
 *
 * The auth argument will always have an `accessToken` property, but it may also have a `customData` property if the auth config has a custom data schema.
 */
export type TAuthArg<TAuth extends TAnyActionAuth> =
  TAuth["type"] extends typeof AuthType.NONE
    ? never
    : TAuth["type"] extends typeof AuthType.OAUTH
      ? { accessToken: string }
      : TAuth["type"] extends typeof AuthType.TOKEN
        ? TAuth["config"] extends TTokenAuthConfigWithOutputMetadata<
            infer TCustomData,
            TAnyRegistryData
          >
          ? TCustomData extends TTokenCustomData
            ? {
                customData: TCustomData extends z.AnyZodObject
                  ? z.output<TCustomData>
                  : null
                accessToken: string
              }
            : never
          : never
        : never
