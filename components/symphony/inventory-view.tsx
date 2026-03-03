"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VehicleIntake } from "@/components/symphony/vehicle-intake"
import {
  Car,
  Eye,
  MessageCircle,
  TrendingDown,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  Plus,
} from "lucide-react"

const statusStyles: Record<string, { className: string; label: string }> = {
  "in-inspection": { className: "bg-warning/15 text-warning border-warning/30", label: "検査中" },
  listed: { className: "bg-success/15 text-success border-success/30", label: "出品中" },
  sold: { className: "bg-muted text-muted-foreground border-border", label: "成約済" },
  "pending-purchase": { className: "bg-primary/15 text-primary border-primary/30", label: "仕入承認待ち" },
}

function formatPrice(price: number) {
  if (price === 0) return "---"
  return `${(price / 10000).toFixed(0)}万円`
}

function getAiInsight(vehicle: Vehicle): { type: "warning" | "opportunity" | "info"; text: string } | null {
  if (vehicle.status === "listed" && (vehicle.daysListed ?? 0) > 14 && (vehicle.inquiries ?? 0) < 2) {
    return {
      type: "warning",
      text: `掲載${vehicle.daysListed}日・問い合わせ${vehicle.inquiries}件 - 値下げ検討を推奨`,
    }
  }
  if (vehicle.status === "listed" && (vehicle.inquiries ?? 0) >= 5) {
    return {
      type: "opportunity",
      text: `問い合わせ${vehicle.inquiries}件・閲覧${vehicle.views}回 - 成約見込み高`,
    }
  }
  if (vehicle.status === "pending-purchase") {
    return {
      type: "info",
      text: "マッチング顧客あり - 承認キューをご確認ください",
    }
  }
  return null
}

export function InventoryView({ vehicles }: { vehicles: Vehicle[] }) {
  const [showIntake, setShowIntake] = useState(false)
  const listed = vehicles.filter((v) => v.status === "listed").length
  const inspecting = vehicles.filter((v) => v.status === "in-inspection").length
  const pending = vehicles.filter((v) => v.status === "pending-purchase").length

  return (
    <div className="flex flex-col gap-4">
      {/* Vehicle Intake Panel */}
      {showIntake && (
        <VehicleIntake
          onClose={() => setShowIntake(false)}
          onComplete={() => setShowIntake(false)}
        />
      )}

      {/* Summary strip */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-semibold text-foreground">在庫一覧</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>出品中: <span className="font-medium text-success">{listed}</span></span>
            <span>検査中: <span className="font-medium text-warning">{inspecting}</span></span>
            <span>仕入待ち: <span className="font-medium text-primary">{pending}</span></span>
          </div>
        </div>
        {!showIntake && (
          <Button
            size="sm"
            onClick={() => setShowIntake(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            車両データ取込
          </Button>
        )}
      </div>

      {/* AI summary banner */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div className="text-xs leading-relaxed text-foreground/80">
          <span className="font-medium text-foreground">AI分析サマリー: </span>
          在庫{vehicles.length}台中、メルセデス C200 とスバル フォレスターの2台が長期在庫化の兆候あり。
          アルファードは問い合わせ好調で早期成約の見込み。
          新規仕入候補のBMW 320iは3名の顧客希望と合致しており、承認を推奨します。
        </div>
      </div>

      {/* Vehicle table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">車両</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">ステータス</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">販売価格</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">利益率</th>
                <th className="hidden px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:table-cell">反応</th>
                <th className="hidden px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">AIインサイト</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const margin =
                  vehicle.purchasePrice > 0
                    ? ((vehicle.suggestedPrice - vehicle.purchasePrice) / vehicle.purchasePrice) * 100
                    : 0
                const insight = getAiInsight(vehicle)
                return (
                  <tr
                    key={vehicle.id}
                    className="group border-b border-border transition-colors last:border-0 hover:bg-secondary/30"
                  >
                    {/* Vehicle info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
                          <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{vehicle.year}年式</span>
                            <span>{(vehicle.mileage / 1000).toFixed(0)}{"K km"}</span>
                            <span>{vehicle.colorJa}</span>
                            <span>{"G:"}{vehicle.grade}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", statusStyles[vehicle.status]?.className)}
                      >
                        {vehicle.statusJa}
                      </Badge>
                      {(vehicle.daysListed ?? 0) > 0 && (
                        <div className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {vehicle.daysListed}日
                        </div>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(vehicle.suggestedPrice)}
                      </p>
                      {vehicle.purchasePrice > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {"仕入: "}{formatPrice(vehicle.purchasePrice)}
                        </p>
                      )}
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3 text-right">
                      {margin > 0 ? (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            margin >= 15 ? "text-success" : margin >= 8 ? "text-foreground" : "text-warning"
                          )}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">---</span>
                      )}
                    </td>

                    {/* Engagement */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-2.5 w-2.5" />
                          {vehicle.views ?? 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="h-2.5 w-2.5" />
                          {vehicle.inquiries ?? 0}
                        </span>
                      </div>
                    </td>

                    {/* AI Insight */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {insight ? (
                        <div
                          className={cn(
                            "flex items-start gap-1.5 rounded-md px-2.5 py-1.5 text-[10px]",
                            insight.type === "warning" && "bg-destructive/10 text-destructive",
                            insight.type === "opportunity" && "bg-success/10 text-success",
                            insight.type === "info" && "bg-primary/10 text-primary"
                          )}
                        >
                          {insight.type === "warning" ? (
                            <TrendingDown className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          ) : insight.type === "opportunity" ? (
                            <ArrowUpRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="leading-relaxed">{insight.text}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">---</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to add note */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3">
        <Car className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          {"車両の追加は上の「車両データ取込」ボタンから。写真・車検証・査定票・音声メモなど"}
          <span className="font-medium text-foreground">
            {"生の素材をAIが構造化"}
          </span>
          {"し、あなたが確認・修正して登録します。"}
        </p>
      </div>
    </div>
  )
}
