"use client"

import {
  ActionRegistriesProviderWrapper,
  TActionRegistriesContext,
  createAction,
  createActionsRegistry,
  createClientActionsRegistry,
  createUseActionRegistries,
  generateActionRegistryFunctions,
} from "ai-actions"
import { createContext, useContext } from "react"
import { ClientActionsRegistry } from "./client"

const generator = generateActionRegistryFunctions({ namespace: "test" })
const otherRegistry = generator.createtestActionsRegistry([
  generator.createtestAction({ id: "test" }).input({}).noHandler(),
])
const otherClientREgistry = createClientActionsRegistry(otherRegistry, {})

const anotherRegistry = createActionsRegistry([
  createAction({ id: "test" }).input({}).noHandler(),
])
const anotherClientRegistry = createClientActionsRegistry(anotherRegistry, {})

const Registries = [
  ClientActionsRegistry,
  otherClientREgistry,
  anotherClientRegistry,
]

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
