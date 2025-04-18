"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentViewerProps {
  document: any
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Document Preview</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh]">
          <div className="p-4">
            {/* This is a placeholder. In a real app, you would render the actual document */}
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Document Preview: {typeof document === "string" ? document : document.name}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
