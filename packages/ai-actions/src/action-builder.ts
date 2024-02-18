import {
  TActionFunctionExtras,
  TActionInput,
  TActionMetadata,
} from "./action-data"
import { ActionBuilderWithInput } from "./with-input"

export class ActionBuilder<
  TId extends string,
  TNamespace extends string,
  TMetadata extends TActionMetadata,
  TExtras extends TActionFunctionExtras,
> {
  actionData: {
    metadata: TMetadata extends Zod.AnyZodObject
      ? Zod.input<TMetadata>
      : undefined
    actionFunctionExtrasSchema: TExtras
    id: TId
    namespace: TNamespace
  }

  constructor(input: {
    namespace: TNamespace
    metadata: TMetadata extends Zod.AnyZodObject
      ? Zod.input<TMetadata>
      : undefined
    actionFunctionExtrasSchema: TExtras
    id: TId
  }) {
    this.actionData = {
      metadata: input.metadata,
      namespace: input.namespace,
      id: input.id,
      actionFunctionExtrasSchema: input.actionFunctionExtrasSchema,
    }
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
