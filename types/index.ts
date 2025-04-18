export type AcademicCategory = "Undergraduate" | "Masters" | "PhD" | "Summer" | "Extension"
export type ProgramType = "Regular" | "Extension" | "Summer"
export type UserRole =
  | "Student"
  | "Faculty"
  | "DepartmentHead"
  | "AcademicAdvisor"
  | "LibraryMain"
  | "LibraryTwo"
  | "LibraryThree"
  | "Cafeteria"
  | "Bookstore"
  | "CampusPolice"
  | "Finance"
  | "Dormitory"
  | "Registrar"
  | "Admin"

export interface BaseUser {
  id: number
  username: string
  password: string
  role: UserRole
  email: string
  name: string
  department: string
  isFirstLogin: boolean
  lastLogin?: string
  contactNumber?: string
}

export interface Student extends BaseUser {
  role: "Student"
  studentId: string
  academicCategory: AcademicCategory
  programType: ProgramType
  yearOfStudy: number
  program: string
  advisor: string
  enrollmentDate: string
  expectedGraduationDate?: string
  gpa?: number
  financialStatus: "Clear" | "Pending" | "Hold"
}

export interface Faculty extends BaseUser {
  role: "Faculty"
  facultyId: string
  position: string
  startDate: string
  tenure: string
  specialization: string
  officeLocation: string
}

export interface ClearanceRequest {
  id: number
  userId: number
  type: string
  status: "Pending" | "Approved" | "Rejected" | "Documents Requested"
  submittedAt: string
  updatedAt: string
  description: string
  reason: string
  documents: string[]
  approvalChain: string[]
  currentApprover: string
  approvals: Array<{
    role: string
    status: string
    timestamp: string
    comment?: string
  }>
  rejections?: Array<{
    role: string
    reason: string
    requiredDocuments?: string[]
    timestamp: string
  }>
}

export interface WorkflowStep {
  role: string
  order: number
  required: boolean
  documents?: string[]
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  applicableToCategories: AcademicCategory[]
  applicableToProgramTypes: ProgramType[]
}
