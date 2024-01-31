import { TAuthType } from "@energizeai/types"
import { ActionsRegistry } from "."

type TActionId = keyof typeof ActionsRegistry

type ActionIdKeysForAuthType<T extends TAuthType> = {
  [key in TActionId]: ReturnType<
    (typeof ActionsRegistry)[key]["getAuthConfig"]
  >["type"] extends T
    ? key
    : never
}[TActionId]

type TNoAuthActionId = ActionIdKeysForAuthType<"None">
type TOAuthActionId = ActionIdKeysForAuthType<"OAuth">
type TTokenActionId = ActionIdKeysForAuthType<"Token">

type TAction = (typeof ActionsRegistry)[TActionId]
type TNoAuthAction = (typeof ActionsRegistry)[TNoAuthActionId]
type TOAuthAction = (typeof ActionsRegistry)[TOAuthActionId]
type TTokenAction = (typeof ActionsRegistry)[TTokenActionId]

export {
  type TAction,
  type TActionId,
  type TAuthType,
  type TNoAuthAction,
  type TNoAuthActionId,
  type TOAuthAction,
  type TOAuthActionId,
  type TTokenAction,
  type TTokenActionId,
}
