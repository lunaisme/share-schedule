"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import CalendarView from "@/components/calendar-view"
import TaskList from "@/components/task-list"
import AddTaskModal from "@/components/add-task-modal"
import EditTaskModal from "@/components/edit-task-modal"
import { createClient } from "@/lib/client"
import { startOfDay, endOfDay } from "date-fns"

interface Task {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  status: "pending" | "in_progress" | "completed"
  created_by: string
}

type FilterType = "all" | "my-tasks" | "other-tasks"

export default function CalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>("all")

  const supabase = createClient()

  // Ambil filter tersimpan
  useEffect(() => {
    const savedFilter = (localStorage.getItem("calendar-filter-type") as FilterType) || "all"
    setFilterType(savedFilter)
  }, [])

  // Ambil data user dan tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("start_time", { ascending: true })

        if (tasksError) console.error("Error fetching tasks:", tasksError)
        else setTasks(tasksData || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Filter tugas sesuai tanggal dan tipe filter
  const getTasksForDate = () => {
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

    let filtered = tasks.filter((task) => {
      const taskDate = new Date(task.start_time)
      return taskDate >= dayStart && taskDate <= dayEnd
    })

    if (filterType === "my-tasks") {
      filtered = filtered.filter((t) => t.created_by === user?.id)
    } else if (filterType === "other-tasks") {
      filtered = filtered.filter((t) => t.created_by !== user?.id)
    }

    return filtered
  }

  // Tambah task
  const handleAddTask = async (taskData: {
    title: string
    description: string
    start_time: string
    end_time: string
    status: string
  }) => {
    if (!user) return
    setIsSaving(true)

    try {
      const { error } = await supabase.from("tasks").insert({
        ...taskData,
        created_by: user.id,
      })
      if (error) throw error

      const { data: updatedTasks } = await supabase
        .from("tasks")
        .select("*")
        .order("start_time", { ascending: true })

      setTasks(updatedTasks || [])
    } catch (error) {
      console.error("Error creating task:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Edit task
  const handleEditTask = async (
    taskId: string,
    taskData: {
      title: string
      description: string
      start_time: string
      end_time: string
      status: string
    },
  ) => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", taskId)
        .eq("created_by", user.id)

      if (error) throw error

      const { data: updatedTasks } = await supabase
        .from("tasks")
        .select("*")
        .order("start_time", { ascending: true })

      setTasks(updatedTasks || [])
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Hapus task
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("created_by", user.id)

      if (error) throw error
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Ganti filter
  const handleFilterChange = (filter: FilterType) => {
    setFilterType(filter)
    localStorage.setItem("calendar-filter-type", filter)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const selectedDateTasks = getTasksForDate().map((t) => ({
    ...t,
    currentUserId: user?.id,
  }))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userEmail={user?.email} />

      <div className="flex-1 flex flex-col">
        <Header title="Calendar" userEmail={user?.email} />

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Calendar section */}
            <div className="col-span-2">
              <CalendarView
                tasks={tasks}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                currentUserId={user?.id}
                filterType={filterType}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Task list section */}
            <div>
              <TaskList
                tasks={selectedDateTasks}
                selectedDate={selectedDate}
                onAddClick={() => setIsModalOpen(true)}
                onDeleteClick={handleDeleteTask}
                onEditClick={(task) => {
                  setEditingTask(task)
                  setIsEditModalOpen(true)
                }}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
        selectedDate={selectedDate}
        isLoading={isSaving}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTask(undefined)
        }}
        onSubmit={handleEditTask}
        task={editingTask}
        isLoading={isSaving}
      />
    </div>
  )
}
