import { RouterOutputs } from "@/trpc/shared"
import { TRPCClientErrorLike } from "@trpc/client"
import { UseTRPCMutationResult } from "@trpc/react-query/shared"
import {
  createClientActionsRegistry,
  inferActionComponentRouter,
  pickFromActionsRegistry,
  prepareAIActions,
} from "ai-actions"
import { ActionsRegistry } from "."

const ClientOnlyRegistry = pickFromActionsRegistry(ActionsRegistry, [
  "google-sendMail",
  "google-moveEmailToTrash",
  "linear-createIssue",
  "google-replyToEmail",
  "zoom-createMeeting",
])

export const ClientActionsRegistry = createClientActionsRegistry(
  ClientOnlyRegistry,
  {
    pipeMetadata(metadata) {
      return {
        avatar: metadata.avatar,
        title: metadata.title,
        description: metadata.description,
      }
    },
  }
)

export const AIActions = prepareAIActions([ClientActionsRegistry])
export type TAIActions = typeof AIActions

export type TClientActionsRegistry = typeof ClientActionsRegistry
export type TClientActionId = keyof TClientActionsRegistry

export type TActionComponentRouter = inferActionComponentRouter<
  TClientActionsRegistry,
  {
    displayState: "placeholder" | "active" | "skeleton"
    mutationResults?: UseTRPCMutationResult<
      RouterOutputs["actions"]["testActionFunction"],
      TRPCClientErrorLike<any>,
      any,
      any
    >
  }
>

export const isClientAction = (actionId: string): actionId is TClientActionId =>
  actionId in ClientActionsRegistry
