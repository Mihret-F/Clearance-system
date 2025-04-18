"use client"

import { useState } from "react"
import { AlertCircle, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUploader } from "./FileUploader"

interface RejectionDetails {
  department: string
  reason: string
  requiredDocuments?: string[]
}

interface RejectionHandlerProps {
  isOpen: boolean
  onClose: () => void
  rejectionDetails: RejectionDetails | null
  onResubmit: (files: File[]) => void
}

export function RejectionHandler({ isOpen, onClose, rejectionDetails, onResubmit }: RejectionHandlerProps) {
  const [files, setFiles] = useState<File[]>([])

  const handleResubmit = () => {
    onResubmit(files)
    onClose()
  }

  // Don't render if there are no rejection details
  if (!rejectionDetails) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Request Rejected
          </DialogTitle>
          <DialogDescription>
            Your request was rejected by {rejectionDetails.department}. Please provide the required documents to
            continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">Reason for rejection: {rejectionDetails.reason}</p>
          </div>

          {rejectionDetails.requiredDocuments && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Required Documents:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {rejectionDetails.requiredDocuments.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          <FileUploader onFilesSelected={setFiles} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleResubmit} disabled={files.length === 0} className="gap-2">
              <Upload className="h-4 w-4" />
              Resubmit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
