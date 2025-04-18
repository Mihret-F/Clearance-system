"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, Clock, Calendar, Upload } from "lucide-react"

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")

  // Sample tasks data
  const tasks = [
    {
      id: "task-001",
      title: "Upload Library Clearance Form",
      description: "Submit your signed library clearance form",
      dueDate: "2024-04-15",
      priority: "high",
      status: "pending",
      relatedTo: "Library Clearance",
      progress: 0,
    },
    {
      id: "task-002",
      title: "Complete Finance Payment",
      description: "Pay outstanding balance of $250",
      dueDate: "2024-04-10",
      priority: "high",
      status: "in-progress",
      relatedTo: "Finance Clearance",
      progress: 50,
    },
    {
      id: "task-003",
      title: "Return Hostel Keys",
      description: "Return your hostel keys to the dormitory office",
      dueDate: "2024-04-20",
      priority: "medium",
      status: "pending",
      relatedTo: "Hostel Clearance",
      progress: 0,
    },
    {
      id: "task-004",
      title: "Submit Department Exit Form",
      description: "Get your department exit form signed by your advisor",
      dueDate: "2024-04-18",
      priority: "medium",
      status: "completed",
      relatedTo: "Department Clearance",
      progress: 100,
      completedDate: "2024-04-01",
    },
  ]

  // Filter tasks based on search query and filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.relatedTo.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && task.status === "pending") ||
      (filter === "in-progress" && task.status === "in-progress") ||
      (filter === "completed" && task.status === "completed")

    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            High Priority
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            Medium Priority
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Low Priority
          </Badge>
        )
      default:
        return null
    }
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="container py-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Tasks</h1>
          <p className="text-muted-foreground">Tasks that need your attention for clearance completion</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <Checkbox checked={task.status === "completed"} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {task.relatedTo} • Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>

                    <p className="text-sm mb-4">{task.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {task.status === "completed" ? (
                          <span>Completed on {new Date(task.completedDate).toLocaleDateString()}</span>
                        ) : (
                          <span>
                            {getDaysRemaining(task.dueDate) > 0
                              ? `${getDaysRemaining(task.dueDate)} days remaining`
                              : "Due today"}
                          </span>
                        )}
                      </div>

                      {task.status !== "completed" && (
                        <Button className="mt-2 sm:mt-0 gap-2">
                          {task.status === "pending" ? (
                            <>
                              <Clock className="h-4 w-4" />
                              Start Task
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Complete Task
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery
                ? "No tasks match your search criteria"
                : filter !== "all"
                  ? `You don't have any ${filter} tasks`
                  : "You don't have any pending tasks at the moment"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
