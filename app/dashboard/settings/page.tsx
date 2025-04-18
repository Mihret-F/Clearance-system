"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, Lock, Save, Smartphone } from "lucide-react"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [language, setLanguage] = useState("en")
  const [timeZone, setTimeZone] = useState("UTC")
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  useEffect(() => {
    // Check if dark mode preference exists
    const isDark = localStorage.getItem("darkMode") === "true"
    setDarkMode(isDark)

    // In a real app, you would fetch user settings from your backend here
  }, [])

  const handleDarkModeToggle = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("darkMode", newMode.toString())

    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleSaveSettings = () => {
    // In a real app, you would send the updated settings to your backend here
    console.log("Saving settings:", {
      darkMode,
      emailNotifications,
      pushNotifications,
      language,
      timeZone,
      twoFactorAuth,
    })

    // Show success message
    alert("Settings saved successfully!")
  }

  return (
    <div className="container py-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="appearance">
        <div className="flex flex-col sm:flex-row gap-6">
          <Card className="p-4 sm:w-48">
            <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
              <TabsTrigger value="appearance" className="justify-start w-full">
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start w-full">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="language" className="justify-start w-full">
                Language & Region
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start w-full">
                Security
              </TabsTrigger>
            </TabsList>
          </Card>

          <div className="flex-1">
            <Card className="p-6">
              <TabsContent value="appearance" className="space-y-6 mt-0">
                <div>
                  <h2 className="text-lg font-medium mb-4">Appearance</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Customize how the Digital Clearance System looks for you
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-muted-foreground" />
                        <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
                        <Moon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">Reduce spacing and size of elements</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6 mt-0">
                <div>
                  <h2 className="text-lg font-medium mb-4">Notifications</h2>
                  <p className="text-sm text-muted-foreground mb-6">Configure how you receive notifications</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                      </div>
                      <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base mb-2 block">Notification Types</Label>
                      <div className="space-y-2">
                        {[
                          "Request status updates",
                          "Document approvals",
                          "New messages",
                          "System announcements",
                          "Deadline reminders",
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <p className="text-sm">{item}</p>
                            <Switch defaultChecked />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="language" className="space-y-6 mt-0">
                <div>
                  <h2 className="text-lg font-medium mb-4">Language & Region</h2>
                  <p className="text-sm text-muted-foreground mb-6">Set your language and regional preferences</p>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select value={timeZone} onValueChange={setTimeZone}>
                        <SelectTrigger id="timezone" className="w-full">
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                          <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                          <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                          <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                          <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger id="dateFormat" className="w-full">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                <div>
                  <h2 className="text-lg font-medium mb-4">Security</h2>
                  <p className="text-sm text-muted-foreground mb-6">Manage your account security settings</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                    </div>

                    {twoFactorAuth && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <p className="font-medium">Set up two-factor authentication</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Use an authenticator app to generate verification codes
                        </p>
                        <Button>Set Up</Button>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-base">Change Password</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update your password regularly to keep your account secure
                      </p>
                      <Button variant="outline" className="gap-2">
                        <Lock className="h-4 w-4" />
                        Change Password
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-base">Active Sessions</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage devices where you're currently logged in
                      </p>
                      <div className="space-y-2">
                        <div className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Browser</p>
                            <p className="text-xs text-muted-foreground">Last active: Just now</p>
                          </div>
                          <Badge>Current</Badge>
                        </div>
                        <div className="p-3 border rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">Mobile App</p>
                            <p className="text-xs text-muted-foreground">Last active: 2 hours ago</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Log Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
