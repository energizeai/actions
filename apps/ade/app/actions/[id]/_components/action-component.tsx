"use client"

import { GoogleMoveEmailToTrashCard } from "@/registry/_components/google-move-email-to-trash-card"
import { GoogleReplyToEmailCard } from "@/registry/_components/google-reply-to-email-card"
import { GoogleSendMailCard } from "@/registry/_components/google-send-mail-card"
import { LinearCreateIssueCard } from "@/registry/_components/linear-create-issue-card"
import { ZoomCreateMeetingCard } from "@/registry/_components/zoom-create-meeting-card"
import { TActionId } from "@/registry/_properties/types"
import { TActionComponentRouter } from "@/registry/client"
import { useActionRegistries } from "@/registry/provider"
import { api } from "@/trpc/react"
import { extractErrorMessage } from "@/trpc/shared"
import { createActionComponentRouter } from "ai-actions"
import { toast } from "sonner"

function ActionComponent({
  actionId,
  state,
  args,
  userData = {
    email: "",
    name: "",
  },
}: {
  actionId: TActionId
  state: "active" | "placeholder" | "skeleton"
  args: any
  userData?: {
    email: string
    name: string
  }
}) {
  const { actionsRegistry } = useActionRegistries("ADE")
  const caller = api.actions.testActionFunction.useMutation()

  const Router = createActionComponentRouter<TActionComponentRouter>({
    "google-sendMail": GoogleSendMailCard,
    "google-moveEmailToTrash": GoogleMoveEmailToTrashCard,
    "linear-createIssue": LinearCreateIssueCard,
    "google-replyToEmail": GoogleReplyToEmailCard,
    "zoom-createMeeting": ZoomCreateMeetingCard,
  })

  const actionData = actionsRegistry[actionId]

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
            actionId,
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
