import z from "zod"
import { TActionInput, TAnyRegistryData, ValidZodSchema } from "./action-data"
import { ActionBuilderWithInput } from "./with-input"

export interface TActionBuilderConstructorData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TFunctionName extends string,
> {
  id: TId
  functionName: TFunctionName
  metadata: TRegistry["metadataSchema"] extends infer U
    ? U extends ValidZodSchema
      ? z.output<U>
      : undefined
    : undefined
  registryData: TRegistry
}

export interface TActionBuilderData
  extends TActionBuilderConstructorData<TAnyRegistryData, string, string> {}

export class ActionBuilder<TLocalActionData extends TActionBuilderData> {
  _actionData: TLocalActionData

  constructor(input: TLocalActionData) {
    this._actionData = input
  }

  /**
   * The Zod input schema for the action. This is used to validate the arguments passed to the action.
   *
   * You must include a `.describe()` call on each field to provide a description of the input. This description will be used to generate the prompts and details page for your action.
   *
   * @example
   * The following input schema is an example for a `send-email` action.
   * ```
   * z.object({
   *  subject: z.string().desribe("The subject of the email"),
   *  body: z.string().describe("The body of the email"),
   *  to: z.array(z.object({
   *   email: z.string().describe("The email of the recipient"),
   * })).describe("The recipients of the email"),
   * ```
   */
  setInputSchema<T extends TActionInput>(input: T) {
    return new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
        inputSchema: input,
      },
    })
  }
}
