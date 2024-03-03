import z from "zod"
import { TAnyActionAuth, TAuthArg } from "./auth"

export type ValidZodSchema = z.ZodString | z.ZodNumber | z.AnyZodObject

export type TActionMetadata = ValidZodSchema | undefined
export type TActionFunctionContext = ValidZodSchema | undefined
export type TActionInput = z.ZodObject<any>
export type TActionOutput = ValidZodSchema | z.ZodVoid
export type TTokenAuthMetadata = z.ZodObject<any> | undefined
export type TOAuthMetadata = z.ZodObject<any> | undefined
export type TActionType = "CLIENT" | "SERVER" | "ECHO"

export type TActionFunction<
  TRegistry extends TAnyRegistryData,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TAnyActionAuth,
> = (
  _: {
    input: z.output<TInput>
    context: TRegistry["actionFunctionContextSchema"] extends infer U
      ? U extends ValidZodSchema
        ? z.output<U>
        : undefined
      : undefined
  } & (TAuth["type"] extends "None" ? {} : { auth: TAuthArg<TAuth> })
) => Promise<z.input<TOutput>>

export type TRegistryData<
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TContext extends TActionFunctionContext,
  TToken extends TTokenAuthMetadata,
  TOAuth extends TOAuthMetadata,
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
  metadataSchema?: TMetadata

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
  actionFunctionContextSchema?: TContext

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

export type TAnyRegistryData = TRegistryData<
  string,
  TActionMetadata,
  TActionFunctionContext,
  TTokenAuthMetadata,
  TOAuthMetadata
>

export type TActionData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TFunctionName extends string,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TAuth extends TAnyActionAuth,
  TType extends TActionType,
> = {
  registryData: TRegistry
  id: TId
  actionType: TType
  functionName: TFunctionName
  metadata: TRegistry["metadataSchema"] extends infer U
    ? U extends ValidZodSchema
      ? z.output<U>
      : undefined
    : undefined
  inputSchema: TInput
  outputSchema: TOutput
  authConfig: TAuth
  actionFunction: TActionFunction<TRegistry, TInput, TOutput, TAuth>
  exampleInput: z.input<TInput> | null
}

export type TAnyActionData = TActionData<any, any, any, any, any, any, any>
