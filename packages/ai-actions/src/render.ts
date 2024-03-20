import z from "zod"
import {
  TActionRegistrySubset,
  TAnyActionRegistry,
  TFunctionCallingArgs,
  setupActionCaller,
} from "."
import { TStreamable } from "./action-data"
import { ActionBuilderWithHandler } from "./with-handler"

export type TActionsWithRender<
  TRegistry extends TAnyActionRegistry,
  U extends (keyof TRegistry)[] | undefined = undefined,
> = {
  [K in TActionRegistrySubset<TRegistry, U>]: {
    description?: string | undefined
    parameters: TRegistry[K]["inputSchema"]
    render: (
      props: z.output<TRegistry[K]["inputSchema"]>
    ) => AsyncGenerator<TStreamable, TStreamable, void>
  }
}

export function setupActionsWithRender<
  T extends {
    [K in string]: ActionBuilderWithHandler<any>
  },
  U extends (keyof T)[],
  TArgs extends TFunctionCallingArgs<T, any>,
>(registry: T, actionIds: U, args: TArgs) {
  type TRet = TActionsWithRender<T, U>
  const withRender: TRet = ({} = {} as any)

  for (const id of actionIds) {
    const action = registry[id]
    if (!action) continue // should never happen

    const renderFn = action._render
    if (!renderFn) continue

    withRender[action.functionName as keyof TRet] = {
      description: action.inputSchema.description,
      parameters: action.inputSchema,
      render: async function* (props: any) {
        const { actionCaller } = setupActionCaller(registry, {
          ...args,
          onActionExecutionFinished: undefined, // we call this later
          mode: "render",
        })

        const results = await actionCaller([
          {
            name: action.functionName,
            arguments: props,
          },
        ])

        const result = results[0]

        if (!result || result.isError) {
          throw new Error("Expected 1 result")
        }

        const renderProps = {
          input: result.parsedArguments,
          context: result.$parsedContext,
          additionalParams: result.parsedAdditionalParams,
          auth: result.$auth,
          handler: action.handler,
        } as const satisfies Parameters<typeof renderFn>[0]

        function isGeneratorFunction(func: any) {
          const constructor = func.constructor

          if (!constructor) return false
          if (
            "GeneratorFunction" === constructor.name ||
            "GeneratorFunction" === constructor.displayName ||
            "AsyncGeneratorFunction" === constructor.name ||
            "AsyncGeneratorFunction" === constructor.displayName
          )
            return true
          return false
        }

        const handleFinished = () => {
          if (args.onActionExecutionFinished) {
            args.onActionExecutionFinished({
              ...result,
              timestamp: Date.now(),
            } as any)
          }
        }

        if (isGeneratorFunction(renderFn)) {
          const yieldResult = yield* renderFn(renderProps)

          handleFinished()

          return yieldResult
        }

        const renderResult = await renderFn(renderProps)

        handleFinished()

        return renderResult
      },
    }
  }

  return withRender
}
