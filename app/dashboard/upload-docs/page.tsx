"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Building,
  CreditCard,
  Coffee,
  BookOpen,
} from "lucide-react"

export default function UploadDocsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Sample document requests data
  const documentRequests = [
    {
      id: "req-001",
      department: "Cafeteria",
      departmentIcon: Coffee,
      documentName: "Meal Card",
      requestDate: "2024-04-01",
      dueDate: "2024-04-15",
      status: "pending",
      description: "Please submit a copy of your meal card to verify your meal plan status.",
      approver: {
        name: "John Smith",
        position: "Cafeteria Manager",
        avatar: "/placeholder.svg?height=40&width=40&text=JS",
      },
    },
    {
      id: "req-002",
      department: "Finance",
      departmentIcon: CreditCard,
      documentName: "Payment Receipt",
      requestDate: "2024-03-28",
      dueDate: "2024-04-10",
      status: "pending",
      description: "Please upload your payment receipt for the outstanding tuition balance of $250.",
      approver: {
        name: "Sarah Johnson",
        position: "Finance Officer",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      },
    },
    {
      id: "req-003",
      department: "Library",
      departmentIcon: BookOpen,
      documentName: "Library Card",
      requestDate: "2024-03-25",
      dueDate: "2024-04-08",
      status: "completed",
      description: "Please submit a copy of your library card for verification.",
      completedDate: "2024-03-30",
      approver: {
        name: "Michael Brown",
        position: "Head Librarian",
        avatar: "/placeholder.svg?height=40&width=40&text=MB",
      },
    },
    {
      id: "req-004",
      department: "Department",
      departmentIcon: Building,
      documentName: "Course Registration Form",
      requestDate: "2024-03-20",
      dueDate: "2024-04-05",
      status: "rejected",
      description: "Please submit your signed course registration form.",
      rejectionReason: "The form is missing your academic advisor's signature. Please get it signed and resubmit.",
      approver: {
        name: "Dr. Robert Wilson",
        position: "Department Head",
        avatar: "/placeholder.svg?height=40&width=40&text=RW",
      },
    },
  ]

  // Filter document requests based on search query and filter
  const filteredRequests = documentRequests.filter((request) => {
    const matchesSearch =
      request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.documentName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && request.status === "pending") ||
      (filter === "completed" && request.status === "completed") ||
      (filter === "rejected" && request.status === "rejected")

    return matchesSearch && matchesFilter
  })

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadSubmit = () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)

          // Update the request status (in a real app, this would be done via API)
          // For demo purposes, we're not actually updating the state

          // Close the modal after a short delay
          setTimeout(() => {
            setUploadModalOpen(false)
            setSelectedFile(null)
            setUploadProgress(0)
          }, 500)

          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const openUploadModal = (request) => {
    setSelectedRequest(request)
    setUploadModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "rejected":
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="container py-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Document Requests</h1>
          <p className="text-muted-foreground">Upload documents requested by departments</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Document Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Department Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <request.departmentIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{request.documentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.department} • Requested on {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">Due {new Date(request.dueDate).toLocaleDateString()}</Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-4">{request.description}</p>

                    {request.status === "rejected" && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-400">
                          <span className="font-medium">Rejection reason:</span> {request.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.approver.avatar} alt={request.approver.name} />
                          <AvatarFallback>{request.approver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{request.approver.name}</p>
                          <p className="text-xs text-muted-foreground">{request.approver.position}</p>
                        </div>
                      </div>

                      <div>
                        {request.status === "pending" && (
                          <Button onClick={() => openUploadModal(request)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Document
                          </Button>
                        )}

                        {request.status === "completed" && (
                          <Button variant="outline" className="gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Completed
                          </Button>
                        )}

                        {request.status === "rejected" && (
                          <Button onClick={() => openUploadModal(request)} className="gap-2">
                            <Upload className="h-4 w-4" />
                            Resubmit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No document requests found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery
                ? "No document requests match your search criteria"
                : filter !== "all"
                  ? `You don't have any ${filter} document requests`
                  : "You don't have any document requests at the moment"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <selectedRequest.departmentIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedRequest.documentName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRequest.department}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Document Description</Label>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              <div className="space-y-2">
                <Label>Upload Document</Label>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Drag & drop or click to upload"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : "PDF, PNG, JPG or DOCX up to 10MB"}
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadSubmit} disabled={!selectedFile || uploading}>
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
