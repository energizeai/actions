"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function DocPageOutline() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [headingElements, setHeadingElements] = useState<
    { id: string; text: string; tagName: string }[] | null
  >(null)
  const pathname = usePathname()

  useEffect(() => {
    const headingElements = document.getElementsByClassName("markdown-heading")

    if (!activeId && headingElements.length) {
      setActiveId(headingElements[0]!.id)
    }

    setHeadingElements(
      Array.from(headingElements).map((element) => ({
        id: element.id,
        text: (element as HTMLHeadingElement).innerText,
        tagName: (element as HTMLHeadingElement).tagName,
      }))
    )
  }, [])

  useEffect(() => {
    const elems = document.getElementsByClassName("markdown-heading")
    const itemIds = Array.from(elems).map((element) => element.id)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: `0% 0% -80% 0%` }
    )

    itemIds?.forEach((id) => {
      if (!id) {
        return
      }

      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      itemIds?.forEach((id) => {
        if (!id) {
          return
        }

        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [])

  if (pathname.includes("/actions/")) {
    return null
  }

  if (headingElements === null)
    return (
      <div className="flex-col gap-4 hidden xl:flex justify-start items-start fixed w-[250px]">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
      </div>
    )

  if (!headingElements || !headingElements.length) return null

  return (
    <div className="flex-col gap-4 hidden xl:flex justify-start items-start fixed w-[250px]">
      {[...headingElements].map((element) => {
        const id = element.id
        return (
          <button
            key={id}
            className={cn(
              "text-left line-clamp-1 whitespace-nowrap overflow-hidden",
              activeId === id
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground transition-colors duration-200",
              element.tagName === "H3" && "pl-4"
            )}
            onClick={(e) => {
              e.preventDefault()
              const target = document.getElementById(id || "na")
              if (target) {
                target.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            {element.text}
          </button>
        )
      })}
    </div>
  )
}
