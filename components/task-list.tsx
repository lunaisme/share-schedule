"use client"

import { Trash2, Plus, Clock, Edit } from "lucide-react"
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

interface TaskListProps {
  tasks: Task[]
  selectedDate: Date
  onAddClick: () => void
  onDeleteClick: (taskId: string) => void
  onEditClick: (task: Task) => void
  isLoading?: boolean
}

export default function TaskList({
  tasks,
  selectedDate,
  onAddClick,
  onDeleteClick,
  onEditClick,
  isLoading = false,
}: TaskListProps) {
  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tasks</h3>
          <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
        </div>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-3">No tasks yet</p>
            <p className="text-sm text-muted-foreground mb-4">Click to add one</p>
            <Button onClick={onAddClick} variant="outline" size="sm">
              Create Your First Task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors",
                task.status === "completed" && "opacity-75",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4
                    className={cn(
                      "font-medium text-foreground truncate text-sm",
                      task.status === "completed" && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {task.start_time && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(task.start_time), "h:mm a")}
                      </div>
                    )}
                    <Badge variant="secondary" className={cn(getStatusColor(task.status), "text-xs")}>
                      {task.status === "in_progress"
                        ? "In Progress"
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                {task.created_by === task.currentUserId && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditClick(task)}
                      className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8 p-0"
                      title="Edit task"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteClick(task.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
