"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay,
} from "date-fns"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  start_time: string
  title: string
  created_by?: string
}

interface CalendarViewProps {
  tasks: Task[]
  onDateSelect: (date: Date) => void
  selectedDate: Date
  currentUserId?: string
  filterType?: FilterType
  onFilterChange?: (filter: FilterType) => void
}

type FilterType = "all" | "my-tasks" | "other-tasks"

export default function CalendarView({
  tasks,
  onDateSelect,
  selectedDate,
  currentUserId,
  filterType = "all",
  onFilterChange,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [internalFilterType, setInternalFilterType] = useState<FilterType>(filterType)

  const handleFilterChange = (newFilter: FilterType) => {
    setInternalFilterType(newFilter)
    onFilterChange?.(newFilter)
  }

  const getFilteredTasks = (tasksToFilter: Task[]) => {
    return tasksToFilter.filter((task) => {
      if (internalFilterType === "my-tasks") return task.created_by === currentUserId
      if (internalFilterType === "other-tasks") return task.created_by !== currentUserId
      return true
    })
  }

  const getTaskCountForDay = (day: Date) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    const filtered = getFilteredTasks(tasks).filter((task) => {
      const taskDate = new Date(task.start_time)
      return taskDate >= dayStart && taskDate <= dayEnd
    })
    return filtered.length
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  })

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{format(currentDate, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <select
            value={internalFilterType}
            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
            className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors"
            title="Filter tasks"
          >
            <option value="my-tasks">mine</option>
            <option value="other-tasks">bie's</option>
            <option value="all">All</option>
          </select>

          {/* Navigation buttons */}
          <div className="flex gap-2 ml-2 border-l border-border pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            const isSelectedDate =
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear()
            const taskCount = getTaskCountForDay(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "aspect-square p-2 rounded-lg border transition-all flex flex-col items-center justify-center",
                  !isCurrentMonth && "opacity-30",
                  isSelectedDate && "bg-primary text-primary-foreground border-primary",
                  !isSelectedDate && "border-border hover:border-primary hover:bg-secondary",
                  isTodayDate && !isSelectedDate && "border-primary",
                )}
              >
                <span className="text-sm font-semibold">{day.getDate()}</span>
                {taskCount > 0 && (
                  <span className="text-xs mt-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded">
                    {taskCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </>
    </div>
  )
}
