"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/symphony/header"
import { KpiBar } from "@/components/symphony/kpi-bar"
import { AgentStatusPanel } from "@/components/symphony/agent-status-panel"
import { ApprovalQueue } from "@/components/symphony/approval-queue"
import { ActivityFeed } from "@/components/symphony/activity-feed"
import { CommandChat } from "@/components/symphony/command-chat"
import { VehicleCards } from "@/components/symphony/vehicle-cards"
import {
  agents as initialAgents,
  approvalQueue as initialApprovals,
  activityFeed,
  vehicles,
  kpis,
} from "@/lib/mock-data"
import type { ApprovalItem } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, CheckSquare, Radio, Car } from "lucide-react"

export default function SymphonyDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals)
  const [activeTab, setActiveTab] = useState("approvals")

  const handleApprove = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleReject = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header pendingCount={approvals.length} />

      {/* KPI Strip */}
      <div className="border-b border-border bg-background px-4 py-2 lg:px-6">
        <KpiBar kpis={kpis} />
      </div>

      {/* Main Content - 3 column layout on desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Agent Status (hidden on mobile, shown as part of tabs) */}
        <aside className="hidden w-72 flex-shrink-0 border-r border-border lg:block">
          <ScrollArea className="h-full">
            <div className="p-4">
              <AgentStatusPanel
                agents={initialAgents}
                selectedAgentId={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />
            </div>
          </ScrollArea>
        </aside>

        {/* Center Column - Approval Queue + Activity */}
        <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Mobile Tabs / Desktop Split */}
          <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
              <TabsList className="mx-4 mt-2 grid w-auto grid-cols-4 bg-secondary">
                <TabsTrigger value="approvals" className="gap-1.5 text-xs">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">承認</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-1.5 text-xs">
                  <Radio className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">活動</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1.5 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">AI</span>
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="gap-1.5 text-xs">
                  <Car className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">在庫</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="approvals" className="flex-1 overflow-auto">
                <div className="p-4">
                  <ApprovalQueue items={approvals} onApprove={handleApprove} onReject={handleReject} />
                </div>
              </TabsContent>
              <TabsContent value="activity" className="flex-1 overflow-auto">
                <div className="p-4">
                  <AgentStatusPanel
                    agents={initialAgents}
                    selectedAgentId={selectedAgent}
                    onSelectAgent={setSelectedAgent}
                  />
                  <div className="mt-4">
                    <ActivityFeed events={activityFeed} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="chat" className="flex-1 overflow-hidden">
                <CommandChat />
              </TabsContent>
              <TabsContent value="vehicles" className="flex-1 overflow-auto">
                <div className="p-4">
                  <VehicleCards vehicles={vehicles} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Center */}
          <div className="hidden flex-1 flex-col overflow-hidden lg:flex">
            <div className="flex flex-1 overflow-hidden">
              {/* Approval + Activity column */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <ApprovalQueue items={approvals} onApprove={handleApprove} onReject={handleReject} />
                    <div className="mt-6">
                      <ActivityFeed events={activityFeed} />
                    </div>
                  </div>
                </ScrollArea>
                {/* Vehicle strip at bottom */}
                <div className="border-t border-border">
                  <ScrollArea className="h-auto max-h-[280px]">
                    <div className="p-4">
                      <VehicleCards vehicles={vehicles} />
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Chat column */}
              <div className="hidden w-[380px] flex-shrink-0 border-l border-border xl:flex xl:flex-col">
                <CommandChat />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
