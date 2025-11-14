"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  title: string
  userEmail?: string
  onAddTask?: () => void
}

export default function Header({ title, userEmail, onAddTask }: HeaderProps) {
  const initials = userEmail?.split("@")[0].split("").slice(0, 2).join("").toUpperCase() || "U"

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="flex items-center gap-4">
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Task
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{userEmail}</p>
          </div>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
