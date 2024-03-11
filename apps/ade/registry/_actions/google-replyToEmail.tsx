import z from "zod"
import { createADEAction } from "../_properties/generators"

const GoogleReplyToEmailAction = createADEAction({
  id: "google-replyToEmail",
  metadata: {
    title: "Reply To Email",
    description: "Send an email with the Gmail API",
    renderOnClient: true,
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
  },
})
  .describe("Send an email with the Gmail API")
  .input({
    body: z.string().describe("The body of the email"),
    subject: z.string().describe("The subject of the email thread."),
    to: z
      .string()
      .describe("The email address of the last sender in the thread."),
    threadId: z.string().describe("The ID of the thread to reply to."),
  })
  .authType("OAuth")
  .oAuthData({
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
  .handler(async ({ input, auth, context }) => {
    const { userData } = context
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
