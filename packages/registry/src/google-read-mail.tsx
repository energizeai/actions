import { createAction, createActionMetadata } from "@energizeai/types"
import z from "zod"

const GoogleReadMailAction = createAction({
  metadata: createActionMetadata({
    title: "Read Email",
    description: "List the messages in your Gmail inbox",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["read-email"],
    apiReference:
      "https://developers.google.com/people/api/rest/v1/people/searchContacts",
    examples: ["what new messages do I have in my inbox?"],
  }),
})
  .setInputSchema(
    z
      .object({
        query: z
          .string()
          .optional()
          .default("is:unread")
          .describe(
            `Only return messages matching the specified query. Supports the same query format as the Gmail search box. For example, "from:someuser@example.com rfc822msgid:<somemsgid@example.com> is:unread".`
          ),
      })
      .describe(`List the messages in your Gmail inbox`)
  )
  .setOutputSchema(
    z.object({
      messages: z.array(z.any().describe("The messages in your Gmail inbox")),
    })
  )
  .setAuthType("OAuth")
  .setOAuthData({
    humanReadableDescription: "Read-only access to your Google email",
    humanReadableName: "Google Email",
    button: {
      text: "Continue with Google",
    },
    discoveryEndpoint:
      "https://accounts.google.com/.well-known/openid-configuration",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    oauthAppGenerationURL: "https://console.cloud.google.com/apis/credentials",
  })
  .setActionFunction(async ({ input, auth, userData }) => {
    // search contacts
    const base = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json",
    }

    const url = new URL(base)
    url.searchParams.append("q", input.query)
    url.searchParams.append("maxResults", "50")

    const response = await fetch(url.toString(), {
      headers,
    })

    if (!response.ok) {
      throw new Error("Could not fetch contacts")
    }

    const data = await response.json()

    const parsedData = z
      .object({
        messages: z.array(z.any()),
      })
      .safeParse(data)

    // if no messages are found, throw an error
    if (!parsedData.success || parsedData.data.messages.length === 0) {
      throw new Error(
        `Could not find messages for ${input.query} in your Google email`
      )
    }

    return {
      messages: parsedData.data.messages.slice(0, 5),
    }
  })

export { GoogleReadMailAction }
