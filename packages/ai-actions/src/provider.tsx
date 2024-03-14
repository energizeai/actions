"use client"

import { ReactNode } from "react"
import { dezerialize, zerialize } from "zodex"
import { TAnyClientActionRegistry } from "./client-registry"

type inferNamespace<T extends TAnyClientActionRegistry> =
  T[keyof T]["namespace"] extends string
    ? `${T[keyof T]["namespace"]}ActionsRegistry`
    : never

const serializeClientActionsRegistry = <T extends TAnyClientActionRegistry>(
  registry: T,
  type: "serialize" | "deserialize" = "serialize"
): T => {
  const newRegistry = {} as any

  const keys = Object.keys(registry) as (keyof T)[]
  for (const key of keys) {
    const found = registry[key as keyof T]
    if (!found) continue

    newRegistry[key as keyof T] = {
      inputSchema: (type === "serialize"
        ? zerialize(found.inputSchema)
        : dezerialize(found.inputSchema as any)) as any,
      outputSchema: found.outputSchema
        ? type === "serialize"
          ? zerialize(found.outputSchema)
          : dezerialize(found.outputSchema as any)
        : undefined,
      functionName: found.functionName,
      actionId: found.actionId,
      metadata: found.metadata,
      namespace: found.namespace,
    }
  }

  return newRegistry as T
}

export const deserializeClientActionsRegistry = <
  T extends TAnyClientActionRegistry,
>(
  registry: T
): T => {
  return serializeClientActionsRegistry(registry, "deserialize")
}

export type TActionRegistriesContext =
  | Record<string, TAnyClientActionRegistry>
  | undefined

export function createUseActionRegistries<
  const TClientRegistries extends Array<TAnyClientActionRegistry>,
  TContext extends TActionRegistriesContext,
>(registries: TClientRegistries, useContext: () => TContext) {
  type TMap = {
    [K in TClientRegistries[number] as inferNamespace<K>]: K
  }

  function wrapper() {
    const context = useContext()
    if (context === undefined) {
      throw new Error(
        "useActionRegistry must be used within a ActionRegistryProvider"
      )
    }

    type TNamespace = keyof TMap extends string ? keyof TMap : never

    const final: TMap = {} as any

    for (const key in context) {
      const deserialized = deserializeClientActionsRegistry(context[key] as any)
      final[`${key}ActionsRegistry` as keyof TMap] = deserialized
    }

    return final
  }

  return wrapper
}

type ActionRegistryProviderProps = {
  Context: React.Context<TActionRegistriesContext>
  actionRegistries: TAnyClientActionRegistry[]
  children: ReactNode
}

export function ActionRegistriesProviderWrapper({
  children,
  actionRegistries,
  Context,
}: ActionRegistryProviderProps) {
  const reduced = actionRegistries.reduce(
    (acc, curr) => {
      const values = Object.values(curr)

      const currnamespace = values[0]?.namespace || ""
      const serialized = serializeClientActionsRegistry(curr)

      acc[currnamespace] = serialized
      return acc
    },
    {} as Record<string, TAnyClientActionRegistry>
  )

  return <Context.Provider value={reduced}>{children}</Context.Provider>
}
