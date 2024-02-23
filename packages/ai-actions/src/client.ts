import React from "react"
import z from "zod"
import { TActionInput, TAnyActionRegistry } from "."
import { ValidZodSchema } from "./action-data"

type TClientMetadata = z.output<ValidZodSchema> | never

type ClientSafeActionData<
  TId extends string,
  TFunctionName extends string,
  TInputSchema extends TActionInput,
  TMetadata extends TClientMetadata,
> = {
  actionId: TId
  functionName: TFunctionName
  inputSchema: TInputSchema
  metadata: TMetadata
}

type TAnyClientSafeActionRegistry = Readonly<{
  [key: string]: ClientSafeActionData<
    string,
    string,
    TActionInput,
    TClientMetadata
  >
}>

export type inferActionComponentRouter<
  T extends TAnyClientSafeActionRegistry,
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
  T extends inferActionComponentRouter<TAnyClientSafeActionRegistry, any>,
  K extends keyof T,
> = T[K]

export const createActionComponentRouter = <
  TRouter extends inferActionComponentRouter<TAnyClientSafeActionRegistry, any>,
>(args: {
  [K in keyof TRouter]: React.FC<inferActionComponentProps<TRouter, K>>
}) => {
  type CustomProps =
    TRouter extends inferActionComponentRouter<any, infer K>
      ? K
      : { other: string }

  type C = React.FC<
    CustomProps &
      {
        [K in keyof TRouter]: {
          functionName: K
          args: z.input<TRouter[K]["inputSchema"]>
          inputSchema: TRouter[K]["inputSchema"]
          onSubmit: (args: {
            functionName: K
            args: NonNullable<TRouter[K]["args"]>
          }) => void
        }
      }[keyof TRouter] & {
        fallback?: React.ReactNode
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

type inferClientSafe<
  T extends TAnyActionRegistry,
  TTransformedMetadata extends TClientMetadata,
> = {
  [K in keyof T as ReturnType<T[K]["getActionType"]> extends "CLIENT"
    ? K
    : never]: ClientSafeActionData<
    ReturnType<T[K]["getId"]>,
    ReturnType<T[K]["getFunctionName"]>,
    ReturnType<T[K]["getInputSchema"]>,
    TTransformedMetadata
  >
}

export const createClientSafeActionRegistry = <
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
): inferClientSafe<T, TTransformedMetadata> => {
  type TRet = inferClientSafe<T, TTransformedMetadata>
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
      inputSchema: action.getInputSchema(),
      functionName: action.getFunctionName(),
      actionId: action.getId(),
      metadata: options?.pipeMetadata
        ? options.pipeMetadata(action.getMetadata())
        : undefined,
    }
  }

  return newRegistry
}

// export const createActionsRegistryClientRouter = <
//   T extends TAnyActionRegistry,
//   Props extends {} = {},
// >(args: {
//   clientRouter: {
//     [K in inferClientActionIds<T>]: (props: Props) => React.ReactNode
//   }
// }): React.FC<
//   {
//     fallback?: React.ReactNode
//     action: {
//       [K in keyof T]: {
//         functionName: ReturnType<T[K]["getFunctionName"]>
//         arguments: z.output<ReturnType<T[K]["getInputSchema"]>>
//       }
//     }[keyof T]
//   } & Props
// > => {
//   return ({
//     fallback,
//     ...props
//   }: {
//     fallback?: React.ReactNode
//   } & Props) => {
//     return null
//   }
// }
