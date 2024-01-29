import { cn } from "../utils"

const SectionHeader = ({
  children,
  title,
  badge,
  subtitle,
  icon,
  titleClassName,
  className,
}: {
  children?: React.ReactNode
  title: string
  badge?: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  titleClassName?: string
  className?: string
}) => {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon}
      <div className="flex flex-1 flex-col">
        <h1
          className={cn(
            "flex items-center gap-2 text-3xl text-xl font-semibold md:text-2xl",
            titleClassName
          )}
        >
          {title}
          {badge && badge}
        </h1>
        {typeof subtitle === "string" ? (
          <p className="mt-1 text-muted-foreground lg:max-w-[70%]">
            {subtitle}
          </p>
        ) : (
          subtitle
        )}
      </div>
      {children && (
        <div className="flex items-center justify-end gap-2 lg:ml-4">
          {children}
        </div>
      )}
    </div>
  )
}

export { SectionHeader }
