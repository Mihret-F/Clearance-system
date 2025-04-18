import type { Workflow } from "@/types"

export const workflows: Workflow[] = [
  {
    id: "termination_pg_extension",
    name: "Student Termination (Postgraduate, Extension)",
    description: "Clearance workflow for postgraduate extension students terminating their studies",
    steps: [
      { role: "AcademicAdvisor", order: 1, required: true },
      { role: "DepartmentHead", order: 2, required: true },
      { role: "Dormitory", order: 3, required: true },
      { role: "LibraryMain", order: 4, required: true },
      { role: "LibraryTwo", order: 5, required: true },
      { role: "LibraryThree", order: 6, required: true },
      { role: "PostgraduateDean", order: 7, required: true },
      { role: "Registrar", order: 8, required: true },
    ],
    applicableToCategories: ["Masters", "PhD"],
    applicableToProgramTypes: ["Extension"],
  },
  {
    id: "id_replacement_pg_regular",
    name: "ID Card Replacement (Postgraduate, Regular)",
    description: "Workflow for regular postgraduate students requesting ID card replacement",
    steps: [
      { role: "AcademicAdvisor", order: 1, required: true },
      { role: "LibraryMain", order: 2, required: true },
      { role: "LibraryTwo", order: 3, required: true },
      { role: "LibraryThree", order: 4, required: true },
      { role: "Bookstore", order: 5, required: true },
      { role: "CampusPolice", order: 6, required: true },
      { role: "Dormitory", order: 7, required: true },
      { role: "Cafeteria", order: 8, required: true },
      { role: "Finance", order: 9, required: true },
      { role: "Registrar", order: 10, required: true },
    ],
    applicableToCategories: ["Masters", "PhD"],
    applicableToProgramTypes: ["Regular"],
  },
  // Add more workflows based on the table...
]

export function getWorkflow(academicCategory: string, programType: string, requestType: string): Workflow | undefined {
  return workflows.find(
    (workflow) =>
      workflow.applicableToCategories.includes(academicCategory as any) &&
      workflow.applicableToProgramTypes.includes(programType as any) &&
      workflow.id.includes(requestType.toLowerCase()),
  )
}
