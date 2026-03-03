"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ApprovalItem } from "@/lib/types"
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ShoppingCart,
  FileText,
  Users,
  Search,
  Truck,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const typeIcon: Record<string, React.ReactNode> = {
  pricing: <DollarSign className="h-4 w-4" />,
  purchase: <ShoppingCart className="h-4 w-4" />,
  listing: <FileText className="h-4 w-4" />,
  customer: <Users className="h-4 w-4" />,
  inspection: <Search className="h-4 w-4" />,
  transfer: <Truck className="h-4 w-4" />,
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "高", className: "bg-destructive/15 text-destructive border-destructive/30" },
  medium: { label: "中", className: "bg-warning/15 text-warning border-warning/30" },
  low: { label: "低", className: "bg-muted text-muted-foreground border-border" },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  return `${hours}時間前`
}

export function ApprovalQueue({
  items,
  onApprove,
  onReject,
}: {
  items: ApprovalItem[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const highCount = items.filter((i) => i.priority === "high").length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">承認キュー</h2>
          <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px]">
            {items.length}
          </Badge>
        </div>
        {highCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {highCount}件 緊急
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const isExpanded = expandedId === item.id
          const priority = priorityConfig[item.priority]
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border border-border bg-card transition-all",
                item.priority === "high" && "border-destructive/20",
                isExpanded && "ring-1 ring-primary/20"
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex w-full items-start gap-3 p-3 text-left"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  {typeIcon[item.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.titleJa}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("flex-shrink-0 text-[10px]", priority.className)}
                    >
                      {priority.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {item.descriptionJa}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{item.agentName}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 pt-1 text-muted-foreground">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-3 pb-3 pt-2">
                  <div className="rounded-md bg-secondary/50 p-3">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      AI推論根拠
                    </p>
                    <p className="text-xs leading-relaxed text-foreground/80">
                      {item.reasoningJa}
                    </p>
                  </div>
                  {Object.keys(item.data).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(item.data).map(([key, val]) => (
                        <div
                          key={key}
                          className="rounded-md bg-secondary px-2 py-1 text-[10px]"
                        >
                          <span className="text-muted-foreground">{key}: </span>
                          <span className="font-medium text-foreground">
                            {typeof val === "number"
                              ? val.toLocaleString("ja-JP")
                              : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation()
                        onApprove(item.id)
                      }}
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReject(item.id)
                      }}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      却下
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
