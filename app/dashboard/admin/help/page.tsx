"use client"

import { useState } from "react"
import {
  Search,
  HelpCircle,
  Book,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  ExternalLink,
  Users,
  Shield,
  Activity,
  Database,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample FAQs
const faqs = [
  {
    question: "How do I add a new user to the system?",
    answer:
      "To add a new user, navigate to User Management in the admin dashboard. Click the 'Add User' button and fill in the required information. You can assign roles and permissions during this process. Once completed, the user will receive an email with login instructions.",
  },
  {
    question: "How do I assign roles to users?",
    answer:
      "To assign roles to users, go to the Role Assignment page in the admin dashboard. Find the user you want to modify, click the edit button, and select the appropriate role from the dropdown menu. You can also assign multiple roles if needed. Don't forget to save your changes when finished.",
  },
  {
    question: "How do I monitor system performance?",
    answer:
      "System performance can be monitored through the System Monitoring page. This dashboard provides real-time metrics on CPU usage, memory utilization, disk space, and network traffic. You can also view active users and recent system events. For more detailed analysis, check the Reports section.",
  },
  {
    question: "How do I backup the database?",
    answer:
      "To backup the database, navigate to the Database Management page and click the 'Backup Now' button. You can also schedule automated backups by configuring the backup schedule. All backups are stored securely and can be downloaded or restored if needed.",
  },
  {
    question: "What should I do if a user forgets their password?",
    answer:
      "If a user forgets their password, you can reset it from the User Management page. Find the user, click the edit button, and select 'Reset Password'. The system will send an email to the user with instructions to create a new password. Alternatively, users can use the 'Forgot Password' link on the login page.",
  },
  {
    question: "How do I view system logs?",
    answer:
      "System logs can be accessed from the System Monitoring page. Click on the 'Logs' tab to view detailed information about system activities, errors, and warnings. You can filter logs by date, severity, or source to find specific information.",
  },
  {
    question: "Can I customize notification settings?",
    answer:
      "Yes, notification settings can be customized in the Settings page. You can choose which events trigger notifications and how they are delivered (email, in-app, or both). You can also set up notification rules for specific user roles.",
  },
  {
    question: "How do I generate reports?",
    answer:
      "Reports can be generated from the Reports section. Select the type of report you want to create, specify the date range and other parameters, then click 'Generate'. Reports can be viewed online, downloaded as PDF or CSV, or scheduled for regular delivery via email.",
  },
  {
    question: "What should I do if I encounter a system error?",
    answer:
      "If you encounter a system error, first check the System Monitoring page for any alerts or warnings. If the issue persists, contact technical support with details about the error, including any error messages and the steps that led to the error. For critical issues, use the emergency contact information provided in the Help section.",
  },
]

// Sample guides
const guides = [
  {
    title: "User Management Guide",
    description: "Learn how to add, edit, and manage users in the system",
    icon: Users,
    link: "#",
  },
  {
    title: "Role Assignment Guide",
    description: "Understand how to create and assign roles with appropriate permissions",
    icon: Shield,
    link: "#",
  },
  {
    title: "System Monitoring Guide",
    description: "Monitor system performance and troubleshoot issues",
    icon: Activity,
    link: "#",
  },
  {
    title: "Database Management Guide",
    description: "Learn how to backup, restore, and optimize the database",
    icon: Database,
    link: "#",
  },
  {
    title: "Notification System Guide",
    description: "Configure and manage system notifications",
    icon: Bell,
    link: "#",
  },
  {
    title: "Report Generation Guide",
    description: "Create and schedule custom reports",
    icon: FileText,
    link: "#",
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Help Center</h1>
      </div>

      <Tabs defaultValue="faqs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4 mt-4">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No FAQs found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Try adjusting your search to find what you're looking for.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Guides</CardTitle>
              <CardDescription>Detailed guides to help you manage the system effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((guide, index) => {
                  const Icon = guide.icon
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-base">{guide.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{guide.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Guide
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">techsupport@university.edu</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Phone</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">+1 (555) 123-4567</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Live Chat</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Available 9 AM - 5 PM (Mon-Fri)
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Contact Technical Support</Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Administrative Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">admin@university.edu</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Phone</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">+1 (555) 987-6543</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Book className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">Office Hours</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">8 AM - 4 PM (Mon-Fri)</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Contact Administrative Support</Button>
                    </CardFooter>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Support Ticket</CardTitle>
                    <CardDescription>
                      Fill out the form below to submit a support ticket and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Name
                          </label>
                          <Input id="name" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input id="email" type="email" placeholder="Your email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject
                        </label>
                        <Input id="subject" placeholder="Brief description of your issue" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          className="w-full min-h-[100px] rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          placeholder="Describe your issue in detail"
                        ></textarea>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Submit Ticket</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
