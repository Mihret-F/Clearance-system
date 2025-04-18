"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileUploader } from "@/components/dashboard/FileUploader"
import { WorkflowVisualizer } from "@/components/dashboard/WorkflowVisualizer"

interface MultiStepRequestFormProps {
  user: {
    id: string
    name: string
    type: string
    department: string
    program?: string
    position?: string
    startDate?: string
  }
  onSubmit: (data: any) => void
  onClose: () => void
}

const steps = [
  { id: 1, title: "Type", description: "Select request type" },
  { id: 2, title: "Details", description: "Add request details" },
  { id: 3, title: "Documents", description: "Upload documents" },
  { id: 4, title: "Review", description: "Review and submit" },
]

export function MultiStepRequestForm({ user, onSubmit, onClose }: MultiStepRequestFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    clearanceType: "",
    reason: "",
    description: "",
    documents: [],
  })
  const [errors, setErrors] = useState({})
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 640)

  // Check if we're on mobile when component mounts
  useState(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => setIsMobile(window.innerWidth < 640)
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  })

  const validateStep = () => {
    const newErrors = {}

    switch (currentStep) {
      case 1:
        if (!formData.clearanceType) newErrors.clearanceType = "Please select a clearance type"
        if (!formData.reason) newErrors.reason = "Please select a reason"
        break
      case 2:
        if (!formData.description) newErrors.description = "Please provide additional details"
        break
      case 3:
        if (formData.documents.length === 0) newErrors.documents = "Please upload at least one document"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(formData)
      onClose()
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-6">
      {/* Mobile Step Indicator */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">{steps[currentStep - 1].title}</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden md:block">
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center relative ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                    ? "text-success"
                    : "text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${
                    step.id === currentStep
                      ? "border-primary bg-primary/10"
                      : step.id < currentStep
                        ? "border-success bg-success/10"
                        : "border-muted"
                  }`}
                >
                  {step.id < currentStep ? <Check className="w-5 h-5" /> : <span>{step.id}</span>}
                </div>
                {step.id !== steps.length && (
                  <div
                    className={`absolute w-[calc(100%-2.5rem)] h-[2px] left-[calc(50%+1.25rem)] top-5 -z-10
                    ${step.id < currentStep ? "bg-success" : "bg-muted"}`}
                  />
                )}
              </div>
              <span className="text-sm mt-2">{step.title}</span>
              <span className="text-xs text-muted-foreground">{step.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Clearance Type</Label>
              <Select
                value={formData.clearanceType}
                onValueChange={(value) => {
                  setFormData({ ...formData, clearanceType: value })
                  setErrors({ ...errors, clearanceType: null })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clearance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="termination">Termination</SelectItem>
                  <SelectItem value="id_replacement">ID Replacement</SelectItem>
                </SelectContent>
              </Select>
              {errors.clearanceType && <p className="text-sm text-destructive">{errors.clearanceType}</p>}
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => {
                  setFormData({ ...formData, reason: value })
                  setErrors({ ...errors, reason: null })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {formData.clearanceType === "id_replacement" ? (
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
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Additional Information</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setErrors({ ...errors, description: null })
                }}
                placeholder="Provide additional details about your request..."
                className="min-h-[150px] resize-none"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <FileUploader
                onFilesSelected={(files) => {
                  setFormData({ ...formData, documents: files })
                  setErrors({ ...errors, documents: null })
                }}
              />
              {errors.documents && <p className="text-sm text-destructive">{errors.documents}</p>}
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-4 bg-muted/50">
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Clearance Type</Label>
                  <p className="text-lg font-medium">{formData.clearanceType}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Reason</Label>
                  <p className="text-lg font-medium">{formData.reason}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Additional Information</Label>
                  <p className="mt-1">{formData.description}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Documents</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.documents.map((doc, index) => (
                      <Badge key={index} variant="secondary">
                        {doc.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            <WorkflowVisualizer />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
      {/* Mobile Close Button */}
      {isMobile && (
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      )}

      {renderStepIndicator()}

      <div className="bg-card rounded-lg p-4 sm:p-6 max-h-[60vh] sm:max-h-none overflow-y-auto">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button variant="outline" onClick={currentStep === 1 ? onClose : handleBack} className="gap-2">
            {currentStep === 1 ? (
              <>Cancel</>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" /> Back
              </>
            )}
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} className="gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2">
              Submit Request
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
