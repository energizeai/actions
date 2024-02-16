import z from "zod"
import {
  ActionMetadata,
  TActionInput,
  TActionOnSubmit,
  TActionOutput,
  TActionUserData,
} from "."
import { TActionBuilderWithInputData } from "./with-input"
import { ActionBuilderWithOutput } from "./with-output"

type TActionComponentPropsData<
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = {
  /**
   * The input to the action function. You can use this input to prepopulate the form so all the user has to do is click submit.
   */
  input: z.infer<TInput>

  /**
   * The user data for the action. This is the data that the user has provided to the LLM. You can use this data to prepopulate the form so all the user has to do is click submit.
   */
  userData: TActionUserData

  /**
   * Indicates whether the action function is currently running.
   */
  isLoading: boolean

  /**
   * Indicates whether the action function has completed running and is successful.
   */
  isSuccess: boolean

  /**
   * Indicates whether the action function has completed running and has failed.
   */
  isError: boolean

  /**
   * The submit handler for the form. This is called when the user clicks the submit button.
   */
  onSubmit: (
    formValues: z.infer<
      TOnSubmitValues extends undefined ? TInput : TOnSubmitValues
    >
  ) => Promise<void>
}

export type TActionComponentProps<
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = {
  inputSchema: TInput
  metadata: ReturnType<ActionMetadata["getMetadata"]>
} & (
  | {
      /**
       *  When the action is active, the user can interact with the component.
       */
      displayState: "active"
      data: TActionComponentPropsData<TInput, TOnSubmitValues>
    }
  | {
      /**
       * A placeholder component is used for things like the action details page, where the user can view the component but not interact with it.
       */
      displayState: "placeholder"
      data: undefined
    }
  | {
      /**
       * Indicates whether the `LLM is still streaming in the input to the action function`.
       * If this is the case, it is necessary to show a loading state of the form.
       * We recommend using Skeleton components instead of input fields to indicate that the form is loading.
       */
      displayState: "skeleton"
      data: undefined
    }
)

export type TActionComponent<
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = React.FC<TActionComponentProps<TInput, TOnSubmitValues>>

export type TPassThroughComponent<
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = TOutput extends z.ZodVoid ? TActionComponent<TInput, TOnSubmitValues> : null

/**
 * For actions that do not return any data (i.e. POST actions), you need to specify a component to render in the chat after the action is invoked.
 * This component should be a form asking for confirmation to submit the input to the action function.
 */
export class ActionBuilderWithVoidOutput<
  TId extends string,
  TInput extends TActionInput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  private actionData: TActionBuilderWithInputData<TId, TInput>
  private submissionSchema?: TSubmission

  constructor({
    actionData,
    submissionSchema,
  }: {
    actionData: TActionBuilderWithInputData<TId, TInput>
    submissionSchema?: TSubmission
  }) {
    this.actionData = actionData
    this.submissionSchema = submissionSchema
  }

  setComponentSubmissionSchema<T extends TActionInput>(
    submissionSchema: T
  ): ActionBuilderWithVoidOutput<TId, TInput, T> {
    return new ActionBuilderWithVoidOutput({
      actionData: this.actionData,
      submissionSchema: submissionSchema,
    })
  }

  setOutputComponent(
    component: React.FC<TActionComponentProps<TInput, TSubmission>>
  ): ActionBuilderWithOutput<TId, TInput, z.ZodVoid, TSubmission> {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this.actionData,
        submissionSchema: this.submissionSchema,
        outputSchema: z.void(),
        component,
      },
    })
  }
}
