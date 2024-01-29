import z from "zod"

import { TAuthConfig, TAuthInputArg } from "./auth"
import { TScopePool } from "./scope"

export type TActionInput = z.ZodObject<any>
export type TActionOutput = z.ZodObject<any> | z.ZodVoid

type TActionComponentProps<TInput extends TActionInput> = {
  /**
   * The input to the action function. You can use this input to prepopulate the form so all the user has to do is click submit.
   */
  input: z.infer<TInput>

  isSkeletonComponent: boolean

  isPlaceholderComponent: boolean

  /**
   * Indicates whether the action function is currently running.
   */
  isLoading: boolean

  /**
   * Indicates whether the action function has completed running and is successful.
   */
  isSuccess: boolean

  /**
   * Indicates whether the action function has completed running and has failed.
   */
  isError: boolean

  /**
   * The submit handler for the form. This is called when the user clicks the submit button.
   */
  onSubmit: (values: z.infer<TInput>) => Promise<void> // eslint-disable-line no-unused-vars
}

/**
 * For actions that do not return any data (i.e. POST actions), you need to specify a component to render in the chat after the action is invoked.
 * This component should be a form asking for confirmation to submit the input to the action function.
 */
export type TActionComponent<
  TInput extends TActionInput,
  TOutput extends TActionOutput,
> = TOutput extends z.ZodVoid
  ? Readonly<{
      Component: React.FC<
        | TActionComponentProps<TInput>
        | (Partial<TActionComponentProps<TInput>> & {
            /**
             * A placeholder component is used for things like the action details page, where the user can view the component but not interact with it.
             */
            isPlaceholderComponent: true
          })
        | (Partial<TActionComponentProps<TInput>> & {
            /**
             * Indicates whether the `LLM is still streaming in the input to the action function`.
             * If this is the case, it is necessary to show a loading state of the form.
             * We recommend using Skeleton components instead of input fields to indicate that the form is loading.
             */
            isSkeletonComponent: true
          })
      >
    }>
  : {}

/**
 * Generic type for configuring an action. TInput and TOutput are Zod schemas
 * for the input and output of the action, respectively.
 *
 * @example
 * This example configures an action for writing an event to Google Calendar
 * ```
 * {
 *   resource: "Google Calendar",
 *   title: "Write Event",
 *   description: "Write an event to your Google Calendar",
 *   defaultKeywords: ["create-event"],
 *   // ... other properties
 * }
 * ```
 */
export type TActionConfig<
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TAuthConfig,
> = Readonly<{
  /**
   * The public facing name of the action. This should be a verb phrase.
   *
   * @example "Create issue"
   * @example "Get availabilities"
   * @example "Get Google contact"
   */
  title: string

  /**
   * A short description of what the action does.
   *
   * @example "Creates an issue in Linear"
   * @example "Gets the availabilities of a user using Google's FreeBusy API"
   * @example "Gets a contact from Google Contacts"
   */
  description: string

  /**
   * The name of the resource that the action operates on.
   *
   * @example "Google Calendar"
   * @example "Gmail"
   * @example "Notion"
   */
  resource: string

  /**
   * The default keywords the user will have to reference the action. Spaces are not allowed.
   *
   * So for example, if the keyword is "create-issue", the user will be able to type @ create-issue to reference the action.
   *
   * @example ["create-issue"]
   * @example ["get-google-contact"]
   * @example ["send-mail", "send-google-mail"]
   */
  defaultKeywords: Readonly<[string, ...string[]]>

  scopePool: TScopePool<TAuth>

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
  avatar: Readonly<{
    /**
     * The image to display when the light theme is enabled.
     */
    light: string

    /**
     * The image to display when the dark theme is enabled.
     */
    dark: string
  }>

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
  chatMessage: string

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
  apiReference: string | null

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
  examples: Readonly<[string, ...string[]]> | null

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
  loadingMessage: string

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

  // eslint-disable-next-line no-unused-vars
  runTimeDescriptionGenerator?: (_: {
    localTimeZone: string
    userData: { name: string; email: string }
  }) => string | null

  /**
   * The Zod input schema for the action. This is used to validate the arguments passed to the action.
   *
   * You must include a `.describe()` call on each field to provide a description of the input. This description will be used to generate the prompts and details page for your action.
   *
   * @example
   * The following input schema is an example for a `send-email` action.
   * ```
   * z.object({
   *  subject: z.string().desribe("The subject of the email"),
   *  body: z.string().describe("The body of the email"),
   *  to: z.array(z.object({
   *   email: z.string().describe("The email of the recipient"),
   * })).describe("The recipients of the email"),
   * ```
   */
  input: TInput

  /**
   * Spark has two options for outputs:
   *
   * 1.`JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   *
   * 2.`React Component` that asks for confirmation for the action. This is typically the output for actions that `POST data`. If this is the case, you should specify a React component that asks for confirmation for the action. The output will be `void`.
   */
  output: TOutput

  /**
   * The authentication configuration for the action. This is used to generate the authentication page for the action and get users authenticated.
   */
  authConfig: TAuth

  /**
   * The function that gets called when the action is invoked. This function should return a promise that resolves to the output of the action.
   *
   * @param input The input to the action function. This is the input that the user provides when invoking the action.
   * @param auth The authentication information for the action. This is the authentication information that the user provides when invoking the action.
   *
   * @returns A promise that resolves to the output of the action.
   *
   * @example
   * The following action function is an example for a `send-email` action.
   * ```
   * async ({ input, auth }) => {
   *   const { subject, body, to } = input;
   *   const { accessToken } = auth;
   *   ...code to send email using the input...
   *   return;
   * }
   * ```
   *
   * @example
   * The following action function is an example for a `get-google-contact` action.
   * ```
   * async ({ input, auth }) => {
   *   const contact = ...code to get contact...
   *   return contact;
   * }
   * ```
   */

  // eslint-disable-next-line no-unused-vars
  actionFunction: (_: {
    input: z.infer<TInput>
    auth: TAuthInputArg<TAuth>
  }) => Promise<z.infer<TOutput>>
}> &
  TActionComponent<TInput, TOutput>
