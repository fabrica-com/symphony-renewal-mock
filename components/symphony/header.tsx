"use client"

import { Bell, Settings, Activity, LayoutDashboard, Car, Users, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/lib/types"

export function Header({
  pendingCount,
  currentView,
  onViewChange,
}: {
  pendingCount: number
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}) {
  const navItems: { view: ViewMode; label: string; icon: React.ReactNode }[] = [
    { view: "command", label: "コマンドセンター", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { view: "inventory", label: "在庫一覧", icon: <Car className="h-3.5 w-3.5" /> },
    { view: "customers", label: "顧客一覧", icon: <Users className="h-3.5 w-3.5" /> },
    { view: "calendar", label: "スケジュール", icon: <Calendar className="h-3.5 w-3.5" /> },
  ]

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">Symphony</h1>
          </div>
        </div>
        <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          全システム正常稼働
        </div>

        {/* Navigation */}
        <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                currentView === item.view
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive p-0 text-[9px] text-destructive-foreground">
              {pendingCount}
            </Badge>
          )}
          <span className="sr-only">通知</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
          <span className="sr-only">設定</span>
        </Button>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          YT
        </div>
      </div>
    </header>
  )
}
