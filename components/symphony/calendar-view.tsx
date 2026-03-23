"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { CalendarEvent, CalendarEventType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Car,
  Users,
  Gavel,
  Search,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Bot,
} from "lucide-react"

const eventTypeConfig: Record<CalendarEventType, { label: string; color: string; icon: React.ReactNode }> = {
  delivery: { label: "納車", color: "bg-emerald-500 text-white", icon: <Car className="h-3 w-3" /> },
  negotiation: { label: "商談", color: "bg-blue-500 text-white", icon: <Users className="h-3 w-3" /> },
  auction: { label: "オークション", color: "bg-orange-500 text-white", icon: <Gavel className="h-3 w-3" /> },
  inspection: { label: "入庫", color: "bg-cyan-500 text-white", icon: <Search className="h-3 w-3" /> },
  loaner: { label: "代車", color: "bg-purple-500 text-white", icon: <Car className="h-3 w-3" /> },
  shaken: { label: "車検", color: "bg-red-500 text-white", icon: <Search className="h-3 w-3" /> },
  "follow-up": { label: "フォロー", color: "bg-pink-500 text-white", icon: <Phone className="h-3 w-3" /> },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  scheduled: { label: "予定", className: "border-muted-foreground/30 text-muted-foreground" },
  confirmed: { label: "確定", className: "border-success text-success" },
  completed: { label: "完了", className: "border-muted-foreground text-muted-foreground" },
  cancelled: { label: "中止", className: "border-destructive text-destructive" },
}

// Generate dates for the week view
function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = []
  const startOfWeek = new Date(baseDate)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day) // Start from Sunday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    dates.push(date)
  }
  return dates
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateDisplay(date: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"]
  return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`
}

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  // Use a fixed base date to avoid hydration issues
  const [weekOffset, setWeekOffset] = useState(0)
  
  const baseDate = useMemo(() => {
    // Fixed date for consistent rendering
    const fixed = new Date("2026-03-03T00:00:00")
    fixed.setDate(fixed.getDate() + weekOffset * 7)
    return fixed
  }, [weekOffset])

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    events.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = []
      }
      grouped[event.date].push(event)
    })
    // Sort events by start time within each day
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime))
    })
    return grouped
  }, [events])

  const todayKey = "2026-03-03" // Fixed for demo

  // Count events by type for summary
  const eventCounts = useMemo(() => {
    const counts: Record<CalendarEventType, number> = {
      delivery: 0,
      negotiation: 0,
      auction: 0,
      inspection: 0,
      loaner: 0,
      shaken: 0,
      "follow-up": 0,
    }
    weekDates.forEach((date) => {
      const dateKey = formatDateKey(date)
      const dayEvents = eventsByDate[dateKey] || []
      dayEvents.forEach((event) => {
        counts[event.type]++
      })
    })
    return counts
  }, [weekDates, eventsByDate])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">スケジュール</h2>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Google Calendar連携</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setWeekOffset((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setWeekOffset(0)}
          >
            今週
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setWeekOffset((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 px-1">
        {(Object.entries(eventCounts) as [CalendarEventType, number][]).map(([type, count]) => {
          if (count === 0) return null
          const config = eventTypeConfig[type]
          return (
            <div
              key={type}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                config.color
              )}
            >
              {config.icon}
              {config.label}: {count}
            </div>
          )
        })}
      </div>

      {/* Week view */}
      <div className="flex flex-col gap-2">
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date)
          const dayEvents = eventsByDate[dateKey] || []
          const isToday = dateKey === todayKey
          const isPast = dateKey < todayKey

          return (
            <div
              key={dateKey}
              className={cn(
                "rounded-lg border border-border bg-card p-3",
                isToday && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isToday ? "text-primary" : isPast ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {formatDateDisplay(date)}
                </span>
                {isToday && (
                  <Badge variant="outline" className="h-4 border-primary px-1.5 text-[9px] text-primary">
                    今日
                  </Badge>
                )}
                {dayEvents.length > 0 && (
                  <span className="ml-auto text-[10px] text-muted-foreground">{dayEvents.length}件</span>
                )}
              </div>

              {dayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">予定なし</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayEvents.map((event) => {
                    const typeConfig = eventTypeConfig[event.type]
                    const stConfig = statusConfig[event.status]
                    return (
                      <div
                        key={event.id}
                        className="group flex flex-col gap-1.5 rounded-md border border-border bg-background p-2.5 transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-md",
                                typeConfig.color
                              )}
                            >
                              {typeConfig.icon}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{event.title}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("h-4 px-1.5 text-[9px]", stConfig.className)}
                          >
                            {stConfig.label}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="ml-8 flex flex-col gap-1">
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5" />
                              {event.location}
                            </div>
                          )}
                          {event.customerName && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Users className="h-2.5 w-2.5" />
                              {event.customerName}
                            </div>
                          )}
                          {event.vehicleName && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Car className="h-2.5 w-2.5" />
                              {event.vehicleName}
                            </div>
                          )}
                          {event.agentName && (
                            <div className="flex items-center gap-1.5 text-[10px] text-primary">
                              <Bot className="h-2.5 w-2.5" />
                              {event.agentName}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {event.notes && (
                          <p className="ml-8 line-clamp-2 text-[10px] text-muted-foreground">
                            {event.notes}
                          </p>
                        )}

                        {/* Google Calendar link */}
                        {event.googleCalendarId && (
                          <div className="ml-8 flex items-center gap-1 text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            <ExternalLink className="h-2.5 w-2.5" />
                            <span>Google Calendarで開く</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Note */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {"Google Calendarと双方向同期中。納車・商談・オークション日程を自動で共有します。"}
        </p>
      </div>
    </div>
  )
}
