"use client"

import { ActionsRegistry } from "@repo/registry"
import { ValuesOf } from "@repo/types"
import React, { useEffect } from "react"

export const ActionComponent = ({
  actionData,
  isPlaceholderComponent,
  isSkeletonComponent,
}: {
  actionData: ValuesOf<typeof ActionsRegistry>
  isPlaceholderComponent?: boolean
  isSkeletonComponent?: boolean
}) => {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !("Component" in actionData)) {
    return null
  }

  return <actionData.Component isPlaceholderComponent={true} />
}
