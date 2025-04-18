"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Import components
import Sidebar from "@/components/dashboard/Sidebar"
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import FacultyDashboard from "@/components/dashboard/FacultyDashboard"
import ApproverDashboard from "@/components/dashboard/ApproverDashboard"
import RegistrarDashboard from "@/components/dashboard/RegistrarDashboard"
import AdminDashboard from "@/components/dashboard/AdminDashboard"

// Types
interface User {
  id: number
  username: string
  role: string
  email: string
  department?: string
}

interface ClearanceRequest {
  id: number
  userId: number
  type: string
  status: string
  submittedAt: string
  updatedAt: string
  pendingDepartments: string[]
  description: string
  documents?: string[]
  approvals?: Array<{
    role: string
    status: string
    timestamp: string
    comment?: string
  }>
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [clearanceRequests, setClearanceRequests] = useState<ClearanceRequest[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(storedUser))

    // Check for dark mode preference
    if (typeof window !== "undefined") {
      const darkModePreference = localStorage.getItem("darkMode") === "true"
      setIsDarkMode(darkModePreference)
      if (darkModePreference) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", (!isDarkMode).toString())
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const renderDashboard = () => {
    const props = {
      user,
      clearanceRequests,
      setClearanceRequests,
    }

    switch (user.role) {
      case "Student":
        return <StudentDashboard {...props} />
      case "Faculty":
        return <FacultyDashboard {...props} />
      case "DepartmentHead":
      case "AcademicAdvisor":
      case "LibraryMain":
      case "LibraryTwo":
      case "LibraryThree":
      case "Cafeteria":
      case "Bookstore":
      case "CampusPolice":
      case "Finance":
      case "Dormitory":
        return <ApproverDashboard {...props} />
      case "Registrar":
        return <RegistrarDashboard {...props} />
      case "Admin":
        return <AdminDashboard {...props} />
      default:
        return <div>Unknown role</div>
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar user={user} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8"
          >
            {renderDashboard()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
