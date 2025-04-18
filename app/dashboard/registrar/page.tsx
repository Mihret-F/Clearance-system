"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegistrarDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user || !user.role) {
      router.push("/login")
      return
    }

    // Check if user is registrar
    if (user.role !== "Registrar") {
      router.push("/login")
    }
  }, [router])

  // ... rest of the dashboard component
}
