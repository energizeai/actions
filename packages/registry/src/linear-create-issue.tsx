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
import { LinearClient } from "@linear/sdk"
import { useForm } from "react-hook-form"
import z from "zod"

const LinearCreateIssueAction = createAction({
  metadata: createActionMetadata({
    title: "Create Issue",
    description: "Create an issue in Linear",
    resource: "Linear",
    avatar: {
      light: "/logos/linear-dark.svg",
      dark: "/logos/linear-light.svg",
    },
    defaultKeywords: ["linear-create-issue"],
    apiReference: "https://developers.linear.app/docs/sdk/getting-started",
    examples: [
      "The chat breaks when a code snippet gets too big",
      "The button on the home page doesn't lead to the right page",
      "We need to make the chat window responsive on mobile",
    ],
  }),
})
  .setInputSchema(
    z
      .object({
        title: z
          .string()
          .min(1)
          .describe(
            `Title of the issue. Required. Must be a non-empty string.`
          ),
        description: z
          .string()
          .optional()
          .describe(`Description of the issue. Optional.`),
      })
      .describe(`Create an issue in the Linear workspace.`)
  )
  .setOutputSchema(z.void())
  .setOutputComponent(({ data, displayState, inputSchema, metadata }) => {
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
              <AvatarImage src={metadata.avatar.light} alt="Google logo" />
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
                disabled={displayState !== "active" || data.isLoading}
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
  })
  .setAuthType("OAuth")
  .setOAuthData({
    humanReadableDescription: "Ability to create issues in Linear",
    humanReadableName: "Linear OAuth",
    button: {
      text: "Continue with Linear",
    },
    discoveryEndpoint: undefined,
    authorizationEndpoint: "https://linear.app/oauth/authorize",
    tokenEndpoint: "https://api.linear.app/oauth/token",
    revokeEndpoint: "https://api.linear.app/oauth/revoke",
    codeChallengeMethod: null,
    scopes: ["issues:create"],
    oauthAppGenerationURL:
      "https://linear.app/energizeai/settings/api/applications/new",
  })
  .setActionFunction(async ({ input, auth, userData }) => {
    const linearClient = new LinearClient({
      accessToken: auth.accessToken,
    })

    const teams = await linearClient.teams()
    const team = teams.nodes[0]
    if (team && team.id) {
      await linearClient.createIssue({
        teamId: team.id,
        title: input.title,
        description: input.description,
      })
    }

    return
  })

export { LinearCreateIssueAction }
