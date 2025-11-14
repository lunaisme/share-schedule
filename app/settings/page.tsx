"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/client"

type ThemeColor = "slate" | "blue" | "green" | "red" | "purple" | "orange"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [theme, setTheme] = useState<ThemeColor>("slate")
  const [isLoading, setIsLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Load saved theme from localStorage
        const savedTheme = (localStorage.getItem("theme-color") as ThemeColor) || "slate"
        const savedDark = localStorage.getItem("dark-mode") === "true"
        setTheme(savedTheme)
        setIsDark(savedDark)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleThemeChange = (newTheme: ThemeColor) => {
    setTheme(newTheme)
    localStorage.setItem("theme-color", newTheme)
    // Apply theme to root element
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  const handleDarkModeToggle = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem("dark-mode", String(newDarkMode))

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const themeOptions: { value: ThemeColor; label: string }[] = [
    { value: "slate", label: "Slate" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "red", label: "Red" },
    { value: "purple", label: "Purple" },
    { value: "orange", label: "Orange" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userEmail={user?.email} />

      <div className="flex-1 flex flex-col">
        <Header title="Settings" userEmail={user?.email} />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Theme Color Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Theme */}
                <div>
                  <Label htmlFor="theme-color" className="mb-3 block font-medium">
                    Color Theme
                  </Label>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger id="theme-color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Choose your preferred color theme for the dashboard
                  </p>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Enable dark mode for easier viewing at night</p>
                  </div>
                  <Button variant={isDark ? "default" : "outline"} onClick={handleDarkModeToggle}>
                    {isDark ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold text-foreground">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
