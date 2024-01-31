import { createAction, createActionMetadata } from "@energizeai/types"
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
  .setOutputSchema(
    z.object({
      hello: z.string(),
    })
  )
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
    return {
      hello: input.hello,
    }
  })
  .setExampleInput({
    name: "hello world",
    hello: "hello world",
  })

export { TokenAction }
