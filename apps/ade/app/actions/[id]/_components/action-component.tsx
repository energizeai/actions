"use client"

import { ActionsRegistry } from "@/registry"
import { TActionId } from "@/registry/_properties/types"
import { api } from "@/trpc/react"
import React, { useEffect } from "react"
import { toast } from "sonner"

function ActionComponent({
  actionId,
  state,
  inputDataAsString,
  userData,
}: {
  actionId: TActionId
} & (
  | {
      inputDataAsString: string
      userData: {
        name: string
        email: string
      }
      state: "active"
    }
  | {
      inputDataAsString: undefined
      userData: undefined
      state: "placeholder"
    }
  | {
      inputDataAsString: undefined
      userData: undefined
      state: "skeleton"
    }
)) {
  const actionData = ActionsRegistry[actionId]
  const [mounted, setMounted] = React.useState(false)

  const caller = api.actions.testActionFunction.useMutation()

  useEffect(() => {
    setMounted(true)
  }, [])

  const Component = actionData.getComponent()

  if (!mounted || !Component) {
    return null
  }

  if (state === "placeholder") {
    return (
      <Component
        displayState="placeholder"
        data={undefined}
        // @ts-ignore
        inputSchema={actionData.getInputSchema()}
        metadata={actionData.getMetadata()}
      />
    )
  }

  if (state === "skeleton") {
    return (
      <Component
        displayState="skeleton"
        data={undefined}
        // @ts-ignore
        inputSchema={actionData.getInputSchema()}
        metadata={actionData.getMetadata()}
      />
    )
  }

  const inputSafeParsed = actionData
    .getInputSchema()
    .safeParse(JSON.parse(inputDataAsString))

  if (inputSafeParsed.success === false) {
    return (
      <div>
        <div className="text-red-500 font-semibold">
          Input Error: {inputSafeParsed.error.message}
        </div>
        <div className="text-muted-foreground">
          {JSON.stringify(inputDataAsString, null, 2)}
        </div>
      </div>
    )
  }

  return (
    <Component
      displayState="active"
      // @ts-ignore
      inputSchema={actionData.getInputSchema()}
      metadata={actionData.getMetadata()}
      data={{
        isLoading: caller.isLoading,
        isSuccess: caller.isSuccess,
        isError: caller.isError,

        // @ts-ignore
        input: inputSafeParsed.data,

        onSubmit: async (input) => {
          try {
            await caller.mutateAsync({
              actionId: actionId,
              inputDataAsString: JSON.stringify(input),
              userData,
            })
          } catch {
            toast.error("Error running action.")
          }
        },
      }}
    />
  )
}

export { ActionComponent }
