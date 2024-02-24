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
import { extractErrorMessage } from "@/trpc/shared"
import { createActionComponentRouter } from "ai-actions"
import { toast } from "sonner"

function ActionComponent({
  clientActionId,
  state,
  args,
  userData = {
    email: "",
    name: "",
  },
}: {
  clientActionId: TClientActionId
  state: "active" | "placeholder" | "skeleton"
  args: any
  userData?: {
    email: string
    name: string
  }
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
      args={args}
      metadata={actionData.metadata}
      isLoading={caller.isLoading}
      isSuccess={caller.isSuccess}
      onSubmit={(props) => {
        try {
          caller.mutateAsync({
            actionId: clientActionId,
            inputDataAsString: JSON.stringify(props.args),
            userData,
          })
        } catch (error) {
          toast.error(extractErrorMessage(error))
        }
      }}
    />
  )
}

export { ActionComponent }
