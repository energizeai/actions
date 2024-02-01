import { createAction, createActionMetadata } from "@energizeai/types"
import { Button } from "@energizeai/ui/button"
import { Card, CardContent, CardFooter, CardTitle } from "@energizeai/ui/card"
import z from "zod"

const NoauthAction = createAction({
  metadata: createActionMetadata({
    title: "No Auth Action",
    description: "hello world",
    resource: "hello world",
    avatar: {
      light: "/logos/google.svg",
      dark: "/logos/google.svg",
    },
    defaultKeywords: ["hello", "world"],
    apiReference: "https://energizeai.github.io/types",
  }),
})
  .setInputSchema(
    z.object({
      name: z.string(),
      hello: z.string(),
    })
  )
  // .setOutputSchema(
  //   z.object({
  //     testing: z.string(),
  //   })
  // )
  .setOutputSchema(z.void())
  .setOutputComponent(({ data, displayState }) => {
    if (displayState === "skeleton") return <div>skeleton component</div>
    if (displayState === "placeholder") return <div>placeholder component</div>
    return (
      <Card>
        <CardTitle>Test Component</CardTitle>
        <CardContent>
          <pre>{JSON.stringify(data.input, null, 2)}</pre>
        </CardContent>
        <CardFooter>
          <Button
            disabled={data.isLoading}
            onClick={() => data?.onSubmit(data.input)}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    )
  })
  .setAuthType("None")
  .setActionFunction(async ({ input, auth }) => {
    console.log("running function")
    console.log(input)
    // sleep 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000))
    console.log(input)
    return
  })
  .setExampleInput({
    hello: "world",
    name: "ido",
  })

export { NoauthAction }
