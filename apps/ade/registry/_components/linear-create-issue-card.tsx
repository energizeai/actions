"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { ConditionalSkeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ThemedImage } from "@/components/ui/themed-image"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { inferActionComponentProps } from "ai-actions"
import { useForm } from "react-hook-form"
import z from "zod"
import { TActionComponentRouter } from "../client"

type Props = inferActionComponentProps<
  TActionComponentRouter,
  "linear-createIssue"
>

const LinearCreateIssueCard = ({
  args,
  displayState,
  metadata,
  inputSchema,
  onSubmit,
  mutationResults,
}: Props) => {
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      title: args ? args.title : "",
      description: args ? args.description : "",
    },
  })

  const isLoading = mutationResults?.isLoading
  const isSuccess = mutationResults?.isSuccess

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <ThemedImage
              srcLight={metadata.avatar.light}
              srcDark={metadata.avatar.dark}
              ImageComponent={
                <AvatarImage className={cn("bg-background")} src={""} />
              }
            />
          </Avatar>
          {metadata.title}
        </CardTitle>
        <CardDescription>
          Let&apos;s confirm that you want to create an issue in Linear.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={args ? form.handleSubmit(onSubmit) : undefined}>
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
              disabled={displayState !== "active" || isLoading || isSuccess}
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

export { LinearCreateIssueCard }
