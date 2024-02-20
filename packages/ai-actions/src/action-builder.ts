import { TActionData, TActionInput, TAnyRegistryData } from "./action-data"
import { ActionBuilderWithInput } from "./with-input"

export type TActionBuilderConstructorData<
  TRegistry extends TAnyRegistryData,
  TId extends string,
> = Pick<
  TActionData<TRegistry, TId, any, any, any, any>,
  "metadata" | "id" | "registryData"
>

export type TActionBuilderData = TActionBuilderConstructorData<
  TAnyRegistryData,
  string
>

export class ActionBuilder<TLocalActionData extends TActionBuilderData> {
  actionData: TLocalActionData

  constructor(input: TLocalActionData) {
    this.actionData = input
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
        ...this.actionData,
        inputSchema: input,
      },
    })
  }
}
