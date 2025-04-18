"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HelpPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the support page
    router.push("/dashboard/support")
  }, [router])

  return null
}
