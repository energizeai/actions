"use client"

import { TActionRegistriesContext, createUseActionRegistries } from "ai-actions"
import { createContext, useContext } from "react"
import { TAIActions } from "./client"

const Context = createContext<TActionRegistriesContext>(undefined)

export function ActionRegistriesProvider({
  actions,
  children,
}: {
  children: React.ReactNode
  actions: TActionRegistriesContext
}) {
  return <Context.Provider value={actions}>{children}</Context.Provider>
}

export const useActionRegistries = createUseActionRegistries<TAIActions>(() =>
  useContext(Context)
)
