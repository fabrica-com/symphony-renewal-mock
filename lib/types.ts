export type AgentStatus = "active" | "idle" | "waiting" | "error"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type Priority = "high" | "medium" | "low"

// Business phases for agent organization
export type BusinessPhase = 
  | "purchasing"      // 仕入れ
  | "inventory"       // 在庫管理・価格設定
  | "marketing"       // 集客
  | "sales"           // 接客・商談
  | "contract"        // 成約・納車
  | "aftersales"      // アフターフォロー

export type AgentSchedule = "realtime" | "daily" | "weekly" | "monthly" | "on-demand"

export interface Agent {
  id: string
  name: string
  nameJa: string
  role: string
  roleJa: string
  phase: BusinessPhase
  phaseJa: string
  schedule: AgentSchedule
  scheduleJa: string
  status: AgentStatus
  currentTask: string
  currentTaskJa: string
  completedToday: number
  tokenUsage: number
  tokenBudget: number
  skills?: string[]
}

export interface ApprovalItem {
  id: string
  agentId: string
  agentName: string
  type: 
    | "pricing"         // 価格調整
    | "purchase"        // 仕入承認
    | "listing"         // 出品承認
    | "customer"        // 顧客アプローチ
    | "inspection"      // 検査結果
    | "transfer"        // 業販・AA出品
    | "sns-post"        // SNS投稿
    | "inquiry-reply"   // 問い合わせ返信
    | "follow-up"       // フォローアップ
    | "review-reply"    // 口コミ返信
    | "contract"        // 契約書
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
  daysListed?: number
  inquiries?: number
  views?: number
  source?: string
  vin?: string
}

export interface Customer {
  id: string
  name: string
  nameKana: string
  phone: string
  email: string
  preferences: CustomerPreference
  matchedVehicles: string[]
  matchScore: number
  status: "active" | "contacted" | "negotiating" | "closed" | "dormant"
  statusJa: string
  lastContact: string
  source: string
  sourceJa: string
  notes: string
  registeredAt: string
  budget: { min: number; max: number }
}

export interface CustomerPreference {
  bodyTypes: string[]
  makes: string[]
  yearMin?: number
  yearMax?: number
  mileageMax?: number
  colors: string[]
  features: string[]
}

export interface KPI {
  label: string
  labelJa: string
  value: string
  change: number
  trend: "up" | "down" | "flat"
}

export type ViewMode = "command" | "inventory" | "customers" | "calendar"

// Calendar event types for Google Calendar integration
export type CalendarEventType = 
  | "delivery"     // 納車
  | "negotiation"  // 商談
  | "auction"      // オークション
  | "inspection"   // 検査・入庫
  | "loaner"       // 代車・レンタカー
  | "follow-up"    // フォローアップ
  | "shaken"       // 車検

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  typeJa: string
  date: string        // ISO date string YYYY-MM-DD
  startTime: string   // HH:MM format
  endTime: string     // HH:MM format
  location?: string
  customerId?: string
  customerName?: string
  vehicleId?: string
  vehicleName?: string
  agentId?: string
  agentName?: string
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  statusJa: string
  notes?: string
  googleCalendarId?: string  // For sync with Google Calendar
  color?: string  // Event color for calendar display
}
