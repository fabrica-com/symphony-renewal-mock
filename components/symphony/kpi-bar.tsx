"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { KPI } from "@/lib/types"
import { cn } from "@/lib/utils"

export function KpiBar({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {kpis.map((kpi) => (
        <div
          key={kpi.labelJa}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{kpi.labelJa}</p>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {kpi.value}
              {kpi.labelJa === "月間売上" && <span className="ml-0.5 text-xs font-normal text-muted-foreground">円</span>}
              {kpi.labelJa === "平均販売日数" && <span className="ml-0.5 text-xs font-normal text-muted-foreground">日</span>}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
              kpi.trend === "up" && kpi.change > 0 && "bg-success/10 text-success",
              kpi.trend === "up" && kpi.change < 0 && "bg-success/10 text-success",
              kpi.trend === "down" && "bg-destructive/10 text-destructive",
              kpi.trend === "flat" && "bg-muted text-muted-foreground"
            )}
          >
            {kpi.trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : kpi.trend === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {Math.abs(kpi.change)}%
          </div>
        </div>
      ))}
    </div>
  )
}
