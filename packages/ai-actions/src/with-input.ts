import { TActionBuilderData } from "./action-builder"
import { TActionData, TActionInput, TActionOutput } from "./action-data"
import { TNoAuth } from "./auth"
import { ActionBuilderWithAuth, TActionBuilderWithAuthData } from "./with-auth"
import { ActionBuilderWithGet } from "./with-get"
import { ActionBuilderWithPost } from "./with-post"

type TActionBuilderWithInputData<
  TBuilderData extends TActionBuilderData,
  TInput extends TActionInput,
> = TBuilderData &
  Pick<TActionData<any, any, any, TInput, any, any, any>, "inputSchema">

export type TActionDataWithInput = TActionBuilderWithInputData<
  TActionBuilderData,
  TActionInput
>

export type TActionType = "GET" | "POST" | "ECHO"

type TEcho<TLocalActionData extends TActionDataWithInput> =
  TLocalActionData["inputSchema"] extends infer TOutput
    ? TOutput extends TActionOutput
      ? ReturnType<
          ActionBuilderWithAuth<
            TActionBuilderWithAuthData<
              TLocalActionData & {
                submissionSchema: undefined
                outputSchema: TOutput
                component: null
              },
              TNoAuth
            >
          >["setActionFunction"]
        >
      : never
    : never

export class ActionBuilderWithInput<
  TLocalActionData extends TActionDataWithInput,
> {
  actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this.actionData = {
      ...actionData,
    }
  }

  /**
   * Spark has three options for actions:
   *
   * 1.`JSON Data` that adheres to a specific Zod schema. This is typically the output for actions that `GET data`. If this is the case, you should specify the Zod schema for the output.
   *
   * 2.`React Component` that asks for confirmation for the action. This is typically the output for actions that `POST data`. If this is the case, you should specify a React component that asks for confirmation for the action. The output will be `void`.
   *
   * 3. `Echo` that just simply returns the input data.
   */
  setActionType(type: "GET"): ActionBuilderWithGet<TLocalActionData>
  setActionType(
    type: "POST"
  ): ActionBuilderWithPost<TLocalActionData, undefined>
  setActionType(type: "ECHO"): TEcho<TLocalActionData>

  setActionType(output: TActionType) {
    if (output === "POST") {
      return new ActionBuilderWithPost({
        actionData: this.actionData,
        submissionSchema: undefined,
      })
    } else if (output === "GET") {
      return new ActionBuilderWithGet({
        actionData: {
          ...this.actionData,
        },
      })
    } else {
      // ECHO
      return (
        new ActionBuilderWithGet({
          actionData: {
            ...this.actionData,
          },
        })
          .setOutputSchema(this.actionData.inputSchema)
          .setAuthType("None")
          // @ts-expect-error - This is a valid action function
          .setActionFunction(async ({ input }) => {
            return input
          })
      )
    }
  }
}
