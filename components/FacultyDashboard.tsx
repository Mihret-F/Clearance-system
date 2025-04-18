"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MultiStepRequestForm } from "@/components/dashboard/MultiStepRequestForm"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
}

interface FacultyDashboardProps {
  user: User
  clearanceRequests: any[]
  setClearanceRequests: (requests: any[]) => void
  onNewRequest: () => void
}

export function FacultyDashboard({
  user,
  clearanceRequests,
  setClearanceRequests,
  onNewRequest,
}: FacultyDashboardProps) {
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)

  const handleNewRequest = (data: any) => {
    const newRequest = {
      id: Date.now(),
      ...data,
      userId: user.id,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    }
    setClearanceRequests([...clearanceRequests, newRequest])
    setShowNewRequestDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Faculty Dashboard</h2>
        <Button onClick={() => setShowNewRequestDialog(true)}>New Request</Button>
      </div>

      {/* Requests Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clearanceRequests.map((request) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">{request.type}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submitted on {new Date(request.submittedAt).toLocaleDateString()}
              </p>
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${
                    request.status === "Approved"
                      ? "text-green-600"
                      : request.status === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {request.status}
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>New Clearance Request</DialogTitle>
          </DialogHeader>
          <MultiStepRequestForm
            user={user}
            onSubmit={handleNewRequest}
            onClose={() => setShowNewRequestDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FacultyDashboard
