"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ApproverDashboard from "@/components/dashboard/ApproverDashboard"

export default function ApproverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [clearanceRequests, setClearanceRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === "undefined") return

    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(storedUser)

      // Check if user is an approver
      if (userData.role !== "DepartmentHead" && userData.role !== "Approver") {
        router.push("/dashboard/requester")
        return
      }

      setUser(userData)

      // Load clearance requests from localStorage or use sample data
      const storedRequests = localStorage.getItem("clearanceRequests")
      if (storedRequests) {
        setClearanceRequests(JSON.parse(storedRequests))
      } else {
        // Sample data
        const sampleRequests = [
          {
            id: "req-001",
            type: "Graduation Clearance",
            userId: "STU12345",
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Library", "Finance", "Registrar"],
            documents: ["Transcript.pdf", "ID Card.jpg", "Fee Receipt.pdf"],
            description: "Graduation clearance request for Computer Science department",
            priority: 2,
          },
          {
            id: "req-002",
            type: "Transfer Clearance",
            userId: "STU54321",
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Library", "Finance", "Registrar"],
            documents: ["Transfer Form.pdf", "ID Card.jpg"],
            description: "Transfer to Engineering department",
            priority: 1,
          },
          {
            id: "req-003",
            type: "Library Clearance",
            userId: "FAC98765",
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Library"],
            documents: ["Library Card.jpg"],
            description: "Faculty library clearance",
            priority: 3,
          },
          {
            id: "req-004",
            type: "Graduation Clearance",
            userId: "STU11111",
            submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Approved",
            approvals: [
              {
                role: "DepartmentHead",
                status: "Approved",
                timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                comment: "All requirements met.",
              },
            ],
            currentApprover: "Library",
            approvalChain: ["DepartmentHead", "Library", "Finance", "Registrar"],
            documents: ["Transcript.pdf", "ID Card.jpg", "Fee Receipt.pdf"],
            description: "Graduation clearance request for Mathematics department",
          },
          {
            id: "req-005",
            type: "Leave Clearance",
            userId: "STU22222",
            submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Rejected",
            approvals: [
              {
                role: "DepartmentHead",
                status: "Rejected",
                timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                comment: "Incomplete documentation. Please provide medical certificate.",
              },
            ],
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Registrar"],
            documents: ["Leave Application.pdf"],
            description: "Medical leave request",
          },
        ]

        setClearanceRequests(sampleRequests)
        localStorage.setItem("clearanceRequests", JSON.stringify(sampleRequests))
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("user")
      router.push("/login")
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleClearanceRequestsUpdate = (updatedRequests) => {
    setClearanceRequests(updatedRequests)
    localStorage.setItem("clearanceRequests", JSON.stringify(updatedRequests))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ApproverDashboard
      user={user}
      clearanceRequests={clearanceRequests}
      setClearanceRequests={handleClearanceRequestsUpdate}
    />
  )
}
