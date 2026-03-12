"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Agent, BusinessPhase } from "@/lib/types"
import { Bot, Zap, ChevronDown, ChevronRight, ShoppingCart, Package, Megaphone, Users, FileText, Heart } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const statusConfig: Record<string, { label: string; className: string; pulse: boolean }> = {
  active: { label: "稼働中", className: "bg-primary text-primary-foreground", pulse: true },
  idle: { label: "待機", className: "bg-muted-foreground/30 text-muted-foreground", pulse: false },
  waiting: { label: "承認待", className: "bg-warning text-warning-foreground", pulse: true },
  error: { label: "エラー", className: "bg-destructive text-destructive-foreground", pulse: false },
}

const phaseConfig: Record<BusinessPhase, { label: string; icon: React.ReactNode }> = {
  purchasing: { label: "仕入れ", icon: <ShoppingCart className="h-3 w-3" /> },
  inventory: { label: "在庫・価格", icon: <Package className="h-3 w-3" /> },
  marketing: { label: "集客", icon: <Megaphone className="h-3 w-3" /> },
  sales: { label: "接客・商談", icon: <Users className="h-3 w-3" /> },
  contract: { label: "成約・納車", icon: <FileText className="h-3 w-3" /> },
  aftersales: { label: "アフター", icon: <Heart className="h-3 w-3" /> },
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
  const [collapsedPhases, setCollapsedPhases] = useState<Set<BusinessPhase>>(new Set())

  // Group agents by phase
  const phases: BusinessPhase[] = ["purchasing", "inventory", "marketing", "sales", "contract", "aftersales"]
  const agentsByPhase = phases.reduce((acc, phase) => {
    acc[phase] = agents.filter((a) => a.phase === phase)
    return acc
  }, {} as Record<BusinessPhase, Agent[]>)

  const togglePhase = (phase: BusinessPhase) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">Agents</h2>
        <span className="text-xs text-muted-foreground">
          {agents.filter((a) => a.status === "active").length}/{agents.length} 稼働中
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {phases.map((phase) => {
          const phaseAgents = agentsByPhase[phase]
          if (phaseAgents.length === 0) return null
          const config = phaseConfig[phase]
          const isCollapsed = collapsedPhases.has(phase)
          const activeCount = phaseAgents.filter((a) => a.status === "active" || a.status === "waiting").length

          return (
            <div key={phase} className="flex flex-col">
              <button
                onClick={() => togglePhase(phase)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">{config.icon}</span>
                <span className="text-xs font-medium text-foreground">{config.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {activeCount > 0 && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                  {phaseAgents.length}
                </span>
              </button>
              {!isCollapsed && (
                <div className="ml-2 flex flex-col gap-1 border-l border-border pl-2">
                  {phaseAgents.map((agent) => {
                    const statusCfg = statusConfig[agent.status]
                    const tokenPercent = Math.round((agent.tokenUsage / agent.tokenBudget) * 100)
                    return (
                      <button
                        key={agent.id}
                        onClick={() => onSelectAgent(agent.id)}
                        className={cn(
                          "group flex flex-col gap-1.5 rounded-lg border border-border bg-card p-2 text-left transition-all hover:border-primary/40 hover:bg-secondary",
                          selectedAgentId === agent.id && "border-primary/60 bg-secondary"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary">
                              <Bot className="h-3 w-3 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-foreground">{agent.nameJa}</p>
                              <p className="truncate text-[10px] text-muted-foreground">{agent.scheduleJa}</p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                              statusCfg.className,
                              statusCfg.pulse && "animate-pulse"
                            )}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-[10px] text-muted-foreground">{agent.currentTaskJa}</p>
                        <div className="flex items-center gap-2">
                          <Zap className="h-2.5 w-2.5 text-muted-foreground" />
                          <Progress value={tokenPercent} className="h-1 flex-1" />
                          <span className="text-[9px] tabular-nums text-muted-foreground">{tokenPercent}%</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
