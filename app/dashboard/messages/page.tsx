"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send, PaperclipIcon, User, Building, CreditCard, BookOpen, MessageSquare } from "lucide-react"

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState(null)
  const [messageText, setMessageText] = useState("")

  // Sample contacts data
  const contacts = [
    {
      id: "contact-001",
      name: "Library Department",
      avatar: "/placeholder.svg?height=40&width=40&text=LD",
      role: "Department",
      icon: BookOpen,
      lastMessage: "Please submit your library clearance form by next week.",
      lastMessageTime: "2024-04-02T14:15:00Z",
      unread: true,
    },
    {
      id: "contact-002",
      name: "Finance Office",
      avatar: "/placeholder.svg?height=40&width=40&text=FO",
      role: "Department",
      icon: CreditCard,
      lastMessage: "Your payment has been received. Thank you!",
      lastMessageTime: "2024-04-01T10:30:00Z",
      unread: false,
    },
    {
      id: "contact-003",
      name: "Dr. Robert Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=RW",
      role: "Department Head",
      icon: User,
      lastMessage: "I've approved your department clearance request.",
      lastMessageTime: "2024-03-30T16:45:00Z",
      unread: false,
    },
    {
      id: "contact-004",
      name: "Hostel Administration",
      avatar: "/placeholder.svg?height=40&width=40&text=HA",
      role: "Department",
      icon: Building,
      lastMessage: "Please schedule a room inspection before checkout.",
      lastMessageTime: "2024-03-28T09:20:00Z",
      unread: false,
    },
  ]

  // Sample messages data
  const messageThreads = {
    "contact-001": [
      {
        id: "msg-001",
        sender: "contact",
        content: "Hello! This is the Library Department. We noticed you have a pending clearance request.",
        timestamp: "2024-04-01T10:30:00Z",
      },
      {
        id: "msg-002",
        sender: "user",
        content: "Yes, I submitted it last week. Is there anything else I need to do?",
        timestamp: "2024-04-01T10:35:00Z",
      },
      {
        id: "msg-003",
        sender: "contact",
        content:
          "Please submit your library clearance form by next week. You can upload it through the system or bring it to our office.",
        timestamp: "2024-04-02T14:15:00Z",
      },
    ],
    "contact-002": [
      {
        id: "msg-004",
        sender: "user",
        content: "I just made a payment for my outstanding balance. Can you confirm if it was received?",
        timestamp: "2024-03-31T15:20:00Z",
      },
      {
        id: "msg-005",
        sender: "contact",
        content: "Your payment has been received. Thank you!",
        timestamp: "2024-04-01T10:30:00Z",
      },
    ],
    "contact-003": [
      {
        id: "msg-006",
        sender: "user",
        content:
          "Hello Dr. Wilson, I submitted my department clearance request last week. Could you please review it when you have time?",
        timestamp: "2024-03-29T11:45:00Z",
      },
      {
        id: "msg-007",
        sender: "contact",
        content: "I'll take a look at it today.",
        timestamp: "2024-03-30T09:30:00Z",
      },
      {
        id: "msg-008",
        sender: "contact",
        content: "I've approved your department clearance request.",
        timestamp: "2024-03-30T16:45:00Z",
      },
      {
        id: "msg-009",
        sender: "user",
        content: "Thank you very much!",
        timestamp: "2024-03-30T17:00:00Z",
      },
    ],
    "contact-004": [
      {
        id: "msg-010",
        sender: "contact",
        content: "Please schedule a room inspection before checkout.",
        timestamp: "2024-03-28T09:20:00Z",
      },
    ],
  }

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact) return

    // In a real app, you would send the message to your backend here
    console.log("Sending message to", selectedContact, ":", messageText)

    // Reset the message input
    setMessageText("")
  }

  return (
    <div className="container py-6 max-w-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        <div className="flex flex-col md:flex-row gap-6 flex-1 h-[calc(100%-3rem)] min-h-0">
          {/* Contacts List */}
          <Card className="w-full md:w-80 flex-shrink-0 flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      className={`w-full p-3 flex items-start gap-3 hover:bg-muted transition-colors ${
                        selectedContact?.id === contact.id ? "bg-muted" : ""
                      } ${contact.unread ? "font-medium" : ""}`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center">
                          <p className="truncate">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(contact.lastMessageTime)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                        <p className="text-sm truncate mt-1">{contact.lastMessage}</p>
                      </div>
                      {contact.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>}
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No contacts found</p>
                </div>
              )}
            </div>
          </Card>

          {/* Message Thread */}
          <Card className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Contact Header */}
                <div className="p-3 border-b flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedContact.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedContact.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messageThreads[selectedContact.id]?.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "contact" && (
                        <div className="flex items-start gap-2 max-w-[80%]">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</p>
                          </div>
                        </div>
                      )}

                      {message.sender === "user" && (
                        <div className="flex items-start gap-2 max-w-[80%]">
                          <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-primary-foreground/70 mt-1">{formatTime(message.timestamp)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <PaperclipIcon className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-10 resize-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button size="icon" className="flex-shrink-0" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a contact from the list to view your conversation history
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
