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
  input: z.output<TSubmission extends undefined ? TInput : TSubmission>
  auth: TAuthArg<TAuth>
  extras: TExtras extends z.AnyZodObject ? z.infer<TExtras> : undefined
}) => Promise<z.infer<TOutput>>

export type TRegistryData<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
> = {
  /**
   * The namespace for the actions registry. Useful if you have multiple action registries.
   *
   * @example "ADE"
   */
  namespace: TNamespace

  /**
   * The schema for the metadata of the action. This is used to validate the metadata passed to the action.
   *
   * If you don't have metadata, you can pass `undefined`.
   *
   * @example
   * ```typescript
   * z.object({
   *   title: z.string(),
   *   description: z.string(),
   * })
   * ```
   */
  metadataSchema: TMetadata

  /**
   * Sometimes you may want to pass extra data to each action function (on top of input and auth). This is useful for things like user data, local time zone, etc.
   *
   * If you don't have any extra data, you can pass `undefined`.
   *
   * @example
   * ```typescript
   * z.object({
   *  userData: z.object({
   *   email: z.string().email(),
   *   name: z.string(),
   *  })
   * })
   * ```
   */
  actionFunctionExtrasSchema: TExtras
}

export type TAnyRegistryData = TRegistryData<
  string,
  TActionMetadata,
  TActionFunctionExtras
>

export type TActionData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TActionAuth,
  TSubmission extends TActionOnSubmit = undefined,
> = {
  registryData: TRegistry
  id: TId
  metadata: TRegistry["metadataSchema"] extends z.AnyZodObject
    ? z.output<TRegistry["metadataSchema"]>
    : undefined
  inputSchema: TInput
  submissionSchema?: TSubmission
  outputSchema: TOutput
  authConfig: TAuth
  actionFunction: TActionFunction<
    TRegistry["actionFunctionExtrasSchema"],
    TInput,
    TOutput,
    TAuth,
    TSubmission
  >
  component: TPassThroughComponent<
    TRegistry["metadataSchema"],
    TInput,
    TOutput,
    TSubmission
  >
  exampleInput: z.infer<TInput> | null
}
