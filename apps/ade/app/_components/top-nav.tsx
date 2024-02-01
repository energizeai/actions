import { Button } from "@energizeai/ui/button"
import { ThemedImage } from "@energizeai/ui/themed-image"
import { cn } from "@energizeai/ui/utils"
import { GithubIcon, TwitterIcon } from "lucide-react"
import Link from "next/link"
import { CommandMenu } from "./command-menu"

export default async function TopNav() {
  return (
    <div className="sticky h-fit top-0 bg-background/80 backdrop-blur z-10">
      <div className="flex flex-row gap-2 mx-auto px-4 max-w-screen-xl items-center w-full py-4">
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
        <CommandMenu />
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
        </div>
      </div>
    </div>
  )
}
