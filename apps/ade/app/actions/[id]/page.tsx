import { redirect } from "next/navigation"

export default async function ActionPage({
  params,
}: {
  params: { id: string }
}) {
  redirect(`/actions/${params.id}/details`)
}
