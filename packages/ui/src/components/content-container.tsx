import { cn } from "../utils"

export default function ContentContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex w-full items-center justify-center">
      <div
        className={cn(
          "mx-5 flex flex-col py-5 md:max-w-screen-lg lg:max-w-screen-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
