import z from "zod"
import {
  TActionInput,
  TActionMetadata,
  TActionOnSubmit,
  TActionOutput,
  TAnyRegistryData,
} from "./action-data"
import { TActionDataWithInput } from "./with-input"
import { ActionBuilderWithOutput } from "./with-output"

type TActionComponentPropsData<
  TInput extends TActionInput,
  TOnSubmitValues extends TActionOnSubmit,
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
  TOnSubmitValues extends TActionOnSubmit,
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
  TOnSubmitValues extends TActionOnSubmit,
> = React.FC<TActionComponentProps<TMetadata, TInput, TOnSubmitValues>>

export type TPassThroughComponent<
  TMetadata extends TActionMetadata,
  TInput extends TActionInput,
  TOutput extends TActionOutput,
  TOnSubmitValues extends TActionOnSubmit,
> = TOutput extends z.ZodVoid
  ? TActionComponent<TMetadata, TInput, TOnSubmitValues>
  : null

/**
 * For actions that do not return any data (i.e. POST actions), you need to specify a component to render in the chat after the action is invoked.
 * This component should be a form asking for confirmation to submit the input to the action function.
 */
export class ActionBuilderWithPost<
  TLocalActionData extends TActionDataWithInput,
  TSubmission extends TActionOnSubmit,
> {
  actionData: TLocalActionData
  submissionSchema: TSubmission

  constructor({
    actionData,
    submissionSchema,
  }: {
    actionData: TLocalActionData
    submissionSchema: TSubmission
  }) {
    this.actionData = actionData
    this.submissionSchema = submissionSchema
  }

  setComponentSubmissionSchema<T extends TActionInput>(
    submissionSchema: T
  ): ActionBuilderWithPost<TLocalActionData, T> {
    return new ActionBuilderWithPost({
      actionData: this.actionData,
      submissionSchema,
    })
  }

  setOutputComponent(
    component: TLocalActionData["registryData"] extends infer TRegistry
      ? TRegistry extends TAnyRegistryData
        ? TLocalActionData["inputSchema"] extends infer TInput
          ? TRegistry["metadataSchema"] extends infer TMetadata
            ? TInput extends TActionInput
              ? TMetadata extends TActionMetadata
                ? React.FC<
                    TActionComponentProps<TMetadata, TInput, TSubmission>
                  >
                : never
              : never
            : never
          : never
        : never
      : never
  ) {
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
