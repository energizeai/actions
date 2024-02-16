import z from "zod"
import {
  ActionMetadata,
  TActionAuth,
  TActionFunction,
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
} from "."
import { TPassThroughComponent } from "./with-post"

export type TActionData<
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = {
  id: TId
  metadata: ActionMetadata
  inputSchema: TInput
  submissionSchema?: TSubmission
  outputSchema: TOutput
  authConfig: TAuth
  actionFunction: TActionFunction<TInput, TOutput, TAuth, TSubmission>
  component: TPassThroughComponent<TInput, TOutput, TSubmission>
  exampleInput: z.infer<TInput> | null
}
