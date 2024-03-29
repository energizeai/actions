"use client"

import { Button } from "@/components/ui/button"
import { ThemedImage } from "@/components/ui/themed-image"
import { getDocPosts } from "@/lib/docs"
import { cn } from "@/lib/utils"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

const isActive = (pathname: string, href: string) => {
  return href === "/" ? pathname === href : pathname.startsWith(href)
}

const SideNavLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => {
  const pathname = usePathname()

  return (
    <Link href={href}>
      <Button
        variant={"ghost"}
        className={cn(
          "w-full justify-start gap-3 -ml-3 text-muted-foreground transition-colors duration-200",
          isActive(pathname, href) &&
            "bg-foreground text-background hover:bg-foreground/80 hover:text-background"
        )}
        size={"sm"}
      >
        {children}
      </Button>
    </Link>
  )
}

export default function SideNav({
  docPosts,
}: {
  docPosts: ReturnType<typeof getDocPosts>
}) {
  const pathname = usePathname()
  let lastSeenGroup = ""

  const docs: React.ReactNode[] = []

  for (const post of docPosts) {
    if (post.metadata.group !== lastSeenGroup) {
      docs.push(
        <h3
          key={post.metadata.group}
          className="text-sm font-bold mb-2 first:mt-0 mt-6"
        >
          {post.metadata.group}
        </h3>
      )
      lastSeenGroup = post.metadata.group
    }
    docs.push(
      <SideNavLink key={post.slug} href={"/" + post.slug}>
        {post.metadata.title}
      </SideNavLink>
    )
  }

  const actions = Object.keys(ActionsRegistry).map((key) => {
    const action = ActionsRegistry[key as TActionId]

    return (
      <SideNavLink href={`/actions/${key}`} key={key}>
        <ThemedImage
          srcLight={action.metadata.avatar.light}
          srcDark={action.metadata.avatar.dark}
          invert={isActive(pathname, `/actions/${key}`)}
          ImageComponent={
            <img
              alt={`${key} icon`}
              src={""}
              className={cn("text-background h-4 w-4 rounded-sm")}
            />
          }
        />
        <p className="text-ellipsis whitespace-nowrap overflow-x-hidden">
          {action.metadata.title}
        </p>
      </SideNavLink>
    )
  })

  return (
    <div
      className="flex-none w-[250px] hidden fixed top-[152px] z-10 md:flex lg:flex flex-col gap-2 -ml-3 pl-3 overflow-y-auto"
      style={{
        maxHeight: "calc(100vh - 180px)",
      }}
    >
      {pathname.includes("/actions/") ? actions : docs}
    </div>
  )
}
