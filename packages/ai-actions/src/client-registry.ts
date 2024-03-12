import React from "react"
import z from "zod"
import { TActionInput, TAnyActionRegistry, ValuesOf } from "."

type TClientMetadata = z.output<z.ZodType<any>> | undefined

export interface ClientActionData<
  TNamespace extends string,
  TId extends string,
  TFunctionName extends string,
  TInputSchema extends TActionInput,
  TMetadata extends TClientMetadata,
> {
  namespace: TNamespace
  actionId: TId
  functionName: TFunctionName
  inputSchema: TInputSchema
  metadata: TMetadata
}

export type TAnyClientActionRegistry = Readonly<{
  [K in string]: ClientActionData<any, any, any, any, any>
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
  } & (T[K]["metadata"] extends z.output<any>
      ? {
          metadata: T[K]["metadata"]
        }
      : {})
}

export type inferActionComponentProps<
  T extends inferActionComponentRouter<TAnyClientActionRegistry, any>,
  K extends keyof T,
> = T[K]

export const createActionComponentRouter = <
  TRouter extends inferActionComponentRouter<TAnyClientActionRegistry, any>,
>(
  args: Partial<{
    [K in keyof TRouter]: React.FC<inferActionComponentProps<TRouter, K>>
  }>
) => {
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

      const parsedArgs = props.inputSchema.safeParse(props.args)

      const finalProps = {
        ...rest,
        args: parsedArgs.success ? parsedArgs.data : null,
        inputSchema: props.inputSchema,
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

type inferNamespace<T extends TAnyActionRegistry> =
  T[keyof T]["registryData"]["namespace"]

type inferClientReturn<
  T extends TAnyActionRegistry,
  TTransformedMetadata extends TClientMetadata,
> = {
  [K in keyof T]: ClientActionData<
    inferNamespace<T>,
    T[K]["id"],
    T[K]["functionName"],
    T[K]["inputSchema"],
    TTransformedMetadata
  >
}

type TCreateClientActionsRegistryOptions<
  T extends TAnyActionRegistry,
  TTransformedMetadata extends TClientMetadata = undefined,
> = T[keyof T]["metadata"] extends undefined
  ? {}
  : {
      pipeMetadata?: (metadata: T[keyof T]["metadata"]) => TTransformedMetadata
    }

export const createClientActionsRegistry = <
  const T extends TAnyActionRegistry,
  TTransformedMetadata extends TClientMetadata = undefined,
>(
  registry: T,
  options?: TCreateClientActionsRegistryOptions<T, TTransformedMetadata>
): inferClientReturn<T, TTransformedMetadata> => {
  type TNewReg = inferClientReturn<T, TTransformedMetadata>
  const newRegistry = {} as TNewReg

  const keys = Object.keys(registry) as (keyof T)[]
  for (const key of keys) {
    const action = registry[key]
    if (!action) continue

    newRegistry[key as keyof TNewReg] = {
      namespace: action.registryData.namespace,
      inputSchema: action.inputSchema,
      functionName: action.functionName,
      actionId: action.id,
      metadata: (options && "pipeMetadata" in options && options.pipeMetadata
        ? options.pipeMetadata(action.metadata)
        : undefined) as TTransformedMetadata,
    }
  }

  return newRegistry
}

export * from "./provider"
