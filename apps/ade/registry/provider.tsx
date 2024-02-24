"use client"

import { TAnyClientActionRegistry } from "ai-actions"
import { ReactNode, createContext, useContext } from "react"

const ActionRegistryContext = createContext<{
  clientRegistry: TAnyClientActionRegistry
}>({ clientRegistry: {} })

type ActionRegistryProviderProps = {
  clientRegistry: TAnyClientActionRegistry
  children: ReactNode
}

export const ActionsRegistryProvider = ({
  clientRegistry,
  children,
}: ActionRegistryProviderProps) => {
  return (
    <ActionRegistryContext.Provider
      value={{
        clientRegistry,
      }}
    >
      {children}
    </ActionRegistryContext.Provider>
  )
}

export const useActionRegistry = <T extends TAnyClientActionRegistry>() => {
  const context = useContext(ActionRegistryContext)

  if (context === undefined) {
    throw new Error(
      "useActionRegistry must be used within a ActionRegistryProvider"
    )
  }

  return context as { clientRegistry: T }
}
