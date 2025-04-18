"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Activity,
  Server,
  HardDrive,
  Wifi,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function SystemMonitoringPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)

  // Sample data for system monitoring
  const systemMetrics = {
    cpu: 42,
    memory: 68,
    disk: 54,
    network: 24,
  }

  const serviceStatus = [
    { name: "Web Server", status: "Operational", uptime: "99.98%" },
    { name: "Database Server", status: "Operational", uptime: "99.95%" },
    { name: "Authentication Service", status: "Operational", uptime: "99.99%" },
    { name: "Email Service", status: "Degraded", uptime: "98.75%" },
    { name: "Storage Service", status: "Operational", uptime: "99.97%" },
    { name: "Backup Service", status: "Operational", uptime: "99.90%" },
  ]

  const systemEvents = [
    {
      id: 1,
      type: "Error",
      message: "Database connection timeout",
      timestamp: "2023-11-05T10:30:00Z",
      service: "Database",
    },
    {
      id: 2,
      type: "Warning",
      message: "High CPU usage detected",
      timestamp: "2023-11-05T11:15:00Z",
      service: "Web Server",
    },
    {
      id: 3,
      type: "Info",
      message: "Scheduled backup completed",
      timestamp: "2023-11-05T12:00:00Z",
      service: "Backup",
    },
    { id: 4, type: "Error", message: "Email delivery failed", timestamp: "2023-11-05T12:45:00Z", service: "Email" },
    { id: 5, type: "Info", message: "System update installed", timestamp: "2023-11-05T13:30:00Z", service: "System" },
    {
      id: 6,
      type: "Warning",
      message: "Low disk space on storage server",
      timestamp: "2023-11-05T14:15:00Z",
      service: "Storage",
    },
    {
      id: 7,
      type: "Info",
      message: "New user registered",
      timestamp: "2023-11-05T15:00:00Z",
      service: "Authentication",
    },
    {
      id: 8,
      type: "Error",
      message: "API rate limit exceeded",
      timestamp: "2023-11-05T15:45:00Z",
      service: "Web Server",
    },
  ]

  const performanceData = [
    { time: "00:00", cpu: 25, memory: 45, network: 10 },
    { time: "03:00", cpu: 20, memory: 42, network: 8 },
    { time: "06:00", cpu: 15, memory: 40, network: 5 },
    { time: "09:00", cpu: 35, memory: 50, network: 15 },
    { time: "12:00", cpu: 55, memory: 65, network: 20 },
    { time: "15:00", cpu: 45, memory: 60, network: 18 },
    { time: "18:00", cpu: 40, memory: 55, network: 15 },
    { time: "21:00", cpu: 30, memory: 50, network: 12 },
  ]

  // Simulate refreshing data
  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.cpu}%</div>
                <Progress value={systemMetrics.cpu} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.memory}%</div>
                <Progress value={systemMetrics.memory} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.disk}%</div>
                <Progress value={systemMetrics.disk} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Usage</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.network} Mbps</div>
                <Progress value={systemMetrics.network} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>24-hour performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" />
                    <Line type="monotone" dataKey="network" stroke="#8b5cf6" name="Network (Mbps)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Last 24 Hours
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Current status of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceStatus.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            service.status === "Operational"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : service.status === "Degraded"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{service.uptime}</TableCell>
                      <TableCell>Just now</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="ml-auto">
                View Service Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>Recent system events and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.type === "Error" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : event.type === "Warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span
                            className={
                              event.type === "Error"
                                ? "text-red-600 dark:text-red-400"
                                : event.type === "Warning"
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                            }
                          >
                            {event.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{event.message}</TableCell>
                      <TableCell>{event.service}</TableCell>
                      <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                View All Logs
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
