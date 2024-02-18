import { env } from "@/env/server.mjs"
import { TActionId } from "@/registry/_properties/types"
import { db } from "@/server/db"
import { linkedAccounts } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { ActionAuthForm } from "./_components/action-auth-form"
import ActionTestForm from "./_components/test-form"

export default async function ActionTestPage({
  params,
}: {
  params: { id: TActionId }
}) {
  if (env.NODE_ENV !== "development") {
    redirect(`/actions/${params.id}/test-prod`)
  }

  const linkedAccount =
    (await db
      .select()
      .from(linkedAccounts)
      .where(eq(linkedAccounts.actionId, params.id))
      .then((res) => res[0])) || null

  return (
    <ActionTestForm params={params} linkedAccount={linkedAccount}>
      <ActionAuthForm actionId={params.id} />
    </ActionTestForm>
  )
}
