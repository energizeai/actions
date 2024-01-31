import { createAction, createActionMetadata } from "@energizeai/types"
import { Button } from "@energizeai/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@energizeai/ui/card"
import z from "zod"

const TokenAction = createAction({
  metadata: createActionMetadata({
    title: "Token Action",
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
  .setComponentSubmissionSchema(
    z.object({
      custom: z.string().describe("Please enter your organization ID"),
    })
  )
  .setComponent(({ data, displayState }) => {
    if (displayState === "skeleton") return null
    if (displayState === "placeholder") return null

    const { onSubmit } = data

    return (
      <Card>
        <CardHeader>
          <CardTitle>hello world</CardTitle>
        </CardHeader>
        <CardContent>{data.input.name}</CardContent>
        <CardFooter>
          <Button onClick={() => onSubmit({ custom: "hello world" })}>
            Submit
          </Button>
        </CardFooter>
      </Card>
    )
  })
  // .setAuthType("None")
  // .setAuthType("OAuth")
  // .setOAuthData({
  //   discoveryEndpoint: "hello world",
  //   humanReadableDescription: "dfdklfjsdlkfjlsdfja",
  //   humanReadableName: "sdfsjflkajlksdfl",
  //   button: {
  //     text: "Continue with google",
  //   },
  //   scopes: ["sdfjsdkflsjdfdjf"],
  //   oauthAppGenerationURL: "sjdfklsdjflksdjfls",
  // })
  .setAuthType("Token")
  .setTokenData({
    humanReadableDescription: "dfdklfjsdlkfjlsdfja",
    humanReadableName: "sdfsjflkajlksdfl",
    generatingTokenReferenceURL: "skldfjasdfjksdlf",
    button: {
      text: "Continue with google",
    },
    customDataSchema: z.object({
      hello: z.string().describe("Please enter your organization ID"),
    }),
    validateToken: async ({ auth }) => {
      return { isValid: true }
    },
  })
  .setActionFunction(async ({ input, auth }) => {
    console.log(auth)
    return
  })
  .setExampleInput({
    name: "hello world",
    hello: "hello world",
  })

export { TokenAction }
