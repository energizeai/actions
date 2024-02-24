import {
  createActionComponentRouter,
  createClientSafeActionRegistry,
  generateActionRegistryFunctions,
  inferActionComponentProps,
  inferActionComponentRouter,
  setupActionCaller,
} from "ai-actions"
import { z } from "zod"

const main = async () => {
  const { createDemoAction, createDemoActionsRegistry } =
    generateActionRegistryFunctions({
      namespace: "Demo",
      metadataSchema: z.object({
        title: z.string(),
      }),
      actionFunctionExtrasSchema: z.string(),
    })

  const sendGreetingAction = createDemoAction({
    id: "sendGreeting",
    metadata: {
      title: "Send a Greeting to a Person",
    },
  })
    .setInputSchema(
      z.object({
        name: z.string().describe("The name to extract"),
        category: z
          .enum(["formal", "informal"])
          .default("informal")
          .describe("The category of greeting"),
      })
    )
    .setActionType("CLIENT")
    .setOutputSchema(z.string())
    .setAuthType("Token")
    .setTokenData({
      customDataSchema: null,
    })
    .setActionFunction(async ({ input }) => {
      if (input.category === "formal") {
        return `Hello, ${input.name}`
      }

      return `Hey, ${input.name}`
    })

  const sendGoodbyeMessage = createDemoAction({
    id: "sendGoodbyeMessage",
    metadata: {
      title: "Send a Greeting to a Person",
    },
    functionName: "testFunctionName",
  })
    .setInputSchema(
      z.object({
        name: z.string().describe("The name to extract"),
        type: z
          .enum(["formal", "informal"])
          .describe("The category of message"),
      })
    )
    .setActionType("SERVER")
    .setOutputSchemaAsInputSchema()
    .setAuthType("OAuth")
    .setOAuthData({
      scopes: [""],
      discoveryEndpoint: "",
    })
    .setActionFunction(async ({ input, extras }) => {
      // wait 3 seconds
      for (let i = 0; i < 3; i++) {
        console.log(`waiting goodbyemessage ${i}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // if (input.type === "formal") {
      //   return {
      //     goodbyeMessage: `Bye, ${input.name}`,
      //   }
      // }

      return {
        name: "sdfsdffa",
        type: input.type,
      }
    })

  const echoAction = createDemoAction({
    id: "echo",
    metadata: {
      title: "Send a Greeting to a Person",
    },
    functionName: "echoFunction",
  })
    .setInputSchema(
      z.object({
        data: z.string().describe("The data to echo"),
        other: z.string().default("default"),
      })
    )
    .setActionType("CLIENT")
    .setOutputSchema(z.string())
    .setAuthType("None")
    .setActionFunction(async ({ input }) => {
      return input.data
    })

  const demoRegistry = createDemoActionsRegistry([
    echoAction,
    sendGreetingAction,
    sendGoodbyeMessage,
  ])

  const clientDemoRegistry = createClientSafeActionRegistry(demoRegistry, {
    pipeMetadata(metadata) {
      return metadata.title
    },
  })

  const a = clientDemoRegistry["sendGreeting"].metadata

  type A = inferActionComponentRouter<
    typeof clientDemoRegistry,
    {
      userData: {
        email: string
        password: string
      }
    }
  >

  type B = inferActionComponentProps<A, "sendGreeting">
  type C = inferActionComponentProps<A, "echo">

  const myComponentB = (props: B) => {
    props.metadata
    if (!props.args) return <p>hello world</p>
    return (
      <p
        onClick={() => {
          if (props.args) {
            props.onSubmit(props.args)
          }
        }}
      >
        {props.args.name}
      </p>
    )
  }

  const myComponentC = (props: C) => {
    if (!props.args) return <p>hello world</p>
    return (
      <p
        onClick={() => {
          if (props.args) {
            props.onSubmit(props.args)
          }
        }}
      >
        {props.args.data}
      </p>
    )
  }

  const Router = createActionComponentRouter<A>({
    sendGreeting: myComponentB,
    echo: myComponentC,
  })

  const item = (
    <Router
      fallback={<div>hello world</div>}
      functionName={"sendGreeting"}
      args={{
        name: "sdfdsfdsfsd",
      }}
      userData={{
        email: "sdfsdfa",
        password: "dslfjdsjfdslf",
      }}
      inputSchema={clientDemoRegistry["sendGreeting"].inputSchema}
      onSubmit={({ functionName, args }) => {
        if (functionName === "sendGreeting") {
          args.category
        }
      }}
      metadata={clientDemoRegistry["sendGreeting"].metadata}
    />
  )

  const { actionCaller } = setupActionCaller(demoRegistry, {
    async fetchOAuthAccessToken(actionId) {
      return { accessToken: "  " }
    },
    async fetchTokenAuthData(actionId) {
      return { accessToken: "", customData: {} }
    },
    extras: "hello world",
  })

  const results = await actionCaller([
    {
      name: "sendGreeting",
      arguments: {
        name: "sdfdsfdsfsd",
        category: "formal",
      },
    },
  ])

  console.log(results)

  for (const r of results) {
  }
}

main()

// const demoRegistry = createDemoActionsRegistry([
//   sendGreetingAction,
//   sendGoodbyeMessage,
// ])

// const { actionCaller } = setupActionCaller(demoRegistry, {
//   inArray: ["sendGoodbyeMessage"]
// })

// const { tools, toolCallsHandler } = setupFunctionCalling(demoRegistry, {
//   runInParallel: true,
// })

// const responseMessage = (
//   await openai.chat.completions.create({
//     model: "gpt-3.5-turbo-1106",
//     messages,
//     tools: tools,
//     tool_choice: "auto", // auto is default, but we'll be explicit
//   })
// ).choices[0]!.message
// messages.push(responseMessage)

// const tool_calls = responseMessage.tool_calls
// if (!tool_calls) return // no demo

// const { toolCallMessages, results } = await toolCallsHandler(tool_calls)

// const secondResponse = await openai.chat.completions.create({
//   model: "gpt-3.5-turbo-0125",
//   messages: messages.concat(toolCallMessages),
// })

// console.log(secondResponse.choices)
