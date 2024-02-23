import {
  createClientSafeActionRegistry,
  inferActionComponentRouter,
} from "ai-actions"
import { ActionsRegistry } from "."

export const ClientSafeActionsRegistry = createClientSafeActionRegistry(
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
  typeof ClientSafeActionsRegistry,
  {
    displayState: "placeholder" | "active" | "skeleton"
    isLoading: boolean
    isSuccess: boolean
  }
>

export type TClientActionId = keyof typeof ClientSafeActionsRegistry
