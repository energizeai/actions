# Actions by Energize AI

Welcome to the Actions repository, by Energize AI. Spark is designed to run a variety of tasks such as sending emails via Google, creating issues in Linear, and more. This repository is dedicated to community contributions for developing new actions for Spark.

## Contributing Actions

Contributing an action to Spark involves five key steps. Below is a guide to help you define and contribute your action effectively.

### Step 1: Define Inputs

First, define the inputs required for your action. Inputs should be structured as a Zod object. For instance, an action to send an email would require inputs like `subject`, `body`, etc.

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

1. **JSON Data** that adheres to a specific Zod schema. This is the recommended the output for actions that `GET data`.
2. **React Component** that asks for confirmation for the action. This is the recommended output for actions that `POST data`.

#### Option 1: JSON Data Output

In this example, the GetGoogleContact action is GETting data from Google Contacts. The output is a JSON object that adheres to the Zod schema below.

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

In this example, the SendEmailInput action is POSTing data to Google. The output is a React component that asks for confirmation for the action.

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

Most actions will need some sort of authentication. For instance, the `SendGoogleEmail` action will need to authenticate with `Google OAuth`. The authentication requirements should be defined as a Zod object following our Auth Config Schema.

#### Option 1: OAuth

```typescript
const GoogleSendMailAuthConfig: AuthConfig = {
  type: "oauth",
  openIdEndpoint: "https://accounts.google.com/.well-known/openid-configuration"
  scopes: ["https://www.googleapis.com/auth/gmail.send"],
}
```

#### Option 2: Manual API Key Entry

```typescript
const CanvasAuthConfig: AuthConfig = {
  type: "manual-token",
  customData: z.object({
    domain: z.string().describe("The domain of the Canvas LTC instance"),
  }),
}
```

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
