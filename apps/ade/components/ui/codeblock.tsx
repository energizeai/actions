// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

"use client"

import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react"
import { CSSProperties, FC, memo } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface Props {
  language: string
  value: string
  customStyles?: CSSProperties
  className?: string
  customTitle?: string
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  json: ".json",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  bash: ".sh",
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789" // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

const CodeBlock: FC<Props> = memo(
  ({ language, value, customStyles, className, customTitle }) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

    const downloadAsFile = () => {
      if (typeof window === "undefined") {
        return
      }
      const fileExtension = programmingLanguages[language] || ".file"
      const suggestedFileName = `file-${generateRandomString(
        3,
        true
      )}${fileExtension}`
      const fileName = window.prompt("Enter file name" || "", suggestedFileName)

      if (!fileName) {
        // User pressed cancel on prompt.
        return
      }

      const blob = new Blob([value], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = fileName
      link.href = url
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const onCopy = () => {
      if (isCopied) return
      copyToClipboard(value)
    }

    return (
      <div
        className={cn(
          "codeblock prose-invert relative w-full rounded-sm bg-slate-800 font-sans dark:bg-muted",
          className
        )}
      >
        <div className="flex w-full items-center justify-between rounded-sm bg-slate-950 px-6 py-2 pr-4 text-white dark:bg-background/90">
          <span className="text-sm">{customTitle || (language ?? "text")}</span>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className="hover:bg-slate-700 hover:text-white focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 dark:hover:bg-muted"
              onClick={downloadAsFile}
              size="icon"
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-xs hover:bg-slate-700 hover:text-white focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 dark:hover:bg-muted"
              onClick={onCopy}
            >
              {isCopied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              <span className="sr-only">Copy code</span>
            </Button>
          </div>
        </div>
        <SyntaxHighlighter
          language={language}
          style={coldarkDark}
          PreTag="div"
          showLineNumbers
          customStyle={{
            margin: 0,
            width: "100%",
            background: "transparent",
            padding: "1.5rem 1rem",
            ...customStyles,
          }}
          lineNumberStyle={{
            userSelect: "none",
          }}
          codeTagProps={{
            style: {
              fontSize: "0.9rem",
              fontFamily: "var(--font-mono)",
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    )
  }
)
CodeBlock.displayName = "CodeBlock"

export { CodeBlock }