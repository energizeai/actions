import { z } from "zod";
import { createADEAction } from "./_properties/generators"
import { inferActionComponent } from "ai-actions"
import { ZoomCreateMeetingCard } from "./_components/zoom-create-meeting-card"

// NOTE: Add to template
export type TZoomCreateMeetingCard = inferActionComponent<
  typeof createADEAction,
  typeof CreateMeetingAction
>

const CreateMeetingAction = createADEAction({
  id: "zoom-createMeeting",
  // ==========================================================================
  // Define the metadata for your action
  // ==========================================================================
  metadata: {
    title: "Create Meeting",
    description: "Create a new Zoom meeting",
    resource: "Zoom",
    avatar: {
      light: "/logos/zoom.svg",
      dark: "/logos/zoom.svg",
    },
    defaultKeywords: ["create-zoom-meeting"],
    apiReference: "https://developers.zoom.us/docs/api/rest/reference/zoom-api/ma/#operation/meetingCreate",
    examples: ["Create a new Zoom meeting"]
  },
})

  // ==========================================================================
  // Define the input schema for your action
  // ==========================================================================

  .setInputSchema(
    z.object({
      agenda: z.string().describe("Meeting agenda (max len 2000ch)").default(""),
      duration: z.number().describe("Length in minutes").default(30),
      schedule_for: z.string().describe("Email address/userID of user to schedule meeting for"),
      start_time: z.string().describe("Starting time in GMT, formatted yyyy-MM-ddTHH:mm:ssZ"),
      topic: z.string().describe("Meeting Name").max(2000),
      type: z.number().describe("Type of meeting (1 instant, 2 scheduled, 3 recurring with no fixed time, 8 recurring with fixed time)").default(2),
      timezone: z.string().describe("Timezone of your boss, in Olson TZ Format"),
      recurrence: z.object({
        type: z.number().describe("Type of recurrence. 1 for Daily, 2 for Weekly, 3 for Monthly."),
        repeat_interval: z.number().describe("Repeat interval for the meeting.")
      }).describe("Recurrence settings.").optional(),
      settings: z.object({
        meeting_invitees: z.array(z.object({
          email: z.string().email().describe("Email of the invitee")
        })).describe("Meeting invitee list")
      }).describe("Meeting settings")
    }).describe("Input schema description")
  )

  // ==========================================================================
  // Define the output schema for your action
  // ==========================================================================

  .setActionType("POST")
  .setOutputComponent(ZoomCreateMeetingCard)

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
    discoveryEndpoint:
      undefined,
    authorizationEndpoint: "https://zoom.us/oauth/authorize",
    tokenEndpoint: "https://zoom.us/oauth/token",
    revokeEndpoint: "https://zoom.us/oauth/revoke",
    codeChallengeMethod: null,
    scopes: ["meeting:write:admin", "user:read:admin"],
    oauthAppGenerationURL: "https://marketplace.zoom.us/develop/create",
  })

  // ==========================================================================
  // Define the action function for your action
  // ==========================================================================

  .setActionFunction(async ({ input, auth, extras }) => {
    const { userData } = extras

    // Get Zoom userID
    var url = `https://api.zoom.us/v2/users/${userData.email}`

    console.log(url)

    const headers = {
      'Authorization': `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json'
    }
  
    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    const data = await response.json()
    // Save: personal meeting url is responseData.personal_meeting_url
    const userId = data.id
    console.log("Zoom userId", userId)

    // Create Zoom meeting

    const meetingDetails = {
      topic: input.topic,
      type: input.type,
      start_time: input.start_time,
      duration: input.duration,
      timezone: input.timezone,
      agenda: input.agenda,
      recurrence: input.recurrence,
      settings: {
        host_video: "true",
        participant_video: "true",
        join_before_host: "False",
        mute_upon_entry: "False",
        watermark: "true",
        audio: "voip",
        auto_recording: "cloud",
        meeting_invitees: input.settings.meeting_invitees
      }
    }

    url = `https://api.zoom.us/v2/users/${userId}/meetings`
  
    const response2 = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(meetingDetails)
    })
    
  
    if (!response2.ok) {
      const errorData = await response2.json();
      console.log(errorData)
      throw new Error(`HTTP error! status: ${response2.status}`);
    }
  
    const data2 = await response2.json()
    console.log(`Join URL: ${data2.join_url}`)
    console.log(`Meeting Password: ${data2.password}`)
  
    return
  })
  


  // NOTE: This is in template. Remove?
  .setExampleInput({
    fieldOne: "hello",
    fieldTwo: "world",
  })

export { CreateMeetingAction };