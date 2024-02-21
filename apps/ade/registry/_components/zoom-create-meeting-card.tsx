"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ConditionalSkeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import { TZoomCreateMeetingCard } from "../zoom-createMeeting"

const ZoomCreateMeetingCard: TZoomCreateMeetingCard = ({ data, displayState, inputSchema, metadata }) => {
  // NOTE: Templates should have this zodResolver by default
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      agenda: data?.input.agenda,
      duration: data?.input.duration, 
      schedule_for: data?.input.schedule_for,
      start_time: data?.input.schedule_for,
      topic: data?.input.topic,
      type: data?.input.type, 
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Default to the browser's timezone
      recurrence: undefined, // Optional, so it's undefined by default
      settings: {
        meeting_invitees: []
      }
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
                    value={field.value?.toString() || ''} // Ensuring the value is a string, as some select components might expect that
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
            {/* IDO TODO: Raising an error for some reason on the onChange */}
            {/* <FormField
              control={form.control}
              name="settings.meeting_invitees"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel>Emails</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      {(value || []).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="email"
                            {...restField}
                            name={`settings.meeting_invitees[${index}].email`}
                            value={item.email || ''}
                            onChange={(e) => {
                              const newEmails = [...value]
                              newEmails[index] = { email: e.target.value }
                              onChange(newEmails)
                            }}
                            placeholder={`Email ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newEmails = value ? [...value, { email: '' }] : [{ email: '' }]
                              onChange(newEmails)
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newEmails = value ? [...value, { email: '' }] : [{ email: '' }];
                          onChange(newEmails);
                        }}
                      >
                        Add Email
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
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
}

export { ZoomCreateMeetingCard }
