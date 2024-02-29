"use client"

import { GoogleMoveEmailToTrashCard } from "@/registry/_components/google-move-email-to-trash-card"
import { GoogleReplyToEmailCard } from "@/registry/_components/google-reply-to-email-card"
import { GoogleSendMailCard } from "@/registry/_components/google-send-mail-card"
import { LinearCreateIssueCard } from "@/registry/_components/linear-create-issue-card"
import { ZoomCreateMeetingCard } from "@/registry/_components/zoom-create-meeting-card"
import {
  TActionComponentRouter,
  TClientActionId,
  TClientActionsRegistry,
} from "@/registry/client"
import { useActionRegistry } from "@/registry/provider"
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
  const { clientRegistry } = useActionRegistry<TClientActionsRegistry>()
  const caller = api.actions.testActionFunction.useMutation()

  const Router = createActionComponentRouter<TActionComponentRouter>({
    "google-sendMail": GoogleSendMailCard,
    "google-moveEmailToTrash": GoogleMoveEmailToTrashCard,
    "linear-createIssue": LinearCreateIssueCard,
    "google-replyToEmail": GoogleReplyToEmailCard,
    "zoom-createMeeting": ZoomCreateMeetingCard,
  })

  const actionData = clientRegistry[clientActionId]

  return (
    <Router
      displayState={state}
      inputSchema={actionData.inputSchema}
      functionName={actionData.functionName}
      args={args}
      metadata={actionData.metadata}
      mutationResults={caller}
      onSubmit={(props) => {
        try {
          caller.mutateAsync({
            actionId: clientActionId,
            inputDataAsString: JSON.stringify(props.args),
            userData,
            localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
        } catch (error) {
          toast.error(extractErrorMessage(error))
        }
      }}
    />
  )
}

export { ActionComponent }
