"use client"

import { camelCaseToTitleCase } from "@/lib/utils"
import { api } from "@/trpc/react"
import { extractErrorMessage } from "@/trpc/shared"
import { ActionsRegistry } from "@energizeai/registry"
import { TActionId, TTokenAction } from "@energizeai/registry/types"
import { Button } from "@energizeai/ui/button"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@energizeai/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@energizeai/ui/form"
import { Input } from "@energizeai/ui/input"
import { Spinner } from "@energizeai/ui/spinner"
import { zodResolver } from "@hookform/resolvers/zod"
import { Cable, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import zodToJsonSchema from "zod-to-json-schema"

export default function TokenForm({ actionId }: { actionId: TActionId }) {
  const authConfig = ActionsRegistry[actionId].getAuthConfig() as ReturnType<
    TTokenAction["getAuthConfig"]
  >
  const router = useRouter()

  const formSchema = z.object({
    accessToken: z.string().min(2),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accessToken: "",
    },
  })

  const [customDataFormValues, setCustomDataFormValues] = useState<
    Record<string, string>
  >({})

  const linkedAccountMutation =
    api.linkedAccounts.createLinkedAccountForTokenAuth.useMutation()
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { accessToken } = values

      await linkedAccountMutation.mutateAsync({
        actionId,
        refreshToken: null,
        accessToken,
        customData: customDataFormValues,
        expiresAt: null,
        authType: "Token",
        scope: null,
      })

      toast.success("Successfully connected account!")
      router.refresh()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    }
  }

  let customKeys: string[] | null = null

  const tokenMutation = { isLoading: false }

  let customDataSchemaAsJson: undefined | ReturnType<typeof zodToJsonSchema> =
    undefined
  if (authConfig && authConfig.config.customDataSchema) {
    customDataSchemaAsJson = zodToJsonSchema(authConfig.config.customDataSchema)
  }

  if (customDataSchemaAsJson && "properties" in customDataSchemaAsJson) {
    customKeys = []
    for (const key in customDataSchemaAsJson.properties) {
      customKeys.push(key)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardDescription>
            In order to use this action, you must first authenticate in respect
            to the AuthConfig.
            <Link
              href={authConfig.config.generatingTokenReferenceURL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline"
            >
              {" "}
              Click here to open a guide with instructions to generate your
              access token. <ExternalLink className="inline h-3 w-3" />
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="accessToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Token</FormLabel>
                <FormControl>
                  <Input placeholder="Enter access token..." {...field} />
                </FormControl>
                <FormDescription>
                  This is your personal access token.{" "}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {customKeys !== null &&
            customKeys.length > 0 &&
            customDataSchemaAsJson &&
            "properties" in customDataSchemaAsJson && (
              <>
                {customKeys.map((key) => (
                  <FormItem key={key}>
                    <FormLabel>{camelCaseToTitleCase(key)}</FormLabel>
                    <Input
                      placeholder={`Enter ${camelCaseToTitleCase(key)}...`}
                      value={customDataFormValues[key] || ""}
                      onChange={(e) => {
                        setCustomDataFormValues((prev) => ({
                          ...prev,
                          [key]: e.target.value || "",
                        }))
                      }}
                    />
                    <FormDescription>
                      {customDataSchemaAsJson &&
                      "properties" in customDataSchemaAsJson &&
                      key in customDataSchemaAsJson.properties &&
                      customDataSchemaAsJson.properties[key]?.description
                        ? customDataSchemaAsJson.properties[key]?.description ||
                          ""
                        : ""}
                    </FormDescription>
                  </FormItem>
                ))}
              </>
            )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={tokenMutation.isLoading}
          >
            {tokenMutation.isLoading ? (
              <Spinner />
            ) : (
              <Cable className="h-4 w-4" />
            )}
            Connect
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
