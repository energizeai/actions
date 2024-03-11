"use client"

import { ReactNode, createContext } from "react"
import { dezerialize, zerialize } from "zodex"
import { TAnyClientActionRegistry } from "./client-registry"

type inferNamespace<T extends TAnyClientActionRegistry> =
  T[keyof T]["namespace"]

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

export const ActionRegistryContext =
  createContext<TActionRegistriesContext>(undefined)

export function createUseActionRegistries<
  const TClientRegistries extends Array<TAnyClientActionRegistry>,
  TContext extends TActionRegistriesContext,
>(registries: TClientRegistries, useContext: () => TContext) {
  type TMap = {
    [K in TClientRegistries[number] as inferNamespace<K>]: K
  }

  function wrapper<TNamespace extends keyof TMap>(namespace: TNamespace) {
    const context = useContext()
    if (context === undefined) {
      throw new Error(
        "useActionRegistry must be used within a ActionRegistryProvider"
      )
    }

    const found = context[namespace as string]

    if (!found) {
      throw new Error(`No namespace found for ${namespace as string}`)
    }

    const deserialized = deserializeClientActionsRegistry(found as any)

    return {
      actionsRegistry: deserialized as TMap[TNamespace],
    }
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

// type inferClientActionsProviderKey<T extends TAnyClientActionRegistry> =
//   `${inferNamespace<T>}ActionsRegistryProvider`

// type inferHookKey<T extends TAnyClientActionRegistry> =
//   `use${inferNamespace<T>}ActionsRegistry`

// type inferClientReturn<T extends TAnyClientActionRegistry> = {
//   [K in inferClientActionsProviderKey<T>]: ({
//     children,
//   }: {
//     children: ReactNode
//   }) => JSX.Element
// } & {
//   [K in inferHookKey<T>]: () => {
//     actionsRegistry: T
//   }
// }

// const serializeClientActionsRegistry = <T extends TAnyClientActionRegistry>(
//   registry: T,
//   type: "serialize" | "deserialize" = "serialize"
// ): T => {
//   const newRegistry = {} as any

//   const keys = Object.keys(registry) as (keyof T)[]
//   for (const key of keys) {
//     const found = registry[key as keyof T]
//     if (!found) continue

//     newRegistry[key as keyof T] = {
//       inputSchema: (type === "serialize"
//         ? zerialize(found.inputSchema)
//         : dezerialize(found.inputSchema as any)) as any,
//       functionName: found.functionName,
//       actionId: found.actionId,
//       metadata: found.metadata,
//     }
//   }

//   return newRegistry as T
// }

// const deserializeClientActionsRegistry = <T extends TAnyClientActionRegistry>(
//   registry: T
// ): T => {
//   return serializeClientActionsRegistry(registry, "deserialize")
// }

// type ActionRegistryProviderProps = {
//   actionsRegistry: TAnyClientActionRegistry
//   children: ReactNode
// }

// export function ActionsRegistryProvider({
//   children,
//   actionsRegistry,
//   namespace
// }: ActionRegistryProviderProps) {
//   return (
//     <ActionRegistryContext.Provider
//       value={{
//         actionsRegistry,
//       }}
//     >
//       {children}
//     </ActionRegistryContext.Provider>
//   )
// }

// export const setupClientActionsRegistryContext = <
//   const T extends TAnyClientActionRegistry,
// >(
//   registry: T
// ): inferClientReturn<T> => {
//   const namespace = Object.values(registry)[0]?.namespace || ""
//   const providerKey: inferClientActionsProviderKey<T> = `${namespace}ActionsRegistryProvider`
//   const hookKey: inferHookKey<T> = `use${namespace}ActionsRegistry`

//   const serialized = serializeClientActionsRegistry(registry)

//   const ActionsRegistryOuter = (props: ActionRegistryProviderProps) => {
//     return (
//       <ActionsRegistryProvider actionsRegistry={serialized}>
//         {props.children}
//       </ActionsRegistryProvider>
//     )
//   }

//   // @ts-expect-error
//   return {
//     [providerKey]: ActionsRegistryOuter,
//     [hookKey]: useActionRegistry,
//   }
// }
