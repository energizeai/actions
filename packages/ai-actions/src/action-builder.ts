import z from "zod"
import { TAnyRegistryData, ValidZodSchema } from "./action-data"
import { ActionBuilderWithInput, TOmitOnInputBase } from "./with-input"

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

export type TOmitActionBuilderBase = "_actionData" | "_description"

export class ActionBuilder<TLocalActionData extends TActionBuilderData> {
  _actionData: TLocalActionData
  _description: string | undefined

  constructor(input: TLocalActionData, description?: string) {
    this._actionData = input
    this._description = description
  }

  /**
   * The description of the action. This is used to generate the prompts and details page for your action.
   * @param description The description of the action.
   * @returns The action builder with the description set.
   * @example
   */
  describe(description: string) {
    this._description = description
    return this as Omit<typeof this, "describe" | TOmitActionBuilderBase>
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
  input<T extends z.ZodRawShape>(input: T) {
    const inputSchema = this._description
      ? z.object(input).describe(this._description)
      : z.object(input)

    const ret = new ActionBuilderWithInput({
      actionData: {
        ...this._actionData,
        inputSchema,
      },
      outputSchema: undefined,
      additionalParamsSchema: undefined,
      authConfig: {
        type: "None",
        config: undefined,
      },
    })

    return ret as Omit<typeof ret, TOmitOnInputBase>
  }
}
