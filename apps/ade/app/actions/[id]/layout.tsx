import { ActionsRegistry } from "@energizeai/registry"
import { TActionId } from "@energizeai/registry/types"
import { Avatar, AvatarFallback, AvatarImage } from "@energizeai/ui/avatar"
import { SectionHeader } from "@energizeai/ui/section-header"
import { TabNav } from "@energizeai/ui/tab-nav"
import { ThemedImage } from "@energizeai/ui/themed-image"
import { cn } from "@energizeai/ui/utils"
import { notFound } from "next/navigation"
import React from "react"

import { dashCase } from "@/lib/utils"

export default async function ActionLayout({
  params,
  children,
}: {
  params: { id: TActionId }
  children: React.ReactNode
}) {
  const actionData = ActionsRegistry[params.id]

  if (!actionData) notFound()

  return (
    <div className="w-full flex flex-col gap-4">
      <SectionHeader
        title={actionData.getMetadata().title}
        className="h-fit bg-background bg-background/80 backdrop-blur w-full"
        icon={
          <Avatar className="h-8 w-8 rounded-sm bg-muted text-foreground">
            <ThemedImage
              srcLight={actionData.getMetadata().avatar.light}
              srcDark={actionData.getMetadata().avatar.dark}
              ImageComponent={
                <AvatarImage className={cn("bg-background")} src={""} />
              }
            />
            <AvatarFallback className="bg-muted" />
          </Avatar>
        }
        subtitle={actionData.getMetadata().description}
      >
        <pre className="max-w-[300px] text-wrap break-all">
          @/packages/registry/src/{dashCase(params.id).substring(1)}.tsx
        </pre>
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
