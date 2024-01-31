import z from "zod"
import { ActionMetadata } from "./metadata"
import { ActionBuilderWithInput } from "./with-input"

export type TActionInput = z.ZodObject<any>
export type TActionOutput = z.ZodObject<any> | z.ZodVoid
export type TActionOnSubmit = z.ZodObject<any> | undefined

export const ActionUserDataSchema = z.object({
  email: z.string().email().describe("The email of the user"),
  name: z.string().describe("The name of the user"),
})
export type TActionUserData = z.infer<typeof ActionUserDataSchema>

export class ActionBuilder {
  private metadata: ActionMetadata

  constructor(input: { metadata: ActionMetadata }) {
    this.metadata = input.metadata
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
      metadata: this.metadata,
      inputSchema: input,
    })
  }
}

export const createAction = (input: { metadata: ActionMetadata }) => {
  return new ActionBuilder(input)
}
