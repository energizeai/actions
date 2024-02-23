import z from "zod"
import { createADEAction } from "../_properties/generators"

const HelloWorldAction = createADEAction({
  id: "energize-helloWorld",
  metadata: {
    title: "Hello World",
    description: "Get a greeting",
    resource: "Energize AI",
    avatar: {
      light: "/logos/energize-black-square.png",
      dark: "/logos/energize-white-square.png",
    },
    defaultKeywords: ["hello-world"],
    apiReference: "#",
    examples: [],
  },
})
  .setInputSchema(
    z
      .object({
        name: z.string().describe(`Name of the person to greet.`),
      })
      .describe(`Get a greeting.`)
  )
  .setActionType("SERVER")
  .setOutputSchema(
    z.object({
      greeting: z.string().describe(`The raw MYSQL schema for a table.`),
    })
  )
  .setAuthType("None")
  .setActionFunction(async ({ input, extras }) => {
    return {
      greeting: `Hello, ${input.name}!`,
    }
  })

export { HelloWorldAction }
