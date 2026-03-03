"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Camera,
  FileText,
  Mic,
  Upload,
  Globe,
  Sparkles,
  Check,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type IntakeStep = "source" | "uploading" | "extracting" | "review" | "confirmed"

interface ExtractedField {
  key: string
  label: string
  value: string
  confidence: "high" | "medium" | "low"
  source: string
  editable: boolean
  edited?: boolean
}

interface UploadedFile {
  id: string
  name: string
  type: "photo" | "document" | "auction-sheet" | "inspection-sheet"
  typeJa: string
  preview?: string
  status: "uploaded" | "processing" | "done"
}

// Simulated extraction results based on uploaded files
const mockExtractedFields: ExtractedField[] = [
  { key: "make", label: "メーカー", value: "トヨタ", confidence: "high", source: "車検証OCR", editable: true },
  { key: "model", label: "車名", value: "プリウス", confidence: "high", source: "車検証OCR", editable: true },
  { key: "year", label: "年式", value: "2023", confidence: "high", source: "車検証OCR", editable: true },
  { key: "grade", label: "グレード", value: "Z", confidence: "medium", source: "写真AI解析", editable: true },
  { key: "color", label: "色", value: "ホワイトパール", confidence: "high", source: "写真AI解析", editable: true },
  { key: "mileage", label: "走行距離", value: "12,340 km", confidence: "high", source: "メーター写真OCR", editable: true },
  { key: "vin", label: "車台番号", value: "ZVW60-0012345", confidence: "high", source: "車検証OCR", editable: true },
  { key: "inspection", label: "車検満了", value: "2027年3月", confidence: "high", source: "車検証OCR", editable: true },
  { key: "accidents", label: "修復歴", value: "なし", confidence: "medium", source: "査定票 + 写真AI", editable: true },
  { key: "exterior", label: "外装状態", value: "右リアドアに微細な擦り傷(3cm)を検出", confidence: "medium", source: "写真AI解析", editable: true },
  { key: "interior", label: "内装状態", value: "良好 - 目立つ汚れ・破れなし", confidence: "medium", source: "写真AI解析", editable: true },
  { key: "tire", label: "タイヤ残溝", value: "前5mm / 後6mm（推定）", confidence: "low", source: "写真AI推定", editable: true },
  { key: "market_price", label: "市場相場", value: "268万〜298万円", confidence: "high", source: "市場DB照合(47件)", editable: false },
  { key: "suggested_purchase", label: "推奨仕入価格", value: "248万円以下", confidence: "high", source: "AI価格算定", editable: false },
  { key: "suggested_retail", label: "推奨販売価格", value: "289万円", confidence: "high", source: "AI価格算定", editable: false },
  { key: "matching_customers", label: "マッチング顧客", value: "2名（田中様94%, 鈴木様76%）", confidence: "high", source: "顧客DB照合", editable: false },
]

const confidenceStyles = {
  high: { bg: "bg-success/10", text: "text-success", label: "高確度" },
  medium: { bg: "bg-warning/10", text: "text-warning", label: "要確認" },
  low: { bg: "bg-destructive/10", text: "text-destructive", label: "低確度" },
}

const inputSources = [
  {
    id: "photos",
    icon: Camera,
    label: "車両写真",
    description: "外装・内装・メーター・傷など",
    accept: "image/*",
    multiple: true,
  },
  {
    id: "shaken",
    icon: FileText,
    label: "車検証",
    description: "車検証の写真またはスキャン",
    accept: "image/*,.pdf",
    multiple: false,
  },
  {
    id: "auction",
    icon: Globe,
    label: "オークション査定票",
    description: "USS/HAA/JUなどの査定票",
    accept: "image/*,.pdf",
    multiple: false,
  },
  {
    id: "voice",
    icon: Mic,
    label: "音声メモ",
    description: "現車確認時の口頭メモ",
    accept: "audio/*",
    multiple: false,
  },
]

export function VehicleIntake({ onClose, onComplete }: { onClose: () => void; onComplete?: () => void }) {
  const [step, setStep] = useState<IntakeStep>("source")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showAllFields, setShowAllFields] = useState(false)
  const [auctionUrl, setAuctionUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentSourceId, setCurrentSourceId] = useState<string | null>(null)

  const handleFileSelect = useCallback(
    (sourceId: string) => {
      setCurrentSourceId(sourceId)
      if (fileInputRef.current) {
        const source = inputSources.find((s) => s.id === sourceId)
        if (source) {
          fileInputRef.current.accept = source.accept
          fileInputRef.current.multiple = source.multiple
          fileInputRef.current.click()
        }
      }
    },
    []
  )

  const handleFilesAdded = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      const typeMap: Record<string, UploadedFile["type"]> = {
        photos: "photo",
        shaken: "document",
        auction: "auction-sheet",
        voice: "inspection-sheet",
      }
      const typeJaMap: Record<string, string> = {
        photos: "車両写真",
        shaken: "車検証",
        auction: "査定票",
        voice: "音声メモ",
      }

      const newFiles: UploadedFile[] = Array.from(files).map((f, i) => ({
        id: `file-${Date.now()}-${i}`,
        name: f.name,
        type: typeMap[currentSourceId || "photos"] || "photo",
        typeJa: typeJaMap[currentSourceId || "photos"] || "写真",
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
        status: "uploaded" as const,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])
      e.target.value = ""
    },
    [currentSourceId]
  )

  const startExtraction = useCallback(() => {
    setStep("uploading")

    // Simulate upload progress
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "processing" as const }))
      )
      setStep("extracting")
    }, 800)

    // Simulate extraction
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) => ({ ...f, status: "done" as const }))
      )
      setExtractedFields(mockExtractedFields)
      setStep("review")
    }, 3000)
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

  const fieldsToShow = showAllFields ? extractedFields : extractedFields.slice(0, 8)
  const needsReviewCount = extractedFields.filter(
    (f) => f.confidence === "low" || f.confidence === "medium"
  ).length

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Upload className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">車両データ取込</h3>
            <p className="text-[10px] text-muted-foreground">
              生素材を投入 → AI が構造化 → あなたが確認
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-0 border-b border-border px-4 py-2">
        {(["投入", "AI解析", "確認・修正", "完了"] as const).map((label, idx) => {
          const stepIndex = ["source", "extracting", "review", "confirmed"].indexOf(step)
          const isActive = idx <= (step === "uploading" ? 0 : stepIndex)
          const isCurrent = idx === (step === "uploading" ? 0 : stepIndex)
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
                  {isActive && idx < stepIndex ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    idx + 1
                  )}
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
        {/* STEP 1: Source input */}
        {step === "source" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              車両の生データを投入してください。写真、書類、音声 -- どんな形式でもAIが解析します。
              複数素材を組み合わせるほど精度が上がります。
            </p>

            <div className="grid grid-cols-2 gap-2">
              {inputSources.map((source) => {
                const uploaded = uploadedFiles.filter(
                  (f) =>
                    (source.id === "photos" && f.type === "photo") ||
                    (source.id === "shaken" && f.type === "document") ||
                    (source.id === "auction" && f.type === "auction-sheet") ||
                    (source.id === "voice" && f.type === "inspection-sheet")
                ).length

                return (
                  <button
                    key={source.id}
                    onClick={() => handleFileSelect(source.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-all hover:border-primary/40 hover:bg-primary/5",
                      uploaded > 0 ? "border-primary/30 bg-primary/5" : "border-border"
                    )}
                  >
                    <source.icon
                      className={cn(
                        "h-6 w-6",
                        uploaded > 0 ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs font-medium text-foreground">{source.label}</span>
                    <span className="text-center text-[10px] text-muted-foreground">
                      {source.description}
                    </span>
                    {uploaded > 0 && (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/20">
                        {uploaded}件アップロード済
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Auction URL input */}
            <div className="rounded-lg border border-border p-3">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                オークションURL（任意）
              </label>
              <div className="flex gap-2">
                <input
                  value={auctionUrl}
                  onChange={(e) => setAuctionUrl(e.target.value)}
                  placeholder="https://uss.jp/auction/..."
                  className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <Button size="sm" variant="outline" className="text-xs" disabled={!auctionUrl}>
                  <Globe className="mr-1 h-3 w-3" />
                  取得
                </Button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                USS / HAA / JU のオークションページURLからデータを自動取得
              </p>
            </div>

            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-foreground">
                  アップロード済み（{uploadedFiles.length}件）
                </p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1.5"
                    >
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-6 w-6 rounded object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="max-w-[120px] truncate text-[10px] text-foreground">
                        {file.name}
                      </span>
                      <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] text-primary">
                        {file.typeJa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={startExtraction}
              disabled={uploadedFiles.length === 0}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI解析を開始（{uploadedFiles.length}件の素材）
            </Button>
          </div>
        )}

        {/* STEP 2: Uploading / Extracting */}
        {(step === "uploading" || step === "extracting") && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
              <Sparkles className="absolute h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {step === "uploading" ? "ファイルをアップロード中..." : "AIがデータを解析中..."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {step === "uploading"
                  ? `${uploadedFiles.length}件のファイルを処理しています`
                  : "写真AI解析 / OCR / 市場DB照合 / 顧客マッチングを並行実行中"}
              </p>
            </div>
            {step === "extracting" && (
              <div className="flex w-full max-w-xs flex-col gap-1.5 text-[10px]">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        file.status === "done" ? "bg-success" : "bg-primary animate-pulse"
                      )}
                    />
                    <span className="text-muted-foreground">{file.typeJa}: {file.name}</span>
                    <span className={cn("ml-auto", file.status === "done" ? "text-success" : "text-primary")}>
                      {file.status === "done" ? "完了" : "処理中..."}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Review extracted data */}
        {step === "review" && (
          <div className="flex flex-col gap-3">
            {/* Summary banner */}
            <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="text-xs text-foreground/80">
                <span className="font-medium text-foreground">
                  {uploadedFiles.length}件の素材から{extractedFields.length}項目を抽出しました。
                </span>
                {needsReviewCount > 0 && (
                  <span className="text-warning">
                    {" "}{needsReviewCount}項目が要確認です。
                  </span>
                )}
                {" "}各項目の出典と確度を確認し、必要に応じて修正してください。
              </div>
            </div>

            {/* Extracted fields */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-secondary/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                抽出データ -- 出典・確度付き
              </div>
              {fieldsToShow.map((field) => {
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

            {extractedFields.length > 8 && (
              <button
                onClick={() => setShowAllFields(!showAllFields)}
                className="flex items-center justify-center gap-1 text-xs text-primary hover:text-primary/80"
              >
                {showAllFields ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> 折りたたむ
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> 残り{extractedFields.length - 8}
                    項目を表示（市場相場・推奨価格・マッチング結果）
                  </>
                )}
              </button>
            )}

            {/* Confidence legend */}
            {needsReviewCount > 0 && (
              <div className="flex items-start gap-2 rounded-md bg-warning/5 border border-warning/20 px-3 py-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                <p className="text-[10px] text-foreground/70">
                  <span className="font-medium text-warning">要確認項目があります。</span>
                  {" "}AI解析の確度が低い項目は現車で再確認してください。
                  修正ボタンで正しい値を入力すると、今後の解析精度も向上します。
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
              各エージェントがバックグラウンドで処理を開始しました。
              <br />
              検査エージェント / 価格算定エージェント / 出品エージェント が並行稼働中です。
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFilesAdded}
      />
    </div>
  )
}
