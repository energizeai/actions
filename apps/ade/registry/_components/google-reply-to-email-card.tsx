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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ConditionalSkeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { inferActionComponentProps } from "ai-actions"
import { useForm } from "react-hook-form"
import z from "zod"
import { TActionComponentRouter } from "../client"

type Props = inferActionComponentProps<
  TActionComponentRouter,
  "google-replyToEmail"
>

const GoogleReplyToEmailCard = ({
  args,
  displayState,
  mutationResults,
  inputSchema,
  metadata,
  onSubmit,
}: Props) => {
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      body: args ? args.body : "",
      threadId: args ? args.threadId : "",
      subject: args ? args.subject : "",
    },
  })

  const isLoading = mutationResults?.isLoading
  const isSuccess = mutationResults?.isSuccess

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={metadata.avatar.light} alt="Google logo" />
            <AvatarFallback className="bg-muted" />
          </Avatar>
          {metadata.title}
        </CardTitle>
        <CardDescription>
          Let&apos;s confirm that you want to reply to {args ? args.to : ""}.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={args ? form.handleSubmit(onSubmit) : undefined}>
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
              disabled={displayState !== "active" || isLoading || isSuccess}
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

export { GoogleReplyToEmailCard }
