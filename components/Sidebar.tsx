"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  BarChart3,
  User,
  Users,
  Shield,
  Activity,
  Database,
  Settings,
  FileText,
  MessageSquare,
  UserCircle,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  X,
} from "lucide-react"

interface SidebarProps {
  user: {
    username: string
    role: string
    department?: string
    name?: string
    id?: string
  }
  onLogout: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// Update the NavItem component to use Link properly and highlight active items
const NavItem = ({
  icon: Icon,
  label,
  active = false,
  href,
  onClick,
  badge,
}: {
  icon: any
  label: string
  active?: boolean
  href?: string
  onClick?: () => void
  badge?: number
}) => {
  const content = (
    <div
      className={`flex items-center w-full gap-2 px-3 py-2 rounded-lg transition-colors ${
        active
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm truncate">{label}</span>
      {badge && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {badge}
        </span>
      )}
      {active && <div className="ml-auto w-1.5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0" />}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  )
}

export function Sidebar({ user, onLogout, isDarkMode, onToggleDarkMode, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3) // Example count
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get menu items based on user role
  const getMenuItems = (role: string) => {
    // Approver roles
    if (
      role === "Approver" ||
      role === "DepartmentHead" ||
      [
        "AcademicAdvisor",
        "LibraryMain",
        "LibraryTwo",
        "LibraryThree",
        "Cafeteria",
        "Bookstore",
        "CampusPolice",
        "Finance",
        "Dormitory",
      ].includes(role)
    ) {
      return [
        { name: "Dashboard Overview", icon: Home, href: "/dashboard/approver" },
        { name: "Pending Requests", icon: Clock, href: "/dashboard/approver/pending", badge: 5 },
        { name: "Approved Requests", icon: CheckCircle, href: "/dashboard/approver/approved" },
        { name: "Rejected Requests", icon: XCircle, href: "/dashboard/approver/rejected" },
        { name: "Notifications", icon: Bell, href: "/dashboard/approver/notifications", badge: 2 },
        { name: "Reports", icon: BarChart3, href: "/dashboard/approver/reports" },
        { name: "Profile Settings", icon: User, href: "/dashboard/profile" },
      ]
    }

    // Admin role
    if (role === "Admin") {
      return [
        { name: "Dashboard Overview", icon: Home, href: "/dashboard/admin" },
        { name: "User Management", icon: Users, href: "/dashboard/admin/users" },
        { name: "Role Assignment", icon: Shield, href: "/dashboard/admin/roles" },
        { name: "System Monitoring", icon: Activity, href: "/dashboard/admin/monitoring" },
        { name: "Database Management", icon: Database, href: "/dashboard/admin/database" },
        { name: "System Settings", icon: Settings, href: "/dashboard/admin/settings" },
        { name: "Notifications", icon: Bell, href: "/dashboard/admin/notifications", badge: 3 },
      ]
    }

    // Default for Student and Faculty (Requesters)
    return [
      { name: "Dashboard", icon: Home, href: "/dashboard/requester" },
      { name: "My Requests", icon: FileText, href: "/dashboard/requests" },
      { name: "Pending Tasks", icon: Clock, href: "/dashboard/tasks" },
      { name: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
      { name: "Profile", icon: UserCircle, href: "/dashboard/profile" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
      { name: "Help Center", icon: HelpCircle, href: "/dashboard/support" },
    ]
  }

  const menuItems = getMenuItems(user.role)

  const handleLogout = () => {
    onLogout()
  }

  const toggleDarkMode = () => {
    onToggleDarkMode()
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transform transition-transform lg:translate-x-0 flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <Link href="/dashboard" className="font-bold text-xl flex items-center">
          <Image
            src="/placeholder.svg?height=32&width=32&text=DCS"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2"
          />
          DCS
        </Link>
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src="/placeholder.svg?height=100&width=100&text=User" alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-gray-900 dark:text-gray-100">{user.name || user.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.id || "ID-" + Math.floor(Math.random() * 10000)} • {user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto flex-grow">
        {menuItems.map((item) => (
          <NavItem
            key={item.name}
            icon={item.icon}
            label={item.name}
            active={pathname === item.href}
            href={item.href}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2 flex-shrink-0">
        <button
          onClick={toggleDarkMode}
          className="flex items-center w-full gap-3 px-3 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isDarkMode ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
          <span className="truncate">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
