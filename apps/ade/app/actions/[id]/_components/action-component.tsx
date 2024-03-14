"use client"

import { GoogleMoveEmailToTrashCard } from "@/registry/_components/google-move-email-to-trash-card"
import { GoogleReplyToEmailCard } from "@/registry/_components/google-reply-to-email-card"
import { GoogleSendMailCard } from "@/registry/_components/google-send-mail-card"
import { LinearCreateIssueCard } from "@/registry/_components/linear-create-issue-card"
import { ZoomCreateMeetingCard } from "@/registry/_components/zoom-create-meeting-card"
import { TActionComponentRouter, TClientActionId } from "@/registry/client"
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
  actionId: TClientActionId
  state: "active" | "placeholder" | "skeleton"
  args: any
  userData?: {
    email: string
    name: string
  }
}) {
  const { ADEActionsRegistry } = useActionRegistries()
  const caller = api.actions.testActionFunction.useMutation()

  const Router = createActionComponentRouter<TActionComponentRouter>({
    "google-sendMail": GoogleSendMailCard,
    "google-moveEmailToTrash": GoogleMoveEmailToTrashCard,
    "linear-createIssue": LinearCreateIssueCard,
    "google-replyToEmail": GoogleReplyToEmailCard,
    "zoom-createMeeting": ZoomCreateMeetingCard,
  })

  const actionData = ADEActionsRegistry[actionId]

  return (
    <Router
      displayState={state}
      inputSchema={actionData.inputSchema}
      outputSchema={actionData.outputSchema}
      functionName={actionData.functionName}
      args={args}
      metadata={actionData.metadata}
      mutationResults={caller}
      fallback={
        <div className="w-full h-full text-center flex-col gap-10 text-3xl flex items-center justify-center">
          <h1 className="text-6xl">404</h1>
          <p className="text-lg text-muted-foreground">Action not found</p>
        </div>
      }
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
