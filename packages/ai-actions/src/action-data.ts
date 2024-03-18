import { ReactNode } from "react"
import z from "zod"
import { TAnyActionAuth, TAuthArg } from "./auth"

export type TActionMetadata = z.ZodType<any> | undefined
export type THandlerContext = z.ZodType<any> | undefined
export type TActionInput = z.ZodObject<any>
export type TActionOutput = z.ZodType<any>
export type TOptionalActionOutput = TActionOutput | undefined
export type TTokenAuthMetadata = z.ZodObject<any> | undefined
export type TOAuthMetadata = z.ZodObject<any> | undefined
export type TAdditionalParams = z.ZodType<any>
export type TOptionalAdditionalParams = TAdditionalParams | undefined

export type TStreamable = ReactNode | Promise<ReactNode>

export type TRenderReturn =
  | TStreamable
  | Generator<TStreamable, TStreamable, void>
  | AsyncGenerator<TStreamable, TStreamable, void>

export interface TActionHandler<
  TRegistry extends TAnyRegistryData,
  TInput extends TActionInput,
  THandlerRet extends any,
  TAuth extends TAnyActionAuth,
  TAdditional extends TOptionalAdditionalParams,
> {
  (
    _: {
      input: z.output<TInput>
    } & (TAuth["type"] extends "None" ? {} : { auth: TAuthArg<TAuth> }) &
      (TAdditional extends TAdditionalParams
        ? { additionalParams: z.output<TAdditional> }
        : {}) & (TRegistry["handlerContextSchema"] extends z.ZodType<any>
            ? { context: z.output<TRegistry["handlerContextSchema"]> }
            : {})
  ): THandlerRet
}

export interface TRegistryData<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TContext extends THandlerContext,
  TToken extends TTokenAuthMetadata,
  TOAuth extends TOAuthMetadata,
> {
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
  metadataSchema?: TMetadata

  /**
   * Sometimes you may want to pass extra data to each action handler (on top of input and auth). This is useful for things like user data, local time zone, etc.
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
  handlerContextSchema?: TContext

  /**
   * The schema for the token auth metadata. Useful if you want to store some extra data with the token.
   *
   * ```typescript
   * z.object({
   *  tokenGenerationDocumentationURL: z.string().url(),
   * })
   */
  tokenAuthMetadataSchema?: TToken

  /**
   * The schema for the OAuth metadata. Useful if you want to store some extra data with the OAuth token.
   *
   * ```typescript
   * z.object({
   *   oauthAppGenerationDocumentationURL: z.string().url(),
   * })
   */
  oAuthMetadataSchema?: TOAuth
}

export interface TAnyRegistryData
  extends TRegistryData<
    string,
    TActionMetadata,
    THandlerContext,
    TTokenAuthMetadata,
    TOAuthMetadata
  > {}

export interface TActionData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TFunctionName extends string,
  TInput extends TActionInput,
  TOutput extends TOptionalActionOutput,
  TAdditional extends TOptionalAdditionalParams,
  TAuth extends TAnyActionAuth,
  THandlerRet extends any,
> {
  registryData: TRegistry
  id: TId
  functionName: TFunctionName
  metadata: TRegistry["metadataSchema"] extends z.ZodType<any>
    ? z.output<TRegistry["metadataSchema"]>
    : undefined
  inputSchema: TInput
  outputSchema: TOutput
  additionalParamsSchema: TAdditional
  authConfig: TAuth
  exampleInput: z.input<TInput> | null

  handler: TActionHandler<TRegistry, TInput, THandlerRet, TAuth, TAdditional>
  $unwrappedHandler: TActionHandler<
    TRegistry,
    TInput,
    THandlerRet,
    TAuth,
    TAdditional
  >

  render:
    | ((
        props: Parameters<
          TActionHandler<TRegistry, TInput, any, TAuth, TAdditional>
        >[0] & {
          handler: TActionHandler<
            TRegistry,
            TInput,
            THandlerRet,
            TAuth,
            TAdditional
          >
        }
      ) => TRenderReturn)
    | undefined
}

export interface TAnyActionData
  extends TActionData<any, any, any, any, any, any, any, any> {}
