import z from "zod"
import { TActionAuth, TAuthArg } from "./auth"
import { TPassThroughComponent } from "./with-post"

export type TActionMetadata = z.ZodObject<any> | undefined
export type TActionFunctionExtras = z.ZodObject<any> | undefined
export type TActionInput = z.ZodObject<any>
export type TActionOutput = z.ZodObject<any> | z.ZodVoid
export type TActionOnSubmit = z.ZodObject<any> | undefined

export type TActionFunction<
  TExtras extends TActionFunctionExtras,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = (_: {
  input: z.infer<TSubmission extends undefined ? TInput : TSubmission>
  auth: TAuthArg<TAuth>
  extras: TExtras extends z.AnyZodObject ? z.infer<TExtras> : undefined
}) => Promise<z.infer<TOutput>>

export type TActionData<
  TId extends string,
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = {
  id: TId
  namespace: TNamespace
  metadata: TMetadata extends z.AnyZodObject ? z.input<TMetadata> : undefined
  actionFunctionExtrasSchema: TExtras
  inputSchema: TInput
  submissionSchema?: TSubmission
  outputSchema: TOutput
  authConfig: TAuth
  actionFunction: TActionFunction<TExtras, TInput, TOutput, TAuth, TSubmission>
  component: TPassThroughComponent<TMetadata, TInput, TOutput, TSubmission>
  exampleInput: z.infer<TInput> | null
}
