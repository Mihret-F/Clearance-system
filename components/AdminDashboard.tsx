"use client"

import { useEffect } from "react"
import { useState } from "react"
import {
  Home,
  Users,
  Shield,
  Activity,
  Settings,
  ArrowUpRight,
  Bell,
  Database,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  HardDrive,
  Wifi,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAdminStore } from "@/lib/store"
import { useRouter } from "next/navigation"

// Import the user management and role assignment components
import UserManagementContent from "@/components/dashboard/UserManagementContent"
import RoleAssignmentContent from "@/components/dashboard/RoleAssignmentContent"

interface AdminDashboardProps {
  user: {
    id: string
    username: string
    role: string
    name?: string
    isFirstLogin?: boolean
    email?: string
  }
}

// Dashboard component
export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  // Get data from the store
  const { users, roles, systemMetrics } = useAdminStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Navigate to full page when clicking "View All"
  const navigateToFullPage = (page) => {
    router.push(`/dashboard/admin/${page}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="h-12 w-12 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading dashboard...</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Please wait while we fetch your data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}. Here's an overview of your system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <Bell className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="inline sm:hidden">3</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{systemMetrics.userChangePercent}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeRequests}</div>
            <p className="text-xs text-muted-foreground">+{systemMetrics.requestChangePercent}% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">+{systemMetrics.healthChangePercent}% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.databaseSize} GB</div>
            <p className="text-xs text-muted-foreground">+{systemMetrics.databaseChangeSize} GB from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* System Resources */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Current resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <span className="text-sm">42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <span className="text-sm">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Disk Usage</span>
                    </div>
                    <span className="text-sm">54%</span>
                  </div>
                  <Progress value={54} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Network</span>
                    </div>
                    <span className="text-sm">12 Mbps</span>
                  </div>
                  <Progress value={24} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigateToFullPage("monitoring")}>
                  View Details
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${i}`} />
                        <AvatarFallback>{i}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {
                            ["User login", "Role updated", "Database backup", "System update", "New user registered"][
                              i - 1
                            ]
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {
                            [
                              "John Doe logged in from 192.168.1.1",
                              "Admin role permissions updated by System Admin",
                              "Automatic database backup completed successfully",
                              "System updated to version 2.4.1",
                              "New student user registered: Sarah Johnson",
                            ][i - 1]
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">{`${i * 10} minutes ago`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>

            {/* Request Status */}
            <Card>
              <CardHeader>
                <CardTitle>Request Status</CardTitle>
                <CardDescription>Current clearance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-2xl font-bold">42</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rejected</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Requests
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab Content */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button size="sm" onClick={() => navigateToFullPage("users")}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View Full Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserManagementContent />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab Content */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Role Assignment</CardTitle>
                <Button size="sm" onClick={() => navigateToFullPage("roles")}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View Full Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RoleAssignmentContent />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab Content */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>System Logs</CardTitle>
                <Button size="sm" onClick={() => navigateToFullPage("monitoring")}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View Full Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="bg-muted px-4 py-2 font-mono text-sm">System logs will appear here</div>
                  <div className="p-4 font-mono text-sm">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-b border-gray-100 dark:border-gray-800 py-2 last:border-0">
                        <span className="text-gray-500">
                          [{new Date().toISOString().slice(0, 19).replace("T", " ")}]
                        </span>{" "}
                        <span
                          className={`font-semibold ${
                            i % 3 === 0 ? "text-red-500" : i % 3 === 1 ? "text-yellow-500" : "text-green-500"
                          }`}
                        >
                          {i % 3 === 0 ? "ERROR" : i % 3 === 1 ? "WARNING" : "INFO"}
                        </span>{" "}
                        <span>
                          {
                            [
                              "Failed login attempt from IP 192.168.1.100",
                              "Database connection pool reaching capacity",
                              "User session expired for user_id: 12345",
                              "System backup completed successfully",
                              "New user registered: john.doe@example.com",
                              "Role permissions updated for role_id: 3",
                              "File upload failed: file size exceeds limit",
                              "API rate limit reached for endpoint /api/users",
                              "Cache cleared successfully",
                              "Scheduled maintenance starting in 30 minutes",
                            ][i]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab Content */}
        <TabsContent value="settings">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>System Settings</CardTitle>
                <Button size="sm" onClick={() => navigateToFullPage("settings")}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View Full Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Email Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">SMTP Server</span>
                        <span className="text-sm font-medium">smtp.university.edu</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Email From</span>
                        <span className="text-sm font-medium">noreply@university.edu</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Two-Factor Auth</span>
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Password Policy</span>
                        <span className="text-sm font-medium">Strong</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
