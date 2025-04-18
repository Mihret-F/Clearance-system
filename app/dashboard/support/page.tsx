"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HelpCircle, Send, PaperclipIcon, Search, FileText } from "lucide-react"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("new")
  const [supportCategory, setSupportCategory] = useState("")
  const [supportPriority, setSupportPriority] = useState("")
  const [supportSubject, setSupportSubject] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Sample support tickets data
  const supportTickets = [
    {
      id: "TICKET-001",
      subject: "Issue with document upload",
      category: "Technical",
      priority: "High",
      status: "Open",
      createdAt: "2024-04-01T10:30:00Z",
      lastUpdated: "2024-04-02T14:15:00Z",
      messages: [
        {
          id: "msg-001",
          sender: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40&text=JD",
            role: "Student",
          },
          content:
            "I'm having trouble uploading my library clearance document. The system keeps showing an error after I select the file.",
          timestamp: "2024-04-01T10:30:00Z",
        },
        {
          id: "msg-002",
          sender: {
            name: "Support Team",
            avatar: "/placeholder.svg?height=40&width=40&text=ST",
            role: "Support Agent",
          },
          content:
            "Hello John, thank you for reaching out. Could you please provide more details about the error message you're seeing? Also, what file format are you trying to upload?",
          timestamp: "2024-04-02T14:15:00Z",
        },
      ],
    },
    {
      id: "TICKET-002",
      subject: "Question about clearance process",
      category: "Information",
      priority: "Medium",
      status: "Closed",
      createdAt: "2024-03-25T09:45:00Z",
      lastUpdated: "2024-03-27T11:20:00Z",
      closedAt: "2024-03-27T11:20:00Z",
      messages: [
        {
          id: "msg-003",
          sender: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40&text=JD",
            role: "Student",
          },
          content:
            "I'm confused about the clearance process. Do I need to visit each department in person after submitting my request online?",
          timestamp: "2024-03-25T09:45:00Z",
        },
        {
          id: "msg-004",
          sender: {
            name: "Support Team",
            avatar: "/placeholder.svg?height=40&width=40&text=ST",
            role: "Support Agent",
          },
          content:
            "Hello John, great question! No, you don't need to visit each department in person. The digital clearance system allows departments to review and approve your request online. You'll only need to visit a department if they specifically request additional information or documents that cannot be uploaded digitally.",
          timestamp: "2024-03-26T10:30:00Z",
        },
        {
          id: "msg-005",
          sender: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40&text=JD",
            role: "Student",
          },
          content: "Thank you for the clarification! That makes the process much easier.",
          timestamp: "2024-03-26T11:15:00Z",
        },
        {
          id: "msg-006",
          sender: {
            name: "Support Team",
            avatar: "/placeholder.svg?height=40&width=40&text=ST",
            role: "Support Agent",
          },
          content: "You're welcome! Is there anything else you'd like to know about the clearance process?",
          timestamp: "2024-03-27T09:45:00Z",
        },
        {
          id: "msg-007",
          sender: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40&text=JD",
            role: "Student",
          },
          content: "No, that's all I needed to know. Thank you for your help!",
          timestamp: "2024-03-27T10:30:00Z",
        },
        {
          id: "msg-008",
          sender: {
            name: "Support Team",
            avatar: "/placeholder.svg?height=40&width=40&text=ST",
            role: "Support Agent",
          },
          content:
            "Great! I'm glad I could help. I'll close this ticket now, but feel free to open a new one if you have any more questions in the future.",
          timestamp: "2024-03-27T11:20:00Z",
        },
      ],
    },
  ]

  // Filter tickets based on search query
  const filteredTickets = supportTickets.filter((ticket) => {
    return (
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleSubmitTicket = (e) => {
    e.preventDefault()

    // In a real app, you would submit the ticket to your backend here
    console.log("Submitting ticket:", {
      category: supportCategory,
      priority: supportPriority,
      subject: supportSubject,
      message: supportMessage,
    })

    // Reset form and show success message
    alert("Support ticket submitted successfully!")
    setSupportCategory("")
    setSupportPriority("")
    setSupportSubject("")
    setSupportMessage("")
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Open</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">In Progress</Badge>
      case "Closed":
        return <Badge variant="outline">Closed</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container py-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Get help with your clearance process</p>
        </div>
      </div>

      <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="new">New Support Ticket</TabsTrigger>
          <TabsTrigger value="history">Ticket History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={supportCategory} onValueChange={setSupportCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="document">Document Upload</SelectItem>
                      <SelectItem value="process">Clearance Process</SelectItem>
                      <SelectItem value="department">Department Specific</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={supportPriority} onValueChange={setSupportPriority} required>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail"
                  rows={6}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="gap-2">
                  <PaperclipIcon className="h-4 w-4" />
                  Attach Files
                </Button>
                <p className="text-xs text-muted-foreground">
                  Optional: Attach screenshots or relevant documents (max 5MB)
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How long does the support team typically take to respond?",
                  answer:
                    "Our support team aims to respond to all tickets within 24 hours during business days. High priority tickets are usually addressed within 4-6 hours.",
                },
                {
                  question: "Can I update my ticket after submission?",
                  answer:
                    "Yes, you can add additional information or attachments to your ticket at any time by viewing it in your ticket history and adding a reply.",
                },
                {
                  question: "What information should I include in my support ticket?",
                  answer:
                    "Please include as much detail as possible about your issue, including any error messages, steps to reproduce the problem, and screenshots if applicable. This helps our team resolve your issue more quickly.",
                },
              ].map((faq, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg font-medium">Your Support Tickets</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ticket.id} • {ticket.category} • {ticket.priority} Priority
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">Created: {formatDate(ticket.createdAt)}</div>
                      </div>

                      <div className="space-y-4 p-4 bg-muted rounded-lg max-h-80 overflow-y-auto">
                        {ticket.messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                              <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{message.sender.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {message.sender.role}
                                </Badge>
                                <p className="text-xs text-muted-foreground">{formatDate(message.timestamp)}</p>
                              </div>
                              <p className="text-sm mt-1">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {ticket.status !== "Closed" && (
                        <div className="flex gap-2">
                          <Input placeholder="Type your reply..." className="flex-1" />
                          <Button className="gap-2">
                            <Send className="h-4 w-4" />
                            Reply
                          </Button>
                        </div>
                      )}

                      {ticket.status === "Closed" && ticket.closedAt && (
                        <div className="text-center p-2 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            This ticket was closed on {formatDate(ticket.closedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {searchQuery
                  ? "No tickets match your search criteria"
                  : "You haven't submitted any support tickets yet"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Button onClick={() => setActiveTab("new")}>Create New Ticket</Button>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
