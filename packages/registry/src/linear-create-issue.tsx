import {
  TActionComponent,
  createAction,
  createActionMetadata,
} from "@energizeai/types"
import { LinearClient } from "@linear/sdk"
import z from "zod"
import { LinearCreateIssueCard } from "./_components/linear-create-issue-card"

const actionInputSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .describe(`Title of the issue. Required. Must be a non-empty string.`),
    description: z
      .string()
      .optional()
      .describe(`Description of the issue. Optional.`),
  })
  .describe(`Create an issue in the Linear workspace.`)

export type TLinearCreateIssueCard = TActionComponent<typeof actionInputSchema>

const LinearCreateIssueAction = createAction({
  id: "linear-createIssue",
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
  .setInputSchema(actionInputSchema)
  .setOutputSchema(z.void())
  .setOutputComponent(LinearCreateIssueCard)
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
