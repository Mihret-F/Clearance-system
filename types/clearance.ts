export interface ClearanceDocument {
  name: string
  size: number
  type?: string
  uploadedAt?: string
}

export interface ClearanceRequest {
  id: string | number
  userId: string | number
  type: string
  status: "Pending" | "Approved" | "Rejected" | "Documents Requested"
  submittedAt: string
  currentApprover: string
  workflow: string[]
  currentStep: number
  rejectedStep?: number
  rejectionReason?: string
  documents: ClearanceDocument[]
  comments?: string
}

export interface UserData {
  id: string
  name: string
  fathersName?: string
  program?: string
  programType?: "Regular" | "Extension" | "Summer" | "Evening"
  academicCategory?: "Undergraduate" | "Masters" | "PhD"
  year?: number
  department?: string
  advisor?: string
  enrollmentDate?: string
  expectedGraduationDate?: string
  position?: string
  startDate?: string
  tenure?: string
  specialization?: string
  officeLocation?: string
}
