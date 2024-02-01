"use client"

import { env } from "@/env/client.mjs"
// Error components must be Client Components
import { HandIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="py-5">
      {env.NODE_ENV !== "development" ? (
        <div className="h-full w-full flex-col bg-background/10 flex justify-center items-center backdrop-blur z-10 rounded">
          <HandIcon className="h-12 w-12 mb-12" />
          <div className="w-[50%] text-center">
            In order to test this action, you must run ADE locally. ADE stores
            all of your data locally and does not send any data to the server.
            ADE is fully open sourced and{" "}
            <Link
              href={"https://github.com/energizeai/actions"}
              passHref
              target="_blank"
              className="text-primary hover:underline"
            >
              you can clone it here
            </Link>
          </div>
        </div>
      ) : (
        "ERROR"
      )}
    </div>
  )
}
