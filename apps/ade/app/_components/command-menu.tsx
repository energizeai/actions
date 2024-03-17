"use client"

import { DialogProps } from "@radix-ui/react-alert-dialog"
import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ThemedImage } from "@/components/ui/themed-image"
import { getDocPosts } from "@/lib/docs"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { SearchIcon } from "lucide-react"

export function CommandMenu({
  docPosts,
  ...props
}: DialogProps & {
  docPosts: ReturnType<typeof getDocPosts>
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const docGroupMap = docPosts.reduce(
    (acc, post) => {
      if (!post.metadata.group) return acc
      if (!acc[post.metadata.group]) acc[post.metadata.group] = []
      acc[post.metadata.group]!.push(post)
      return acc
    },
    {} as Record<string, ReturnType<typeof getDocPosts>>
  )

  const docCommandGroups = Object.keys(docGroupMap).map((group) => (
    <CommandGroup key={group} heading={group}>
      {docGroupMap[group]!.map((post) => (
        <CommandItem
          value={post.metadata.title}
          key={post.slug}
          onSelect={() => {
            runCommand(() => router.push(`/` + post.slug))
          }}
        >
          {post.metadata.title}
        </CommandItem>
      ))}
    </CommandGroup>
  ))

  return (
    <>
      <Button
        variant={"outline"}
        className="text-muted-foreground px-3 min-w-[150px] justify-start lg:justify-auto"
        onClick={() => setOpen(true)}
        {...props}
      >
        <SearchIcon className="h-4 w-4" />
        <span className="text-left lg:min-w-[300px]">Search ADE...</span>
        <kbd className="font-semibold hidden lg:inline-block tracking-widest bg-muted border text-muted-foreground px-2 text-sm rounded-sm py-0.5">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {docCommandGroups}
          <CommandGroup heading="Actions">
            {Object.keys(ActionsRegistry).map((actionId, ix) => {
              const action = ActionsRegistry[actionId as TActionId]
              return (
                <CommandItem
                  key={actionId}
                  value={action.metadata.title}
                  onSelect={() => {
                    runCommand(() => router.push(`/actions/${actionId}`))
                  }}
                >
                  <ThemedImage
                    srcLight={action.metadata.avatar.light}
                    srcDark={action.metadata.avatar.dark}
                    ImageComponent={<img className="h-4 w-4 mr-2" />}
                  />
                  {action.metadata.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <SunIcon className="mr-2 h-4 w-4" />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <MoonIcon className="mr-2 h-4 w-4" />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <LaptopIcon className="mr-2 h-4 w-4" />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
