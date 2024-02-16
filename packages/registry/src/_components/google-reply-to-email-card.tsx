"use client"

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@energizeai/ui/form"
import { ConditionalSkeleton } from "@energizeai/ui/skeleton"
import { Spinner } from "@energizeai/ui/spinner"
import { Textarea } from "@energizeai/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TGoogleReplyToEmailCard } from "../google-reply-to-email"

const GoogleReplyToEmailCard: TGoogleReplyToEmailCard = ({
  data,
  displayState,
  inputSchema,
  metadata,
}) => {
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      body: data?.input.body || "",
      threadId: data?.input.threadId || "",
      subject: data?.input.subject || "",
    },
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
          Let&apos;s confirm that you want to reply to {data?.input.to || ""}.
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
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              name="send"
              type="submit"
              disabled={
                displayState !== "active" || data.isLoading || data.isSuccess
              }
              variant={data?.isSuccess ? "success" : undefined}
              onClick={() => {
                if (!data) return

                data.onSubmit({
                  body: form.getValues("body"),
                  to: data.input.to,
                  subject: data.input.subject,
                  threadId: data.input.threadId,
                })
              }}
            >
              {data?.isLoading ? <Spinner /> : null}
              {!data?.isSuccess ? "Send" : "Sent!"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export { GoogleReplyToEmailCard }
