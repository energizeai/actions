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
import { DateTimePicker } from "@/components/ui/date-time-picker/date-time-picker"
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
import { ConditionalSkeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn, getDateValueFromString } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { inferActionComponentProps } from "ai-actions"
import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { TActionComponentRouter } from "../client"

type Props = inferActionComponentProps<
  TActionComponentRouter,
  "zoom-createMeeting"
>

export const ZoomCreateMeetingCard = ({
  args,
  displayState,
  metadata,
  mutationResults,
  onSubmit,
  inputSchema,
}: Props) => {
  const [isClient, setIsClient] = useState(false)

  const isLoadingArguments = displayState === "skeleton"
  const isPlaceholder = displayState === "placeholder"

  let start: null | string = null

  if (args) {
    if (args.start_time) {
      start = new Date(args.start_time).toISOString()
    }
  }

  const formSchema = inputSchema.extend({
    meeting_invitees: z.array(z.object({ email: z.string().email() })),
    start_time: z.string(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agenda: args ? args.agenda : "",
      meeting_invitees: args
        ? args.meeting_invitees.map((email) => ({
            email: args.meeting_invitees[0],
          }))
        : [{ email: "" }],
      duration: args ? args.duration : 30,
      topic: args ? args.topic : "",
      start_time: start || undefined,
    },
  })

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "meeting_invitees",
  })

  const isLoading = mutationResults?.isLoading
  const isSuccess = mutationResults?.isSuccess

  async function onFormSubmit(formValues: z.infer<typeof formSchema>) {
    if (isLoadingArguments || isPlaceholder || !args || isLoading) return
    await onSubmit({
      ...formValues,
      meeting_invitees: formValues.meeting_invitees.map((email) => email.email),
    })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <Card className="w-[90%] md:w-[80%] lg:w-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={metadata.avatar.light} alt="Zoom logo" />
            <AvatarFallback className="bg-muted" />
          </Avatar>
          Create Event
        </CardTitle>
        <CardDescription>
          Let&apos;s confirm that you want to create an event on your Google
          Calendar
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Topic</FormLabel>
                  <FormControl>
                    <ConditionalSkeleton
                      showSkeleton={isLoadingArguments}
                      variant="input"
                    >
                      <Input
                        placeholder="Enter meeting topic..."
                        {...field}
                        disabled={isPlaceholder}
                      />
                    </ConditionalSkeleton>
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
                  <FormLabel>Agenda</FormLabel>
                  <FormControl>
                    <ConditionalSkeleton
                      showSkeleton={isLoadingArguments}
                      variant="textarea"
                    >
                      <Textarea
                        placeholder="Enter meeting agenda..."
                        {...field}
                        disabled={isPlaceholder}
                      />
                    </ConditionalSkeleton>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <ConditionalSkeleton
                        showSkeleton={isLoadingArguments}
                        variant="input"
                      >
                        <DateTimePicker
                          granularity="minute"
                          {...field}
                          value={getDateValueFromString(field.value)}
                          onChange={(v) => {
                            field.onChange(v.toString())
                          }}
                          isDisabled={isPlaceholder}
                        />
                      </ConditionalSkeleton>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Duration (mins)</FormLabel>
                    <FormControl>
                      <ConditionalSkeleton
                        showSkeleton={isLoadingArguments}
                        variant="input"
                      >
                        <Input
                          placeholder="Enter meeting duration..."
                          type="number"
                          {...field}
                          disabled={isPlaceholder}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                        />
                      </ConditionalSkeleton>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`meeting_invitees.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && "sr-only")}>
                        Meeting Invitee
                      </FormLabel>
                      <FormDescription className={cn(index !== 0 && "sr-only")}>
                        Enter the email address of the invitee.
                      </FormDescription>
                      <FormControl>
                        <ConditionalSkeleton
                          showSkeleton={isLoadingArguments}
                          variant="input"
                        >
                          <Input
                            {...field}
                            disabled={isPlaceholder}
                            placeholder="Enter email..."
                          />
                        </ConditionalSkeleton>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={isLoadingArguments || isPlaceholder}
                size="sm"
                className="mt-2"
                onClick={() => append({ email: "" })}
              >
                Add Attendee
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              disabled={isLoading || isLoadingArguments || isPlaceholder}
              variant={isSuccess ? "success" : undefined}
            >
              {isLoading ? <Spinner /> : null}
              {!isSuccess ? "Create" : "Created!"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
