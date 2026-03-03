"use client"

import { cn } from "@/lib/utils"
import type { Agent } from "@/lib/types"
import { Bot, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const statusConfig: Record<string, { label: string; className: string; pulse: boolean }> = {
  active: { label: "稼働中", className: "bg-primary text-primary-foreground", pulse: true },
  idle: { label: "待機中", className: "bg-muted-foreground/30 text-muted-foreground", pulse: false },
  waiting: { label: "承認待ち", className: "bg-warning text-warning-foreground", pulse: true },
  error: { label: "エラー", className: "bg-destructive text-destructive-foreground", pulse: false },
}

export function AgentStatusPanel({
  agents,
  selectedAgentId,
  onSelectAgent,
}: {
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">Agents</h2>
        <span className="text-xs text-muted-foreground">
          {agents.filter((a) => a.status === "active").length}/{agents.length} 稼働中
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {agents.map((agent) => {
          const config = statusConfig[agent.status]
          const tokenPercent = Math.round((agent.tokenUsage / agent.tokenBudget) * 100)
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={cn(
                "group flex flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary",
                selectedAgentId === agent.id && "border-primary/60 bg-secondary"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{agent.nameJa}</p>
                    <p className="truncate text-xs text-muted-foreground">{agent.roleJa}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    config.className,
                    config.pulse && "animate-pulse"
                  )}
                >
                  {config.label}
                </span>
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">{agent.currentTaskJa}</p>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-muted-foreground" />
                <Progress value={tokenPercent} className="h-1.5 flex-1" />
                <span className="text-[10px] tabular-nums text-muted-foreground">{tokenPercent}%</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
