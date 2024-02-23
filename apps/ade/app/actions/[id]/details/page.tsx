import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/ui/codeblock"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

import { ActionComponent } from "../_components/action-component"

export default function ActionDetailsPage({
  params,
}: {
  params: { id: TActionId }
}) {
  const actionData = ActionsRegistry[params.id]

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
      <div className="grid mb-4 gap-4 grid-cols-1 lg:grid-cols-2 flex-1 p-4 border rounded">
        {actionData.getMetadata().apiReference && (
          <Link
            className="flex items-center hover:underline font-semibold text-muted-foreground"
            href={actionData.getMetadata().apiReference || "#"}
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
            {actionData.getMetadata().defaultKeywords.map((keyword, index) => (
              <Badge key={index} variant={"outline"}>
                @{keyword}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center line-clamp-1">
          <span className="mr-4">🔒</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Authentication Method:
          </span>
          {actionData.getAuthConfig().type.toUpperCase()}
        </div>
        <div className="flex items-center line-clamp-1">
          <span className="mr-4">🗣️</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Chat Message:
          </span>
          <span className="flex-1 line-clamp-1">
            {actionData.getMetadata().chatMessage}
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-4">️⌛</span>
          <span className="font-semibold text-muted-foreground mr-2">
            Loading Message:
          </span>
          <span className="flex-1 line-clamp-1">
            {actionData.getMetadata().loadingMessage}
          </span>
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
        value={JSON.stringify(actionData.getInputJSONSchema(), null, 2)}
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
        value={actionData.getActionFunction().toString()}
      />
      <h1 className="text-xl font-semibold mt-4">Output</h1>
      <p className="text-muted-foreground mb-7">
        This is the resulting output of the action.
      </p>
      {actionData.getComponent() !== null ? (
        <div className="lg:max-w-screen-sm">
          <ActionComponent
            clientActionId={params.id}
            inputDataAsString={undefined}
            state="placeholder"
            userData={undefined}
          />
        </div>
      ) : (
        <CodeBlock
          className="max-w-full overflow-x-hidden"
          customStyles={{
            overflow: "auto",
            maxHeight: "90vh",
            maxWidth: "100%",
          }}
          language="json"
          value={JSON.stringify(actionData.getOutputJSONSchema(), null, 2)}
        />
      )}
    </div>
  )
}
