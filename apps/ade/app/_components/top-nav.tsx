"use client"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { ThemedImage } from "@/components/ui/themed-image"
import { getDocPosts } from "@/lib/docs"
import { cn } from "@/lib/utils"
import { GithubIcon, TwitterIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CommandMenu } from "./command-menu"

export default function TopNav({
  docPosts,
}: {
  docPosts: ReturnType<typeof getDocPosts>
}) {
  const pathname = usePathname()

  return (
    <div className="sticky h-fit top-0 bg-background/80 backdrop-blur z-10">
      <div className="border-b border-muted">
        <div className="flex flex-row gap-2 items-center w-full mx-auto px-4 max-w-screen-xl py-4">
          <div className="flex-1">
            <h1 className="text-lg lg:text-2xl font-medium flex gap-2.5 items-center justify-start text-left">
              <span>
                <ThemedImage
                  srcLight={"/logos/energize-black-square.png"}
                  srcDark={"/logos/energize-white-square.png"}
                  ImageComponent={
                    <img
                      alt="Energize logo"
                      src={""}
                      className={cn("text-background h-8 w-8 rounded-sm")}
                    />
                  }
                />
              </span>
              Energize AI
            </h1>
          </div>
          <CommandMenu docPosts={docPosts} />
          <div className="flex flex-1 hidden lg:flex justify-end gap-2 items-center">
            <Link
              href="https://github.com/energizeai/actions"
              passHref
              target="_blank"
              rel="noopener"
            >
              <Button size={"icon"} variant={"outline"}>
                <GithubIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="https://twitter.com/Energize_AI"
              passHref
              target="_blank"
              rel="noopener"
            >
              <Button size={"icon"} variant={"outline"}>
                <TwitterIcon className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="border-b border-muted lg:block hidden md:block">
        <div className="flex flex-row gap-8 items-center w-full mx-auto px-4 max-w-screen-xl text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "border-b-2 py-3 border-transparent hover:border-muted text-muted-foreground hover:text-foreground",
              !pathname.includes("/actions/") &&
                "border-primary hover:border-primary text-foreground"
            )}
          >
            Documentation
          </Link>
          <Link
            href="/actions"
            className={cn(
              "border-b-2 border-transparent hover:border-muted py-3 text-muted-foreground hover:text-foreground",
              pathname.includes("/actions/") &&
                "border-primary hover:border-primary text-foreground"
            )}
          >
            Actions Registry
          </Link>
        </div>
      </div>
    </div>
  )
}
