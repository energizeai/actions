import React from "react"
import z from "zod"
import { dezerialize, zerialize } from "zodex"
import { TActionInput, TAnyActionRegistry, ValuesOf } from "."
import { ValidZodSchema } from "./action-data"

type TClientMetadata = z.output<ValidZodSchema> | never

interface ClientActionData<
  TId extends string,
  TFunctionName extends string,
  TInputSchema extends TActionInput,
  TMetadata extends TClientMetadata,
> {
  actionId: TId
  functionName: TFunctionName
  inputSchema: TInputSchema
  metadata: TMetadata
}

export type TAnyClientActionRegistry = Readonly<{
  [K in string]: ClientActionData<string, K, TActionInput, TClientMetadata>
}>

export type inferActionComponentRouter<
  T extends TAnyClientActionRegistry,
  Props extends {} = {},
> = {
  [K in keyof T]: Props & {
    args: z.output<T[K]["inputSchema"]> | null
    functionName: T[K]["functionName"]
    inputSchema: T[K]["inputSchema"]
    onSubmit: (args: z.output<T[K]["inputSchema"]>) => void
    metadata: T[K]["metadata"]
  }
}

export type inferActionComponentProps<
  T extends inferActionComponentRouter<TAnyClientActionRegistry, any>,
  K extends keyof T,
> = T[K]

export const createActionComponentRouter = <
  TRouter extends inferActionComponentRouter<TAnyClientActionRegistry, any>,
>(args: {
  [K in keyof TRouter]: React.FC<inferActionComponentProps<TRouter, K>>
}) => {
  type CustomProps =
    TRouter extends inferActionComponentRouter<any, infer K>
      ? K
      : { other: string }

  type C = React.FC<
    CustomProps & {
      functionName: string
      args: unknown
      inputSchema: TRouter[keyof TRouter]["inputSchema"]
      onSubmit: (
        args: ValuesOf<{
          [K in keyof TRouter]: {
            functionName: K
            args: NonNullable<TRouter[K]["args"]>
          }
        }>
      ) => void
      fallback?: React.ReactNode
      metadata: TRouter[keyof TRouter]["metadata"]
    }
  >

  const Component: C = (props) => {
    if (args[props.functionName]) {
      const SubComponent = args[props.functionName]

      if (!SubComponent) {
        return props.fallback || null
      }

      const { fallback, onSubmit: wrapperOnSubmit, ...rest } = props

      const dezerialized = dezerialize(props.inputSchema)

      const parsedArgs = dezerialized.safeParse(props.args)

      const finalProps = {
        ...rest,
        args: parsedArgs.success ? parsedArgs.data : null,
        inputSchema: dezerialize(props.inputSchema),
        onSubmit: (args: NonNullable<unknown>) => {
          // we want to pass the on submit up to the parent
          wrapperOnSubmit({ functionName: props.functionName, args: args })
        },
      }

      return React.createElement(SubComponent, finalProps as any)
    }

    return props.fallback || null
  }

  return Component
}

type inferClientAct<
  T extends TAnyActionRegistry,
  TTransformedMetadata extends TClientMetadata,
> = {
  [K in keyof T as ReturnType<T[K]["getActionType"]> extends "CLIENT"
    ? ReturnType<T[K]["getFunctionName"]>
    : never]: ClientActionData<
    ReturnType<T[K]["getId"]>,
    ReturnType<T[K]["getFunctionName"]>,
    ReturnType<T[K]["getInputSchema"]>,
    TTransformedMetadata
  >
}

export const createClientActionRegistry = <
  const T extends TAnyActionRegistry,
  TTransformedMetadata extends TClientMetadata = never,
>(
  registry: T,
  options?: {
    pipeMetadata?: ReturnType<T[keyof T]["getMetadata"]> extends infer TMetadata
      ? TMetadata extends z.output<any>
        ? (metadata: TMetadata) => TTransformedMetadata
        : never
      : never
  }
): inferClientAct<T, TTransformedMetadata> => {
  type TRet = inferClientAct<T, TTransformedMetadata>
  const newRegistry = {} as TRet

  const keys = Object.keys(registry) as (keyof T)[]
  for (const key of keys) {
    if (registry[key]!.getActionType() !== "CLIENT") {
      continue
    }

    const action = registry[key]
    if (!action) continue

    // @ts-ignore
    newRegistry[key as keyof TRet] = {
      inputSchema: zerialize(action.getInputSchema()),
      functionName: action.getFunctionName(),
      actionId: action.getId(),
      metadata: options?.pipeMetadata
        ? options.pipeMetadata(action.getMetadata())
        : undefined,
    }
  }

  return newRegistry
}
