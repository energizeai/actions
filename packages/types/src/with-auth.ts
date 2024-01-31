import { ActionMetadata, TActionInput, TActionOnSubmit, TActionOutput } from "."
import { TActionAuth } from "./auth"
import { ActionBuilderWithFunction, TActionFunction } from "./with-function"
import { TPassThroughComponent } from "./with-void-output"

export class ActionBuilderWithAuth<
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> {
  protected metadata: ActionMetadata
  protected inputSchema: TInput
  protected outputSchema: TOutput
  protected authConfig: TAuth
  private submissionSchema?: TSubmission
  protected component: TPassThroughComponent<TInput, TOutput, TSubmission>

  constructor({
    metadata,
    inputSchema,
    outputSchema,
    authConfig,
    component,
    submissionSchema = undefined,
  }: {
    metadata: ActionMetadata
    inputSchema: TInput
    outputSchema: TOutput
    authConfig: TAuth
    component: TPassThroughComponent<TInput, TOutput, TSubmission>
    submissionSchema?: TSubmission
  }) {
    this.metadata = metadata
    this.inputSchema = inputSchema
    this.outputSchema = outputSchema
    this.authConfig = authConfig
    this.component = component
    this.submissionSchema = submissionSchema
  }

  /**
   * The function that gets called when the action is invoked. This function should return a promise that resolves to the output of the action.
   *
   * @param input The input to the action function. This is the input that the user provides when invoking the action.
   * @param auth The authentication information for the action. This is the authentication information that the user provides when invoking the action.
   *
   * @returns A promise that resolves to the output of the action.
   *
   * @example
   * The following action function is an example for a `send-email` action.
   * ```
   * async ({ input, auth }) => {
   *   const { subject, body, to } = input;
   *   const { accessToken } = auth;
   *   ...code to send email using the input...
   *   return;
   * }
   * ```
   *
   * @example
   * The following action function is an example for a `get-google-contact` action.
   * ```
   * async ({ input, auth }) => {
   *   const contact = ...code to get contact...
   *   return contact;
   * }
   * ```
   */

  setActionFunction(
    actionFunction: TActionFunction<TInput, TOutput, TAuth, TSubmission>
  ) {
    return new ActionBuilderWithFunction({
      metadata: this.metadata,
      inputSchema: this.inputSchema,
      submissionSchema: this.submissionSchema,
      outputSchema: this.outputSchema,
      authConfig: this.authConfig,
      actionFunction,
      component: this.component,
    })
  }
}
