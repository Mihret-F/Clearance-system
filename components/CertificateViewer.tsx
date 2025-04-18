"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface CertificateViewerProps {
  request: any
  user: any
  onClose: () => void
}

export function CertificateViewer({ request, user, onClose }: CertificateViewerProps) {
  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert("Certificate downloaded successfully!")
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Digital Clearance Certificate</DialogTitle>
        </DialogHeader>
        <div className="p-8 border rounded-lg space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="flex justify-center">
              <img src="/university-logo.png" alt="University Logo" className="h-24" />
            </div>
            <h2 className="text-2xl font-bold">Digital Clearance Certificate</h2>
            <p className="text-gray-600">This is to certify that</p>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-gray-600">
              has successfully completed the clearance process for
              <br />
              <span className="font-semibold">{request.type}</span>
            </p>
            <div className="pt-8">
              <p className="text-sm text-gray-500">Certificate ID: {request.id}</p>
              <p className="text-sm text-gray-500">Date: {new Date(request.updatedAt).toLocaleDateString()}</p>
            </div>
          </motion.div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload}>Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
