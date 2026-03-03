export type AgentStatus = "active" | "idle" | "waiting" | "error"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type Priority = "high" | "medium" | "low"

export interface Agent {
  id: string
  name: string
  nameJa: string
  role: string
  roleJa: string
  status: AgentStatus
  currentTask: string
  currentTaskJa: string
  completedToday: number
  tokenUsage: number
  tokenBudget: number
}

export interface ApprovalItem {
  id: string
  agentId: string
  agentName: string
  type: "pricing" | "purchase" | "listing" | "customer" | "inspection" | "transfer"
  typeJa: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  priority: Priority
  createdAt: string
  data: Record<string, unknown>
  reasoning: string
  reasoningJa: string
}

export interface ActivityEvent {
  id: string
  agentId: string
  agentName: string
  action: string
  actionJa: string
  timestamp: string
  status: "success" | "info" | "warning" | "error"
  details?: string
  detailsJa?: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  purchasePrice: number
  suggestedPrice: number
  status: "in-inspection" | "listed" | "sold" | "pending-purchase"
  statusJa: string
  imageUrl: string
  grade: string
  color: string
  colorJa: string
}

export interface KPI {
  label: string
  labelJa: string
  value: string
  change: number
  trend: "up" | "down" | "flat"
}
