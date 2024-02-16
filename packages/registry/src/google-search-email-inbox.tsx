import { createAction, createActionMetadata } from "@energizeai/types"
import z from "zod"

const OutputSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().describe(`The ID of the message.`),
        threadId: z.string().describe(`The ID of the thread.`),
        snippet: z.string().optional().describe(`The snippet of the message.`),
        subject: z.string().optional().describe(`The subject of the message.`),
        from: z.object({
          name: z.string().optional().describe(`The name of the sender.`),
          email: z.string().optional().describe(`The email of the sender.`),
        }),
      })
    )
    .describe(`List of messages in the user's mailbox.`),
  nextPageToken: z
    .string()
    .optional()
    .describe(`Token to retrieve the next page of results in the list.`),
})

const GoogleSearchEmailInboxAction = createAction({
  id: "google-searchEmailInbox",
  metadata: createActionMetadata({
    title: "Search Email Inbox",
    description: "Query the messages in your Gmail inbox",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["search-email-inbox"],
    apiReference:
      "https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list",
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
        pageToken: z
          .string()
          .optional()
          .describe(
            `Page token to retrieve a specific page of results in the list. Optional.`
          ),
      })
      .describe(`List the messages in your Gmail inbox`)
  )
  .setOutputSchema(OutputSchema)
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
    // Fetch the messages from the Gmail API
    const base = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      Accept: "application/json",
    }

    const url = new URL(base)
    url.searchParams.append("q", input.query)
    url.searchParams.append("maxResults", "5")

    if (input.pageToken) {
      url.searchParams.append("pageToken", input.pageToken)
    }

    const response = await fetch(url.toString(), {
      headers,
    })

    if (!response.ok) {
      throw new Error("Could not fetch email")
    }

    const data = await response.json()

    const parsedData = z
      .object({
        messages: z.array(
          z.object({
            id: z.string(),
            threadId: z.string(),
          })
        ),
        nextPageToken: z.string().optional(),
      })
      .safeParse(data)

    async function getEmailMetadata(
      messageId: string
    ): Promise<z.infer<typeof OutputSchema>["messages"][number]> {
      const metadataUrl = new URL(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`
      )
      metadataUrl.searchParams.append("format", "metadata")

      const metdataResponse = await fetch(metadataUrl.toString(), {
        headers,
      })

      if (!metdataResponse.ok) {
        throw new Error("Could not fetch email metadata")
      }

      const metadata = await metdataResponse.json()

      const data = z
        .object({
          snippet: z.string().optional(),
          threadId: z.string(),
          labelIds: z.array(z.string()),
          payload: z.object({
            headers: z.array(
              z.object({
                name: z.string(),
                value: z.string(),
              })
            ),
          }),
        })
        .parse(metadata)

      return {
        id: messageId,
        threadId: data.threadId,
        snippet: data.snippet,
        subject: data.payload.headers.find(
          (header) => header.name === "Subject"
        )?.value,
        from: {
          name: data.payload.headers
            .find((header) => header.name === "From")
            ?.value.split(" <")[0],
          email: data.payload.headers
            .find((header) => header.name === "From")
            ?.value.split(" <")[1]
            ?.replace(">", ""),
        },
      }
    }

    // if no messages are found, throw an error
    if (!parsedData.success || parsedData.data.messages.length === 0) {
      throw new Error(
        `Could not find messages for ${input.query} in your Google email`
      )
    }

    const metadatas = await Promise.allSettled(
      parsedData.data.messages.map(async (message) => {
        return await getEmailMetadata(message.id)
      })
    ).then((results) => {
      return results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<
            z.infer<typeof OutputSchema>["messages"][number]
          > => {
            return result.status === "fulfilled"
          }
        )
        .map((result) => result.value)
    })

    return {
      messages: metadatas,
      nextPageToken: parsedData.data.nextPageToken,
    }
  })

export { GoogleSearchEmailInboxAction }
