"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "./button"

export type TabNavItem = {
  name: string
  href: string
}

const TabNav = ({
  items,
  children,
  className,
}: {
  items: TabNavItem[]
  children?: React.ReactNode
  className?: string
}) => {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex justify-between items-center border-b gap-4",
        className
      )}
    >
      <div className="flex flex-row gap-2 justify-start py-0">
        {items.map((item, ix) => (
          <div
            className={cn(
              "relative pb-2",
              pathname !== item.href && "text-muted-foreground"
            )}
            key={item.name + "tabbed-nav-item"}
          >
            <Link href={item.href} key={item.name + "tabbed-nav"}>
              <Button variant={"ghost"} size={"sm"}>
                {item.name}
              </Button>
            </Link>
            {pathname === item.href && (
              <span className="absolute rounded left-0 bottom-0 h-[2px] w-full bg-foreground" />
            )}
          </div>
        ))}
      </div>
      <div className="pb-2">{children}</div>
    </div>
  )
}

export { TabNav }
