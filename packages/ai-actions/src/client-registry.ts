import React from "react"
import z from "zod"
import { TActionInput, TAnyActionRegistry, ValuesOf } from "."
import { TOptionalActionOutput } from "./action-data"

type TClientMetadata = z.output<z.ZodType<any>> | undefined

export interface ClientActionData<
  TNamespace extends string,
  TId extends string,
  TFunctionName extends string,
  TInputSchema extends TActionInput,
  TOutputSchema extends TOptionalActionOutput,
  TMetadata extends TClientMetadata,
> {
  namespace: TNamespace
  actionId: TId
  functionName: TFunctionName
  inputSchema: TInputSchema
  outputSchema: TOutputSchema
  metadata: TMetadata
}

type TAnyClientActionData = ClientActionData<any, any, any, any, any, any>

export interface TAnyClientActionRegistry
  extends Readonly<{
    [K in string]: TAnyClientActionData
  }> {}

type inferActionComponentPropsBase<T extends TAnyClientActionData> = {
  args: z.output<T["inputSchema"]> | null
  functionName: T["functionName"]
  inputSchema: T["inputSchema"]
  outputSchema: T["outputSchema"]
  onSubmit: (args: z.output<T["inputSchema"]>) => void
} & (T["metadata"] extends z.output<any>
  ? {
      metadata: T["metadata"]
    }
  : {})

export type inferActionComponentRouter<
  T extends TAnyClientActionRegistry,
  Props extends {} = {},
> = {
  [K in keyof T as T[K]["functionName"]]: Props &
    inferActionComponentPropsBase<T[K]>
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
      outputSchema: TRouter[keyof TRouter]["outputSchema"]
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
    T[K]["outputSchema"],
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
      outputSchema: action.outputSchema,
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
