"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Building, BookOpen, Calendar, Edit, Save, Upload, Lock } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    program: "",
    enrollmentYear: "",
    bio: "",
  })

  useEffect(() => {
    // Get user from localStorage on component mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)

      // Set initial form data
      setFormData({
        name: userData.name || "John Doe",
        email: userData.email || "john.doe@example.com",
        phone: userData.phone || "+1 234 567 890",
        address: userData.address || "123 University Ave, Campus City",
        department: userData.department || "Computer Science",
        program: userData.program || "Bachelor of Science",
        enrollmentYear: userData.enrollmentYear || "2021",
        bio: userData.bio || "Student at University",
      })
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = () => {
    // In a real app, you would send the updated profile to your backend here
    console.log("Saving profile:", formData)

    // Update local storage
    const updatedUser = { ...user, ...formData }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)

    // Exit edit mode
    setEditMode(false)
  }

  if (!user) {
    return (
      <div className="container py-6 max-w-full">
        <Card className="p-8 text-center">
          <p>Loading profile...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>
        <Button onClick={() => setEditMode(!editMode)} className="gap-2">
          {editMode ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=100&width=100&text=User" alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {editMode && (
                <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h2 className="text-xl font-bold">{formData.name}</h2>
            <p className="text-muted-foreground mb-2">{user.id || "STD-123456"}</p>
            <Badge className="mb-4">{user.role || "Student"}</Badge>

            <div className="w-full space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formData.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formData.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formData.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formData.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formData.program}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Enrolled: {formData.enrollmentYear}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="w-full">
              <h3 className="font-medium mb-2">Bio</h3>
              <p className="text-sm text-muted-foreground">{formData.bio}</p>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="p-6 lg:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="academic">Academic Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editMode ? (
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {editMode ? (
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editMode ? (
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  {editMode ? (
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.address}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {editMode ? (
                  <textarea
                    id="bio"
                    name="bio"
                    className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded-md">{formData.bio}</p>
                )}
              </div>

              {editMode && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {editMode ? (
                    <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  {editMode ? (
                    <Input id="program" name="program" value={formData.program} onChange={handleInputChange} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.program}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enrollmentYear">Enrollment Year</Label>
                  {editMode ? (
                    <Input
                      id="enrollmentYear"
                      name="enrollmentYear"
                      value={formData.enrollmentYear}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{formData.enrollmentYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <p className="text-sm p-2 bg-muted rounded-md">{user.id || "STD-123456"}</p>
                </div>
              </div>

              {editMode && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <div className="flex justify-end">
                <Button className="gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
