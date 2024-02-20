import z from "zod"
import zodToJsonSchema from "zod-to-json-schema"
import { TActionData } from "./action-data"
import { TActionAuth, TTokenCustomData } from "./auth"
import { TActionDataWithAuth } from "./with-auth"

export type TActionBuilderWithFunctionData<
  TAuthActionData extends TActionDataWithAuth,
> = TAuthActionData["authConfig"] extends infer U
  ? U extends TActionAuth<TAuthActionData["registryData"], TTokenCustomData>
    ? TAuthActionData &
        Pick<
          TActionData<
            TAuthActionData["registryData"],
            TAuthActionData["id"],
            TAuthActionData["inputSchema"],
            TAuthActionData["outputSchema"],
            U,
            TAuthActionData["submissionSchema"]
          >,
          "actionFunction" | "exampleInput"
        >
    : never
  : never

export type TActionDataWithFunction =
  TActionBuilderWithFunctionData<TActionDataWithAuth>

export class ActionBuilderWithFunction<
  TLocalActionData extends TActionDataWithFunction,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.actionData = actionData
  }

  setExampleInput(exampleInput: z.input<TLocalActionData["inputSchema"]>) {
    this.actionData.exampleInput = exampleInput
    return this
  }

  getId(): TLocalActionData["id"] {
    return this.actionData.id
  }

  getExampleInput(): TLocalActionData["exampleInput"] {
    return this.actionData.exampleInput
  }

  getNamespace(): TLocalActionData["registryData"]["namespace"] {
    return this.actionData.registryData.namespace
  }

  getMetadata(): TLocalActionData["metadata"] {
    return this.actionData.metadata
  }

  getAuthConfig(): TLocalActionData["authConfig"] {
    return this.actionData.authConfig
  }

  getInputSchema(): TLocalActionData["inputSchema"] {
    return this.actionData.inputSchema
  }

  getSubmissionSchema(): TLocalActionData["submissionSchema"] {
    return this.actionData.submissionSchema
  }

  getActionFunction(): TLocalActionData["actionFunction"] {
    return this.actionData.actionFunction
  }

  getOutputSchema(): TLocalActionData["outputSchema"] {
    return this.actionData.outputSchema
  }

  getInputJSONSchema() {
    return zodToJsonSchema(this.actionData.inputSchema)
  }

  getOutputJSONSchema() {
    return zodToJsonSchema(this.actionData.outputSchema)
  }

  getComponent(): TLocalActionData["component"] {
    return this.actionData.component
  }

  getRegistryData(): TLocalActionData["registryData"] {
    return this.actionData.registryData
  }
}
