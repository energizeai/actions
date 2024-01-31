"use client"

import { getClientIdEnvKey, getClientSecretEnvKey } from "@/lib/oauth"
import { ActionsRegistry } from "@energizeai/registry"
import { TActionId, TOAuthAction } from "@energizeai/registry/types"
import { Badge } from "@energizeai/ui/badge"
import { Button } from "@energizeai/ui/button"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@energizeai/ui/card"
import { ThemedImage } from "@energizeai/ui/themed-image"
import { Tooltip, TooltipContent, TooltipTrigger } from "@energizeai/ui/tooltip"
import { Cable, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const CopyButton = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)

    toast("Copied to clipboard", {
      icon: <Copy className="h-4 w-4" />,
    })

    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={"outline"}
          className="w-full mt-2 gap-4"
          onClick={handleCopy}
        >
          <span className="flex-1 text-left overflow-hidden overflow-ellipsis">
            {text}
          </span>
          <Copy className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  )
}

export default function OAuthForm({
  actionId,
  authConfig,
  authorizationEndpoint,
}: {
  actionId: TActionId
  authConfig: TOAuthAction["authConfig"]
  authorizationEndpoint: string | null
}) {
  const action = ActionsRegistry[actionId]
  const [step, setStep] = useState(0)

  if (!authorizationEndpoint) {
    return (
      <div>
        <h1>Missing Authorization Endpoint</h1>
        <p>
          The authorization endpoint is missing from the OAuth configuration.
        </p>
      </div>
    )
  }

  const clientIdKey = getClientIdEnvKey(ActionsRegistry[actionId].getMetadata())
  const clientSecretKey = getClientSecretEnvKey(
    ActionsRegistry[actionId].getMetadata()
  )

  const callbackURL = `http://localhost:3000/api/callback/oauth/${actionId}`

  let content = (
    <>
      <CardContent className="-mt-4 flex flex-col gap-2">
        <p className="font-bold">Step 1: Create OAuth Application</p>
        <small className="text-muted-foreground mt-2">
          Open this link to start creating an OAuth application
        </small>
        <Link
          href={authConfig.config.oauthAppGenerationURL || "#"}
          target="_blank"
          className="font-semibold hover:underline pb-4"
        >
          <Button variant={"outline"} className="w-full mt-2 gap-4">
            <ThemedImage
              srcLight={action.getMetadata().avatar.light}
              srcDark={action.getMetadata().avatar.dark}
              ImageComponent={<img className="h-4 w-4" />}
            />
            <span className="flex-1 text-left overflow-hidden overflow-ellipsis">
              Create an OAuth app
            </span>
          </Button>
        </Link>
        <small className="text-muted-foreground">
          Paste the Authorization callback URL
        </small>
        <CopyButton text={callbackURL} className="w-full" />
        <small className="text-muted-foreground mt-2">
          Make sure the following scopes are checked
        </small>
        <div className="flex flex-row gap-2 items-center justify-start">
          {authConfig.config.scopes.map((scope, index) => (
            <Badge key={index} className="mt-2" variant={"outline"}>
              {scope}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          type="submit"
          className="w-full"
          disabled={!authorizationEndpoint}
          onClick={() => setStep(1)}
        >
          <Cable className="h-4 w-4" />
          Next
        </Button>
      </CardFooter>
    </>
  )

  if (step > 0) {
    content = (
      <>
        <CardContent className="-mt-4 flex flex-col gap-2">
          <p className="font-bold">Step 2: Set Enviornment Variables</p>
          <small className="text-muted-foreground mt-2">
            Make sure the following are set in your environment in{" "}
            <code className="text-sm font-semibold">`ade/.env.local`.</code>You
            should have received them in the previous step on your OAuth
            provider.
          </small>
          <CopyButton text={clientIdKey} className="w-full" />
          <CopyButton text={clientSecretKey} className="w-full" />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href={authorizationEndpoint} passHref className="w-full">
            <Button
              type="submit"
              className="w-full"
              disabled={!authorizationEndpoint}
            >
              <Cable className="h-4 w-4" />
              Connect
            </Button>
          </Link>
          <Button
            className="w-full"
            onClick={() => setStep(0)}
            variant={"ghost"}
          >
            Back
          </Button>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      <CardHeader>
        <CardDescription>
          In order to use this action, you must first authenticate in respect to
          the AuthConfig.
        </CardDescription>
      </CardHeader>
      {content}
    </>
  )
}

// Since this action requires OAuth, you must first setup an application on
// the resource.
// <br />
// <br />1{")"} First you must create an application on the resource. You
// can do so{" "}
// <Link
//   href={authConfig.config.oauthAppGenerationURL || "#"}
//   target="_blank"
//   className="text-primary font-semibold hover:underline"
// >
//   here
// </Link>{" "}
// .
// <br />
// <br />2{")"} It must have the following scopes:{" "}
// <code className="text-sm font-semibold inline-block">
//   `{authConfig.config.scopes.join(" ")}`
// </code>
// .
// <br />
// <br />3{")"} Please make sure you have the following environment
// variables set in{" "}
// <code className="text-sm font-semibold">`ade/.env.local`</code>
// <pre className="block bg-muted text-muted-foreground rounded-sm p-1 px-2 mt-4">
//   <code>{`${clientIdKey}`}</code>
// </pre>
// <pre className="block bg-muted text-muted-foreground rounded-sm p-1 px-2 mt-2">
//   <code>{`${clientSecretKey}`}</code>
// </pre>
