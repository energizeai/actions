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

export class ActionBuilder<TId extends string> {
  private metadata: ActionMetadata
  private id: TId

  constructor(input: { metadata: ActionMetadata; id: TId }) {
    this.metadata = input.metadata
    this.id = input.id
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
        metadata: this.metadata,
        id: this.id,
        inputSchema: input,
      },
    })
  }
}

/**
 * Create a new action.
 */
export const createAction = <TId extends string>(input: {
  /**
   * The metadata for the action. This includes the title, description, resource, and other details about the action.
   */
  metadata: ActionMetadata

  /**
   * The unique identifier for the action. This is used to reference the action in the registry.
   *
   * Guidelines for Creating IDs:
   * Prefix with Service: Start with a prefix that identifies the service (e.g., Google, Bing).
   * Action Description: Follow the service prefix with a short, descriptive action name.
   * Use Hyphens: Separate words with hyphens (e.g., google-searchEmailInbox).
   * Use Camel Case: Use camel case for action names (e.g., google-searchEmailInbox).
   *
   * @example
   * ```
   * id: "google-searchEmailInbox"
   * ```
   */
  id: TId
}) => {
  return new ActionBuilder(input)
}
