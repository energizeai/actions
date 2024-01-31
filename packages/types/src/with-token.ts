import { ActionMetadata, TActionInput, TActionOnSubmit, TActionOutput } from "."
import { TTokenAuthConfig, TTokenCustomData } from "./auth"
import { ActionBuilderWithAuth } from "./with-auth"
import { TPassThroughComponent } from "./with-void-output"

export class ActionBuilderWithTokenType<
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
    submissionSchema = undefined,
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

  setTokenData = <T extends TTokenCustomData>(data: TTokenAuthConfig<T>) => {
    return new ActionBuilderWithAuth({
      metadata: this.metadata,
      inputSchema: this.inputSchema,
      outputSchema: this.outputSchema,
      submissionSchema: this.submissionSchema,
      authConfig: {
        type: "Token",
        config: data,
      },
      component: this.component,
    })
  }
}
