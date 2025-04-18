import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define the types for our store
interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  status: "active" | "inactive" | "pending"
  lastLogin?: string
  createdAt: string
}

interface Role {
  id: string
  name: string | "pending"
  lastLogin?: string
  createdAt: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

interface SystemMetrics {
  totalUsers: number
  totalUsersChange: number
  activeRequests: number
  activeRequestsChange: number
  systemHealth: number
  systemHealthChange: number
  databaseSize: number
  databaseSizeChange: number
}

interface AdminStore {
  users: User[]
  roles: Role[]
  systemMetrics: SystemMetrics
  addUser: (user: User) => void
  updateUser: (id: string, userData: Partial<User>) => void
  deleteUser: (id: string) => void
  addRole: (role: Role) => void
  updateRole: (id: string, roleData: Partial<Role>) => void
  deleteRole: (id: string) => void
  updateSystemMetrics: (metrics: Partial<SystemMetrics>) => void
}

// Create the store
export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      users: [
        {
          id: "1",
          name: "Admin User",
          email: "admin@university.edu",
          role: "admin",
          status: "active",
          lastLogin: "2023-05-15T10:30:00Z",
          createdAt: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "John Student",
          email: "john@university.edu",
          role: "student",
          status: "active",
          lastLogin: "2023-05-14T14:20:00Z",
          createdAt: "2023-01-15T00:00:00Z",
        },
        {
          id: "3",
          name: "Jane Faculty",
          email: "jane@university.edu",
          role: "faculty",
          department: "Computer Science",
          status: "active",
          lastLogin: "2023-05-13T09:15:00Z",
          createdAt: "2023-01-10T00:00:00Z",
        },
      ],
      roles: [
        {
          id: "1",
          name: "Admin",
          description: "System administrator with full access",
          permissions: ["all"],
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Student",
          description: "Student role with limited access",
          permissions: ["view_own", "submit_request"],
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Faculty",
          description: "Faculty role with department access",
          permissions: ["view_own", "submit_request", "view_department"],
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
        {
          id: "4",
          name: "Approver",
          description: "Can approve clearance requests",
          permissions: ["view_assigned", "approve_request", "reject_request"],
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
        {
          id: "5",
          name: "Registrar",
          description: "Final clearance approval and certificate generation",
          permissions: ["view_all", "approve_final", "generate_certificate"],
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
      ],
      systemMetrics: {
        totalUsers: 150,
        totalUsersChange: 5,
        activeRequests: 42,
        activeRequestsChange: -3,
        systemHealth: 98,
        systemHealthChange: 2,
        databaseSize: 450,
        databaseSizeChange: 15,
      },
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, user],
          systemMetrics: {
            ...state.systemMetrics,
            totalUsers: state.systemMetrics.totalUsers + 1,
            totalUsersChange: state.systemMetrics.totalUsersChange + 1,
          },
        })),
      updateUser: (id, userData) =>
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...userData } : user)),
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          systemMetrics: {
            ...state.systemMetrics,
            totalUsers: state.systemMetrics.totalUsers - 1,
            totalUsersChange: state.systemMetrics.totalUsersChange - 1,
          },
        })),
      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (id, roleData) =>
        set((state) => ({
          roles: state.roles.map((role) => (role.id === id ? { ...role, ...roleData } : role)),
        })),
      deleteRole: (id) => set((state) => ({ roles: state.roles.filter((role) => role.id !== id) })),
      updateSystemMetrics: (metrics) =>
        set((state) => ({
          systemMetrics: { ...state.systemMetrics, ...metrics },
        })),
    }),
    {
      name: "admin-store",
    },
  ),
)
