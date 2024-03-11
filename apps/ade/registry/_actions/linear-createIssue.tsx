import { LinearClient } from "@linear/sdk"
import z from "zod"
import { createADEAction } from "../_properties/generators"

const LinearCreateIssueAction = createADEAction({
  id: "linear-createIssue",
  metadata: {
    title: "Create Issue",
    description: "Create an issue in Linear",
    resource: "Linear",
    renderOnClient: true,
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
  },
})
  .describe("Create an issue in the Linear workspace.")
  .input({
    title: z
      .string()
      .min(1)
      .describe(`Title of the issue. Required. Must be a non-empty string.`),
    description: z
      .string()
      .optional()
      .describe(`Description of the issue. Optional.`),
  })
  .authType("OAuth")
  .oAuthData({
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
  .handler(async ({ input, auth }) => {
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
