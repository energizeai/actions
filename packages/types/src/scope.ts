/**
 * Defines a structure for 'ScopePoolOr', which represents a logical OR condition in a scope pool.
 *
 * @example
 * This example signifies that the user must have both the "read:issue" and "read:organization" scopes.
 * ```
 * {
 *   and: ["read:issue", "read:organization"]
 * }
 * ```
 */
type TScopePoolNode = {
  and: [string, ...string[]]
}

/**
 * The scope pool that the user must have in order to use the action.
 *
 * @example
 * To read events from Google Calendar, the user must have either the readonly scope or the general events scope.
 * ```
 * {
 *   or: [
 *     {
 *       and: ["https://www.googleapis.com/auth/calendar.events.readonly"]
 *     },
 *     {
 *       and: ["https://www.googleapis.com/auth/calendar.events"]
 *     }
 *   ]
 * }
 * ```
 *
 * @example
 * The get weather API does not required any authentication, so the scope pool is null.
 * ```
 * null
 * ```
 */

export type TScopePool = {
  or: [TScopePoolNode, ...TScopePoolNode[]]
}
