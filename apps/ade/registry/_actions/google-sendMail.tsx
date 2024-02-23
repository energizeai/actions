import z from "zod"
import { createADEAction } from "../_properties/generators"

const GoogleSendMailAction = createADEAction({
  id: "google-sendMail",
  metadata: {
    title: "Send Email",
    description: "Send an email with the Gmail API",
    resource: "Google",
    loadingMessage: "Generating email...",
    chatMessage: "Please send an email",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["send-email"],
    apiReference:
      "https://www.google.com/search?q=google+send+mail+api&sourceid=chrome&ie=UTF-8",
    examples: ["Send an email to johnappleseed@gmail.com"],
  },
})
  .setInputSchema(
    z.object({
      subject: z.string().describe("The subject of the email"),
      body: z.string().describe("The body of the email"),
      to: z
        .array(
          z.object({
            email: z
              .string()
              .email()
              .describe("The email address to send the email to"),
          })
        )
        .describe("The email address to send the email to"),
    })
  )
  .setActionType("CLIENT")
  .setOutputAsVoid()
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
  .setActionFunction(async ({ input, auth, extras }) => {
    const { userData } = extras
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

    const rawEmail = createEmail(
      input.to.map((to) => to.email),
      input.subject,
      input.body
    )

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          raw: rawEmail,
        }),
      }
    ).then((res) => res.json())

    return
  })

export { GoogleSendMailAction }
