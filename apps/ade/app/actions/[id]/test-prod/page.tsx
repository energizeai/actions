import { env } from "@/env/server.mjs"
import { TActionId } from "@/registry/_properties/types"
import { redirect } from "next/navigation"
import { ActionAuthForm } from "../test/_components/action-auth-form"
import ActionTestForm from "../test/_components/test-form"

export default async function ActionTestProdPage({
  params,
}: {
  params: { id: TActionId }
}) {
  if (env.NODE_ENV === "development") {
    redirect(`/actions/${params.id}/test`)
  }
  return (
    <ActionTestForm params={params} linkedAccount={null}>
      <ActionAuthForm actionId={params.id} />
    </ActionTestForm>
  )
}
