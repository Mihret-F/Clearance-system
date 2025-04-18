"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, PieChart, Download, FileText, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chart, ChartContainer } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts"

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")
  const [reportType, setReportType] = useState("all")

  // Sample data for charts
  const [approvalData, setApprovalData] = useState([
    { name: "Week 1", approved: 12, rejected: 3, pending: 5 },
    { name: "Week 2", approved: 19, rejected: 4, pending: 7 },
    { name: "Week 3", approved: 15, rejected: 2, pending: 3 },
    { name: "Week 4", approved: 21, rejected: 5, pending: 8 },
  ])

  const [requestTypeData, setRequestTypeData] = useState([
    { name: "Graduation", value: 45 },
    { name: "Transfer", value: 25 },
    { name: "ID Card", value: 15 },
    { name: "Leave", value: 10 },
    { name: "Other", value: 5 },
  ])

  const [processingTimeData, setProcessingTimeData] = useState([
    { name: "Jan", time: 2.3 },
    { name: "Feb", time: 2.1 },
    { name: "Mar", time: 1.8 },
    { name: "Apr", time: 2.4 },
    { name: "May", time: 1.9 },
    { name: "Jun", time: 1.7 },
    { name: "Jul", time: 1.5 },
    { name: "Aug", time: 1.6 },
    { name: "Sep", time: 1.4 },
    { name: "Oct", time: 1.3 },
    { name: "Nov", time: 1.2 },
    { name: "Dec", time: 1.1 },
  ])

  const [recentRequests, setRecentRequests] = useState([
    { id: "REQ-001", type: "Graduation", status: "Approved", date: "2023-11-15", user: "John Smith" },
    { id: "REQ-002", type: "Transfer", status: "Rejected", date: "2023-11-14", user: "Emily Johnson" },
    { id: "REQ-003", type: "ID Card", status: "Approved", date: "2023-11-13", user: "Michael Brown" },
    { id: "REQ-004", type: "Leave", status: "Pending", date: "2023-11-12", user: "Sarah Williams" },
    { id: "REQ-005", type: "Graduation", status: "Approved", date: "2023-11-11", user: "David Lee" },
  ])

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
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("user")
      router.push("/login")
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  // Update chart data based on time range
  useEffect(() => {
    if (timeRange === "week") {
      setApprovalData([
        { name: "Mon", approved: 5, rejected: 1, pending: 2 },
        { name: "Tue", approved: 7, rejected: 2, pending: 3 },
        { name: "Wed", approved: 4, rejected: 1, pending: 1 },
        { name: "Thu", approved: 6, rejected: 0, pending: 2 },
        { name: "Fri", approved: 8, rejected: 1, pending: 3 },
        { name: "Sat", approved: 3, rejected: 0, pending: 1 },
        { name: "Sun", approved: 2, rejected: 0, pending: 0 },
      ])
    } else if (timeRange === "month") {
      setApprovalData([
        { name: "Week 1", approved: 12, rejected: 3, pending: 5 },
        { name: "Week 2", approved: 19, rejected: 4, pending: 7 },
        { name: "Week 3", approved: 15, rejected: 2, pending: 3 },
        { name: "Week 4", approved: 21, rejected: 5, pending: 8 },
      ])
    } else if (timeRange === "year") {
      setApprovalData([
        { name: "Jan", approved: 45, rejected: 10, pending: 15 },
        { name: "Feb", approved: 38, rejected: 8, pending: 12 },
        { name: "Mar", approved: 52, rejected: 12, pending: 18 },
        { name: "Apr", approved: 41, rejected: 9, pending: 14 },
        { name: "May", approved: 47, rejected: 11, pending: 16 },
        { name: "Jun", approved: 53, rejected: 13, pending: 19 },
        { name: "Jul", approved: 49, rejected: 10, pending: 17 },
        { name: "Aug", approved: 55, rejected: 14, pending: 20 },
        { name: "Sep", approved: 51, rejected: 12, pending: 18 },
        { name: "Oct", approved: 48, rejected: 11, pending: 16 },
        { name: "Nov", approved: 43, rejected: 9, pending: 15 },
        { name: "Dec", approved: 39, rejected: 8, pending: 13 },
      ])
    }
  }, [timeRange])

  const handleExportPDF = () => {
    alert("Exporting report as PDF...")
    // In a real implementation, this would generate and download a PDF
  }

  const handleExportCSV = () => {
    alert("Exporting report as CSV...")
    // In a real implementation, this would generate and download a CSV
  }

  const handlePrint = () => {
    window.print()
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400">View and analyze clearance request data</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="export">Export Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {approvalData.reduce((sum, item) => sum + item.approved + item.rejected + item.pending, 0)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "This Year"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(
                      (approvalData.reduce((sum, item) => sum + item.approved, 0) /
                        approvalData.reduce((sum, item) => sum + item.approved + item.rejected, 0)) *
                        100,
                    )}
                    %
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "This Year"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Avg. Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {processingTimeData.reduce((sum, item) => sum + item.time, 0) / processingTimeData.length}
                    <span className="text-lg ml-1">days</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "This Year"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Approval Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Status</CardTitle>
                <CardDescription>Breakdown of approved, rejected, and pending requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={{}}>
                    <Chart>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={approvalData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="approved" name="Approved" fill="#4ade80" />
                          <Bar dataKey="rejected" name="Rejected" fill="#f87171" />
                          <Bar dataKey="pending" name="Pending" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Chart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Request Types Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Types</CardTitle>
                  <CardDescription>Distribution of request types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer config={{}}>
                      <Chart>
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={requestTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {requestTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </Chart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Time Trend</CardTitle>
                  <CardDescription>Average processing time in days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ChartContainer config={{}}>
                      <Chart>
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart
                            data={processingTimeData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="time"
                              name="Processing Time (days)"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </Chart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Latest requests processed by you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Request ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((request, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{request.id}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{request.type}</td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{request.user}</td>
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{request.date}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                request.status === "Approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : request.status === "Rejected"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Analysis Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Request Analysis</CardTitle>
                <CardDescription>In-depth analysis of request patterns and processing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Request Volume by Department</h3>
                      <div className="h-64">
                        <ChartContainer config={{}}>
                          <Chart>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "Computer Science", value: 45 },
                                  { name: "Business", value: 38 },
                                  { name: "Engineering", value: 52 },
                                  { name: "Arts", value: 27 },
                                  { name: "Medicine", value: 33 },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" name="Requests" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Chart>
                        </ChartContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Processing Time by Request Type</h3>
                      <div className="h-64">
                        <ChartContainer config={{}}>
                          <Chart>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "Graduation", value: 2.3 },
                                  { name: "Transfer", value: 1.8 },
                                  { name: "ID Card", value: 1.2 },
                                  { name: "Leave", value: 1.5 },
                                  { name: "Other", value: 1.9 },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" name="Days" fill="#82ca9d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Chart>
                        </ChartContainer>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Approval Rate Trend</h3>
                    <div className="h-64">
                      <ChartContainer config={{}}>
                        <Chart>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={[
                                { name: "Jan", rate: 85 },
                                { name: "Feb", rate: 83 },
                                { name: "Mar", rate: 87 },
                                { name: "Apr", rate: 89 },
                                { name: "May", rate: 86 },
                                { name: "Jun", rate: 88 },
                                { name: "Jul", rate: 90 },
                                { name: "Aug", rate: 92 },
                                { name: "Sep", rate: 91 },
                                { name: "Oct", rate: 93 },
                                { name: "Nov", rate: 94 },
                                { name: "Dec", rate: 95 },
                              ]}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[80, 100]} />
                              <Tooltip />
                              <Line type="monotone" dataKey="rate" name="Approval Rate (%)" stroke="#8884d8" />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </Chart>
                      </ChartContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Top Rejection Reasons</h3>
                      <div className="h-64">
                        <ChartContainer config={{}}>
                          <Chart>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={[
                                  { name: "Incomplete Documentation", value: 45 },
                                  { name: "Unpaid Fees", value: 32 },
                                  { name: "Missing Signatures", value: 28 },
                                  { name: "Incorrect Information", value: 21 },
                                  { name: "Other", value: 14 },
                                ]}
                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" />
                                <Tooltip />
                                <Bar dataKey="value" name="Count" fill="#ff8042" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Chart>
                        </ChartContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Request Volume by Time of Day</h3>
                      <div className="h-64">
                        <ChartContainer config={{}}>
                          <Chart>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "8-10 AM", value: 28 },
                                  { name: "10-12 PM", value: 35 },
                                  { name: "12-2 PM", value: 22 },
                                  { name: "2-4 PM", value: 38 },
                                  { name: "4-6 PM", value: 25 },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" name="Requests" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Chart>
                        </ChartContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Reports Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>Generate and download reports in various formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <FileText className="h-12 w-12 text-blue-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Monthly Summary</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Complete summary of all requests processed this month
                        </p>
                        <Button onClick={handleExportPDF} className="w-full">
                          Export as PDF
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <BarChart3 className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Performance Report</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Detailed analysis of your approval performance
                        </p>
                        <Button onClick={handleExportPDF} className="w-full">
                          Export as PDF
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <PieChart className="h-12 w-12 text-purple-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Request Analytics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Breakdown of request types and approval rates
                        </p>
                        <Button onClick={handleExportPDF} className="w-full">
                          Export as PDF
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Custom Report</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Report Type
                        </label>
                        <Select value={reportType} onValueChange={setReportType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Requests</SelectItem>
                            <SelectItem value="approved">Approved Requests</SelectItem>
                            <SelectItem value="rejected">Rejected Requests</SelectItem>
                            <SelectItem value="pending">Pending Requests</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time Period
                        </label>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-6">
                      <Button onClick={handleExportPDF} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Export as PDF
                      </Button>
                      <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export as CSV
                      </Button>
                      <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
