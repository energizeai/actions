"use client"

import { ActionsRegistry } from "@repo/registry"
import { Badge } from "@repo/ui/badge"
import { CodeBlock } from "@repo/ui/codeblock"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { zodToJsonSchema } from "zod-to-json-schema"

import { ActionComponent } from "../_components/action-component"

export default function ActionDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const actionData = ActionsRegistry[params.id as keyof typeof ActionsRegistry]

  if (!actionData) {
    return <div>ERROR</div>
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden max-w-full">
      <h1 className="text-xl font-semibold">Metadata</h1>
      <p className="text-muted-foreground mb-4">
        Below is the metadata for the action. This includes the action's name,
        description, and other information.
      </p>
      <div className="grid mb-4 gap-4 grid-cols-2 flex-1 p-4 border rounded">
        {actionData.apiReference && (
          <Link
            className="flex items-center hover:underline font-semibold text-muted-foreground"
            href={actionData.apiReference}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mr-4">🏗️</span>
            API Reference
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        )}
        <div className="flex items-center">
          <span className="mr-4">🔠</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Default Keywords:
          </span>
          <div className="flex items-center justify-start gap-2 flex-wrap">
            {actionData.defaultKeywords.map((keyword, index) => (
              <Badge key={index} variant={"outline"}>
                @{keyword}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-4">🔒</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Authentication Method:
          </span>
          {actionData.authConfig.type.toUpperCase()}
        </div>
        <div className="flex items-center">
          <span className="mr-4">🗣️</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Chat Message:
          </span>
          {actionData.chatMessage}
        </div>
        <div className="flex items-center">
          <span className="mr-4">️⌛</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Loading Message:
          </span>
          {actionData.loadingMessage}
        </div>
      </div>
      <h1 className="text-xl font-semibold mt-4">Input Schema</h1>
      <p className="text-muted-foreground mb-7">
        This is the input schema for the action. This is the data that the
        action requires to run.
      </p>
      <CodeBlock
        className="max-w-full overflow-x-hidden"
        customStyles={{
          overflow: "auto",
          maxHeight: "90vh",
          maxWidth: "100%",
        }}
        language="json"
        value={JSON.stringify(zodToJsonSchema(actionData.input), null, 2)}
      />
      <h1 className="text-xl font-semibold mt-4">Action Function</h1>
      <p className="text-muted-foreground mb-7">
        This is the TS function that runs the action. This is the code that will
        be executed when the action is run.
      </p>
      <CodeBlock
        className="max-w-full overflow-x-hidden"
        customStyles={{
          overflow: "auto",
          maxHeight: "90vh",
          maxWidth: "100%",
        }}
        language="typescript"
        value={actionData.actionFunction.toString()}
      />
      <h1 className="text-xl font-semibold mt-4">Output</h1>
      <p className="text-muted-foreground mb-7">
        This is the resulting output of the action.
      </p>
      {"Component" in actionData ? (
        <>
          <ActionComponent actionData={actionData} />
        </>
      ) : (
        <CodeBlock
          className="max-w-full overflow-x-hidden"
          customStyles={{
            overflow: "auto",
            maxHeight: "90vh",
            maxWidth: "100%",
          }}
          language="json"
          value={JSON.stringify(zodToJsonSchema(actionData.output), null, 2)}
        />
      )}
    </div>
  )
}
