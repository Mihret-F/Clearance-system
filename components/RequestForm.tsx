"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileUploader } from "./FileUploader"
import { WorkflowVisualizer } from "./WorkflowVisualizer"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// Define the approval workflows for different scenarios
const approvalWorkflows = {
  // Student Termination (Post Graduate, Extension)
  termination_pg_extension: [
    "Academic Advisor",
    "Department Head",
    "Dormitory Head",
    "Library (A) Chief of Circulation",
    "Library (B) Chief of Circulation (Main)",
    "Library (C)",
    "Post Graduate Dean",
    "Registrar",
  ],

  // ID Card Replacement (Post Graduate, Regular)
  id_replacement_pg_regular: [
    "Academic Advisor",
    "Library (A) Chief of Circulation",
    "Library (B)",
    "Main Library",
    "Book Store",
    "Campus Police",
    "Dormitory Head",
    "Students' Cafeteria Head",
    "Finance Office",
    "Registrar",
  ],

  // Student Termination (Post Graduate, Regular)
  termination_pg_regular: [
    "Academic Advisor",
    "Department Head",
    "Library (A) Chief of Circulation",
    "Library (B) Chief of Circulation (Main)",
    "Library (C)",
    "Post Graduate Dean",
    "Students' Cafeteria Head",
    "Students' Dormitory Head",
    "Registrar",
  ],

  // ID Card Replacement (Post Graduate, Extension)
  id_replacement_pg_extension: [
    "Academic Advisor",
    "Continuing Education",
    "Library (A) Chief of Circulation",
    "Library (B)",
    "Main Library",
    "Book Store",
    "Campus Police",
    "Finance Office",
    "Registrar",
  ],

  // ID Card Replacement (Regular student)
  id_replacement_regular: [
    "Academic Advisor",
    "Department Head",
    "Library (A) Chief of Circulation",
    "Library (B)",
    "Main Library",
    "Book Store",
    "Campus Police",
    "Dormitory Head",
    "Students' Cafeteria Head",
    "Registrar",
  ],

  // ID Card Replacement (Summer)
  id_replacement_summer: [
    "Academic Advisor",
    "Continuing Education",
    "Library (A) Chief of Circulation",
    "Library (B)",
    "Main Library",
    "Campus Police",
    "Dormitory Head",
    "Students' Cafeteria Head",
    "Finance Office",
    "Registrar",
  ],

  // Student Termination (Summer)
  termination_summer: [
    "Academic Advisor",
    "Department Head",
    "Students' Dormitory Head",
    "Library (A) Chief of Circulation",
    "Library (B) Chief of Circulation (Main)",
    "Students' Cafeteria Head",
    "Registrar",
  ],
}

interface RequestFormProps {
  user: {
    id: string
    name: string
    type: string // 'regular', 'postgraduate', 'summer', 'extension'
    department: string
    program?: string
    startDate?: string
    position?: string
  }
  onSubmit: (data: any) => void
}

export function RequestForm({ user, onSubmit }: RequestFormProps) {
  const [formData, setFormData] = useState({
    clearanceType: "",
    description: "",
    documents: [],
    reason: "",
  })
  const [workflow, setWorkflow] = useState([])
  const [showPreview, setShowPreview] = useState(false)

  // Fix the type checking
  const getClearanceTypes = () => {
    if (user?.type === "faculty") {
      return [
        { value: "sabbatical", label: "Sabbatical Leave" },
        { value: "teachingAbroad", label: "Teaching Abroad" },
        { value: "resignation", label: "Resignation" },
      ]
    }

    // For students - handle undefined type
    const userType = user?.type || "regular"
    const types = []

    if (userType.includes("postgraduate")) {
      if (userType.includes("extension")) {
        types.push(
          { value: "termination_pg_extension", label: "Termination (Post Graduate, Extension)" },
          { value: "id_replacement_pg_extension", label: "ID Card Replacement (Post Graduate, Extension)" },
        )
      } else {
        types.push(
          { value: "termination_pg_regular", label: "Termination (Post Graduate, Regular)" },
          { value: "id_replacement_pg_regular", label: "ID Card Replacement (Post Graduate, Regular)" },
        )
      }
    } else if (userType.includes("summer")) {
      types.push(
        { value: "termination_summer", label: "Termination (Summer)" },
        { value: "id_replacement_summer", label: "ID Card Replacement (Summer)" },
      )
    } else {
      // Regular students
      types.push(
        { value: "termination_regular", label: "Termination (Regular)" },
        { value: "id_replacement_regular", label: "ID Card Replacement (Regular)" },
      )
    }
    return types
  }

  const handleClearanceTypeChange = (value: string) => {
    setFormData({ ...formData, clearanceType: value })
    setWorkflow(approvalWorkflows[value] || [])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPreview(true)
  }

  const confirmSubmit = () => {
    onSubmit({
      ...formData,
      workflow,
      userId: user.id,
      submittedAt: new Date().toISOString(),
    })
    setShowPreview(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto-filled User Information */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Full Name</Label>
              <Input value={user?.name || ""} disabled className="bg-gray-50 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <Label>ID Number</Label>
              <Input value={user.id} disabled className="bg-gray-50 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={user.department} disabled className="bg-gray-50 text-gray-900 dark:text-gray-100" />
            </div>
            {user.type === "faculty" ? (
              <>
                <div>
                  <Label>Position</Label>
                  <Input value={user.position} disabled className="bg-gray-50 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input value={user.startDate} disabled className="bg-gray-50 text-gray-900 dark:text-gray-100" />
                </div>
              </>
            ) : (
              <div>
                <Label>Program</Label>
                <Input value={user.program} disabled className="bg-gray-50 text-gray-900 dark:text-gray-100" />
              </div>
            )}
          </div>
        </Card>

        {/* Clearance Type Selection */}
        <div className="space-y-2">
          <Label>Clearance Type</Label>
          <Select value={formData.clearanceType} onValueChange={handleClearanceTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select clearance type" />
            </SelectTrigger>
            <SelectContent>
              {getClearanceTypes().map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason</Label>
          <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              {formData.clearanceType.includes("id_replacement") ? (
                <>
                  <SelectItem value="lost">Lost ID Card</SelectItem>
                  <SelectItem value="damaged">Damaged ID Card</SelectItem>
                  <SelectItem value="expired">Expired ID Card</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="personal">Personal Reasons</SelectItem>
                  <SelectItem value="academic">Academic Reasons</SelectItem>
                  <SelectItem value="financial">Financial Reasons</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Additional Information</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide additional details about your request..."
            className="min-h-[100px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
          />
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <Label>Supporting Documents</Label>
          <FileUploader onFilesSelected={(files) => setFormData({ ...formData, documents: files })} />
        </div>

        {/* Workflow Preview */}
        {workflow.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <Label>Approval Workflow</Label>
            <WorkflowVisualizer steps={workflow} currentStep={-1} />
          </motion.div>
        )}

        <Button type="submit" className="w-full">
          Preview Request
        </Button>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Your Request</DialogTitle>
            <DialogDescription>Please review your clearance request details before submitting.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Clearance Type</Label>
              <div className="font-medium">
                {getClearanceTypes().find((t) => t.value === formData.clearanceType)?.label}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Reason</Label>
              <div className="font-medium">{formData.reason}</div>
            </div>

            <div className="grid gap-2">
              <Label>Additional Information</Label>
              <div className="text-sm">{formData.description}</div>
            </div>

            <div className="grid gap-2">
              <Label>Documents</Label>
              <div className="flex flex-wrap gap-2">
                {formData.documents.map((doc, index) => (
                  <Badge key={index} variant="secondary">
                    {doc.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Approval Workflow</Label>
              <WorkflowVisualizer steps={workflow} currentStep={-1} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Edit
              </Button>
              <Button onClick={confirmSubmit}>Submit Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
