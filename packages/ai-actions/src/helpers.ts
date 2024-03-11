import { TAnyActionRegistry } from "."
import { TAuthType } from "./auth"

/**
 * Filter the action registry by the auth type.
 *
 * @param registry The registry of actions.
 * @param authType The auth type to filter by.
 *
 * @returns The filtered registry of actions.
 */
export const filterActionRegistryByAuthType = <
  const T extends TAnyActionRegistry,
  U extends TAuthType,
>(
  registry: T,
  authType: U
): {
  [K in keyof T as T[K]["auth"]["type"] extends U ? K : never]: T[K]
} => {
  return Object.entries(registry).reduce((acc, [id, action]) => {
    if (action.auth.type === authType) {
      acc[id] = action
    }
    return acc
  }, {} as any)
}

/**
 * Filter the action registry by metadat
 *
 * @param registry The registry of actions.
 * @param filterFn The filter function to apply to the actions.
 *
 * @returns The filtered registry of actions.
 */
export const filterActionRegistryByMetadata = <
  const T extends TAnyActionRegistry,
>(
  registry: T,
  fn: (metadata: T[keyof T]["metadata"]) => boolean
): T => {
  return Object.entries(registry).reduce((acc, [id, action]) => {
    const result = fn(action.metadata)
    if (result) {
      acc[id] = action
    }
    return acc
  }, {} as any)
}

/**
 * Create a readonly map of {
 *   [id]: id
 * }
 */
export const generateActionIdMap = <const T extends TAnyActionRegistry>(
  registry: T
): Readonly<{ [K in keyof T]: K }> => {
  return Object.freeze(
    Object.keys(registry).reduce((acc, id) => ({ ...acc, [id]: id }), {})
  ) as Readonly<{ [K in keyof T]: K }>
}

/**
 * Pick the actions from the registry.
 *
 * @param registry The registry of actions.
 * @param id The id of the action to pick.
 *
 * @returns The picked actions.
 *
 */
export const pickFromActionsRegistry = <
  T extends TAnyActionRegistry,
  K extends keyof T | (keyof T)[],
>(
  registry: T,
  id: K
): K extends infer U
  ? U extends (keyof T)[]
    ? Pick<T, U[number]>
    : U extends keyof T
      ? Pick<T, U>
      : never
  : never => {
  const keys: (keyof T)[] = Array.isArray(id) ? id : ([id] as (keyof T)[])

  return keys.reduce((acc, key) => {
    acc[key] = registry[key]
    return acc
  }, {} as any)
}

export const omitFromActionsRegistry = <
  T extends TAnyActionRegistry,
  K extends keyof T | (keyof T)[],
>(
  registry: T,
  id: K
): K extends infer U
  ? U extends (keyof T)[]
    ? Omit<T, U[number]>
    : U extends keyof T
      ? Omit<T, U>
      : never
  : never => {
  const keys: (keyof T)[] = Array.isArray(id) ? id : ([id] as (keyof T)[])

  return Object.entries(registry).reduce((acc, [key, value]) => {
    if (!keys.includes(key as any)) {
      acc[key] = value
    }
    return acc
  }, {} as any)
}
