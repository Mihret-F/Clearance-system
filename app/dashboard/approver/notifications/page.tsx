"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle, XCircle, FileText, Clock, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

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

      // Load or generate notifications
      const storedNotifications = localStorage.getItem("approverNotifications")

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications))
      } else {
        // Generate sample notifications
        const sampleNotifications = [
          {
            id: "notif-001",
            type: "request_assigned",
            title: "New Request Assigned",
            message: "A new graduation clearance request has been assigned to you.",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
            requestId: "req-001",
            priority: "high",
          },
          {
            id: "notif-002",
            type: "request_reminder",
            title: "Request Pending for 48 Hours",
            message: "A transfer clearance request has been pending for more than 48 hours.",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            requestId: "req-002",
            priority: "medium",
          },
          {
            id: "notif-003",
            type: "system_message",
            title: "System Maintenance",
            message: "The system will be undergoing maintenance tonight from 2 AM to 4 AM.",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            priority: "low",
          },
          {
            id: "notif-004",
            type: "request_update",
            title: "Request Approved by Next Department",
            message: "A request you approved has been approved by the Library department.",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            requestId: "req-004",
            priority: "low",
          },
          {
            id: "notif-005",
            type: "request_rejected",
            title: "Request Rejected by Next Department",
            message: "A request you approved has been rejected by the Finance department.",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            requestId: "req-004",
            priority: "high",
          },
        ]

        setNotifications(sampleNotifications)
        localStorage.setItem("approverNotifications", JSON.stringify(sampleNotifications))
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

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif,
    )

    setNotifications(updatedNotifications)
    localStorage.setItem("approverNotifications", JSON.stringify(updatedNotifications))
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }))

    setNotifications(updatedNotifications)
    localStorage.setItem("approverNotifications", JSON.stringify(updatedNotifications))
  }

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id)

    // Navigate to relevant page if there's a requestId
    if (notification.requestId) {
      if (notification.type === "request_assigned") {
        router.push("/dashboard/approver/pending")
      } else if (notification.type === "request_update" || notification.type === "request_rejected") {
        router.push("/dashboard/approver/approved")
      }
    }
  }

  const getFilteredNotifications = () => {
    if (activeTab === "all") {
      return notifications
    } else if (activeTab === "unread") {
      return notifications.filter((notif) => !notif.read)
    } else if (activeTab === "high_priority") {
      return notifications.filter((notif) => notif.priority === "high")
    }
    return notifications
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
  }

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case "request_assigned":
        return <FileText className={`h-5 w-5 ${priority === "high" ? "text-red-500" : "text-blue-500"}`} />
      case "request_reminder":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "system_message":
        return <Info className="h-5 w-5 text-gray-500" />
      case "request_update":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "request_rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400">Stay updated with system alerts and request updates</p>
          </div>

          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark All as Read
            </Button>
          </div>
        </div>

        {/* Notification Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="high_priority">
              High Priority ({notifications.filter((n) => n.priority === "high").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You're all caught up! Check back later for new notifications.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read
                            ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20"
                        } cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 p-2 rounded-full ${
                              notification.priority === "high"
                                ? "bg-red-100 dark:bg-red-900/20"
                                : notification.priority === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900/20"
                                  : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4
                                className={`text-sm font-medium ${
                                  notification.read
                                    ? "text-gray-900 dark:text-white"
                                    : "text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    New
                                  </span>
                                )}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(notification.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                            {notification.requestId && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Request ID: {notification.requestId}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Unread Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No unread notifications</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You've read all your notifications. Great job staying on top of things!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 cursor-pointer transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 p-2 rounded-full ${
                              notification.priority === "high"
                                ? "bg-red-100 dark:bg-red-900/20"
                                : notification.priority === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900/20"
                                  : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {notification.title}
                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  New
                                </span>
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(notification.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                            {notification.requestId && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Request ID: {notification.requestId}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="high_priority" className="mt-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>High Priority Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      No high priority notifications
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      You don't have any high priority notifications at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read
                            ? "bg-red-50 dark:bg-red-900/5 border-red-100 dark:border-red-900/10"
                            : "bg-red-100 dark:bg-red-900/10 border-red-200 dark:border-red-900/20"
                        } cursor-pointer transition-colors hover:bg-red-100 dark:hover:bg-red-900/20`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-2 rounded-full bg-red-200 dark:bg-red-900/30">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4
                                className={`text-sm font-medium ${
                                  notification.read
                                    ? "text-red-700 dark:text-red-400"
                                    : "text-red-800 dark:text-red-500"
                                }`}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    New
                                  </span>
                                )}
                              </h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(notification.timestamp)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                            {notification.requestId && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs border-red-200 dark:border-red-900/20">
                                  Request ID: {notification.requestId}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">Digital Clearance System - Approver Portal</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                © {new Date().getFullYear()} University Name. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                Help
              </Button>
              <Button variant="ghost" size="sm">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
