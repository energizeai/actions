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
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import {
  Fingerprint,
  HandMetalIcon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"

export function CommandMenu({ ...props }: DialogProps) {
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
          <CommandGroup heading="Documentation">
            <CommandItem
              value={"Introduction"}
              onSelect={() => {
                runCommand(() => router.push(`/`))
              }}
            >
              <HandMetalIcon className="h-3 w-3 mr-2" />
              Introduction
            </CommandItem>
            <CommandItem
              value={"Getting Started"}
              onSelect={() => {
                runCommand(() => router.push(`/getting-started`))
              }}
            >
              <RocketIcon className="h-3 w-3 mr-2" />
              Getting Started
            </CommandItem>
            <CommandItem
              value={"Authentication"}
              onSelect={() => {
                runCommand(() => router.push(`/authentication`))
              }}
            >
              <Fingerprint className="h-3 w-3 mr-2" />
              Authentication
            </CommandItem>
            <CommandItem
              value={"Contribue"}
              onSelect={() => {
                runCommand(() => router.push(`/contribute`))
              }}
            >
              <SparklesIcon className="h-3 w-3 mr-2" />
              Contribute
            </CommandItem>
          </CommandGroup>
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
