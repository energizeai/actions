"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { cn } from "../utils"
import { Button } from "./button"

type Props = {
  text: string
  className?: string
}

export const CopyButton = ({ text, className }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)

    toast("Copied to clipboard", {
      icon: <CopyIcon className="h-4 w-4" />,
    })

    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      className={cn("flex items-center gap-1", className)}
      disabled={copied}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </Button>
  )
}
