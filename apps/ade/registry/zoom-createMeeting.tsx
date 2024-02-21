import { z } from "zod";
import { createADEAction } from "./_properties/generators"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

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
      light: "/logos/energize-black.svg",
      dark: "/logos/energize-white.svg",
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
      agenda: z.string().describe("Meeting agenda (max len 2000ch)"),
      duration: z.number().describe("Length in minutes"),
      schedule_for: z.string().describe("Email address/userID of user to schedule meeting for"),
      start_time: z.string().describe("Starting time in GMT, formatted yyyy-MM-ddTHH:mm:ssZ"),
      topic: z.string().describe("Meeting Name (max len 200ch)"),
      type: z.number().describe("Type of meeting, always 2 - scheduled"),
      timezone: z.string().describe("Timezone of your boss, in Olson TZ Format"),
      recurrence: z.object({
        type: z.number().describe("Type of recurrence. 1 for Daily, 2 for Weekly, 3 for Monthly."),
        repeat_interval: z.number().describe("Repeat interval for the meeting.")
      }).describe("Recurrence settings.").optional(),
      // settings: z.object({
      //   host_video: z.string().describe("Start the meeting with the host's video on ('true' or 'false')."),
      //   participant_video: z.string().describe("Start the meeting with the participants' videos on ('true' or 'false')."),
      //   join_before_host: z.string().describe("Allow participants to join before the host ('true' or 'false')."),
      //   mute_upon_entry: z.string().describe("Mute participants upon entry ('true' or 'false')."),
      //   watermark: z.string().describe("Add watermark on shared content ('true' or 'false')."),
      //   audio: z.enum(["voip", "telephony", "both"]).describe("Choose audio options (voip, telephony, both)."),
      //   auto_recording: z.enum(["none", "local", "cloud"]).describe("Automatic recording settings (none, local, cloud).")
      // }).describe("Meeting settings.")
    }).describe("Input schema description")
  )

  // ==========================================================================
  // Define the output schema for your action
  // ==========================================================================

  .setActionType("POST")
  .setOutputComponent(({ data, displayState, inputSchema, metadata }) => {
    // NOTE: Templates should have this zodResolver by default
    const form = useForm<z.infer<typeof inputSchema>>({
      resolver: zodResolver(inputSchema),
      defaultValues: {
        agenda: "",
        duration: 60, // Default duration can be set as needed
        schedule_for: "",
        start_time: "",
        topic: "",
        type: 2, // Since it's always 2 for scheduled meetings, it's set as a default
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default to the browser's timezone, adjust as necessary
        recurrence: undefined, // Optional, so it's undefined by default
      },
    })

    // NOTE: This should have atleast 1 FormField defined
    // NOTE: Missing the <Form><form>
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Meeting</CardTitle>
          <CardDescription>
            Create a new Zoom meeting
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={
              data && Boolean(data.onSubmit)
                ? form.handleSubmit(data.onSubmit)
                : undefined
            }
          >
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter meeting name..."
                        {...field}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Agenda</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter meeting agenda..."
                        {...field}
                        maxLength={2000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        placeholder="YYYY-MM-DDTHH:MM:SSZ"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schedule_for"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule For</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email address/User ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Timezone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Meeting</FormLabel>
                    <FormControl>
                    <Select
                      {...field}
                      value={field.value.toString()} // Ensuring the value is a string, as some select components might expect that
                    >
                        <option value="" disabled>Select meeting type</option>
                        <option value="1">1 - Instant Meeting</option>
                        <option value="2">2 - Scheduled Meeting</option>
                        <option value="3">3 - Recurring Meeting with No Fixed Time</option>
                        <option value="8">8 - Recurring Meeting with Fixed Time</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field: { onChange, value, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Select
                          {...restField}
                          value={value?.type?.toString() ?? ''}
                          onChange={(e) => onChange({ ...value, type: parseInt(e.target.value, 10) })}
                        >
                          <option value="1">Daily</option>
                          <option value="2">Weekly</option>
                          <option value="3">Monthly</option>
                        </Select>
                        <Input
                          type="number"
                          {...restField}
                          value={value?.repeat_interval ?? ''}
                          onChange={(e) =>
                            onChange({ ...value, repeat_interval: parseInt(e.target.value, 10) || 0 })
                          }
                          placeholder="Repeat interval"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button
                name="send"
                type="submit"
                disabled={displayState !== "active" || data.isLoading}
                variant={data?.isSuccess ? "success" : undefined}
                onSubmit={
                  data && Boolean(data.onSubmit)
                    ? form.handleSubmit(data.onSubmit)
                    : undefined
                }
              >
                {data?.isLoading ? <Spinner /> : null}
                {!data?.isSuccess ? "Schedule" : "Scheduled!"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    )
  })

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
    scopes: ["meeting:master"],
    oauthAppGenerationURL: "https://marketplace.zoom.us/develop/create",
  })

  // ==========================================================================
  // Define the action function for your action
  // ==========================================================================

  .setActionFunction(async ({ input, auth, extras }) => {
    const { userData } = extras

    userData.email = "eshaotran@college.harvard.edu"

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

    console.log(response.body)

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
        auto_recording: "cloud"
      }
    }

    url = `https://api.zoom.us/v2/accounts/me/users/${response.body.userID}/meetings`
  
    const response2 = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(meetingDetails)
    })
  
    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const data = await response2.json()
    console.log(`Join URL: ${data.join_url}`)
    console.log(`Meeting Password: ${data.password}`)
  
    return
  })
  


  // NOTE: Remove?
  .setExampleInput({
    fieldOne: "hello",
    fieldTwo: "world",
  })

export { CreateMeetingAction };