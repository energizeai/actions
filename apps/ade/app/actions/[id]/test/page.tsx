import { db } from "@/server/db"
import { linkedAccounts } from "@/server/db/schema"
import { TActionId } from "@energizeai/registry/types"
import { eq } from "drizzle-orm"
import { ActionAuthForm } from "./_components/action-auth-form"
import ActionTestForm from "./_components/test-form"

export default async function ActionTestPage({
  params,
}: {
  params: { id: TActionId }
}) {
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
