"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MultiStepRequestForm } from "@/components/dashboard/MultiStepRequestForm"
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Bell,
  Upload,
  FileCheck,
  HelpCircle,
  Calendar,
  ChevronRight,
  FileText,
  Download,
  Activity,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  studentId?: string
  program?: string
  yearOfStudy?: number
  academicCategory?: string
  advisor?: string
}

interface StudentDashboardProps {
  user: User
  clearanceRequests: any[]
  setClearanceRequests: (requests: any[]) => void
  onNewRequest: () => void
}

export function StudentDashboard({
  user,
  clearanceRequests,
  setClearanceRequests,
  onNewRequest,
}: StudentDashboardProps) {
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

  // Calculate statistics
  const stats = {
    pending: clearanceRequests.filter((r) => r.status === "Pending").length,
    approved: clearanceRequests.filter((r) => r.status === "Approved").length,
    rejected: clearanceRequests.filter((r) => r.status === "Rejected").length,
    active: clearanceRequests.filter((r) => r.status !== "Completed").length,
    completed: clearanceRequests.filter((r) => r.status === "Completed").length,
    notifications: 3,
  }

  // Sample deadlines data
  const deadlines = [
    {
      id: 1,
      title: "Graduation Clearance Deadline",
      date: "May 15, 2024",
      daysLeft: 14,
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      icon: Calendar,
    },
    {
      id: 2,
      title: "Library Returns Deadline",
      date: "May 10, 2024",
      daysLeft: 9,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      icon: Calendar,
    },
    {
      id: 3,
      title: "Hostel Checkout",
      date: "May 20, 2024",
      daysLeft: 19,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      icon: Calendar,
    },
  ]

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: "Request Approved",
      message: "Your ID replacement request has been approved by the Department Head.",
      date: "2 hours ago",
    },
    {
      id: 2,
      title: "Document Required",
      message: "Please upload your payment receipt for the library clearance.",
      date: "Yesterday",
    },
  ]

  // Sample pending documents
  const pendingDocuments = [
    {
      id: 1,
      title: "Payment Receipt",
      department: "Finance Office",
      dueDate: "May 5, 2024",
    },
    {
      id: 2,
      title: "Library Card",
      department: "Main Library",
      dueDate: "May 8, 2024",
    },
  ]

  return (
    <div className="space-y-6 max-w-full">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground">Track and manage your clearance requests</p>
        </div>
        <Button onClick={() => setShowNewRequestDialog(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
            <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm font-medium">New Request</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2">
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium">Upload Docs</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-2">
            <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm font-medium">Check Status</span>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
            <HelpCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="text-sm font-medium">Get Support</span>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold">{stats.rejected}</p>
          </div>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card className="overflow-hidden">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto p-0 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="pending"
              className="py-3 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Pending Documents
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="py-3 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Recent Notifications
            </TabsTrigger>
            <TabsTrigger
              value="deadlines"
              className="py-3 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
            >
              Upcoming Deadlines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="p-4 space-y-4 m-0">
            {pendingDocuments.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground">{doc.department}</p>
                </div>
                <Badge variant="outline">Due {doc.dueDate}</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notifications" className="p-4 space-y-4 m-0">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="deadlines" className="p-4 space-y-4 m-0">
            {deadlines.map((deadline) => (
              <div key={deadline.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className={`p-2 rounded-md ${deadline.color} flex-shrink-0`}>
                  <deadline.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{deadline.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {deadline.date} <span className="text-xs">({deadline.daysLeft} days left)</span>
                  </p>
                </div>
              </div>
            ))}
            <Link href="/dashboard/calendar" className="text-sm text-primary flex items-center gap-1">
              View Full Calendar <ChevronRight className="h-4 w-4" />
            </Link>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Clearance Certificate */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Clearance Certificate</h3>
          <Badge>Pending Completion</Badge>
        </div>

        <div className="flex flex-col items-center text-center p-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">Complete Your Clearance</h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Your clearance certificate will be available for download once all departments have approved your clearance
            requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button className="gap-2">
              <Activity className="h-4 w-4" />
              Track Progress
            </Button>
          </div>
        </div>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Clearance Request</DialogTitle>
          </DialogHeader>
          <MultiStepRequestForm
            user={user}
            onSubmit={(data) => {
              setClearanceRequests([
                ...clearanceRequests,
                {
                  id: Date.now(),
                  ...data,
                  status: "Pending",
                  submittedAt: new Date().toISOString(),
                },
              ])
              setShowNewRequestDialog(false)
            }}
            onClose={() => setShowNewRequestDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentDashboard
