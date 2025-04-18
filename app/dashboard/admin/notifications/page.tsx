"use client"

import { useState, useEffect } from "react"
import { Bell, Search, MoreVertical, CheckCircle, Trash2, RefreshCw, AlertTriangle, Info, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample notifications data
const sampleNotifications = [
  {
    id: "notif-001",
    title: "System Update Completed",
    message: "The system has been successfully updated to version 2.4.1.",
    timestamp: "2023-05-15T10:30:00",
    type: "info",
    read: false,
    source: "System",
  },
  {
    id: "notif-002",
    title: "New User Registration",
    message: "A new user 'Emily Johnson' has registered and requires approval.",
    timestamp: "2023-05-15T09:45:00",
    type: "success",
    read: false,
    source: "User Management",
  },
  {
    id: "notif-003",
    title: "Database Backup Failed",
    message: "The scheduled database backup failed. Please check the logs for more information.",
    timestamp: "2023-05-15T08:15:00",
    type: "error",
    read: false,
    source: "Database",
  },
  {
    id: "notif-004",
    title: "High CPU Usage Detected",
    message: "The system has detected unusually high CPU usage (85%) for the past 15 minutes.",
    timestamp: "2023-05-15T07:30:00",
    type: "warning",
    read: true,
    source: "System Monitoring",
  },
  {
    id: "notif-005",
    title: "New Clearance Request",
    message: "Student 'Michael Brown' has submitted a new clearance request.",
    timestamp: "2023-05-14T16:20:00",
    type: "info",
    read: true,
    source: "Clearance System",
  },
  {
    id: "notif-006",
    title: "Role Assignment Changed",
    message: "User 'David Wilson' has been assigned the 'Department Head' role.",
    timestamp: "2023-05-14T14:10:00",
    type: "info",
    read: true,
    source: "User Management",
  },
  {
    id: "notif-007",
    title: "Multiple Failed Login Attempts",
    message: "Multiple failed login attempts detected for user 'admin' from IP 192.168.1.105.",
    timestamp: "2023-05-14T11:45:00",
    type: "warning",
    read: true,
    source: "Security",
  },
  {
    id: "notif-008",
    title: "Storage Space Low",
    message: "The system is running low on storage space (85% used). Consider freeing up space.",
    timestamp: "2023-05-14T10:30:00",
    type: "warning",
    read: true,
    source: "System",
  },
  {
    id: "notif-009",
    title: "Weekly Report Generated",
    message: "The weekly system usage report has been generated and is available for viewing.",
    timestamp: "2023-05-14T08:00:00",
    type: "success",
    read: true,
    source: "Reports",
  },
  {
    id: "notif-010",
    title: "New Feature Available",
    message: "A new feature 'Batch Approval' has been added to the clearance system.",
    timestamp: "2023-05-13T15:20:00",
    type: "info",
    read: true,
    source: "System",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const handleDelete = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      setNotifications([])
    }
  }

  // Filter notifications based on search term and active tab
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.source.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "unread") return matchesSearch && !notification.read
    if (activeTab === "read") return matchesSearch && notification.read

    return matchesSearch
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "error":
        return <X className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "error":
        return "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20"
      case "warning":
        return "border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20"
      case "success":
        return "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20"
      case "info":
      default:
        return "border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.read)}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark All as Read</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 dark:text-red-400"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search notifications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.read ? "border-gray-200 dark:border-gray-700" : getNotificationColor(notification.type)
                }`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.source} • {formatDate(notification.timestamp)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          >
                            New
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Mark as read</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(notification.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-2">{notification.message}</div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No notifications found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {searchTerm
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : activeTab === "unread"
                      ? "You have no unread notifications."
                      : "You have no notifications at this time."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
