import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SectionHeader } from "@/components/ui/section-header"
import { TabNav } from "@/components/ui/tab-nav"
import { ThemedImage } from "@/components/ui/themed-image"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"
import React from "react"

import { env } from "@/env/server.mjs"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { Metadata } from "next"
import Link from "next/link"

export async function generateMetadata({
  params,
}: {
  params: { id: TActionId }
}): Promise<Metadata> {
  const action = ActionsRegistry[params.id]
  if (!action) notFound()

  const imageUrl = new URL(
    `${
      env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://ade.energize.ai"
    }/api/og`
  )
  imageUrl.searchParams.append("title", `${action.getMetadata().title}`)
  imageUrl.searchParams.append("avatar", action.getMetadata().avatar.dark)

  return {
    metadataBase: new URL(
      env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://ade.energize.ai"
    ),
    title: `ADE - ${action.getMetadata().title}`,
    description: `${action.getMetadata().description}`,
    openGraph: {
      images: [imageUrl],
      title: `ADE - ${action.getMetadata().title}`,
      description: `${action.getMetadata().description}`,
    },
  }
}

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
        <Link
          target={env.NODE_ENV !== "development" ? "_blank" : "_self"}
          href={
            env.NODE_ENV !== "development"
              ? `https://github.com/energizeai/actions/blob/main/apps/ade/registry/_actions/${actionData.getId()}.tsx`
              : `#`
          }
          className={cn(
            env.NODE_ENV !== "development" ? "hover:underline" : ""
          )}
        >
          <pre className="max-w-[300px] text-wrap break-all">
            @/registry/_actions/{actionData.getId()}.tsx
          </pre>
        </Link>
      </SectionHeader>
      <TabNav
        items={[
          {
            name: "Details",
            href: `/actions/${params.id}/details`,
          },
          {
            name: "Test",
            href: `/actions/${params.id}/${env.NODE_ENV === "development" ? "test" : "test-prod"}`,
          },
        ]}
        className="lg:pl-8"
      />
      <div className="lg:pl-11 py-4 overflow-hidden max-w-full">{children}</div>
    </div>
  )
}
