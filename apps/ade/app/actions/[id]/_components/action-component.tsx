"use client"

import { GoogleMoveEmailToTrashCard } from "@/registry/_components/google-move-email-to-trash-card"
import { GoogleReplyToEmailCard } from "@/registry/_components/google-reply-to-email-card"
import { GoogleSendMailCard } from "@/registry/_components/google-send-mail-card"
import { LinearCreateIssueCard } from "@/registry/_components/linear-create-issue-card"
import {
  ClientSafeActionsRegistry,
  TActionComponentRouter,
  TClientActionId,
} from "@/registry/client"
import { api } from "@/trpc/react"
import { createActionComponentRouter } from "ai-actions"
import { toast } from "sonner"
import { z } from "zod"

function ActionComponent({
  clientActionId,
  state,
  args,
}: {
  clientActionId: TClientActionId
  state: "active" | "placeholder" | "skeleton"
  args: any
}) {
  const caller = api.actions.testActionFunction.useMutation()

  const Router = createActionComponentRouter<TActionComponentRouter>({
    "google-sendMail": GoogleSendMailCard,
    "google-moveEmailToTrash": GoogleMoveEmailToTrashCard,
    "linear-createIssue": LinearCreateIssueCard,
    "google-replyToEmail": GoogleReplyToEmailCard,
  })

  const actionData = ClientSafeActionsRegistry[clientActionId]

  return (
    <Router
      displayState={state}
      inputSchema={actionData.inputSchema}
      functionName={actionData.functionName}
      args={args as z.input<typeof actionData.inputSchema>}
      isLoading={caller.isLoading}
      isSuccess={caller.isSuccess}
      onSubmit={(props) => {
        try {
          caller.mutateAsync({
            actionId: clientActionId,
            inputDataAsString: JSON.stringify(props.args),
            userData: props.userData,
          })
        } catch {
          toast.error("Error running action.")
        }
      }}
    />
  )
}

export { ActionComponent }
