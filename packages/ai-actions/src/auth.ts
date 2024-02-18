import z from "zod"
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

/**
 * Base type for configuring authentication.
 */
export type TAuthConfigBase = {
  /**
   * A configuration object for the button users will see before authenticating.
   */
  button: {
    /**
     * The text to display on the button.
     *
     * @example
     * The following text is used for the `Google Calendar` authentication button.
     * ```
     * "Continue with Google"
     * ```
     *
     * @example
     * The following text is used for the `Linear` authentication button.
     * ```
     * "Continue with Linear"
     * ```
     */
    text: string
  }

  /**
   * The URL to the privacy policy for the authentication.
   *
   * @example
   * The following URL is used for the `Google People API` authentication.
   * ```
   * "https://developers.google.com/people/v1/getting-started"
   * ```
   */
  policyReferenceURL?: string

  /**
   * A human readable name for the scope of the authentication.
   *
   * @example
   * The following name is used for the `Google Calendar` read scope authentication.
   * ```
   * "Google Calendar"
   * ```
   *
   * @example
   * The following name is used for the `Google Contacts` read scope authentication.
   * ```
   * "Google Contacts"
   * ```
   */
  humanReadableName: string

  /**
   * A human readable description for the scope of the authentication.
   *
   * @example
   * The following description is used for the `Google Calendar` read scope authentication.
   * ```
   * "Read-only access to your Google Calendar"
   * ```
   *
   * @example
   * The following description is used for the `Google Calendar` write scope authentication.
   * ```
   * "Read and write access to your Google Calendar"
   * ```
   */
  humanReadableDescription: string
}

/**
 * Configuration for OAuth-based authentication.
 */
export type TOAuthConfig = TAuthConfigBase & {
  /**
   * An non-empty array of scopes required for the OAuth authentication.
   *
   * @example
   * The following scopes are used for the `Google Contacts` authentication.
   * ```
   * ["https://www.googleapis.com/auth/contacts.other.readonly", "https://www.googleapis.com/auth/contacts.readonly"]
   * ```
   */
  scopes: [string, ...string[]]

  /**
   * A URL that will take the user to where they can generate their own OAuth app to obtain a client ID and client secret.
   */
  oauthAppGenerationURL: string

  /**
   * A URL to documentation that helps users understand the OAuth process or set it up.
   */
  documentationURL?: string
} & (
    | {
        /**
         * The URL of the OAuth 2.0 Discovery Endpoint.
         *
         * @example
         * For google, this is `https://accounts.google.com/.well-known/openid-configuration`.
         */
        discoveryEndpoint: string
      }
    | {
        discoveryEndpoint: undefined

        /**
         * The URL of the authorization endpoint for OAuth.
         *
         * @example
         * For google, this is `https://accounts.google.com/o/oauth2/v2/auth`.
         */
        authorizationEndpoint: string

        /**
         * The URL of the token endpoint for obtaining access and refresh tokens.
         *
         * @example
         * For google, this is `https://oauth2.googleapis.com/token`.
         */
        tokenEndpoint: string

        /**
         * The URL of the refresh endpoint for refreshing access tokens.
         *
         * @example
         * For google, this is `https://oauth2.googleapis.com/token`.
         */
        refreshEndpoint?: string

        /**
         * The URL of the revoke endpoint for revoking access tokens.
         *
         * @example
         * For google, this is `https://oauth2.googleapis.com/revoke`.
         */
        revokeEndpoint: string

        /**
         * The code challenge method used for PKCE. It can either be 'S256' or null.
         */
        codeChallengeMethod: "S256" | null
      }
  )

export type TTokenCustomData = z.ZodObject<any> | null

/**
 * Configuration for authenticating with an access token that users must generate themselves.
 *
 * This is useful for resources that don't support OAuth, but do support API keys.
 */
export type TTokenAuthConfig<TCustomData extends TTokenCustomData> =
  TAuthConfigBase & {
    /**
     * The URL for documentation on how to generate an access token from the provider.
     *
     * This will be displayed for users when they are configuring the action to help them get setup.
     */
    generatingTokenReferenceURL: string

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

/**
 * The authentication configuration for an action.
 */
export type TActionAuth =
  | {
      type: typeof AuthType.NONE
      config: undefined
    }
  | {
      type: typeof AuthType.TOKEN
      config: TTokenAuthConfig<any>
    }
  | {
      type: typeof AuthType.OAUTH
      config: TOAuthConfig
    }

/**
 * Generic type for getting the auth argument in the action input function.
 *
 * The auth argument will always have an `accessToken` property, but it may also have a `customData` property if the auth config has a custom data schema.
 */
export type TAuthArg<TAuth extends TActionAuth> =
  TAuth["config"] extends TTokenAuthConfig<any>
    ? {
        customData: TAuth["config"]["customDataSchema"] extends null
          ? null
          : z.infer<TAuth["config"]["customDataSchema"]>
        accessToken: string
      }
    : TAuth["config"] extends TOAuthConfig
      ? { accessToken: string }
      : never
