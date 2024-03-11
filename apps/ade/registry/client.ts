import { RouterOutputs } from "@/trpc/shared"
import { TRPCClientErrorLike } from "@trpc/client"
import { UseTRPCMutationResult } from "@trpc/react-query/shared"
import {
  createClientActionsRegistry,
  inferActionComponentRouter,
} from "ai-actions"
import { ActionsRegistry } from "."

export const ClientActionsRegistry = createClientActionsRegistry(
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

export type TClientActionsRegistry = typeof ClientActionsRegistry

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
