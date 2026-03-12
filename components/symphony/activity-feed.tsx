"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { ActivityEvent } from "@/lib/types"
import { CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react"

const statusConfig: Record<
  string,
  { icon: React.ReactNode; className: string; lineColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "text-success",
    lineColor: "bg-success/20",
  },
  info: {
    icon: <Info className="h-3.5 w-3.5" />,
    className: "text-primary",
    lineColor: "bg-primary/20",
  },
  warning: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "text-warning",
    lineColor: "bg-warning/20",
  },
  error: {
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: "text-destructive",
    lineColor: "bg-destructive/20",
  },
}

// Extract hours and minutes from ISO string to avoid timezone issues
function formatTimeFromISO(dateStr: string) {
  // Parse the ISO string and extract time parts to avoid hydration mismatch
  const d = new Date(dateStr)
  const hours = d.getUTCHours().toString().padStart(2, "0")
  const minutes = d.getUTCMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">アクティビティ</h2>
        <span className="text-xs text-muted-foreground">リアルタイム</span>
      </div>
      <div className="relative flex flex-col">
        {/* Timeline line */}
        <div className="absolute bottom-0 left-[18px] top-0 w-px bg-border" />
        {events.map((event, idx) => {
          const config = statusConfig[event.status]
          return (
            <div
              key={event.id}
              className={cn(
                "relative flex items-start gap-3 py-2.5 pl-1",
                idx === 0 && "animate-in fade-in slide-in-from-top-1 duration-500"
              )}
            >
              <div
                className={cn(
                  "relative z-10 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-card ring-2 ring-card",
                  config.className
                )}
              >
                {config.icon}
              </div>
              <div className="min-w-0 flex-1 pt-px">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-medium text-primary">
                    {event.agentName}
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {formatTimeFromISO(event.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80">{event.actionJa}</p>
                {event.detailsJa && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {event.detailsJa}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
