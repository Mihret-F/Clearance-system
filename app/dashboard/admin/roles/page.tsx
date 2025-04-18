"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleAssignmentContent from "@/components/dashboard/RoleAssignmentContent"

// Sample role data
const sampleRoles = [
  {
    id: "role-1",
    name: "Admin",
    description: "Full system access with all permissions",
    permissions: [
      "user.view",
      "user.create",
      "user.edit",
      "user.delete",
      "role.view",
      "role.create",
      "role.edit",
      "role.delete",
      "request.view",
      "request.approve",
      "request.reject",
      "system.view",
      "system.edit",
      "system.configure",
      "database.view",
      "database.edit",
      "database.backup",
    ],
    userCount: 3,
  },
  {
    id: "role-2",
    name: "Registrar",
    description: "Manages clearance certificates and final approvals",
    permissions: [
      "user.view",
      "request.view",
      "request.approve",
      "request.reject",
      "certificate.view",
      "certificate.create",
      "certificate.edit",
    ],
    userCount: 5,
  },
  {
    id: "role-3",
    name: "Department Head",
    description: "Manages department-specific approvals and staff",
    permissions: [
      "user.view",
      "request.view",
      "request.approve",
      "request.reject",
      "department.view",
      "department.edit",
    ],
    userCount: 12,
  },
  {
    id: "role-4",
    name: "Faculty",
    description: "Teaching staff with limited clearance request abilities",
    permissions: ["request.view", "request.create", "profile.view", "profile.edit"],
    userCount: 45,
  },
  {
    id: "role-5",
    name: "Student",
    description: "Regular student with basic clearance request abilities",
    permissions: ["request.view", "request.create", "profile.view", "profile.edit"],
    userCount: 1250,
  },
  {
    id: "role-6",
    name: "Library Staff",
    description: "Manages library-related clearance approvals",
    permissions: ["request.view", "request.approve", "request.reject", "library.view", "library.edit"],
    userCount: 8,
  },
  {
    id: "role-7",
    name: "Finance Officer",
    description: "Manages financial clearance approvals",
    permissions: ["request.view", "request.approve", "request.reject", "finance.view", "finance.edit"],
    userCount: 6,
  },
]

// All available permissions grouped by category
const allPermissions = {
  "User Management": [
    { id: "user.view", name: "View Users" },
    { id: "user.create", name: "Create Users" },
    { id: "user.edit", name: "Edit Users" },
    { id: "user.delete", name: "Delete Users" },
  ],
  "Role Management": [
    { id: "role.view", name: "View Roles" },
    { id: "role.create", name: "Create Roles" },
    { id: "role.edit", name: "Edit Roles" },
    { id: "role.delete", name: "Delete Roles" },
  ],
  "Request Management": [
    { id: "request.view", name: "View Requests" },
    { id: "request.create", name: "Create Requests" },
    { id: "request.approve", name: "Approve Requests" },
    { id: "request.reject", name: "Reject Requests" },
  ],
  "System Management": [
    { id: "system.view", name: "View System Settings" },
    { id: "system.edit", name: "Edit System Settings" },
    { id: "system.configure", name: "Configure System" },
  ],
  "Database Management": [
    { id: "database.view", name: "View Database" },
    { id: "database.edit", name: "Edit Database" },
    { id: "database.backup", name: "Backup Database" },
  ],
  "Certificate Management": [
    { id: "certificate.view", name: "View Certificates" },
    { id: "certificate.create", name: "Create Certificates" },
    { id: "certificate.edit", name: "Edit Certificates" },
  ],
  "Department Management": [
    { id: "department.view", name: "View Department" },
    { id: "department.edit", name: "Edit Department" },
  ],
  "Profile Management": [
    { id: "profile.view", name: "View Profile" },
    { id: "profile.edit", name: "Edit Profile" },
  ],
  "Library Management": [
    { id: "library.view", name: "View Library Records" },
    { id: "library.edit", name: "Edit Library Records" },
  ],
  "Finance Management": [
    { id: "finance.view", name: "View Finance Records" },
    { id: "finance.edit", name: "Edit Finance Records" },
  ],
}

export default function RoleAssignmentPage() {
  const router = useRouter()
  const [roles, setRoles] = useState(sampleRoles)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState(Object.keys(allPermissions))
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [editingRole, setEditingRole] = useState(null)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")

  const [newRoleNameError, setNewRoleNameError] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Filter roles based on search term
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role)
      setNewRoleName(role.name)
      setNewRoleDescription(role.description)
      setSelectedPermissions(role.permissions)
    } else {
      setEditingRole(null)
      setNewRoleName("")
      setNewRoleDescription("")
      setSelectedPermissions([])
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingRole(null)
    setNewRoleName("")
    setNewRoleDescription("")
    setSelectedPermissions([])
    setNewRoleNameError("")
  }

  const toggleCategory = (category) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const togglePermission = (permissionId) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId])
    }
  }

  const toggleAllInCategory = (category, checked) => {
    const categoryPermissionIds = allPermissions[category].map((p) => p.id)

    if (checked) {
      // Add all permissions from this category that aren't already selected
      const newPermissions = [...selectedPermissions]
      categoryPermissionIds.forEach((id) => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id)
        }
      })
      setSelectedPermissions(newPermissions)
    } else {
      // Remove all permissions from this category
      setSelectedPermissions(selectedPermissions.filter((id) => !categoryPermissionIds.includes(id)))
    }
  }

  const handleSaveRole = () => {
    if (!newRoleName.trim()) {
      setNewRoleNameError("Role name is required")
      return
    } else {
      setNewRoleNameError("")
    }

    if (editingRole) {
      // Update existing role
      setRoles(
        roles.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: newRoleName,
                description: newRoleDescription,
                permissions: selectedPermissions,
              }
            : role,
        ),
      )
    } else {
      // Create new role
      const newRole = {
        id: `role-${roles.length + 1}`,
        name: newRoleName,
        description: newRoleDescription,
        permissions: selectedPermissions,
        userCount: 0,
      }
      setRoles([...roles, newRole])
    }

    handleCloseDialog()
  }

  const handleDeleteRole = (roleId) => {
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.id !== roleId))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Role Assignment</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleAssignmentContent />
        </CardContent>
      </Card>
    </div>
  )
}
