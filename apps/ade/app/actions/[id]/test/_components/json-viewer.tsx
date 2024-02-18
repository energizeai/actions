"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, ExpandIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const JSONViewer = ({ dataAsString }: { dataAsString: string }) => {
  const [showDialog, setShowDialog] = useState(false)
  let stringified = "ERROR"

  try {
    stringified = JSON.stringify(JSON.parse(dataAsString), null, 2)
  } catch (e) {
    console.error(e)
  }

  return (
    <>
      <div className="relative">
        <div className="top-0 right-4 absolute flex justify-end items-center gap-0.5">
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => {
              setShowDialog(!showDialog)
            }}
          >
            <ExpandIcon className="h-4 w-4" />
          </Button>
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => {
              navigator.clipboard.writeText(stringified)
              toast.success("Copied to clipboard")
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <pre className="max-w-full overflow-x-auto overflow-auto max-h-[70vh]">
          {JSON.stringify(JSON.parse(dataAsString ?? "{}"), null, 2)}
        </pre>
      </div>
      <Dialog open={showDialog} onOpenChange={(v) => setShowDialog(v)}>
        <DialogContent className="min-w-[80vw]">
          <DialogHeader>
            <DialogTitle>JSON View</DialogTitle>
          </DialogHeader>
          <pre className="max-w-full overflow-x-auto overflow-auto max-h-[70vh]">
            {stringified}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  )
}
