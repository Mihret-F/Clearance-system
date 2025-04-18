"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, CheckCircle, XCircle, AlertCircle, Download, Clock } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PendingRequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isRequestInfoDialogOpen, setIsRequestInfoDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [requestedDocuments, setRequestedDocuments] = useState("")
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

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

      // Load clearance requests from localStorage or use sample data
      const storedRequests = localStorage.getItem("clearanceRequests")
      let allRequests = []

      if (storedRequests) {
        allRequests = JSON.parse(storedRequests)
      } else {
        // Sample data
        allRequests = [
          {
            id: "req-001",
            type: "Graduation Clearance",
            userId: "STU12345",
            userName: "John Smith",
            userProgram: "Computer Science",
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Library", "Finance", "Registrar"],
            documents: ["Transcript.pdf", "ID Card.jpg", "Fee Receipt.pdf"],
            description: "Graduation clearance request for Computer Science department",
            priority: 2,
          },
          {
            id: "req-002",
            type: "Transfer Clearance",
            userId: "STU54321",
            userName: "Emily Johnson",
            userProgram: "Business Administration",
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Library", "Finance", "Registrar"],
            documents: ["Transfer Form.pdf", "ID Card.jpg"],
            description: "Transfer to Engineering department",
            priority: 1,
          },
          {
            id: "req-003",
            type: "Library Clearance",
            userId: "FAC98765",
            userName: "Dr. Robert Chen",
            userProgram: "Faculty - Physics",
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Library"],
            documents: ["Library Card.jpg"],
            description: "Faculty library clearance",
            priority: 3,
          },
          {
            id: "req-004",
            type: "Graduation Clearance",
            userId: "STU11111",
            userName: "Michael Brown",
            userProgram: "Mathematics",
            submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Approved",
            approvals: [
              {
                role: "DepartmentHead",
                status: "Approved",
                timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                comment: "All requirements met.",
              },
            ],
            currentApprover: "Library",
            approvalChain: ["DepartmentHead", "Library", "Finance", "Registrar"],
            documents: ["Transcript.pdf", "ID Card.jpg", "Fee Receipt.pdf"],
            description: "Graduation clearance request for Mathematics department",
          },
          {
            id: "req-005",
            type: "Leave Clearance",
            userId: "STU22222",
            userName: "Sarah Williams",
            userProgram: "Psychology",
            submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Rejected",
            approvals: [
              {
                role: "DepartmentHead",
                status: "Rejected",
                timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                comment: "Incomplete documentation. Please provide medical certificate.",
              },
            ],
            currentApprover: "DepartmentHead",
            approvalChain: ["DepartmentHead", "Registrar"],
            documents: ["Leave Application.pdf"],
            description: "Medical leave request",
          },
        ]

        localStorage.setItem("clearanceRequests", JSON.stringify(allRequests))
      }

      // Filter only pending requests for this approver
      const pending = allRequests.filter((req) => req.status === "Pending" && req.currentApprover === userData.role)

      setPendingRequests(pending)
      setFilteredRequests(pending)
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
    let filtered = pendingRequests

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

    setFilteredRequests(filtered)
  }, [searchTerm, filterType, pendingRequests])

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const handleApprove = () => {
    setIsApproveDialogOpen(true)
  }

  const handleReject = () => {
    setIsRejectDialogOpen(true)
  }

  const handleRequestInfo = () => {
    setIsRequestInfoDialogOpen(true)
  }

  const confirmApprove = () => {
    // Get all requests
    const allRequests = JSON.parse(localStorage.getItem("clearanceRequests") || "[]")

    // Find the request to update
    const updatedRequests = allRequests.map((req) => {
      if (req.id === selectedRequest.id) {
        // Get the current approver index
        const currentIndex = req.approvalChain.indexOf(req.currentApprover)

        // Add approval record
        const approvals = req.approvals || []
        approvals.push({
          role: user.role,
          status: "Approved",
          timestamp: new Date().toISOString(),
          comment: "Approved",
        })

        // If this is the last approver in the chain
        if (currentIndex === req.approvalChain.length - 1) {
          return {
            ...req,
            status: "Completed",
            approvals,
            currentApprover: "None",
          }
        } else {
          // Move to next approver
          return {
            ...req,
            status: "Pending",
            approvals,
            currentApprover: req.approvalChain[currentIndex + 1],
          }
        }
      }
      return req
    })

    // Update localStorage
    localStorage.setItem("clearanceRequests", JSON.stringify(updatedRequests))

    // Update UI
    const updatedPending = updatedRequests.filter(
      (req) => req.status === "Pending" && req.currentApprover === user.role,
    )

    setPendingRequests(updatedPending)
    setFilteredRequests(updatedPending)

    // Close dialogs
    setIsApproveDialogOpen(false)
    setIsDetailsOpen(false)

    // Show success message
    setSuccessMessage("Request approved successfully!")
    setShowSuccessAlert(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessAlert(false)
    }, 3000)
  }

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      return // Require a reason
    }

    // Get all requests
    const allRequests = JSON.parse(localStorage.getItem("clearanceRequests") || "[]")

    // Find the request to update
    const updatedRequests = allRequests.map((req) => {
      if (req.id === selectedRequest.id) {
        // Add rejection record
        const approvals = req.approvals || []
        approvals.push({
          role: user.role,
          status: "Rejected",
          timestamp: new Date().toISOString(),
          comment: rejectionReason,
        })

        return {
          ...req,
          status: "Rejected",
          approvals,
          rejectionReason,
        }
      }
      return req
    })

    // Update localStorage
    localStorage.setItem("clearanceRequests", JSON.stringify(updatedRequests))

    // Update UI
    const updatedPending = updatedRequests.filter(
      (req) => req.status === "Pending" && req.currentApprover === user.role,
    )

    setPendingRequests(updatedPending)
    setFilteredRequests(updatedPending)

    // Reset form
    setRejectionReason("")

    // Close dialogs
    setIsRejectDialogOpen(false)
    setIsDetailsOpen(false)

    // Show success message
    setSuccessMessage("Request rejected successfully!")
    setShowSuccessAlert(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessAlert(false)
    }, 3000)
  }

  const confirmRequestInfo = () => {
    if (!requestedDocuments.trim()) {
      return // Require requested documents
    }

    // Get all requests
    const allRequests = JSON.parse(localStorage.getItem("clearanceRequests") || "[]")

    // Find the request to update
    const updatedRequests = allRequests.map((req) => {
      if (req.id === selectedRequest.id) {
        // Add info request record
        const approvals = req.approvals || []
        approvals.push({
          role: user.role,
          status: "Info Requested",
          timestamp: new Date().toISOString(),
          comment: requestedDocuments,
        })

        return {
          ...req,
          status: "Info Requested",
          approvals,
          requestedDocuments,
        }
      }
      return req
    })

    // Update localStorage
    localStorage.setItem("clearanceRequests", JSON.stringify(updatedRequests))

    // Update UI
    const updatedPending = updatedRequests.filter(
      (req) => req.status === "Pending" && req.currentApprover === user.role,
    )

    setPendingRequests(updatedPending)
    setFilteredRequests(updatedPending)

    // Reset form
    setRequestedDocuments("")

    // Close dialogs
    setIsRequestInfoDialogOpen(false)
    setIsDetailsOpen(false)

    // Show success message
    setSuccessMessage("Additional information requested successfully!")
    setShowSuccessAlert(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessAlert(false)
    }, 3000)
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

  const uniqueRequestTypes = [...new Set(pendingRequests.map((req) => req.type))]

  // Add footer to the page
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Requests</h1>
            <p className="text-gray-500 dark:text-gray-400">Review and process pending clearance requests</p>
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

        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Requests Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No pending requests</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  You have processed all pending requests. Check back later for new requests.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Request ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Requester
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                        Priority
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
                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              request.priority === 1 ? "destructive" : request.priority === 2 ? "default" : "secondary"
                            }
                          >
                            {request.priority === 1 ? "High" : request.priority === 2 ? "Medium" : "Low"}
                          </Badge>
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
            <DialogDescription>Review the request details and take appropriate action</DialogDescription>
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
                      <Badge
                        variant={
                          selectedRequest.status === "Pending"
                            ? "outline"
                            : selectedRequest.status === "Approved"
                              ? "success"
                              : "destructive"
                        }
                      >
                        {selectedRequest.status}
                      </Badge>
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

              {/* Approval Chain */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Workflow</h3>
                <div className="mt-2 flex items-center space-x-2 overflow-x-auto py-2">
                  {selectedRequest.approvalChain.map((approver, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`flex flex-col items-center ${
                          approver === selectedRequest.currentApprover
                            ? "text-blue-600 dark:text-blue-400"
                            : selectedRequest.approvals?.some((a) => a.role === approver && a.status === "Approved")
                              ? "text-green-600 dark:text-green-400"
                              : selectedRequest.approvals?.some((a) => a.role === approver && a.status === "Rejected")
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            approver === selectedRequest.currentApprover
                              ? "bg-blue-100 dark:bg-blue-900/20"
                              : selectedRequest.approvals?.some((a) => a.role === approver && a.status === "Approved")
                                ? "bg-green-100 dark:bg-green-900/20"
                                : selectedRequest.approvals?.some((a) => a.role === approver && a.status === "Rejected")
                                  ? "bg-red-100 dark:bg-red-900/20"
                                  : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          {approver === selectedRequest.currentApprover ? (
                            <Clock className="h-4 w-4" />
                          ) : selectedRequest.approvals?.some((a) => a.role === approver && a.status === "Approved") ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : selectedRequest.approvals?.some((a) => a.role === approver && a.status === "Rejected") ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                          )}
                        </div>
                        <span className="text-xs mt-1 whitespace-nowrap">{approver}</span>
                      </div>
                      {index < selectedRequest.approvalChain.length - 1 && (
                        <div className="h-px w-8 bg-gray-200 dark:bg-gray-700 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Approvals/Rejections */}
              {selectedRequest.approvals && selectedRequest.approvals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous Actions</h3>
                  <div className="mt-2 space-y-3">
                    {selectedRequest.approvals.map((approval, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${
                          approval.status === "Approved"
                            ? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20"
                            : approval.status === "Rejected"
                              ? "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
                              : "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{approval.role}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(approval.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          {approval.status === "Approved" ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : approval.status === "Rejected" ? (
                            <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
                          )}
                          <span
                            className={`text-sm ${
                              approval.status === "Approved"
                                ? "text-green-600 dark:text-green-400"
                                : approval.status === "Rejected"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {approval.status}
                          </span>
                        </div>
                        {approval.comment && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{approval.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleRequestInfo}>
              Request More Info
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
            <Button onClick={handleApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>Yes, Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be shared with the requester.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request More Info Dialog */}
      <Dialog open={isRequestInfoDialogOpen} onOpenChange={setIsRequestInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
            <DialogDescription>
              Specify what additional documents or information you need from the requester.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Specify required documents or information..."
              value={requestedDocuments}
              onChange={(e) => setRequestedDocuments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsRequestInfoDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={confirmRequestInfo} disabled={!requestedDocuments.trim()}>
              Send Request
            </Button>
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
