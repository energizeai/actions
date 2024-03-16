import { ActionsRegistry } from "@/registry"
import { redirect } from "next/navigation"

export default function ActionsPage() {
  const firstActionId = Object.keys(ActionsRegistry)[0]

  if (!firstActionId) {
    redirect("/")
  }

  redirect(`/actions/${firstActionId}`)
}
