"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  status: "pending" | "in_progress" | "completed"
}

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    taskId: string,
    taskData: {
      title: string
      description: string
      start_time: string
      end_time: string
      status: string
    },
  ) => Promise<void>
  task?: Task
  isLoading?: boolean
}

export default function EditTaskModal({ isOpen, onClose, onSubmit, task, isLoading = false }: EditTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [status, setStatus] = useState("pending")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)

      const startDate = new Date(task.start_time)
      setStartTime(format(startDate, "HH:mm"))

      if (task.end_time) {
        const endDate = new Date(task.end_time)
        setEndTime(format(endDate, "HH:mm"))
      }
      setError(null)
    }
  }, [task])

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Task title is required")
      return
    }

    if (!task) return

    try {
      const taskDate = format(new Date(task.start_time), "yyyy-MM-dd")
      const startDateTime = `${taskDate}T${startTime}:00`
      const endDateTime = `${taskDate}T${endTime}:00`

      await onSubmit(task.id, {
        title: title.trim(),
        description: description.trim(),
        start_time: startDateTime,
        end_time: endDateTime,
        status,
      })

      setTitle("")
      setDescription("")
      setStartTime("09:00")
      setEndTime("10:00")
      setStatus("pending")
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
