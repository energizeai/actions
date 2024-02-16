import { createAction, createActionMetadata } from "ai-actions"
import z from "zod"

const HelloWorldAction = createAction({
  id: "energize-helloWorld",
  metadata: createActionMetadata({
    title: "Hello World",
    description: "Get a greeting",
    resource: "Energize AI",
    avatar: {
      light: "/logos/energize-black-square.png",
      dark: "/logos/energize-white-square.png",
    },
    defaultKeywords: ["hello-world"],
    apiReference: "#",
  }),
})
  .setInputSchema(
    z
      .object({
        name: z.string().describe(`Name of the person to greet.`),
      })
      .describe(`Get a greeting.`)
  )
  .setActionType("GET")
  .setOutputSchema(
    z.object({
      greeting: z.string().describe(`The raw MYSQL schema for a table.`),
    })
  )
  .setAuthType("None")
  .setActionFunction(async ({ input, auth, userData }) => {
    return {
      greeting: `Hello, ${input.name}!`,
    }
  })

export { HelloWorldAction }
