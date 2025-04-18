"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HelpCircle, Search, Book, FileText, MessageSquare, Phone, Mail, ExternalLink, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpCenterPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const faqs = [
    {
      question: "How do I approve a clearance request?",
      answer:
        "To approve a clearance request, navigate to the 'Pending Requests' section, click on 'View Details' for the request you want to review, and then click the 'Approve' button. You'll be asked to confirm your decision before the request is approved.",
    },
    {
      question: "What happens after I reject a request?",
      answer:
        "When you reject a request, you'll be required to provide a reason for the rejection. The requester will be notified of the rejection along with your reason. They may then address the issues and resubmit the request if applicable.",
    },
    {
      question: "Can I undo an approval or rejection?",
      answer:
        "You can undo a rejection by going to the 'Rejected Requests' section, finding the request, and clicking 'Undo Rejection'. However, once a request has been approved and moved to the next department, it cannot be undone.",
    },
    {
      question: "How do I request additional documents from a requester?",
      answer:
        "When viewing a request's details, click the 'Request More Info' button. You can then specify what additional documents or information you need from the requester. They will be notified of your request.",
    },
    {
      question: "What do the different priority levels mean?",
      answer:
        "High priority (red) indicates urgent requests that require immediate attention. Medium priority (blue) is for standard requests. Low priority (gray) is for routine requests with flexible timelines.",
    },
    {
      question: "How are notifications generated?",
      answer:
        "Notifications are generated automatically when: a new request is assigned to you, a request has been pending for more than 48 hours, a request you approved moves to the next stage, or there are system announcements.",
    },
    {
      question: "Can I generate reports for specific time periods?",
      answer:
        "Yes, in the Reports section, you can select different time ranges (week, month, year) and export reports in various formats including PDF and CSV.",
    },
    {
      question: "What should I do if I'm going on leave?",
      answer:
        "Before going on leave, contact your administrator to temporarily reassign your approval responsibilities to another staff member to avoid delays in the clearance process.",
    },
  ]

  const guides = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of the Digital Clearance System",
      icon: Book,
      link: "#",
    },
    {
      title: "Approval Process Guide",
      description: "Detailed walkthrough of the approval workflow",
      icon: FileText,
      link: "#",
    },
    {
      title: "Generating Reports",
      description: "How to create and export custom reports",
      icon: FileText,
      link: "#",
    },
    {
      title: "Managing Notifications",
      description: "Configure your notification preferences",
      icon: Bell,
      link: "#",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  const filteredFaqs = searchTerm
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : faqs

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help Center</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Find answers and resources to help you use the Digital Clearance System
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for help topics..."
            className="pl-10 py-6 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Help Tabs */}
        <Tabs defaultValue="faq" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="guides">Guides & Tutorials</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Common questions about using the Digital Clearance System</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <HelpCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Try searching with different keywords or browse all FAQs
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Can't find what you're looking for?</p>
                <Button variant="outline" onClick={() => document.querySelector('[data-value="contact"]').click()}>
                  Contact Support
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Guides & Tutorials</CardTitle>
                <CardDescription>Step-by-step instructions for using the Digital Clearance System</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guides.map((guide, index) => {
                    const Icon = guide.icon
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                              <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{guide.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{guide.description}</p>
                              <a
                                href={guide.link}
                                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mt-3"
                              >
                                View Guide
                                <ExternalLink className="ml-1 h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Video Tutorials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <h4 className="font-medium">Approving Requests Tutorial</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">3:45 minutes</p>
                      </div>
                    </div>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <h4 className="font-medium">Generating Reports Tutorial</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">4:20 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Need more detailed instructions?</p>
                <Button variant="outline" onClick={() => document.querySelector('[data-value="contact"]').click()}>
                  Contact Support
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get in touch with our support team for assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Live Chat</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Chat with our support team in real-time
                          </p>
                          <Button className="mt-4">Start Chat</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          <Mail className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Email Support</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Send us an email and we'll respond within 24 hours
                          </p>
                          <a
                            href="mailto:support@dcs.edu"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mt-4"
                          >
                            <Button>Send Email</Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          <Phone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Phone Support</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Call us during business hours (9 AM - 5 PM)
                          </p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mt-2">+1 (555) 123-4567</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Submit a Ticket</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Create a support ticket for complex issues
                          </p>
                          <Button className="mt-4">Create Ticket</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Our support team is available Monday through Friday, 9 AM to 5 PM Eastern Time.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">Digital Clearance System Help Center</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                © {new Date().getFullYear()} University Name. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                Accessibility
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Add missing Play icon component
function Play(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
