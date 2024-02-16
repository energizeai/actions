import { ActionBuilderWithFunction, TAuthType } from "."

type TActionsRegistry<
  T extends ActionBuilderWithFunction<any, any, any, any, any>[],
> = T extends [infer A, ...infer R]
  ? A extends ActionBuilderWithFunction<infer Id, any, any, any, any>
    ? R extends ActionBuilderWithFunction<string, any, any, any, any>[]
      ? Readonly<{ [K in Id]: A }> & TActionsRegistry<R>
      : never
    : never
  : Readonly<{}>

/**
 * Create a registry of actions.
 *
 * @param registry The list of actions to register.
 * @returns The registry of actions.
 */
export const createActionsRegistry = <
  const T extends ActionBuilderWithFunction<any, any, any, any, any>[],
>(
  registry: T
): TActionsRegistry<T> => {
  type TId = ReturnType<T[number]["getId"]>
  return Object.freeze(
    registry.reduce((acc, action) => {
      const id = action.getId() as TId

      if (acc[id]) {
        throw new Error(`Duplicate action id: ${id}`)
      }

      acc[id] = action
      return acc
    }, {} as TActionsRegistry<T>)
  ) as TActionsRegistry<T>
}

/**
 * Filter the action registry by the auth type.
 *
 * @param registry The registry of actions.
 * @param authType The auth type to filter by.
 *
 * @returns The filtered registry of actions.
 */
export const filterActionRegistryByAuthType = <
  const T extends Readonly<{
    [key: string]: ActionBuilderWithFunction<any, any, any, any, any>
  }>,
  U extends TAuthType,
>(
  registry: T,
  authType: U
): {
  [K in keyof T as ReturnType<T[K]["getAuthConfig"]>["type"] extends U
    ? K
    : never]: T[K]
} => {
  return Object.entries(registry).reduce((acc, [id, action]) => {
    if (action.getAuthConfig().type === authType) {
      acc[id] = action
    }
    return acc
  }, {} as any)
}
