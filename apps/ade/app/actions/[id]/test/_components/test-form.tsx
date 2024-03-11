"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Separator } from "@/components/ui/separator"
import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { LinkedAccount } from "@/server/db/schema"
import { api } from "@/trpc/react"
import {
  AlertTriangle,
  Beaker,
  CheckCircle,
  DatabaseIcon,
  Fingerprint,
  HandIcon,
  Info,
  RefreshCw,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { env } from "@/env/client.mjs"
import useLocalStorage from "@/lib/hooks/use-local-storage"
import { cn } from "@/lib/utils"
import { extractErrorMessage } from "@/trpc/shared"
import hjson from "hjson"
import Link from "next/link"
import { ActionComponent } from "../../_components/action-component"
import { JSONViewer } from "./json-viewer"

const StatusBadge = ({
  isError,
  isSuccess,
  linkedAccount,
  handleDeleteAuth,
}: {
  isError?: boolean
  isSuccess?: boolean
  linkedAccount?: LinkedAccount | null
  handleDeleteAuth?: () => void
}) => {
  const router = useRouter()
  const deleteAuthMutation =
    api.linkedAccounts.deleteLinkedAccount.useMutation()

  const handleDelete = async () => {
    if (deleteAuthMutation.isLoading || !linkedAccount) return

    const loader = toast.loading("Deleting authentication")

    try {
      await deleteAuthMutation.mutateAsync({ actionId: linkedAccount.actionId })
      toast.success("Authentication deleted")
      router.refresh()

      if (handleDeleteAuth) {
        handleDeleteAuth()
      }
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      toast.dismiss(loader)
    }
  }

  if (isError) {
    return (
      <Badge variant={"destructive"}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    )
  }

  if (isSuccess) {
    return (
      <Badge variant={"success"}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Success
      </Badge>
    )
  }

  if (linkedAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>
            <Badge className="cursor-pointer" variant={"secondary"}>
              <Fingerprint className="h-3 w-3 mr-1" />
              Authenticated
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <pre className="p-2 text-muted-foreground whitespace-pre-wrap max-w-[400px] overflow-x-auto">
            <code>{JSON.stringify(linkedAccount, null, 2)}</code>
          </pre>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="justify-center flex items-center"
            onClick={handleDelete}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete Authentication</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return null
}

export default function ActionTestForm({
  params,
  linkedAccount,
  children,
}: {
  params: { id: TActionId }
  linkedAccount: LinkedAccount | null
  children?: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [componentLoading, setComponentLoading] = useState(false)
  const [componentInput, setComponentInput] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const action = ActionsRegistry[params.id]
  const authType = ActionsRegistry[params.id]._def.authConfig.type

  const [userData, setUserData] = useLocalStorage<{
    name: string
    email: string
  }>(`ADE-user-data`, {
    name: "",
    email: "",
  })

  const defaultRecord: Record<string, string> = {}
  const jsonSchema = action.getInputJSONSchema()

  if ("properties" in jsonSchema) {
    for (const key in jsonSchema.properties) {
      defaultRecord[key] = ""
    }
  }

  const [actionInputRecord, setActionInputRecord] = useLocalStorage<
    Record<string, string>
  >(`ADE-action-input-${params.id}`, defaultRecord)

  const getParsedInputRecord = () => {
    const parsed: Record<string, unknown> = {}

    for (const key in actionInputRecord) {
      try {
        if (actionInputRecord[key] === "") {
          parsed[key] = undefined
          continue
        }
        parsed[key] = hjson.parse(actionInputRecord[key]!)
      } catch (error) {
        parsed[key] = actionInputRecord[key]
      }
    }

    return parsed
  }

  const actionMutation = api.actions.testActionFunction.useMutation()
  const handleTest = async () => {
    if (componentLoading) return

    if (action.metadata.renderOnClient) {
      setComponentLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setComponentLoading(false)
      setComponentInput(JSON.stringify(getParsedInputRecord()))
      setRefreshKey((prev) => prev + 1)
      return
    }

    if (actionMutation.isLoading) return

    const loader = toast.loading(action.metadata.loadingMessage)

    try {
      await actionMutation.mutateAsync({
        actionId: params.id,
        inputDataAsString: JSON.stringify(getParsedInputRecord()),
        userData,
        localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (error) {
      toast.error(extractErrorMessage(error))
    } finally {
      toast.dismiss(loader)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  let output = <></>

  if (!actionMutation.isLoading) {
    output = (
      <EmptyState
        title="Output"
        details={`No output has been generated yet.`}
        icon={<DatabaseIcon />}
        className="border-none"
      />
    )
  }

  if (actionMutation.isSuccess) {
    output = (
      <JSONViewer
        dataAsString={actionMutation.data?.outputDataAsString ?? ""}
      />
    )
  }

  if (actionMutation.isError) {
    output = (
      <pre className="whitespace-pre-wrap text-destructive max-w-full overflow-auto max-h-[70vh]">
        {actionMutation.error.message}
      </pre>
    )
  }

  if (action.metadata.renderOnClient && componentLoading) {
    output = (
      <ActionComponent
        actionId={params.id}
        state="skeleton"
        key={`action-component-${refreshKey}`}
        args={undefined}
        userData={undefined}
      />
    )
  } else if (componentInput && action.metadata.renderOnClient) {
    output = (
      <ActionComponent
        actionId={params.id}
        args={JSON.parse(componentInput)}
        state="active"
        key={`action-component-${refreshKey}`}
        userData={userData}
      />
    )
  }

  const needsAuth = authType !== "None" && !linkedAccount

  if (!mounted) {
    return null // fixes weird hydration error
  }

  return (
    <div className="grid grid-cols-2 border relative">
      <div className="flex flex-col">
        <div className="p-3 border-b font-bold text-sm flex items-center justify-between">
          <p className="flex justify-start items-center gap-2">
            {needsAuth ? (
              <>
                <Fingerprint className="h-4 w-4" />
                Authenticate
              </>
            ) : (
              "Input"
            )}{" "}
          </p>
          <div className="h-[22px]" />
          <div className="flex justify-end items-center gap-2">
            {!needsAuth && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      className="p-2 h-fit my-0 py-0 hover:underline hover:bg-background"
                    >
                      <RefreshCw
                        className="h-4 w-4"
                        onClick={() => {
                          setActionInputRecord(defaultRecord)
                          setComponentInput(null)
                          actionMutation.reset()
                        }}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset input</TooltipContent>
                </Tooltip>
                <StatusBadge
                  linkedAccount={linkedAccount}
                  handleDeleteAuth={() => {
                    setActionInputRecord(defaultRecord)
                    setComponentInput(null)
                    actionMutation.reset()
                  }}
                />
              </>
            )}
          </div>
        </div>
        <div className={cn("flex flex-col gap-3", !needsAuth && "p-3")}>
          {!linkedAccount && authType !== "None" ? (
            children
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <h3 className="text-muted-foreground text-xs flex items-center justify-start gap-2">
                  User Data
                </h3>
                <div className="flex gap-4 justify-between">
                  <div className="flex-1">
                    <Label>Name</Label>
                    <Input
                      placeholder="Enter name..."
                      name="name"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Email</Label>
                    <Input
                      placeholder="Enter email..."
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Separator className="my-2" />
                <h3 className="text-muted-foreground text-xs flex items-center justify-start gap-2">
                  Action Input
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Info className="h-4 w-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[500px]">
                      <pre>
                        {JSON.stringify(action.getInputJSONSchema(), null, 2)}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                </h3>
                {Object.keys(actionInputRecord).map((key) => (
                  <div className="flex-1" key={key + "-form"}>
                    <Label>
                      {key}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="ml-2">
                            <Info className="h-3 w-3 inline-block" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[500px]">
                          <pre>
                            {JSON.stringify(
                              (
                                action.getInputJSONSchema() as {
                                  properties: Record<string, unknown>
                                }
                              )["properties"][key],
                              null,
                              2
                            )}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      placeholder="Enter value..."
                      name="value"
                      value={actionInputRecord[key]}
                      onChange={(e) =>
                        setActionInputRecord({
                          ...actionInputRecord,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
                <Separator className="my-2" />
                <Button
                  onClick={handleTest}
                  className="w-full"
                  disabled={actionMutation.isLoading}
                >
                  <Beaker className="h-4 w-4" />
                  Test action
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col border-l">
        <div className="p-3 border-b font-bold text-sm flex items-center justify-between">
          <p>Output</p>
          <div className="h-[22px]" />
          <StatusBadge
            isError={actionMutation.isError}
            isSuccess={actionMutation.isSuccess}
          />
        </div>
        <div
          className={cn(
            "h-full w-full p-3",
            actionMutation.isError && "text-destructive"
          )}
        >
          {output}
        </div>
      </div>
      {env.NODE_ENV !== "development" && (
        <div className="absolute h-full w-full flex-col bg-background/10 flex justify-center items-center backdrop-blur z-10 rounded">
          <HandIcon className="h-12 w-12 mb-12" />
          <div className="w-[50%] text-center">
            In order to test this action, you must run ADE locally. ADE stores
            all of your data locally and does not send any data to the server.
            ADE is fully open sourced and{" "}
            <Link
              href={"https://github.com/energizeai/actions"}
              passHref
              target="_blank"
              className="text-primary hover:underline"
            >
              you can clone it here
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
