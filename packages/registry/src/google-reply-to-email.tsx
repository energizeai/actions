import {
  TActionComponent,
  createAction,
  createActionMetadata,
} from "@energizeai/types"
import z from "zod"
import { GoogleReplyToEmailCard } from "./_components/google-reply-to-email-card"

const actionInputSchema = z.object({
  body: z.string().describe("The body of the email"),
  subject: z.string().describe("The subject of the email thread."),
  to: z
    .string()
    .describe("The email address of the last sender in the thread."),
  threadId: z.string().describe("The ID of the thread to reply to."),
})

export type TGoogleReplyToEmailCard = TActionComponent<typeof actionInputSchema>

const GoogleReplyToEmailAction = createAction({
  metadata: createActionMetadata({
    title: "Reply To Email",
    description: "Send an email with the Gmail API",
    resource: "Google",
    loadingMessage: "Replying to email...",
    chatMessage: "Please reply to email",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["reply-to-email"],
    apiReference:
      "https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send",
  }),
})
  .setInputSchema(actionInputSchema)
  .setOutputSchema(z.void())
  .setOutputComponent(GoogleReplyToEmailCard)
  .setAuthType("OAuth")
  .setOAuthData({
    humanReadableDescription: "Ability to send emails using Google's api",
    humanReadableName: "Gmail Send",
    button: {
      text: "Continue with google",
    },
    discoveryEndpoint:
      "https://accounts.google.com/.well-known/openid-configuration",
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    oauthAppGenerationURL: "https://console.cloud.google.com/apis/credentials",
  })
  .setActionFunction(async ({ input, auth, userData }) => {
    function createEmail(
      to: string[],
      subject: string,
      message: string
    ): string {
      const toField = to.join(", ")
      const emailLines = [
        `To: ${toField}`,
        `From: ${userData.email}`,
        `Subject: ${subject}`,
        "",
        message,
      ]

      const email = emailLines.join("\r\n").trim()

      // Convert the email to a URL-safe base64-encoded string
      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
      return encodedEmail
    }

    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
    }

    const rawEmail = createEmail([input.to], input.subject, input.body)

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          raw: rawEmail,
          threadId: input.threadId,
        }),
      }
    ).then((res) => res.json())

    return
  })

export { GoogleReplyToEmailAction }
