"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FilterType = "all" | "my-tasks" | "other-tasks"

interface TaskFilterProps {
  filter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export default function TaskFilter({ filter, onFilterChange }: TaskFilterProps) {
  return (
    <div className="w-full sm:w-48">
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          <SelectItem value="my-tasks">My Tasks</SelectItem>
          <SelectItem value="other-tasks">Other&apos;s Tasks</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
