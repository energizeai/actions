import { createAction, createActionMetadata } from "@energizeai/types"
import { simpleParser } from "mailparser"
import z from "zod"

const outputSchema = z.object({
  id: z.string().describe(`The ID of the message.`),
  threadId: z.string().describe(`The ID of the thread.`),
  labelIds: z
    .array(z.string())
    .describe(`List of IDs of labels applied to this message.`),
  subject: z.string().optional().describe(`The subject of the message.`),
  textBody: z.string().optional().describe(`The text body of the message.`),
  from: z.string().describe(`The email address of the sender.`),
})

const GoogleReadEmailAction = createAction({
  metadata: createActionMetadata({
    title: "Read Email",
    description: "Read a specified email from the user's Gmail",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["read-email"],
    apiReference:
      "https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get",
  }),
})
  .setInputSchema(
    z
      .object({
        messageId: z.string().min(1).describe(`The ID of the email to read.`),
      })
      .describe(
        `Read a specified email from the user's Gmail. This is useful to read an email that was not already provided.`
      )
  )
  .setOutputSchema(outputSchema)
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
    const getEmailUrl = new URL(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${input.messageId}`
    )
    getEmailUrl.searchParams.append("format", "raw")

    const emailResponse = await fetch(getEmailUrl.toString(), {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        Accept: "application/json",
      },
    })

    if (!emailResponse.ok) {
      throw new Error("Could not fetch email")
    }

    const email = z
      .object({
        id: z.string(),
        threadId: z.string(),
        labelIds: z.array(z.string()),
        raw: z.string(),
      })
      .parse(await emailResponse.json())

    // Decode the raw email data
    const decodedEmail = Buffer.from(email.raw, "base64").toString("utf-8")

    // Step 2: Use Mailparser to parse the decoded email
    const parsedEmail = await simpleParser(decodedEmail)

    return {
      id: email.id,
      threadId: email.threadId,
      labelIds: email.labelIds,
      textBody: parsedEmail.text,
      subject: parsedEmail.subject,
      from: parsedEmail.from?.text || "NA",
    }
  })

export { GoogleReadEmailAction }
