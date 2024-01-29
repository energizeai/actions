"use client"

import React, { ElementRef, useEffect, useRef, useState } from "react"

import { cn } from "../utils"

const SlideIn = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const [isVisible, setVisible] = useState(false)
  const domRef = useRef<ElementRef<"div"> | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setVisible(entry.isIntersecting))
    })

    if (!domRef.current) return

    observer.observe(domRef.current)
    return () => {
      if (!domRef.current) return
      observer.unobserve(domRef.current)
    }
  }, [])

  return (
    <div
      ref={domRef}
      className={cn(isVisible ? "animate-fade-in-from-right" : "", className)}
    >
      {children}
    </div>
  )
}

export default SlideIn
