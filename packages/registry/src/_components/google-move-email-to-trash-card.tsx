"use client"

import { Avatar, AvatarImage } from "@energizeai/ui/avatar"
import { Button } from "@energizeai/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@energizeai/ui/card"
import { Skeleton } from "@energizeai/ui/skeleton"
import { Spinner } from "@energizeai/ui/spinner"
import { TGoogleMoveEmailToTrashCard } from "../google-move-email-to-trash"

export const GoogleMoveEmailToTrashCard: TGoogleMoveEmailToTrashCard = ({
  data,
  displayState,
  metadata,
}) => {
  const messageIds = data?.input.messageIds || []

  if (displayState === "placeholder") {
    messageIds.push("ABC")
    messageIds.push("DEF")
    messageIds.push("GHI")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={metadata.avatar.light} alt="logo" />
          </Avatar>
          Please confirm
        </CardTitle>
        <CardDescription>
          Are you sure you want to delete{" "}
          {messageIds.length > 1
            ? `these ${messageIds.length} emails`
            : "this email"}
          ?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {messageIds.map((id) => (
            <a
              href={`https://mail.google.com/mail/u/0/#all/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              key={id}
            >
              Message ID: {id}
            </a>
          ))}
          {displayState === "skeleton" &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          disabled={
            displayState !== "active" || data.isLoading || data.isSuccess
          }
          variant={data?.isSuccess ? "success" : "destructive"}
          onClick={() => {
            if (data) {
              data.onSubmit(data.input)
            }
          }}
        >
          {data?.isLoading ? <Spinner /> : null}
          {!data?.isSuccess
            ? `Delete email${messageIds.length > 1 ? "s" : ""}`
            : `Email${messageIds.length > 1 ? "s" : ""} deleted!`}
        </Button>
      </CardFooter>
    </Card>
  )
}
