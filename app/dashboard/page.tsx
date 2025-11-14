"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import AddTaskModal from "@/components/add-task-modal"
import EditTaskModal from "@/components/edit-task-modal"
import { createClient } from "@/lib/client"
import { startOfDay, endOfDay, format, addDays, startOfMonth, endOfMonth } from "date-fns"

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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>("all")

  const supabase = createClient()

  useEffect(() => {
    const savedFilter = (localStorage.getItem("dashboard-filter-type") as FilterType) || "all"
    setFilterType(savedFilter)
  }, [])

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

        if (tasksError) {
          console.error("Error fetching tasks:", tasksError)
        } else {
          setTasks(tasksData || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

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

  const handleFilterChange = (filter: FilterType) => {
    setFilterType(filter)
    localStorage.setItem("dashboard-filter-type", filter)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // --- Membuat daftar 1 bulan penuh ---
  const groupedTasks = (() => {
    const groups: { [key: string]: Task[] } = {}
    const now = new Date()
    const startMonth = startOfMonth(now)
    const endMonthDate = endOfMonth(now)

    // Buat entry setiap hari dalam bulan ini
    for (let date = startMonth; date <= endMonthDate; date = addDays(date, 1)) {
      const dateKey = format(date, "yyyy-MM-dd")
      groups[dateKey] = []
    }

    // Kelompokkan tugas ke dalam tanggal
    tasks.forEach((task) => {
      const taskDate = new Date(task.start_time)
      const dateKey = format(taskDate, "yyyy-MM-dd")

      if (!groups[dateKey]) return

      if (filterType === "my-tasks" && task.created_by !== user?.id) return
      if (filterType === "other-tasks" && task.created_by === user?.id) return

      groups[dateKey].push(task)
    })

    return groups
  })()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userEmail={user?.email} />

      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" userEmail={user?.email} />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 text-center text-sm text-muted-foreground">
              "Belum semua fitur ada yaa kalo ada masukan boleh bilang bie :)"
            </div>
            <div className="mb-4 text-center text-sm text-muted-foreground">
              "Ada fitur darkmode di setting.. coba aja"
            </div>
            {/* Filter dan Tombol Add Task */}
            <div className="mb-6 flex items-center justify-between">
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value as FilterType)}
                className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors"
              >
                <option value="my-tasks">mine</option>
                <option value="other-tasks">bie's</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
              >
                + Add Task
              </button>
            </div>

            {/* Daftar 1 bulan penuh */}
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => {
                const date = new Date(dateKey)
                return (
                  <div key={dateKey} className="grid grid-cols-5 hover:bg-muted/30 transition">
                    {/* Kolom kiri: tanggal */}
                    <div className="col-span-1 border-r border-border p-4 flex items-center justify-center bg-muted/40">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{format(date, "EEE")}</span>
                        <span className="text-lg font-bold">{format(date, "d")}</span>
                        <span className="text-xs text-muted-foreground">{format(date, "MMM")}</span>
                      </div>
                    </div>

                    {/* Kolom kanan: daftar tugas */}
                    <div className="col-span-4 p-4 space-y-2">
                      {dateTasks.length > 0 ? (
                        dateTasks.map((task) => (
                          <div
                            key={task.id}
                            className="border border-border bg-card rounded-lg p-3 flex justify-between items-start hover:border-primary transition"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {format(new Date(task.start_time), "HH:mm")}
                                {task.end_time && ` - ${format(new Date(task.end_time), "HH:mm")}`}
                              </div>
                            </div>
                            {task.created_by === user?.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTask(task)
                                    setIsEditModalOpen(true)
                                  }}
                                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No tasks for this day</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
        selectedDate={new Date()}
        isLoading={isSaving}
      />

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
