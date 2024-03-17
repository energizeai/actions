"use client"

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

const deserializeClientActionsRegistry = <T extends TAnyClientActionRegistry>(
  registry: T
): T => {
  return serializeClientActionsRegistry(registry, "deserialize")
}

type TBase = {
  [K in string]: TAnyClientActionRegistry
}
export type TActionRegistriesContext<TMap extends TBase = TBase> =
  | {
      serializedRegistryMap: TMap
    }
  | undefined

export function createUseActionRegistries<
  const TContext extends NonNullable<TActionRegistriesContext>,
>(useContext: () => TActionRegistriesContext) {
  function wrapper() {
    const context = useContext()
    if (context === undefined) {
      throw new Error(
        "useActionRegistry must be used within a ActionRegistryProvider"
      )
    }

    const final: TContext["serializedRegistryMap"] = {} as any

    for (const key in context.serializedRegistryMap) {
      const deserialized = deserializeClientActionsRegistry(
        context.serializedRegistryMap[key] as any
      )
      final[
        `${key}ActionsRegistry` as keyof TContext["serializedRegistryMap"]
      ] = deserialized
    }

    return final
  }

  return wrapper
}

export function prepareAIActions<
  TRegistries extends Array<TAnyClientActionRegistry>,
>(
  actionRegistries: TRegistries
): NonNullable<
  TActionRegistriesContext<{
    [K in TRegistries[number] as inferNamespace<K>]: K
  }>
> {
  return {
    serializedRegistryMap: actionRegistries.reduce(
      (acc, curr) => {
        const values = Object.values(curr)

        const currnamespace = values[0]?.namespace || ""
        const serialized = serializeClientActionsRegistry(curr)

        // @ts-expect-error
        acc[currnamespace] = serialized

        return acc
      },
      {} as {
        [K in TRegistries[number] as inferNamespace<K>]: K
      }
    ),
  }
}
