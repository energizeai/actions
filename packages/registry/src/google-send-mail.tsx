import { createAction, createActionMetadata } from "@energizeai/types"
import { Avatar, AvatarImage } from "@energizeai/ui/avatar"
import { Button } from "@energizeai/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@energizeai/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@energizeai/ui/form"
import { Input } from "@energizeai/ui/input"
import { ConditionalSkeleton } from "@energizeai/ui/skeleton"
import { Spinner } from "@energizeai/ui/spinner"
import { Textarea } from "@energizeai/ui/textarea"
import { cn } from "@energizeai/ui/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"

const GoogleSendMailAction = createAction({
  metadata: createActionMetadata({
    title: "Send Email",
    description: "Send an email with the Gmail API",
    resource: "Google",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["send-email"],
    apiReference:
      "https://www.google.com/search?q=google+send+mail+api&sourceid=chrome&ie=UTF-8",
  }),
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
  .setOutputSchema(z.void())
  .setOutputComponent(({ data, displayState, inputSchema, metadata }) => {
    const form = useForm<z.infer<typeof inputSchema>>({
      resolver: zodResolver(inputSchema),
      defaultValues: {
        subject: data?.input.subject || "",
        body: data?.input.body || "",
        to:
          data?.input.to ||
          (displayState === "placeholder" ? [{ email: "" }] : []),
      },
    })

    const { fields, append } = useFieldArray({
      name: "to",
      control: form.control,
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={metadata.avatar.light} alt="Google logo" />
            </Avatar>
            {metadata.title}
          </CardTitle>
          <CardDescription>
            Let&apos;s confirm that you want to send this email.
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
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <ConditionalSkeleton
                        showSkeleton={displayState === "skeleton"}
                        variant="input"
                      >
                        <Input
                          placeholder="Enter subject..."
                          {...field}
                          disabled={displayState === "placeholder"}
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
                        showSkeleton={displayState === "skeleton"}
                        variant="textarea"
                      >
                        <Textarea
                          placeholder="Enter email body..."
                          {...field}
                          disabled={displayState === "placeholder"}
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
                        <FormDescription
                          className={cn(index !== 0 && "sr-only")}
                        >
                          Enter email address...
                        </FormDescription>
                        <FormControl>
                          <ConditionalSkeleton
                            showSkeleton={displayState === "skeleton"}
                            variant="input"
                          >
                            <Input
                              {...field}
                              disabled={displayState === "placeholder"}
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
                  disabled={displayState !== "active"}
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
                disabled={displayState !== "active" || data.isLoading}
                variant={data?.isSuccess ? "success" : undefined}
              >
                {data?.isLoading ? <Spinner /> : null}
                {!data?.isSuccess ? "Send" : "Sent!"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    )
  })
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
