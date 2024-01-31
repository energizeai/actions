import type { PlopTypes } from "@turbo/gen"

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // A simple generator to add a new React component to the internal UI library
  plop.setGenerator("action-starter", {
    description: "Adds a new action (starter code) to the registry",

    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the action? (e.g. `Get Google Contact`)",
        validate: (value: string) => {
          if (value === "index") {
            return "The name 'index' is not allowed"
          }

          if (/.+/.test(value)) {
            return true
          }

          return "Name is required"
        },
      },
      {
        type: "input",
        name: "description",
        message: "What does this action do? Please describe it in a few words.",
        validate: (value: string) => {
          if (/.+/.test(value)) {
            return true
          }
          return "Description is required"
        },
      },
      {
        type: "input",
        name: "resource",
        message:
          "What app does this action run on? (e.g. `Google`, `Linear`, `Slack`, etc.)",
      },
      {
        type: "list",
        name: "type",
        message: "Will your action be GETing or POSTing data?",
        choices: ["GET", "POST"],
      },
      {
        type: "input",
        name: "defaultKeyword",
        message:
          "What keyword should trigger this action? (e.g. `get-google-contact`)",
      },
      {
        type: "input",
        name: "chatMessage",
        message:
          "What message should be encoded into the chat when this action is triggered? (e.g. `Please get my Google contact`)",
      },
      {
        type: "input",
        name: "chatLoadingMessage",
        message:
          "What message should be displayed to the user as the action is running? (e.g. `Getting your Google contact...`)",
      },
      {
        type: "list",
        name: "auth",
        message: "What type of authentication will your action use?",
        choices: ["Token", "OAuth", "None"],
      },
      {
        type: "input",
        name: "generatingTokenReferenceURL",
        message:
          "Please provide a URL for documentation as to how a user can generate an access token to authenticate. (e.g. `https://planetscale.com/docs/concepts/service-tokens`)",
        when: (answers: any) => answers.auth === "Token",
      },
      {
        type: "input",
        name: "scope",
        message:
          "What scope will your action need to request from the app? (e.g. `https://www.googleapis.com/auth/contacts.readonly`)",
        when: (answers: any) => answers.auth === "OAuth",
      },
      {
        type: "input",
        name: "scopeDescription",
        message:
          "Please enter a brief description of why the user has to authenticate? (e.g. `Enables read-only access to the Google People API`)",
        when: (answers: any) => answers.auth !== "None",
      },
      {
        type: "input",
        name: "example",
        message:
          "What is an example prompts a user might use with this action? (e.g. `what is Ethan's email?`)",
      },
      {
        type: "input",
        name: "apiReference",
        message:
          "Please provide a link to the API reference for this action. (e.g. `https://developers.google.com/people/api/rest/v1/people/get`)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/{{dashCase name}}.tsx",
        templateFile: "templates/action.hbs",
      },
      {
        type: "modify",
        path: "src/{{dashCase name}}.tsx",
        pattern: /<\|OUTPUT_TEMPLATE\|>/,
        templateFile: "templates/action-type/{{lowerCase type}}.hbs",
      },
      {
        type: "modify",
        path: "src/{{dashCase name}}.tsx",
        pattern: /<\|RETURN_TEMPLATE\|>/,
        templateFile: "templates/return/{{lowerCase type}}.hbs",
      },
      {
        type: "modify",
        path: "src/{{dashCase name}}.tsx",
        pattern: /<\|IMPORT_TEMPLATE\|>/,
        templateFile: "templates/imports/{{lowerCase type}}.hbs",
      },
      {
        type: "modify",
        path: "src/{{dashCase name}}.tsx",
        pattern: /<\|AUTH_TEMPLATE\|>/,
        templateFile: "templates/auth/{{lowerCase auth}}.hbs",
      },
      {
        type: "modify",
        path: "src/index.ts",
        pattern: /\/\/ <\|GENERATOR\|> import new action here/,
        template: `import { {{properCase name}}Action } from './{{dashCase name}}';\n// <|GENERATOR|> import new action here`,
      },
      {
        type: "modify",
        path: "src/index.ts",
        pattern: /\/\/ <\|GENERATOR\|> add new action here/,
        template: `{{properCase name}}Action: {{properCase name}}Action,\n  // <|GENERATOR|> add new action here`,
      },
    ],
  })
}
