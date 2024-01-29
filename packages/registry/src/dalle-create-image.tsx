import { TActionConfig, TAuthConfig } from "@energizeai/types"
import { z } from "zod"

// ================================================================================
// DEFINE INPUT SCHEMA
// ================================================================================

const InputSchema = z
  .object({
    prompt: z.string().min(1).describe(`A prompt for the user.`),
  })
  .describe(`Generate an image based on a prompt with the DALLE-3 API.`)
type TInput = typeof InputSchema

// ================================================================================
// DEFINE OUTPUT SCHEMA
// ================================================================================

const OutputSchema = z
  .object({
    generatedImageUrl: z
      .string()
      .url()
      .describe(`The URL of the generated image.`),
  })
  .describe(`The output of the DALLE-3 API.`)
type TOutput = typeof OutputSchema

// ================================================================================
// DEFINE AUTH CONFIG
// ================================================================================

const AuthConfig = {
  type: "token",
  policyReferenceURL: "",
  generatingTokenReferenceURL: "",
  customDataSchema: null,
  humanReadableName: "OpenAI",
  humanReadableDescription: "Token based access to your DALLE-3 API.",
  button: {
    text: "Continue with OpenAI",
    image: {
      light: "/logos/openai-black.svg",
      dark: "/logos/openai-white.svg",
    },
  },
} as const satisfies TAuthConfig
type TAuth = typeof AuthConfig

// ================================================================================
// DEFINE ACTION : )
// ================================================================================

const DalleCreateImageAction = {
  resource: "OpenAI",
  defaultKeywords: ["dalle-create-image"],
  title: "Create Image",
  scopePool: null,
  chatMessage: "Please create an image using the DALLE-3 API.",
  description: "Create an image using the DALLE-3 API.",
  avatar: {
    light: "/logos/openai-black.svg",
    dark: "/logos/openai-white.svg",
  },
  apiReference:
    "https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send",
  examples: [
    "make an image of a monkey playing the drums in a band",
    "show me what it would look like if an astronaut was playing basketball on the moon",
    "I'm imagining a cat with a mohawk",
  ],
  authConfig: AuthConfig,
  input: InputSchema,
  output: OutputSchema,
  loadingMessage: "Generating image with DALLE-3...",
  actionFunction: async ({ input, auth }) => {
    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      }
    ).then((res) => res.json())

    if (response.error) {
      throw new Error(response.error.message)
    }

    return {
      generatedImageUrl: "",
    }
  },
} as const satisfies TActionConfig<TInput, TOutput, TAuth>

export default DalleCreateImageAction
