import { cn } from "../utils"

function Skeleton({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "textarea" | "input" | "select"
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        variant === "textarea" && "h-[80px] w-full",
        variant === "input" && "h-10 w-full",
        variant === "select" && "h-10 w-full",
        className
      )}
      {...props}
    />
  )
}
Skeleton.displayName = "Skeleton"

function ConditionalSkeleton({
  showSkeleton,
  className,
  children,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showSkeleton: boolean | undefined
  variant?: Parameters<typeof Skeleton>[0]["variant"]
}) {
  if (showSkeleton === true) {
    return <Skeleton className={className} {...props} variant={variant} />
  }

  return <>{children}</>
}
ConditionalSkeleton.displayName = "ConditionalSkeleton"

export { ConditionalSkeleton, Skeleton }
