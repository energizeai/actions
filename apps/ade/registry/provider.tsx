"use client"

import {
  ActionRegistriesProviderWrapper,
  TActionRegistriesContext,
  createUseActionRegistries,
} from "ai-actions"
import { createContext, useContext } from "react"
import { ClientActionsRegistry } from "./client"

const Registries = [ClientActionsRegistry]

export const ActionRegistriesContext =
  createContext<TActionRegistriesContext>(undefined)

export function ActionRegistriesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ActionRegistriesProviderWrapper
      Context={ActionRegistriesContext}
      actionRegistries={Registries}
    >
      {children}
    </ActionRegistriesProviderWrapper>
  )
}

export const useActionRegistries = createUseActionRegistries(Registries, () =>
  useContext(ActionRegistriesContext)
)
