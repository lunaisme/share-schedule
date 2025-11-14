"use client"

import { Calendar, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  userEmail?: string
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: CheckSquare },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col h-screen transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn("p-6 border-b border-border flex items-center justify-between", isCollapsed && "flex-col gap-4")}
      >
        {!isCollapsed && (
          <>
            <div>
              <h1 className="text-xl font-bold text-foreground">Schedule Share</h1>
              {/* <p className="text-xs text-muted-foreground mt-1 truncate">{userEmail}</p> */}
            </div>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                  isCollapsed && "justify-center px-2",
                )}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className={cn("p-4 border-t border-border", isCollapsed && "px-2")}>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "text-muted-foreground hover:text-foreground",
            isCollapsed ? "w-full px-2" : "w-full justify-start",
          )}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </aside>
  )
}
