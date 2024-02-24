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
    isLoading: boolean
    isSuccess: boolean
  }
>

export type TClientActionId = keyof typeof ClientActionsRegistry

export type TClientActionsRegistry = typeof ClientActionsRegistry
