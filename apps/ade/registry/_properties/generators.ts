import { generateActionRegistryFunctions } from "ai-actions"
import { z } from "zod"
import { ActionsRegistryMetadataSchema } from "./metadata"

const { createADEActionsRegistry, createADEAction } =
  generateActionRegistryFunctions({
    namespace: "ADE",
    metadataSchema: ActionsRegistryMetadataSchema,
    actionFunctionExtras: z.object({
      userData: z.object({
        email: z.string().email(),
        name: z.string(),
      }),
    }),
  })

export { createADEAction, createADEActionsRegistry }
