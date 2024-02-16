import { TAuthType, filterActionRegistryByAuthType } from "@energizeai/types"
import { ActionsRegistry } from "."

type TActionId = keyof typeof ActionsRegistry

const NoAuthActionsRegistry = filterActionRegistryByAuthType(
  ActionsRegistry,
  "None"
)

const OAuthActionsRegistry = filterActionRegistryByAuthType(
  ActionsRegistry,
  "OAuth"
)
const TokenActionsRegistry = filterActionRegistryByAuthType(
  ActionsRegistry,
  "Token"
)

type TNoAuthActionId = keyof typeof NoAuthActionsRegistry
type TOAuthActionId = keyof typeof OAuthActionsRegistry
type TTokenActionId = keyof typeof TokenActionsRegistry

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
