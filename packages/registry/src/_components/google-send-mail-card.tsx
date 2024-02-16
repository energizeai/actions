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
import { TGoogleSendMailCard } from "../google-send-mail"

const GoogleSendMailCard: TGoogleSendMailCard = ({
  data,
  displayState,
  inputSchema,
  metadata,
}) => {
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
                      <FormDescription className={cn(index !== 0 && "sr-only")}>
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
              disabled={
                displayState !== "active" || data.isLoading || data.isSuccess
              }
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
}

export { GoogleSendMailCard }
