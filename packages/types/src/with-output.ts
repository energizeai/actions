import { ActionMetadata, TActionInput, TActionOnSubmit, TActionOutput } from "."
import { AuthType, TAuthType } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { ActionBuilderWithOAuthType } from "./with-oauth"
import { ActionBuilderWithTokenType } from "./with-token"
import { TPassThroughComponent } from "./with-void-output"

type TNoAuth = {
  type: typeof AuthType.NONE
  config: undefined
}

export class ActionBuilderWithOutput<
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  protected metadata: ActionMetadata
  protected inputSchema: TInput
  protected outputSchema: TOutput
  protected component: TPassThroughComponent<TInput, TOutput, TSubmission>
  protected submissionSchema?: TSubmission

  constructor({
    metadata,
    inputSchema,
    outputSchema,
    component,
    submissionSchema,
  }: {
    metadata: ActionMetadata
    inputSchema: TInput
    outputSchema: TOutput
    component: TPassThroughComponent<TInput, TOutput, TSubmission>
    submissionSchema?: TSubmission
  }) {
    this.metadata = metadata
    this.inputSchema = inputSchema
    this.outputSchema = outputSchema
    this.component = component
    this.submissionSchema = submissionSchema
  }

  /**
   * The authentication type for the action. This is used to generate the authentication page for the action and get users authenticated.
   */
  setAuthType(
    type: typeof AuthType.NONE
  ): ActionBuilderWithAuth<TInput, TOutput, TNoAuth, TSubmission>
  setAuthType(
    type: typeof AuthType.TOKEN
  ): ActionBuilderWithTokenType<TInput, TOutput, TSubmission>
  setAuthType(
    type: typeof AuthType.OAUTH
  ): ActionBuilderWithOAuthType<TInput, TOutput, TSubmission>

  setAuthType(
    type: TAuthType
  ):
    | ActionBuilderWithTokenType<TInput, TOutput, TSubmission>
    | ActionBuilderWithAuth<TInput, TOutput, TNoAuth, TSubmission>
    | ActionBuilderWithOAuthType<TInput, TOutput, TSubmission> {
    if (type === AuthType.NONE) {
      return new ActionBuilderWithAuth({
        metadata: this.metadata,
        inputSchema: this.inputSchema,
        submissionSchema: this.submissionSchema,
        outputSchema: this.outputSchema,
        authConfig: {
          type: AuthType.NONE,
          config: undefined,
        },
        component: this.component,
      })
    }
    if (type === AuthType.TOKEN) {
      return new ActionBuilderWithTokenType({
        metadata: this.metadata,
        inputSchema: this.inputSchema,
        submissionSchema: this.submissionSchema,
        outputSchema: this.outputSchema,
        component: this.component,
      })
    }
    if (type === AuthType.OAUTH) {
      return new ActionBuilderWithOAuthType({
        metadata: this.metadata,
        inputSchema: this.inputSchema,
        outputSchema: this.outputSchema,
        submissionSchema: this.submissionSchema,
        component: this.component,
      })
    }
    throw new Error("Invalid authentication type")
  }
}
