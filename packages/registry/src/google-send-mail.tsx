import { zodResolver } from "@hookform/resolvers/zod"
import { generateDayTimeReference } from "@repo/shared"
import { TActionComponent, TActionConfig, TAuthConfig } from "@repo/types"
import { Avatar, AvatarImage } from "@repo/ui/avatar"
import { Button } from "@repo/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form"
import { Input } from "@repo/ui/input"
import { ConditionalSkeleton } from "@repo/ui/skeleton"
import { Spinner } from "@repo/ui/spinner"
import { Textarea } from "@repo/ui/textarea"
import { cn } from "@repo/ui/utils"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

// ================================================================================
// DEFINE INPUT SCHEMA
// ================================================================================

const InputSchema = z
  .object({
    subject: z.string().min(1).describe(`A subject for the email.`),
    body: z.string().min(1).describe(`The body of the email.`),
    to: z
      .array(
        z.object({
          email: z.string().email().describe(`The email address to send to.`),
        })
      )
      .nonempty(),
  })
  .describe(
    `Send an email using the user's Google Mail. As of now attachments are not supported, but instead you can put links to images/files in the body of the email.`
  )
type TInput = typeof InputSchema

// ================================================================================
// DEFINE OUTPUT SCHEMA
// ================================================================================

const OutputSchema = z.void()
type TOutput = typeof OutputSchema

const CardComponent: TActionComponent<TInput, TOutput>["Component"] = ({
  input,
  isPlaceholderComponent,
  isSkeletonComponent,
  isSuccess,
  isLoading,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof InputSchema>>({
    resolver: zodResolver(InputSchema),
    defaultValues: {
      subject: input ? input.subject || "" : "",
      body: input ? input.body || "" : "",
      to: input
        ? isPlaceholderComponent
          ? [{ email: "" }]
          : input.to || []
        : [],
    },
  })

  const { fields, append } = useFieldArray({
    name: "to",
    control: form.control,
  })

  return (
    <Card className="w-[90%] md:w-[80%] lg:w-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={"/logos/google.svg"} alt="Google logo" />
          </Avatar>
          Send Mail
        </CardTitle>
        <CardDescription>
          Let&apos;s confirm that you want to send this email.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            if (onSubmit) {
              form.handleSubmit(onSubmit)
            }
          }}
        >
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <ConditionalSkeleton
                      showSkeleton={isSkeletonComponent}
                      variant="input"
                    >
                      <Input
                        placeholder="Enter subject..."
                        {...field}
                        disabled={isPlaceholderComponent}
                      />
                    </ConditionalSkeleton>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <ConditionalSkeleton
                      showSkeleton={isSkeletonComponent}
                      variant="textarea"
                    >
                      <Textarea
                        placeholder="Enter email body..."
                        {...field}
                        disabled={isPlaceholderComponent}
                      />
                    </ConditionalSkeleton>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`to.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(index !== 0 && "sr-only")}>
                        To
                      </FormLabel>
                      <FormDescription className={cn(index !== 0 && "sr-only")}>
                        Enter email address...
                      </FormDescription>
                      <FormControl>
                        <ConditionalSkeleton
                          showSkeleton={isSkeletonComponent}
                          variant="input"
                        >
                          <Input
                            {...field}
                            disabled={isPlaceholderComponent}
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
                disabled={isSkeletonComponent || isPlaceholderComponent}
                size="sm"
                className="mt-2"
                onClick={() => append({ email: "" })}
              >
                Add Receiver
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              name="send"
              type="submit"
              disabled={isLoading || isPlaceholderComponent}
              variant={isSuccess ? "success" : undefined}
            >
              {isLoading ? <Spinner /> : null}
              {!isSuccess ? "Send" : "Sent!"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

// ================================================================================
// DEFINE AUTH CONFIG
// ================================================================================

const GoogleAuthConfig = {
  type: "oauth",

  button: {
    text: "Continue with Google",
    image: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
  },

  discoveryEndpoint:
    "https://accounts.google.com/.well-known/openid-configuration",

  humanReadableName: "Google Mail",
  humanReadableDescription: "Ability to send emails from your Google",

  scopes: ["https://www.googleapis.com/auth/gmail.send"],

  policyReferenceURL: "https://developers.google.com/gmail/api/auth/scopes",

  documentationURL: "https://developers.google.com/gmail/api",
} as const satisfies TAuthConfig
type TAuth = typeof GoogleAuthConfig

// ================================================================================
// DEFINE ACTION : )
// ================================================================================

const GoogleSendMailAction = {
  resource: "Google Mail",
  defaultKeywords: ["send-mail"],
  title: "Send Mail",
  chatMessage: "Please send an email",
  description: "Send an email using Google Mail",
  scopePool: {
    or: [
      {
        and: ["https://www.googleapis.com/auth/gmail.send"],
      },
    ],
  },
  avatar: {
    light: "/logos/google.svg",
    dark: "/logos/google.svg",
  },
  apiReference:
    "https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send",
  examples: [
    "can you send an email to ido@energize.ai and ask to schedule a meeting to give feedback on Spark?",
    "can you ask johnappleseed123@gmail.com what time the meeting is on Friday",
    "can you send an email to mary123@gmail.com and notify her that I will be running late to the afternoon meeting",
  ],
  authConfig: GoogleAuthConfig,
  input: InputSchema,
  Component: CardComponent,
  output: OutputSchema,
  loadingMessage: "Drafting email",
  runTimeDescriptionGenerator: ({ userData, localTimeZone }) => {
    const description = `Send an email using Google Mail. ${generateDayTimeReference(
      localTimeZone
    )} Also, the user's name is ${
      userData.name
    } so make sure to use it in the email signature.`

    return description
  },
  actionFunction: async ({ input, auth }) => {
    const headers = {
      Authorization: `Bearer ${auth.accessToken}`,
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      }
    ).then((res) => res.json())

    if (response.error) {
      throw new Error(response.error.message)
    }

    return
  },
} as const satisfies TActionConfig<TInput, TOutput, TAuth>

export default GoogleSendMailAction
