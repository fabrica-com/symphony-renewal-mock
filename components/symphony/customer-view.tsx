"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Customer } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Target,
  Calendar,
  Sparkles,
  MessageSquare,
} from "lucide-react"

const statusStyles: Record<string, { className: string }> = {
  active: { className: "bg-success/15 text-success border-success/30" },
  contacted: { className: "bg-primary/15 text-primary border-primary/30" },
  negotiating: { className: "bg-warning/15 text-warning border-warning/30" },
  closed: { className: "bg-muted text-muted-foreground border-border" },
  dormant: { className: "bg-destructive/15 text-destructive border-destructive/30" },
}

function formatPrice(price: number) {
  return `${(price / 10000).toFixed(0)}万`
}

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "今日"
  if (days === 1) return "昨日"
  return `${days}日前`
}

export function CustomerView({ customers }: { customers: Customer[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const active = customers.filter((c) => c.status === "active" || c.status === "negotiating").length
  const dormant = customers.filter((c) => c.status === "dormant").length

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex items-center gap-6 px-1">
        <h2 className="text-sm font-semibold text-foreground">顧客一覧</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>アクティブ: <span className="font-medium text-success">{active}</span></span>
          <span>休眠: <span className="font-medium text-destructive">{dormant}</span></span>
          <span>合計: <span className="font-medium text-foreground">{customers.length}</span></span>
        </div>
      </div>

      {/* AI summary */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div className="text-xs leading-relaxed text-foreground/80">
          <span className="font-medium text-foreground">AI分析サマリー: </span>
          高橋様（マッチスコア91%）と田中様（94%）に最適な車両が在庫にあります。
          佐藤様はアルファードで商談中、成約確率は72%。
          伊藤様は3週間連絡なし -- 再アプローチを推奨します。
        </div>
      </div>

      {/* Customer cards */}
      <div className="flex flex-col gap-2">
        {customers
          .sort((a, b) => b.matchScore - a.matchScore)
          .map((customer) => {
            const isExpanded = expandedId === customer.id
            return (
              <div
                key={customer.id}
                className={cn(
                  "overflow-hidden rounded-lg border border-border bg-card transition-all",
                  isExpanded && "ring-1 ring-primary/20"
                )}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  {/* Match score ring */}
                  <div className="relative flex-shrink-0">
                    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-secondary"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${(customer.matchScore / 100) * 113.1} 113.1`}
                        strokeLinecap="round"
                        className={cn(
                          customer.matchScore >= 90
                            ? "text-success"
                            : customer.matchScore >= 75
                              ? "text-primary"
                              : "text-warning"
                        )}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                      {customer.matchScore}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{customer.name}</p>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", statusStyles[customer.status]?.className)}
                      >
                        {customer.statusJa}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {customer.notes}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>
                        {"予算: "}{formatPrice(customer.budget.min)}{"〜"}{formatPrice(customer.budget.max)}{"円"}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {"最終連絡: "}{daysAgo(customer.lastContact)}
                      </span>
                      <span>{customer.sourceJa}</span>
                    </div>
                  </div>

                  {/* Match count + expand */}
                  <div className="flex items-center gap-3">
                    {customer.matchedVehicles.length > 0 && (
                      <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] text-primary">
                        <Target className="h-3 w-3" />
                        {customer.matchedVehicles.length}{"台マッチ"}
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {/* Contact info */}
                      <div className="rounded-md bg-secondary/50 p-3">
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          連絡先
                        </p>
                        <div className="flex flex-col gap-1.5 text-xs">
                          <div className="flex items-center gap-2 text-foreground/80">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-2 text-foreground/80">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {customer.email}
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div className="rounded-md bg-secondary/50 p-3">
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          希望条件
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {customer.preferences.bodyTypes.map((t) => (
                            <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                              {t}
                            </span>
                          ))}
                          {customer.preferences.makes.map((m) => (
                            <span key={m} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-foreground/70">
                              {m}
                            </span>
                          ))}
                          {customer.preferences.colors.map((c) => (
                            <span key={c} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-foreground/70">
                              {c}
                            </span>
                          ))}
                          {customer.preferences.features.map((f) => (
                            <span key={f} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-3 rounded-md bg-secondary/50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        メモ・AI分析
                      </p>
                      <p className="text-xs leading-relaxed text-foreground/80">{customer.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {/* How to add note */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {"顧客の追加は Symphony AI チャットから行えます。例: "}
          <span className="font-medium text-foreground">
            {'"新規顧客: 山本様、SUV希望、予算300万円、090-xxxx-xxxx"'}
          </span>
        </p>
      </div>
    </div>
  )
}
