import { TActionBuilderData } from "./action-builder"
import {
  TActionData,
  TActionInput,
  TActionOutput,
  TActionType,
} from "./action-data"
import { TNoAuth } from "./auth"
import { ActionBuilderWithActionType } from "./with-action-type"
import { ActionBuilderWithAuth, TActionBuilderWithAuthData } from "./with-auth"

type TActionBuilderWithInputData<
  TBuilderData extends TActionBuilderData,
  TInput extends TActionInput,
> = TBuilderData &
  Pick<TActionData<any, any, any, TInput, any, any, any>, "inputSchema">

export interface TActionDataWithInput
  extends TActionBuilderWithInputData<TActionBuilderData, TActionInput> {}

type TEcho<TLocalActionData extends TActionDataWithInput> =
  TLocalActionData["inputSchema"] extends infer TOutput
    ? TOutput extends TActionOutput
      ? ReturnType<
          ActionBuilderWithAuth<
            TActionBuilderWithAuthData<
              TLocalActionData & {
                outputSchema: TOutput
                actionType: "ECHO"
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
  _actionData: TLocalActionData

  constructor({ actionData }: { actionData: TLocalActionData }) {
    this._actionData = {
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
  setActionType<T extends TActionType>(
    type: T
  ): ActionBuilderWithActionType<T, TLocalActionData>
  setActionType(type: "ECHO"): TEcho<TLocalActionData>

  setActionType(output: TActionType) {
    if (output === "ECHO") {
      // ECHO
      return (
        new ActionBuilderWithActionType({
          actionData: {
            ...this._actionData,
          },
          actionType: "ECHO",
        })
          .setOutputSchema(this._actionData.inputSchema)
          .setAuthType("None")
          // @ts-expect-error - this is a hack to get the correct type
          .setActionFunction(({ input }) => {
            return input
          })
      )
    }

    return new ActionBuilderWithActionType({
      actionData: {
        ...this._actionData,
      },
      actionType: output,
    })
  }
}
