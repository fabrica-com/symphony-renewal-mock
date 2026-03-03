"use client"

import { Bell, Settings, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Header({ pendingCount }: { pendingCount: number }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">Symphony</h1>
          </div>
        </div>
        <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          全システム正常稼働
        </div>
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
