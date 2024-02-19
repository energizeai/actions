import z from "zod"
import {
  TActionInput,
  TActionMetadata,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { TActionBuilderWithInputData } from "./with-input"
import { ActionBuilderWithOutput } from "./with-output"

type TActionComponentPropsData<
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = {
  /**
   * The input to the action function. You can use this input to prepopulate the form so all the user has to do is click submit.
   */
  input: z.output<TInput>

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
  TMetadata extends TActionMetadata,
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = {
  inputSchema: TInput
  metadata: TMetadata extends z.AnyZodObject ? z.output<TMetadata> : undefined
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
  TMetadata extends TActionMetadata,
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = React.FC<TActionComponentProps<TMetadata, TInput, TOnSubmitValues>>

export type TPassThroughComponent<
  TMetadata extends TActionMetadata,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TOnSubmitValues extends TActionOnSubmit = undefined,
> = TOutput extends z.ZodVoid
  ? TActionComponent<TMetadata, TInput, TOnSubmitValues>
  : null

/**
 * For actions that do not return any data (i.e. POST actions), you need to specify a component to render in the chat after the action is invoked.
 * This component should be a form asking for confirmation to submit the input to the action function.
 */
export class ActionBuilderWithPost<
  TRegistry extends TAnyRegistryData,
  TId extends string,
  TInput extends TActionInput,
  TSubmission extends TActionOnSubmit = undefined,
> {
  actionData: TActionBuilderWithInputData<TRegistry, TId, TInput> & {
    submissionSchema?: TSubmission
  }

  constructor({
    actionData,
    submissionSchema,
  }: {
    actionData: TActionBuilderWithInputData<TRegistry, TId, TInput>
    submissionSchema?: TSubmission
  }) {
    this.actionData = { ...actionData, submissionSchema }
  }

  setComponentSubmissionSchema<T extends TActionInput>(
    submissionSchema: T
  ): ActionBuilderWithPost<TRegistry, TId, TInput, T> {
    return new ActionBuilderWithPost({
      actionData: this.actionData,
      submissionSchema: submissionSchema,
    })
  }

  setOutputComponent(
    component: React.FC<
      TActionComponentProps<TRegistry["metadataSchema"], TInput, TSubmission>
    >
  ): ActionBuilderWithOutput<TRegistry, TId, TInput, z.ZodVoid, TSubmission> {
    return new ActionBuilderWithOutput({
      actionData: {
        ...this.actionData,
        outputSchema: z.void(),
        component,
      },
    })
  }
}
