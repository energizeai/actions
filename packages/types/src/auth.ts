import { z } from "zod"

/**
 * Base type for configuring authentication.
 */
type TAuthConfigBase = Readonly<{
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

    /**
     * The image to display on the button.
     *
     * @example
     * The following image is used for the `Google Calendar` action.
     * ```
     * {
     *   light: "/logos/google.svg",
     *   dark: "/logos/google.svg"
     * }
     * ```
     *
     * @example
     * The following image is used for the `Linear` action.
     * ```
     * {
     *   light: "/logos/linear-black.svg",
     *   dark: "/logos/linear-white.svg"
     * }
     * ```
     */
    image: {
      /**
       * The image to display when the light theme is enabled.
       */
      light: string

      /**
       * The image to display when the dark theme is enabled.
       */
      dark: string
    }
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
  policyReferenceURL: string

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
}>

/**
 * Configuration for authenticating with no authentication.
 *
 * This is useful for resources that don't require authentication.
 */
type TNoAuth = {
  type: "none"
}

/**
 * Configuration for authenticating with an access token that users must generate themselves.
 *
 * This is useful for resources that don't support OAuth, but do support API keys.
 */
type TTokenAuthConfig = TAuthConfigBase &
  Readonly<{
    /**
     * The type of authentication: `token`.
     */
    type: "token"

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
    customDataSchema: z.ZodObject<any> | null
  }>

/**
 * Configuration for OAuth-based authentication.
 */
export type TOAuthConfig = TAuthConfigBase &
  Readonly<{
    /**
     * The type of authentication. In this case, 'oauth' for OAuth-based authentication.
     */
    type: "oauth"

    /**
     * An non-empty array of scopes required for the OAuth authentication.
     *
     * @example
     * The following scopes are used for the `Google Contacts` authentication.
     * ```
     * ["https://www.googleapis.com/auth/contacts.other.readonly", "https://www.googleapis.com/auth/contacts.readonly"]
     * ```
     */
    scopes: Readonly<[string, ...string[]]>

    /**
     * A URL to documentation that helps users understand the OAuth process or set it up.
     */
    documentationURL: string
  }> &
  (
    | Readonly<{
        /**
         * The URL of the OAuth 2.0 Discovery Endpoint.
         *
         * @example
         * For google, this is `https://accounts.google.com/.well-known/openid-configuration`.
         */
        discoveryEndpoint: string
      }>
    | Readonly<{
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
        refreshEndpoint: string

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
      }>
  )

/**
 * Type definition for authentication configuration. It can be either TokenAuthConfig or OAuthConfig.
 */
export type TAuthConfig = TTokenAuthConfig | TOAuthConfig | TNoAuth

/**
 * Generic type for getting the auth argument in the action input function.
 *
 * The auth argument will always have an `accessToken` property, but it may also have a `customData` property if the auth config has a custom data schema.
 */
export type TAuthInputArg<TAuth extends TAuthConfig> =
  TAuth extends TTokenAuthConfig
    ? {
        customData: TAuth["customDataSchema"] extends null
          ? null
          : z.infer<NonNullable<TAuth["customDataSchema"]>>
        accessToken: string
      }
    : TAuth extends TOAuthConfig
      ? { accessToken: string }
      : null
