# Actions by Energize AI

Welcome to Actions, by Energize AI. Spark is designed to run a variety of tasks such as sending emails via Google, creating issues in Linear, and more. This repository is your one-stop-shop to quickly develop a new Action for Spark.

Feel free to email info@energize.ai with questions, post a feedback to Spark, or reach out on the [Discord](https://discord.gg/H5RXqCJU)!

## What is an Action?

You can think of an action as a Function that Spark can call. It takes input information from the user, runs code within the function (an API call), and usually outputs information. There are two types of Actions: `GET`s or `POST`s. `GET` Actions retrieve and report information to the user (e.g. retrieving the weather), while `POST` Actions send information onto the internet (e.g. making a Tweet). This distinction will become relevant in Step 2.

## Contributing Actions

Run `npm run generate:action`, which will guide you through setting up the action `.tsx` file. You'll then get a templated file (`/registry/src/[action-name]`), with which you can follow along using this README.

### Step 1: Define Inputs

First, define the inputs required for your action. This is the contextual information the user should provide Spark so it carry out a command. Inputs should be structured as a Zod object. For instance, an action to send an email would require inputs like `subject`, `body`, etc.

You must include a `.describe()` call on each field to provide a description of the input. This description will be used to generate the prompts and details page for your action.

Example:

```typescript
const SendEmailInput = z.object({
  subject: z.string().desribe("The subject of the email"),
  body: z.string().describe("The body of the email"),
  to: z
    .array(
      z.object({
        email: z.string().describe("The email of the recipient"),
      })
    )
    .describe("The recipients of the email"),
})
```

### Step 2: Define Outputs

Spark has two options for outputs:

1. **JSON Data** that adheres to a specific Zod schema. This is the recommended the output for Actions that `GET` data.
2. **React Component** that asks for confirmation for the action. This is the recommended output for Actions that `POST` data.

#### Option 1: JSON Data Output

In this example, the GetGoogleContact action is `GET`ting data from Google Contacts. The output is a JSON object that adheres to the Zod schema below. No React Component is specified.

```typescript
const GetGoogleContactOutput = z.object({
  displayName: z.string().describe("The display name of the contact"),
  primaryEmailAddress: z
    .string()
    .email()
    .describe("The email address of the contact"),
})
```

#### Option 2: React Component Output

In this example, the SendEmailInput action is POSTing data to Google. The output is a React component that asks for confirmation for the action. In this case, there is no output JSON, so we should `setOutputSchema(z.void())` before defining the component. See the Template for an example.

```typescript
// form schema == the input for the action
const formSchema = SendEmailInput

const SendEmailOutput = ({ input } : any) => {
  const values = formSchema.parse(input)
  const form = useForm<z.infer<typeof formSchema>>({...})

  async function onSubmit(values: z.infer<typeof formSchema>) {
    ...
  }

  return (
    <Card className="w-[90%] md:w-[80%] lg:w-[600px]">
      <CardHeader>
        ...
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          ...
          <CardFooter className="justify-end">
            <Button
              type="submit"
            >
              ...
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
```

### Step 3: Define Action Function

The action function will take in the inputs and return the outputs. The function should be defined as an async function.

```typescript
const SendEmail = async (input: z.infer<typeof SendEmailInput>): Promise<z.infer<typeof SendEmailOutput>> => {
  ... // write the code to send a POST request to Google's API
}
```

Note that for functions that POST data, your action function will not need to return anything.

### Step 4: Define Authentication Requirements

We support three types of authentification: OAuth, Manual Token, or No Auth.

Most actions will need some sort of authentication. For instance, the `SendGoogleEmail` action will need to authenticate with `Google OAuth`. If you do need authentification, the auth requirements should be defined as a Zod object following our Auth Config Schema.

NOTE: all auth data is stored locally on your computer in `ade/server/db/sqlite.db`. You can delete it freely, and only you have access to it.

#### Option 1: OAuth

Specify the discovery endpoint and ADE will take care of the rest (refreshing tokens, revoking tokens, etc). If there is no discovery endpoint, you can manually specify the endpoints. See the below example:

```typescript
const GoogleSendMailAuthConfig: AuthConfig = {
  type: "oauth",
  openIdEndpoint: "https://accounts.google.com/.well-known/openid-configuration"
  scopes: ["https://www.googleapis.com/auth/gmail.send"],
}
```

#### Option 2: Manual API Key Entry

You can specify a custom data schema to ask the user for, alongside the token. For instance, if connecting with the Planetscale API, you'd likely want to ask for the organization name. See the below example:

```typescript
const CanvasAuthConfig: AuthConfig = {
  type: "manual-token",
  customData: z.object({
    domain: z.string().describe("The domain of the Canvas LTC instance"),
  }),
}
```

#### Option 3: No Auth

Simply `.setAuthType("None")`. See an example in `registry/src/noauth-action.tsx`.

### Step 5: Putting it all Together

Now that you have defined the inputs, outputs, action function, and authentication requirements, you can put it all together in an Action object. In addition to the things defined above, that Action object should also include a name, description, avatar, and other metadata.

```typescript
const SendEmailAction: Action = {
  name: "Send Email",
  description: "Send an email via Google",
  avatar: {
    light: "./assets/google.svg",
    dark: "./assets/google.svg",
  },
  inputs: SendEmailInput,
  outputs: SendEmailOutput,
  authConfig: GoogleSendMailAuthConfig,
}
```

### Submission

Test your action using our Actions Development Environment (ADE), with `npm run ade:dev`. You should see your new action under the Actions tab! How exciting! When you're ready, submit a merge request with your action file, and we'll quickly review and add it in!
