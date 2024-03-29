import { z } from "zod"

export const ActionsRegistryMetadataSchema = z.object({
  /**
   * The public facing name of the action. This should be a verb phrase.
   *
   * @example "Create issue"
   * @example "Get availabilities"
   * @example "Get Google contact"
   */
  title: z.string().min(1),

  /**
   * A short description of what the action does.
   *
   * @example "Creates an issue in Linear"
   * @example "Gets the availabilities of a user using Google's FreeBusy API"
   * @example "Gets a contact from Google Contacts"
   */
  description: z.string().min(1),

  /**
   * The name of the resource that the action operates on.
   *
   * @example "Google Calendar"
   * @example "Gmail"
   * @example "Notion"
   */
  resource: z.string().min(1),

  /**
   * The default keywords the user will have to reference the action. Spaces are not allowed.
   *
   * So for example, if the keyword is "create-issue", the user will be able to type @ create-issue to reference the action.
   *
   * @example ["create-issue"]
   * @example ["get-google-contact"]
   * @example ["send-mail", "send-google-mail"]
   */
  defaultKeywords: z.array(z.string().min(1)),

  /**
   * The image to display as the avatar/icon for the action. The `light` source is used when the light theme is enabled, and the `dark` source is used when the dark theme is enabled.
   *
   * @example
   * The Google logo is used for the `Google Calendar` action and is under the filepath of "/logos/google.svg".
   * ```
   * {
   *   light: "/logos/google.svg",
   *   dark: "/logos/google.svg"
   * }
   * ```
   *
   * @example
   * The Energize AI logo is used for the `feedback` action. We want the black version of the logo to be used in the light theme, and the white version of the logo to be used in the dark theme.
   * ```
   * {
   *   light: "/logos/energize-black.svg",
   *   dark: "/logos/energize-white.svg"
   * }
   * ```
   */
  avatar: z.object({
    /**
     * The image to display when the light theme is enabled.
     */
    light: z.string().min(1),

    /**
     * The image to display when the dark theme is enabled.
     */
    dark: z.string().min(1),
  }),

  /**
   * The text to encode in the user message when the action is invoked.
   *
   * @example
   * When the user types @get-availabilities, the message "Please check my calendar for availability" is encoded in the user message.
   * ```
   * "Please check my calendar for availability"
   * ```
   *
   * @example
   * When the user types @get-google-contact, the message "Please get my Google contact" is encoded in the user message.
   * ```
   * "Please get my Google contact"
   * ```
   */
  chatMessage: z.string().default("Please call my tool"),

  /**
   * The URL to the API reference for the action. This is used to generate the "Learn more" button in the action details page.
   *
   * @example
   * The API reference for the `Google Calendar API` is used for the Google Calendar action.
   * ```
   * "https://developers.google.com/calendar/api/v3/reference"
   * ```
   *
   * @example
   * The API reference for the `Google People API` is used for the Google Contacts action.
   * ```
   * "https://developers.google.com/people/api/rest/v1/people/get"
   * ```
   */
  apiReference: z.string().nullable(),

  /**
   * Useful examples to get the user started with the action. This is used to generate the "Examples" section in the action details page.
   *
   * @example
   * The following examples are used for the `Google Calendar` create event action.
   * ```
   * [
   *  "I have a dentist appointment on Monday at 2pm",
   *  "I have a meeting with John on Tuesday at 3pm",
   *  "I have a doctor's appointment on June 1st at 10am",
   * ]
   * ```
   */
  examples: z.array(z.string()).default([]),

  /**
   * The loading message to stream in the chat when the action gets invoked.
   *
   * @example
   * The following loading message is used for the `Google Contacts` action.
   * ```
   * "Searching your contacts"
   * ```
   *
   * @example
   * The following loading message is used for the `DALLE-3` action.
   * ```
   * "Generating an image with DALLE-3"
   * ```
   */
  loadingMessage: z.string().default("Loading..."),

  /**
   * When the LLM calls the tool, sometimes you want to give it data only available at runtime. We have found that user data and the local time zone are useful to have at runtime.
   *
   * @param localTimeZone The local time zone of the user. This is a string in the format of "America/Los_Angeles".
   * @param userData The user data of the user. This is an object with the properties `name` and `email`.
   *
   * @returns A string that will be used at runtime when the LLM calls the tool. If null is returned, the LLM will use the description of the input schema.
   *
   * @example
   * A useful thing to pass to the LLM when it has a tool that deals with dates are things like the current day of the week, the current time, and the local time zone.
   * Here is how you would pass that to the LLM.
   *
   * ```
   * ({ localTimeZone }) => {
   *   const { dayOfWeek, currentTimeRFC3339 } = getDayOfWeekAndTime();
   *   return `For reference, the current day is ${dayOfWeek}, the current time is ${currentTimeRFC3339}, the local timezone is ${localTimeZone}.`
   * }
   * ```
   *
   * @example
   * When sending emails, it is helpful for the LLM to know the user's name so it can personalize the email.
   *
   * ```
   * ({ userData }) => {
   *  return `The user's name is ${userData.name}, so make sure to use that in the email signature.`
   * }
   * ```
   */
})

/**
 * Base type for configuring authentication.
 */
const AuthConfigBase = z.object({
  /**
   * A configuration object for the button users will see before authenticating.
   */
  button: z.object({
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
    text: z.string(),
  }),

  /**
   * The URL to the privacy policy for the authentication.
   *
   * @example
   * The following URL is used for the `Google People API` authentication.
   * ```
   * "https://developers.google.com/people/v1/getting-started"
   * ```
   */
  policyReferenceURL: z.string().default(""),

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
  humanReadableName: z.string(),

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
  humanReadableDescription: z.string(),
})

/**
 * Configuration for authenticating with an access token that users must generate themselves.
 *
 * This is useful for resources that don't support OAuth, but do support API keys.
 */
export const TokenAuthMetadataSchema = AuthConfigBase.extend({
  /**
   * The URL for documentation on how to generate an access token from the provider.
   *
   * This will be displayed for users when they are configuring the action to help them get setup.
   */
  generatingTokenReferenceURL: z.string(),
})

/**
 * Configuration for OAuth-based authentication.
 */
export const OAuth2AuthMetadataSchema = AuthConfigBase.extend({
  /**
   * A URL that will take the user to where they can generate their own OAuth app to obtain a client ID and client secret.
   */
  oauthAppGenerationURL: z.string(),

  /**
   * A URL to documentation that helps users understand the OAuth process or set it up.
   */
  documentationURL: z.string().optional(),
})
