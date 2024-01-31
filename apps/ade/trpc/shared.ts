import { type AppRouter } from "@/server/api/root"
import {
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server"
import superjson from "superjson"

export const transformer = superjson

function getBaseUrl() {
  if (typeof window !== "undefined") return ""
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc"
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

export function trpcBadRequestError(message: string, cause?: unknown) {
  return new TRPCError({ code: "BAD_REQUEST", message, cause })
}

export function trpcNotFoundError(message: string, cause?: unknown) {
  return new TRPCError({ code: "NOT_FOUND", message, cause })
}

export function trpcAuthorizationError(message: string, cause?: unknown) {
  return new TRPCError({ code: "UNAUTHORIZED", message, cause })
}

export function extractErrorMessage(error: unknown) {
  if (error instanceof TRPCError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Something went wrong..."
}
