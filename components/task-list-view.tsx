"use client"

import { Trash2, Edit, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  status: "pending" | "in_progress" | "completed"
  created_by: string
  currentUserId?: string
}

interface TaskListViewProps {
  tasks: Task[]
  onEditClick: (task: Task) => void
  onDeleteClick: (taskId: string) => void
  isLoading?: boolean
}

export default function TaskListView({ tasks, onEditClick, onDeleteClick, isLoading = false }: TaskListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks for this date</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 bg-card border border-border rounded-lg p-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors",
            task.status === "completed" && "opacity-75",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4
                  className={cn(
                    "font-semibold text-foreground text-lg",
                    task.status === "completed" && "line-through text-muted-foreground",
                  )}
                >
                  {task.title}
                </h4>
                <Badge variant="secondary" className={getStatusColor(task.status)}>
                  {task.status === "in_progress"
                    ? "In Progress"
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>

              {task.description && <p className="text-sm text-muted-foreground mb-3">{task.description}</p>}

              <div className="flex items-center gap-4 flex-wrap">
                {task.start_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(task.start_time), "h:mm a")}</span>
                    {task.end_time && (
                      <>
                        <span>-</span>
                        <span>{format(new Date(task.end_time), "h:mm a")}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {task.created_by === task.currentUserId && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditClick(task)}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  disabled={isLoading}
                >
                  <Edit className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteClick(task.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Delete</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
