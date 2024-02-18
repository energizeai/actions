import { cn } from "@/lib/utils"
import { Separator } from "./separator"

export default function SeparatorWithText({
  children,
  className,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex gap-4 items-center max-w-full", className)}>
      <Separator className="flex-1" />
      {children}
      <Separator className="flex-1" />
    </div>
  )
}
