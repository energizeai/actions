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
  .describe("Get a greeting")
  .input({
    name: z.string().describe(`Name of the person to greet.`),
  })
  .handler(async ({ input }) => {
    return {
      greeting: `Hello, ${input.name}!`,
    }
  })

export { HelloWorldAction }
