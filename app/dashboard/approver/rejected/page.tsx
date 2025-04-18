"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, XCircle, Download, ArrowUpDown, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RejectedRequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [rejectedRequests, setRejectedRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false)
  const [sortField, setSortField] = useState("submittedAt")
  const [sortDirection, setSortDirection] = useState("desc")

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

      // Load clearance requests from localStorage
      const storedRequests = localStorage.getItem("clearanceRequests")
      let allRequests = []

      if (storedRequests) {
        allRequests = JSON.parse(storedRequests)
      }

      // Filter only rejected requests by this approver
      const rejected = allRequests.filter((req) =>
        req.approvals?.some((approval) => approval.role === userData.role && approval.status === "Rejected"),
      )

      setRejectedRequests(rejected)
      setFilteredRequests(rejected)
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("user")
      router.push("/login")
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Apply search and filter
    let filtered = rejectedRequests

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((req) => req.type === filterType)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle nested properties or special cases
      if (sortField === "userName" && (!a.userName || !b.userName)) {
        aValue = a.userId || ""
        bValue = b.userId || ""
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      // For dates
      if (sortField === "submittedAt") {
        return sortDirection === "asc" ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue)
      }

      // For numbers
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredRequests(filtered)
  }, [searchTerm, filterType, rejectedRequests, sortField, sortDirection])

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleUndoRejection = () => {
    setIsUndoDialogOpen(true)
  }

  const confirmUndoRejection = () => {
    // Get all requests
    const allRequests = JSON.parse(localStorage.getItem("clearanceRequests") || "[]")

    // Find the request to update
    const updatedRequests = allRequests.map((req) => {
      if (req.id === selectedRequest.id) {
        // Remove the rejection record
        const approvals = req.approvals.filter(
          (approval) => !(approval.role === user.role && approval.status === "Rejected"),
        )

        return {
          ...req,
          status: "Pending",
          approvals,
          currentApprover: user.role,
          rejectionReason: undefined,
        }
      }
      return req
    })

    // Update localStorage
    localStorage.setItem("clearanceRequests", JSON.stringify(updatedRequests))

    // Update UI
    const updatedRejected = updatedRequests.filter((req) =>
      req.approvals?.some((approval) => approval.role === user.role && approval.status === "Rejected"),
    )

    setRejectedRequests(updatedRejected)
    setFilteredRequests(updatedRejected)

    // Close dialogs
    setIsUndoDialogOpen(false)
    setIsDetailsOpen(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const uniqueRequestTypes = [...new Set(rejectedRequests.map((req) => req.type))]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rejected Requests</h1>
            <p className="text-gray-500 dark:text-gray-400">View all requests you have rejected</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requests..."
                className="pl-9 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueRequestTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Rejected Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No rejected requests</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You haven't rejected any requests yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        <button className="flex items-center" onClick={() => handleSort("id")}>
                          Request ID
                          {sortField === "id" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        <button className="flex items-center" onClick={() => handleSort("userName")}>
                          Requester
                          {sortField === "userName" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        <button className="flex items-center" onClick={() => handleSort("type")}>
                          Type
                          {sortField === "type" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        <button className="flex items-center" onClick={() => handleSort("submittedAt")}>
                          Submitted
                          {sortField === "submittedAt" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rejection Reason
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{request.id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${request.userName?.charAt(0) || "U"}`}
                              />
                              <AvatarFallback>{request.userName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.userName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {request.userId} • {request.userProgram}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">{request.type}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(request.submittedAt)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="max-w-xs truncate">
                            {request.approvals?.find((a) => a.role === user.role && a.status === "Rejected")?.comment ||
                              "No reason provided"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View the details of this rejected request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Request Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Request ID:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedRequest.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Submitted:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedRequest.submittedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRequest.userName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">ID:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRequest.userId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Program:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRequest.userProgram}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="mt-2 text-sm text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded Documents</h3>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedRequest.documents.map((doc, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white truncate flex-1">{doc}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Rejection */}
              {selectedRequest.approvals && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Rejection</h3>
                  {selectedRequest.approvals
                    .filter((approval) => approval.role === user.role && approval.status === "Rejected")
                    .map((approval, index) => (
                      <div
                        key={index}
                        className="mt-2 p-3 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
                      >
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">Rejected by you</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(approval.timestamp)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {approval.comment || "No reason provided"}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button variant="default" onClick={handleUndoRejection} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Undo Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Rejection Dialog */}
      <Dialog open={isUndoDialogOpen} onOpenChange={setIsUndoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undo Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo your rejection? This will move the request back to your pending queue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsUndoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUndoRejection}>Yes, Undo Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
