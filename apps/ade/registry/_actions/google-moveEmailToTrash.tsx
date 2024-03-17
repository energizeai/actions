import z from "zod"
import { createADEAction } from "../_properties/generators"

const GoogleMoveEmailToTrash = createADEAction({
  id: "google-moveEmailToTrash",
  metadata: {
    title: "Move Emails to Trash",
    description: "Move a list of specific emails to the trash.",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["move-emails-to-trash"],
    apiReference:
      "https://developers.google.com/gmail/api/reference/rest/v1/users.messages/trash",
    examples: ["Can you please delete that email?"],
  },
})
  .describe("Moves the specified message to the trash.")
  .input({
    messageIds: z.array(
      z
        .string()
        .min(1)
        .describe(`The ID of the message/email to be moved to the trash.`)
    ),
  })
  .authType("OAuth")
  .oAuthData({
    humanReadableDescription: "Ability to modify your Google emails",
    humanReadableName: "Google Email",
    button: {
      text: "Continue with Google",
    },
    discoveryEndpoint:
      "https://accounts.google.com/.well-known/openid-configuration",
    scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    oauthAppGenerationURL: "https://console.cloud.google.com/apis/credentials",
  })
  .handler(async ({ input, auth }) => {
    async function moveEmailToTrash(messageId: string) {
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(
          `Failed to move the email to the trash. The Gmail API responded with a ${response.status} status code.`
        )
      }

      return { success: true }
    }

    const results = await Promise.allSettled(
      input.messageIds.map(moveEmailToTrash)
    )

    const failedResults = results.filter(
      (result) => result.status === "rejected"
    )

    if (failedResults.length > 0) {
      throw new Error(
        `Failed to move some emails to the trash. ${failedResults.length} emails failed to be moved to the trash.`
      )
    }

    return
  })

export { GoogleMoveEmailToTrash }
