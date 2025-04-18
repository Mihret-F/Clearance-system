import { users } from "@/data/users"
import type { Student, Faculty, BaseUser } from "@/types"

export function login(username: string, password: string): Student | Faculty | BaseUser | null {
  // Special case for department head
  if (username === "depHead1" && password === "admin") {
    return {
      id: "DH001",
      username: "depHead1",
      name: "Department Head",
      role: "DepartmentHead",
      department: "Computer Science",
      email: "",
      password: "admin",
      lastLogin: new Date().toISOString(),
      isFirstLogin: true,
    }
  }

  // Add more approver accounts
  if (username === "approver1" && password === "admin") {
    return {
      id: "AP001",
      username: "approver1",
      name: "Library Approver",
      role: "Approver",
      department: "Library",
      email: "",
      password: "admin",
      lastLogin: new Date().toISOString(),
      isFirstLogin: true,
    }
  }

  if (username === "approver2" && password === "admin") {
    return {
      id: "AP002",
      username: "approver2",
      name: "Finance Approver",
      role: "Approver",
      department: "Finance",
      email: "",
      password: "admin",
      lastLogin: new Date().toISOString(),
      isFirstLogin: true,
    }
  }

  // Add admin account
  if (username === "admin1" && password === "admin") {
    return {
      id: "AD001",
      username: "admin1",
      name: "System Admin",
      role: "Admin",
      department: "IT",
      email: "admin@example.com",
      password: "admin",
      lastLogin: new Date().toISOString(),
      isFirstLogin: true,
    }
  }

  const user = users.find((u) => u.username === username && u.password === password)
  if (user) {
    // Update last login
    user.lastLogin = new Date().toISOString()
    return user
  }
  return null
}

export function getUserById(id: number): Student | Faculty | BaseUser | null {
  return users.find((u) => u.id === id) || null
}

export function isStudent(user: any): user is Student {
  return user?.role === "Student"
}

export function isFaculty(user: any): user is Faculty {
  return user?.role === "Faculty"
}

// Add a function to check if user is an approver
export function isApprover(user: any): boolean {
  return user?.role === "Approver" || user?.role === "DepartmentHead"
}

// Add a function to check if user is an admin
export function isAdmin(user: any): boolean {
  return user?.role === "Admin"
}
