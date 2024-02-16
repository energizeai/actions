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
import { Input } from "@energizeai/ui/input"
import { ConditionalSkeleton } from "@energizeai/ui/skeleton"
import { Spinner } from "@energizeai/ui/spinner"
import { Textarea } from "@energizeai/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { TLinearCreateIssueCard } from "../linear-create-issue"

const LinearCreateIssueCard: TLinearCreateIssueCard = ({
  data,
  displayState,
  inputSchema,
  metadata,
}) => {
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      title: data?.input.title || "",
      description: data?.input.description || "",
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={metadata.avatar.light} alt="Linear logo" />
          </Avatar>
          {metadata.title}
        </CardTitle>
        <CardDescription>
          Let&apos;s confirm that you want to create an issue in Linear.
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <ConditionalSkeleton
                      showSkeleton={displayState === "skeleton"}
                      variant="input"
                    >
                      <Input
                        placeholder="Enter title..."
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <ConditionalSkeleton
                      showSkeleton={displayState === "skeleton"}
                      variant="textarea"
                    >
                      <Textarea
                        placeholder="Enter description..."
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
          <CardFooter className="justify-end">
            <Button
              type="submit"
              disabled={
                displayState !== "active" || data.isLoading || data.isSuccess
              }
              variant={data?.isSuccess ? "success" : undefined}
            >
              {data?.isLoading ? <Spinner /> : null}
              {!data?.isSuccess ? "Create" : "Created!"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export { LinearCreateIssueCard }
