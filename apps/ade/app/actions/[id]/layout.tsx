import { ActionsRegistry } from "@repo/registry"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { SectionHeader } from "@repo/ui/section-header"
import { TabNav } from "@repo/ui/tab-nav"
import { ThemedImage } from "@repo/ui/themed-image"
import { cn } from "@repo/ui/utils"
import { notFound } from "next/navigation"
import React from "react"

import { dashCase } from "@/lib/utils"

export default async function ActionLayout({
  params,
  children,
}: {
  params: { id: string }
  children: React.ReactNode
}) {
  const actionData = ActionsRegistry[params.id as keyof typeof ActionsRegistry]

  if (!actionData) notFound()

  return (
    <div className="w-full flex flex-col gap-4">
      <SectionHeader
        title={actionData.title}
        className="h-fit bg-background bg-background/80 backdrop-blur w-full"
        icon={
          <Avatar className="h-8 w-8 rounded-sm bg-muted text-foreground">
            <ThemedImage
              srcLight={actionData.avatar.light}
              srcDark={actionData.avatar.dark}
              ImageComponent={
                <AvatarImage className={cn("bg-background")} src={""} />
              }
            />
            <AvatarFallback className="bg-muted" />
          </Avatar>
        }
        subtitle={actionData.description}
      >
        <code>
          @/packages/registry/src/{dashCase(params.id).substring(1)}.tsx
        </code>
      </SectionHeader>
      <TabNav
        items={[
          {
            name: "Details",
            href: `/actions/${params.id}/details`,
          },
          {
            name: "Test",
            href: `/actions/${params.id}/test`,
          },
        ]}
        className="pl-8"
      />
      <div className="pl-11 py-4 overflow-hidden max-w-full">{children}</div>
    </div>
  )
}
