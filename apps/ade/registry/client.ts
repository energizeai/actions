import { RouterOutputs } from "@/trpc/shared"
import { TRPCClientErrorLike } from "@trpc/client"
import { UseTRPCMutationResult } from "@trpc/react-query/shared"
import {
  createClientActionRegistry,
  inferActionComponentRouter,
} from "ai-actions"
import { ActionsRegistry } from "."

export const ClientActionsRegistry = createClientActionRegistry(
  ActionsRegistry,
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

export type TActionComponentRouter = inferActionComponentRouter<
  typeof ClientActionsRegistry,
  {
    displayState: "placeholder" | "active" | "skeleton"
  } & {
    mutationResults?: UseTRPCMutationResult<
      RouterOutputs["actions"]["testActionFunction"],
      TRPCClientErrorLike<any>,
      any,
      any
    >
  }
>

export type TClientActionId = keyof typeof ClientActionsRegistry

export type TClientActionsRegistry = typeof ClientActionsRegistry
