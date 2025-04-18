"use client"

import { useState, useEffect } from "react"
import { Database, Search, Download, Upload, RefreshCw, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample database tables
const databaseTables = [
  { name: "users", rows: 1532, size: "2.4 MB", lastUpdated: "2023-05-15T10:30:00" },
  { name: "clearance_requests", rows: 4215, size: "8.7 MB", lastUpdated: "2023-05-15T14:45:00" },
  { name: "departments", rows: 28, size: "0.3 MB", lastUpdated: "2023-04-20T09:15:00" },
  { name: "roles", rows: 12, size: "0.1 MB", lastUpdated: "2023-04-10T16:20:00" },
  { name: "permissions", rows: 45, size: "0.2 MB", lastUpdated: "2023-04-10T16:25:00" },
  { name: "documents", rows: 8742, size: "156.8 MB", lastUpdated: "2023-05-15T15:10:00" },
  { name: "notifications", rows: 12458, size: "18.3 MB", lastUpdated: "2023-05-15T15:30:00" },
  { name: "audit_logs", rows: 28745, size: "42.6 MB", lastUpdated: "2023-05-15T15:35:00" },
  { name: "settings", rows: 35, size: "0.2 MB", lastUpdated: "2023-05-01T11:10:00" },
  { name: "workflows", rows: 18, size: "0.4 MB", lastUpdated: "2023-04-25T13:25:00" },
]

// Sample backup history
const backupHistory = [
  {
    id: "bkp-001",
    timestamp: "2023-05-15T00:00:00",
    size: "230.5 MB",
    type: "Automated",
    status: "Completed",
    duration: "4m 12s",
  },
  {
    id: "bkp-002",
    timestamp: "2023-05-14T00:00:00",
    size: "228.7 MB",
    type: "Automated",
    status: "Completed",
    duration: "4m 5s",
  },
  {
    id: "bkp-003",
    timestamp: "2023-05-13T00:00:00",
    size: "227.2 MB",
    type: "Automated",
    status: "Completed",
    duration: "4m 3s",
  },
  {
    id: "bkp-004",
    timestamp: "2023-05-12T00:00:00",
    size: "226.8 MB",
    type: "Automated",
    status: "Completed",
    duration: "4m 1s",
  },
  {
    id: "bkp-005",
    timestamp: "2023-05-11T12:30:00",
    size: "225.9 MB",
    type: "Manual",
    status: "Completed",
    duration: "3m 58s",
  },
]

// Sample database metrics
const databaseMetrics = {
  size: {
    total: 230.5,
    used: 229.2,
    free: 1.3,
  },
  performance: {
    queries: 1245,
    avgResponseTime: 42, // ms
    slowQueries: 3,
  },
  connections: {
    current: 18,
    max: 100,
  },
}

export default function DatabaseManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [backupInProgress, setBackupInProgress] = useState(false)

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

  const handleBackup = () => {
    setBackupInProgress(true)
    setTimeout(() => {
      setBackupInProgress(false)
    }, 3000)
  }

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

  // Filter tables based on search term
  const filteredTables = databaseTables.filter((table) => table.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
        <h1 className="text-2xl font-bold tracking-tight">Database Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button className="flex items-center gap-2" onClick={handleBackup} disabled={backupInProgress}>
            <Download className="h-4 w-4" />
            <span>{backupInProgress ? "Backing up..." : "Backup Now"}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.size.total} MB</div>
                <Progress value={(databaseMetrics.size.used / databaseMetrics.size.total) * 100} className="h-2 mt-2" />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>Used: {databaseMetrics.size.used} MB</div>
                  <div>Free: {databaseMetrics.size.free} MB</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.performance.avgResponseTime} ms</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Average response time</div>
                <div className="flex justify-between mt-2 text-xs">
                  <div className="text-gray-500 dark:text-gray-400">
                    Queries: {databaseMetrics.performance.queries}/min
                  </div>
                  <div className="text-amber-500">Slow queries: {databaseMetrics.performance.slowQueries}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databaseMetrics.connections.current}</div>
                <Progress
                  value={(databaseMetrics.connections.current / databaseMetrics.connections.max) * 100}
                  className="h-2 mt-2"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div>Current: {databaseMetrics.connections.current}</div>
                  <div>Max: {databaseMetrics.connections.max}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Summary</CardTitle>
              <CardDescription>Overview of database tables and records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Tables</div>
                    <div className="text-3xl font-bold">{databaseTables.length}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Records</div>
                    <div className="text-3xl font-bold">
                      {databaseTables.reduce((acc, table) => acc + table.rows, 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-sm font-medium mb-2">Largest Tables</div>
                  <div className="space-y-2">
                    {databaseTables
                      .sort((a, b) => Number.parseFloat(b.size) - Number.parseFloat(a.size))
                      .slice(0, 3)
                      .map((table) => (
                        <div key={table.name} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-gray-500" />
                            <span>{table.name}</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">{table.size}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Backups</CardTitle>
              <CardDescription>Last 3 database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupHistory.slice(0, 3).map((backup) => (
                  <div key={backup.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">{backup.type} Backup</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(backup.timestamp)} • {backup.size}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{backup.duration}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">
                View all backups
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>All tables in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search tables..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Name</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell className="text-right">{table.rows.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{table.size}</TableCell>
                        <TableCell className="text-right">{formatDate(table.lastUpdated)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTables.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No tables found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>History of database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupHistory.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.id}</TableCell>
                        <TableCell>{formatDate(backup.timestamp)}</TableCell>
                        <TableCell>{backup.type}</TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>{backup.duration}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {backup.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">Showing {backupHistory.length} backups</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  <span>Restore</span>
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup Schedule</CardTitle>
              <CardDescription>Configure automated database backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Daily Backup</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Every day at 12:00 AM</div>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Weekly Backup</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Every Sunday at 2:00 AM</div>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Monthly Backup</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">1st day of each month at 3:00 AM</div>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Edit Schedule</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
