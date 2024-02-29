import { z } from "zod"
import { createADEAction } from "../_properties/generators"

export const ZoomCreateMeetingAction = createADEAction({
  id: "zoom-createMeeting",
  metadata: {
    title: "Create Meeting",
    description: "Create a new Zoom meeting",
    resource: "Zoom",
    avatar: {
      light: "/logos/zoom.svg",
      dark: "/logos/zoom.svg",
    },
    defaultKeywords: ["create-zoom-meeting"],
    apiReference:
      "https://developers.zoom.us/docs/api/rest/reference/zoom-api/ma/#operation/meetingCreate",
    examples: ["Create a new Zoom meeting"],
  },
})
  .setInputSchema(
    z.object({
      agenda: z.string().max(2000).describe("Meeting agenda"),
      duration: z.number().describe("Length in minutes").default(30),
      start_time: z
        .string()
        .describe("Starting time in GMT, formatted yyyy-MM-ddTHH:mm:ssZ")
        .optional(),
      topic: z.string().describe("Meeting Name").max(2000),
      meeting_invitees: z
        .array(z.string().email().describe("Email of the invitee"))
        .describe("Meeting invitee list"),
    })
  )

  // ==========================================================================
  // Define the output schema for your action
  // ==========================================================================

  .setActionType("CLIENT")
  .setOutputSchema(
    z.object({
      join_url: z.string().describe("Join URL"),
      password: z.string().describe("Meeting password"),
    })
  )

  // ==========================================================================
  // Define the authentication configuration for your action
  // ==========================================================================

  .setAuthType("OAuth")
  .setOAuthData({
    humanReadableDescription: "Enables write access to Zoom Meetings API",
    humanReadableName: "Create Meeting",
    button: {
      text: "Continue with Zoom",
    },
    discoveryEndpoint: undefined,
    authorizationEndpoint: "https://zoom.us/oauth/authorize",
    tokenEndpoint: "https://zoom.us/oauth/token",
    revokeEndpoint: "https://zoom.us/oauth/revoke",
    codeChallengeMethod: null,
    scopes: ["meeting:write", "user_info:read"],
    oauthAppGenerationURL: "https://marketplace.zoom.us/develop/create",
  })

  // ==========================================================================
  // Define the action function for your action
  // ==========================================================================

  .setActionFunction(async ({ input, auth, context }) => {
    const { userData } = context

    // Get Zoom userID
    var url = `https://api.zoom.us/v2/users/${userData.email}`

    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    const data = await response.json()
    const userId = data.id

    // Create Zoom meeting
    const meetingDetails = {
      topic: input.topic,
      type: 2,
      start_time: input.start_time,
      duration: input.duration,
      timezone: context.localTimeZone,
      agenda: input.agenda,
      settings: {
        host_video: "true",
        participant_video: "true",
        join_before_host: "False",
        mute_upon_entry: "False",
        watermark: "true",
        audio: "voip",
        auto_recording: "cloud",
        meeting_invitees: input.meeting_invitees.map((email) => {
          return { email }
        }),
      },
    }

    url = `https://api.zoom.us/v2/users/${userId}/meetings`

    const response2 = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(meetingDetails),
    })

    if (!response2.ok) {
      const errorData = await response2.json()
      console.log(errorData)
      throw new Error(`HTTP error! status: ${response2.status}`)
    }

    const data2 = await response2.json()

    return {
      join_url: data2.join_url,
      password: data2.password,
    }
  })
