"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Users,
  Phone,
  MessageSquare,
  Mail,
  Sparkles,
  Check,
  Pencil,
  X,
  Loader2,
  FileText,
  Mic,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type IntakeStep = "source" | "extracting" | "review" | "confirmed"

interface ExtractedField {
  key: string
  label: string
  value: string
  confidence: "high" | "medium" | "low"
  source: string
  editable: boolean
  edited?: boolean
}

const confidenceStyles = {
  high: { bg: "bg-success/10", text: "text-success", label: "高確度" },
  medium: { bg: "bg-warning/10", text: "text-warning", label: "要確認" },
  low: { bg: "bg-destructive/10", text: "text-destructive", label: "低確度" },
}

const mockCustomerExtraction: ExtractedField[] = [
  { key: "name", label: "お名前", value: "山本 太郎", confidence: "high", source: "名刺OCR", editable: true },
  { key: "kana", label: "フリガナ", value: "ヤマモト タロウ", confidence: "high", source: "名刺OCR", editable: true },
  { key: "phone", label: "電話番号", value: "090-1234-5678", confidence: "high", source: "名刺OCR", editable: true },
  { key: "email", label: "メール", value: "yamamoto@example.com", confidence: "high", source: "名刺OCR", editable: true },
  { key: "body_type", label: "希望ボディタイプ", value: "SUV", confidence: "medium", source: "会話解析", editable: true },
  { key: "budget_min", label: "予算下限", value: "250万円", confidence: "medium", source: "会話解析", editable: true },
  { key: "budget_max", label: "予算上限", value: "350万円", confidence: "medium", source: "会話解析", editable: true },
  { key: "color_pref", label: "希望色", value: "ホワイト / ブラック", confidence: "low", source: "会話推定", editable: true },
  { key: "usage", label: "用途", value: "週末のアウトドア + 通勤", confidence: "medium", source: "会話解析", editable: true },
  { key: "timing", label: "購入時期", value: "1ヶ月以内", confidence: "medium", source: "会話解析", editable: true },
  { key: "family", label: "家族構成", value: "夫婦 + 子供2名（推定）", confidence: "low", source: "会話推定", editable: true },
  { key: "match_result", label: "即時マッチング", value: "マツダ CX-5 適合率89% / スバル フォレスター 適合率72%", confidence: "high", source: "在庫DB照合", editable: false },
]

const inputMethods = [
  {
    id: "card",
    icon: FileText,
    label: "名刺",
    description: "名刺の写真を撮影またはスキャン",
  },
  {
    id: "voice",
    icon: Mic,
    label: "接客メモ（音声）",
    description: "接客中の会話を録音してAIが要件を抽出",
  },
  {
    id: "line",
    icon: MessageSquare,
    label: "LINE / メッセージ",
    description: "LINEやメールの会話スクリーンショット",
  },
  {
    id: "phone",
    icon: Phone,
    label: "電話メモ",
    description: "電話後のテキストメモを入力",
  },
]

export function CustomerIntake({ onClose, onComplete }: { onClose: () => void; onComplete?: () => void }) {
  const [step, setStep] = useState<IntakeStep>("source")
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [freeText, setFreeText] = useState("")

  const toggleMethod = useCallback((id: string) => {
    setSelectedMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }, [])

  const startExtraction = useCallback(() => {
    setStep("extracting")
    setTimeout(() => {
      setExtractedFields(mockCustomerExtraction)
      setStep("review")
    }, 2500)
  }, [])

  const handleEdit = useCallback((key: string, currentValue: string) => {
    setEditingField(key)
    setEditValue(currentValue)
  }, [])

  const handleEditSave = useCallback(
    (key: string) => {
      setExtractedFields((prev) =>
        prev.map((f) =>
          f.key === key ? { ...f, value: editValue, edited: true, confidence: "high" as const } : f
        )
      )
      setEditingField(null)
      setEditValue("")
    },
    [editValue]
  )

  const handleConfirm = useCallback(() => {
    setStep("confirmed")
    setTimeout(() => {
      onComplete?.()
    }, 2000)
  }, [onComplete])

  const needsReviewCount = extractedFields.filter(
    (f) => f.confidence === "low" || f.confidence === "medium"
  ).length

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Users className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">顧客データ取込</h3>
            <p className="text-[10px] text-muted-foreground">
              名刺・会話・メッセージ → AIが顧客情報を構造化
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0 border-b border-border px-4 py-2">
        {(["素材選択", "AI解析", "確認・修正", "完了"] as const).map((label, idx) => {
          const stepIndex = ["source", "extracting", "review", "confirmed"].indexOf(step)
          const isActive = idx <= stepIndex
          const isCurrent = idx === stepIndex
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  {isActive && idx < stepIndex ? <Check className="h-3 w-3" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-[10px] sm:inline",
                    isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1",
                    isActive && idx < stepIndex ? "bg-primary/40" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* STEP 1 */}
        {step === "source" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              顧客との接点から得た生データを選択してください。
              名刺、通話録音、LINEのスクリーンショット等からAIが顧客情報と希望条件を自動抽出します。
            </p>

            <div className="grid grid-cols-2 gap-2">
              {inputMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-all hover:border-primary/40 hover:bg-primary/5",
                    selectedMethods.includes(method.id)
                      ? "border-primary/30 bg-primary/5"
                      : "border-border"
                  )}
                >
                  <method.icon
                    className={cn(
                      "h-6 w-6",
                      selectedMethods.includes(method.id)
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="text-xs font-medium text-foreground">{method.label}</span>
                  <span className="text-center text-[10px] text-muted-foreground">
                    {method.description}
                  </span>
                  {selectedMethods.includes(method.id) && (
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/20">選択中</Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Free text area for phone/walk-in notes */}
            <div className="rounded-lg border border-border p-3">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                テキストメモ（任意）
              </label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="例: 30代男性、SUV希望、予算250-350万、白か黒、週末アウトドア用途、子供2人..."
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                rows={3}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                来店接客や電話後に気づいたことを自由記述。AIが構造化します。
              </p>
            </div>

            <Button
              onClick={startExtraction}
              disabled={selectedMethods.length === 0 && !freeText.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI解析を開始
            </Button>
          </div>
        )}

        {/* STEP 2: Extracting */}
        {step === "extracting" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
              <Users className="absolute h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">顧客情報を解析中...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                テキスト解析 / 名刺OCR / 在庫マッチングを並行実行中
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === "review" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="text-xs text-foreground/80">
                <span className="font-medium text-foreground">
                  {extractedFields.length}項目を抽出しました。
                </span>
                {needsReviewCount > 0 && (
                  <span className="text-warning">
                    {" "}{needsReviewCount}項目が要確認です。
                  </span>
                )}
                {" "}会話から推定した項目は確度が低いため、お客様に確認してください。
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <div className="bg-secondary/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                抽出データ -- 出典・確度付き
              </div>
              {extractedFields.map((field) => {
                const conf = confidenceStyles[field.confidence]
                const isEditing = editingField === field.key
                return (
                  <div
                    key={field.key}
                    className={cn(
                      "flex items-start gap-3 border-b border-border px-3 py-2.5 last:border-0",
                      field.confidence === "low" && "bg-destructive/5"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{field.label}</span>
                        <span className={cn("rounded px-1 py-0.5 text-[9px]", conf.bg, conf.text)}>
                          {conf.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground/60">{field.source}</span>
                        {field.edited && (
                          <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] text-primary">
                            手動修正
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="mt-1 flex gap-1.5">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 rounded border border-primary/40 bg-secondary px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave(field.key)
                              if (e.key === "Escape") setEditingField(null)
                            }}
                          />
                          <Button
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleEditSave(field.key)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-0.5 text-xs font-medium text-foreground">{field.value}</p>
                      )}
                    </div>
                    {field.editable && !isEditing && (
                      <button
                        onClick={() => handleEdit(field.key, field.value)}
                        className="mt-1 flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {needsReviewCount > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                <p className="text-[10px] text-foreground/70">
                  <span className="font-medium text-warning">要確認項目があります。</span>
                  {" "}会話からの推定値は次回の接客時にお客様へ確認してください。
                  修正するとAI精度が向上します。
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="mr-1.5 h-4 w-4" />
                この内容で登録
              </Button>
              <Button variant="outline" onClick={() => setStep("source")} className="px-4">
                素材を追加
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmed */}
        {step === "confirmed" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Check className="h-7 w-7 text-success" />
            </div>
            <p className="text-sm font-semibold text-foreground">登録完了</p>
            <p className="text-center text-xs text-muted-foreground">
              顧客マッチングエージェントが在庫との照合を開始しました。
              <br />
              マッチ結果は承認キューに表示されます。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
