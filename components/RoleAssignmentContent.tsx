"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Shield, Plus, Edit } from "lucide-react"
import { useAdminStore } from "@/lib/store"

export default function RoleAssignmentContent() {
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
  })

  // Get roles from the store
  const { roles, addRole, updateRole } = useAdminStore()

  // Handle adding a new role
  const handleAddRole = () => {
    if (!newRole.name || !newRole.description) {
      return
    }

    const newRoleId = `ROL${String(roles.length + 1).padStart(3, "0")}`

    addRole({
      id: newRoleId,
      ...newRole,
      userCount: 0,
    })

    setNewRole({
      name: "",
      description: "",
      permissions: [],
    })

    setShowRoleDialog(false)
  }

  // Handle editing a role
  const handleEditRole = () => {
    if (!selectedRole) return

    updateRole(selectedRole.id, selectedRole)
    setSelectedRole(null)
    setShowRoleDialog(false)
  }

  // Common permissions for roles
  const commonPermissions = [
    { id: "PERM001", name: "View Dashboard", category: "Dashboard" },
    { id: "PERM002", name: "Submit Requests", category: "Requests" },
    { id: "PERM003", name: "View Own Requests", category: "Requests" },
    { id: "PERM004", name: "Cancel Own Requests", category: "Requests" },
    { id: "PERM005", name: "Approve Requests", category: "Approvals" },
    { id: "PERM006", name: "Reject Requests", category: "Approvals" },
    { id: "PERM007", name: "View Users", category: "Users" },
    { id: "PERM008", name: "Create Users", category: "Users" },
    { id: "PERM009", name: "Edit Users", category: "Users" },
    { id: "PERM010", name: "Delete Users", category: "Users" },
    { id: "PERM011", name: "Manage Roles", category: "Roles" },
    { id: "PERM012", name: "View Reports", category: "Reports" },
    { id: "PERM013", name: "Export Data", category: "System" },
    { id: "PERM014", name: "System Settings", category: "System" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedRole(null)
            setNewRole({
              name: "",
              description: "",
              permissions: [],
            })
            setShowRoleDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium">{role.name}</h4>
              </div>
              <Badge variant="outline">{role.userCount} users</Badge>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Key Permissions:</h5>
                <ul className="space-y-1 text-sm">
                  {role.permissions && Array.isArray(role.permissions) ? (
                    role.permissions.slice(0, 3).map((perm) => (
                      <li key={perm} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                        <span>{perm}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No permissions defined</li>
                  )}
                  {role.permissions && role.permissions.length > 3 && (
                    <li className="text-sm text-muted-foreground">+{role.permissions.length - 3} more permissions</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRole(role)
                  setShowRoleDialog(true)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Edit Role" : "Add New Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={selectedRole ? selectedRole.name : newRole.name}
                onChange={(e) => {
                  if (selectedRole) {
                    setSelectedRole({ ...selectedRole, name: e.target.value })
                  } else {
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                }}
                placeholder="e.g., Department Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={selectedRole ? selectedRole.description : newRole.description}
                onChange={(e) => {
                  if (selectedRole) {
                    setSelectedRole({ ...selectedRole, description: e.target.value })
                  } else {
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                }}
                placeholder="Describe the role's responsibilities"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>

              {/* Group permissions by category */}
              {Array.from(new Set(commonPermissions.map((p) => p.category))).map((category) => (
                <div key={category} className="mt-4">
                  <h4 className="text-sm font-medium mb-2">{category}</h4>
                  <div className="border rounded-md divide-y">
                    {commonPermissions
                      .filter((p) => p.category === category)
                      .map((permission) => {
                        // For selected role, check if permission exists
                        const isGranted = selectedRole
                          ? selectedRole.permissions && selectedRole.permissions.includes(permission.name)
                          : false

                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3">
                            <span className="text-sm">{permission.name}</span>
                            <Switch
                              checked={isGranted}
                              onCheckedChange={(checked) => {
                                if (selectedRole) {
                                  const updatedPermissions = checked
                                    ? [...(selectedRole.permissions || []), permission.name]
                                    : (selectedRole.permissions || []).filter((p) => p !== permission.name)

                                  setSelectedRole({
                                    ...selectedRole,
                                    permissions: updatedPermissions,
                                  })
                                } else {
                                  const updatedPermissions = checked
                                    ? [...(newRole.permissions || []), permission.name]
                                    : (newRole.permissions || []).filter((p) => p !== permission.name)

                                  setNewRole({
                                    ...newRole,
                                    permissions: updatedPermissions,
                                  })
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={selectedRole ? handleEditRole : handleAddRole}>
              {selectedRole ? "Save Changes" : "Add Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
