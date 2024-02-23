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
import { ConditionalSkeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { inferActionComponentProps } from "ai-actions"
import { useFieldArray, useForm } from "react-hook-form"
import z from "zod"
import { TActionComponentRouter } from "../client"

type Props = inferActionComponentProps<
  TActionComponentRouter,
  "google-sendMail"
>

const GoogleSendMailCard = ({
  displayState,
  inputSchema,
  metadata,
  onSubmit,
  args,
  isLoading,
  isSuccess,
}: Props) => {
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      subject: args ? args.subject : "",
      body: args ? args.body : "",
      to: args
        ? args.to
        : displayState === "placeholder"
          ? [{ email: "" }]
          : [],
    },
  })

  const { fields, append } = useFieldArray({
    name: "to",
    control: form.control,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 relative">
          <Avatar className="h-5 w-5">
            <AvatarImage src={metadata.avatar.light} alt="Google logo" />
            <AvatarFallback className="bg-muted" />
          </Avatar>
          <p className="flex-1">{metadata.title}</p>
        </CardTitle>
        <CardDescription>
          Let&apos;s confirm that you want to send this email.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={args ? form.handleSubmit(onSubmit) : undefined}>
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

export { GoogleSendMailCard }
