"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useAdminStore } from "@/lib/store"
import { Save, Mail, Shield, Database, Layout, HardDrive } from "lucide-react"

const generalFormSchema = z.object({
  systemName: z.string().min(2, {
    message: "System name must be at least 2 characters.",
  }),
  universityName: z.string().min(2, {
    message: "University name must be at least 2 characters.",
  }),
  logoUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  maintenanceMode: z.boolean().default(false),
  defaultLanguage: z.string(),
  sessionTimeout: z.number().min(5).max(120),
})

const emailFormSchema = z.object({
  smtpServer: z.string().min(2, {
    message: "SMTP server must be at least 2 characters.",
  }),
  smtpPort: z.string().regex(/^\d+$/, {
    message: "Port must be a number.",
  }),
  smtpUsername: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  smtpPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  senderEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  senderName: z.string().min(2, {
    message: "Sender name must be at least 2 characters.",
  }),
  enableEmailNotifications: z.boolean().default(true),
})

const securityFormSchema = z.object({
  passwordMinLength: z.number().min(6).max(20),
  passwordExpiration: z.number().min(0).max(365),
  maxLoginAttempts: z.number().min(3).max(10),
  twoFactorAuth: z.boolean().default(false),
  ipRestriction: z.boolean().default(false),
  allowedIPs: z.string().optional(),
})

const backupFormSchema = z.object({
  autoBackup: z.boolean().default(true),
  backupFrequency: z.string(),
  backupRetention: z.number().min(1).max(365),
  backupLocation: z.string().min(2, {
    message: "Backup location must be at least 2 characters.",
  }),
  compressionLevel: z.number().min(0).max(9),
})

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { updateSystemMetrics } = useAdminStore()

  // General Settings Form
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      systemName: "Digital Clearance System",
      universityName: "State University",
      logoUrl: "/images/logo.png",
      maintenanceMode: false,
      defaultLanguage: "en",
      sessionTimeout: 30,
    },
  })

  // Email Settings Form
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      smtpServer: "smtp.university.edu",
      smtpPort: "587",
      smtpUsername: "clearance@university.edu",
      smtpPassword: "password123",
      senderEmail: "clearance@university.edu",
      senderName: "Digital Clearance System",
      enableEmailNotifications: true,
    },
  })

  // Security Settings Form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      passwordMinLength: 8,
      passwordExpiration: 90,
      maxLoginAttempts: 5,
      twoFactorAuth: false,
      ipRestriction: false,
      allowedIPs: "",
    },
  })

  // Backup Settings Form
  const backupForm = useForm<z.infer<typeof backupFormSchema>>({
    resolver: zodResolver(backupFormSchema),
    defaultValues: {
      autoBackup: true,
      backupFrequency: "daily",
      backupRetention: 30,
      backupLocation: "/var/backups/dcs",
      compressionLevel: 6,
    },
  })

  const [activeTab, setActiveTab] = useState("general")

  function onGeneralSubmit(values: z.infer<typeof generalFormSchema>) {
    toast({
      title: "General settings updated",
      description: "Your general settings have been saved successfully.",
    })

    // Update system metrics
    updateSystemMetrics({
      systemHealth: Math.floor(Math.random() * 10) + 90, // Random value between 90-100
      systemHealthChange: Math.floor(Math.random() * 5) - 2, // Random value between -2 and +2
    })
  }

  function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    toast({
      title: "Email settings updated",
      description: "Your email settings have been saved successfully.",
    })
  }

  function onSecuritySubmit(values: z.infer<typeof securityFormSchema>) {
    toast({
      title: "Security settings updated",
      description: "Your security settings have been saved successfully.",
    })

    // Update system metrics
    updateSystemMetrics({
      systemHealth: Math.floor(Math.random() * 10) + 90, // Random value between 90-100
      systemHealthChange: Math.floor(Math.random() * 5) - 2, // Random value between -2 and +2
    })
  }

  function onBackupSubmit(values: z.infer<typeof backupFormSchema>) {
    toast({
      title: "Backup settings updated",
      description: "Your backup settings have been saved successfully.",
    })

    // Update system metrics
    updateSystemMetrics({
      databaseSize: Math.floor(Math.random() * 100) + 400, // Random value between 400-500 MB
      databaseSizeChange: Math.floor(Math.random() * 20) - 10, // Random value between -10 and +10
    })
  }

  function runBackupNow() {
    toast({
      title: "Backup started",
      description: "System backup has been initiated. This may take a few minutes.",
    })

    setTimeout(() => {
      toast({
        title: "Backup completed",
        description: "System backup has been completed successfully.",
        variant: "success",
      })

      // Update system metrics
      updateSystemMetrics({
        databaseSize: Math.floor(Math.random() * 100) + 400, // Random value between 400-500 MB
        databaseSizeChange: Math.floor(Math.random() * 20) - 10, // Random value between -10 and +10
      })
    }, 3000)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure and manage your Digital Clearance System settings</p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4 w-full md:w-auto">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the general settings for your Digital Clearance System</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="systemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your clearance system as it appears throughout the application.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="universityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>The name of your university or institution.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>URL to your institution's logo (optional).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The default language for the system.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="sessionTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Timeout (minutes)</FormLabel>
                        <FormControl>
                          <Slider
                            min={5}
                            max={120}
                            step={5}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormDescription>{field.value} minutes</FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Maintenance Mode</FormLabel>
                          <FormDescription>
                            Put the system in maintenance mode. Only administrators will be able to access the system.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Save General Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure the email settings for notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={emailForm.control}
                      name="smtpServer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Server</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={emailForm.control}
                      name="senderEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="senderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={emailForm.control}
                    name="enableEmailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>Enable or disable email notifications for system events.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col md:flex-row gap-4">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Email Settings
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Test email sent",
                          description: "A test email has been sent to the configured sender email.",
                        })
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Test Email
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security settings for your Digital Clearance System</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={securityForm.control}
                      name="passwordMinLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Password Length</FormLabel>
                          <FormControl>
                            <Slider
                              min={6}
                              max={20}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                          </FormControl>
                          <div className="flex justify-between">
                            <FormDescription>{field.value} characters</FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="passwordExpiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Expiration (days)</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={365}
                              step={30}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                          </FormControl>
                          <div className="flex justify-between">
                            <FormDescription>
                              {field.value === 0 ? "Never expires" : `${field.value} days`}
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={securityForm.control}
                    name="maxLoginAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Login Attempts</FormLabel>
                        <FormControl>
                          <Slider
                            min={3}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormDescription>{field.value} attempts</FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="twoFactorAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                          <FormDescription>Require two-factor authentication for all users.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="ipRestriction"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">IP Restriction</FormLabel>
                          <FormDescription>Restrict access to specific IP addresses.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {securityForm.watch("ipRestriction") && (
                    <FormField
                      control={securityForm.control}
                      name="allowedIPs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed IP Addresses</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="192.168.1.1, 10.0.0.1" />
                          </FormControl>
                          <FormDescription>Comma-separated list of allowed IP addresses.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit">
                    <Shield className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Configure database backup settings and schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...backupForm}>
                <form onSubmit={backupForm.handleSubmit(onBackupSubmit)} className="space-y-6">
                  <FormField
                    control={backupForm.control}
                    name="autoBackup"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Automatic Backups</FormLabel>
                          <FormDescription>Enable or disable automatic database backups.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {backupForm.watch("autoBackup") && (
                    <>
                      <FormField
                        control={backupForm.control}
                        name="backupFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backup Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>How often the system should create backups.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={backupForm.control}
                        name="backupRetention"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backup Retention (days)</FormLabel>
                            <FormControl>
                              <Slider
                                min={1}
                                max={365}
                                step={1}
                                defaultValue={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="w-full"
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormDescription>{field.value} days</FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={backupForm.control}
                        name="backupLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backup Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>Directory path where backups will be stored.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={backupForm.control}
                        name="compressionLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compression Level</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={9}
                                step={1}
                                defaultValue={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="w-full"
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormDescription>
                                Level {field.value} (
                                {field.value === 0
                                  ? "No compression"
                                  : field.value < 4
                                    ? "Low"
                                    : field.value < 7
                                      ? "Medium"
                                      : "High"}
                                )
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="flex flex-col md:flex-row gap-4">
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Backup Settings
                    </Button>
                    <Button type="button" variant="outline" onClick={runBackupNow}>
                      <HardDrive className="mr-2 h-4 w-4" />
                      Run Backup Now
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
