"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, Bot, User, Sparkles, Car, Users, Package, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ViewMode } from "@/lib/types"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  cards?: ChatCard[]
  navigateTo?: ViewMode
}

interface ChatCard {
  type: "vehicle-draft" | "customer-draft" | "action-result"
  title: string
  fields: { label: string; value: string }[]
  status: "draft" | "confirmed" | "processing"
}

const initialMessages: ChatMessage[] = [
  {
    id: "sys-1",
    role: "assistant",
    content:
      "おはようございます。本日の状況をお伝えします。\n\n5つのエージェントが稼働中です。承認キューに5件の依頼があります。\n\nUSS東京で BMW 320i M Sport のオークションが45分後に開始されます。3名の顧客希望と合致しており、入札承認をお待ちしています。\n\n車両・顧客の新規登録は各タブの「データ取込」ボタンから生素材（写真・書類・音声）を投入してください。AIが構造化し、確認を求めます。",
    timestamp: new Date("2026-03-03T09:00:00Z"),
  },
]

const quickActions = [
  { label: "車両を取込", icon: Car, navigateTo: "inventory" as ViewMode },
  { label: "顧客を取込", icon: Users, navigateTo: "customers" as ViewMode },
  { label: "在庫状況", icon: Package },
  { label: "本日のレポート", icon: FileText },
]

// Simulated responses for different input patterns
function getSimulatedResponse(message: string): { content: string; cards?: ChatCard[]; navigateTo?: ViewMode } {
  // Vehicle registration patterns
  if (
    message.includes("車両") && (message.includes("登録") || message.includes("追加") || message.includes("仕入") || message.includes("取込")) ||
    message.includes("プリウス") || message.includes("クラウン") || message.includes("USS") || message.includes("HAA")
  ) {
    return {
      content:
        "車両登録ですね。中古車は一物一価ですので、まず生の素材が必要です。\n\n" +
        "在庫一覧タブの「車両データ取込」ボタンから、以下の素材を投入してください:\n\n" +
        "- 車両写真（外装・内装・メーター・傷）\n" +
        "- 車検証（写真 or スキャン）\n" +
        "- オークション査定票（あれば）\n" +
        "- 口頭メモ（音声録音OK）\n\n" +
        "これらの素材からAIが車台番号・年式・走行距離・外装状態・市場相場を自動抽出し、あなたに確認を求めます。\n" +
        "素材が多いほど精度が上がります。",
      navigateTo: "inventory" as ViewMode,
    }
  }

  // Customer registration patterns
  if (
    message.includes("顧客") && (message.includes("登録") || message.includes("追加") || message.includes("新規") || message.includes("取込")) ||
    message.includes("様") && (message.includes("希望") || message.includes("予算"))
  ) {
    return {
      content:
        "顧客登録ですね。お客様の情報を正確に取り込むため、顧客一覧タブの「顧客データ取込」をご利用ください。\n\n" +
        "以下の素材からAIが名前・連絡先・希望条件を自動抽出します:\n\n" +
        "- 名刺（写真 or スキャン）\n" +
        "- 接客時の音声メモ\n" +
        "- LINE / メールのスクリーンショット\n" +
        "- 電話後のテキストメモ\n\n" +
        "抽出結果はすべて確度表示付きで、低確度の項目は次回接客時にお客様へ確認するようリマインドします。",
      navigateTo: "customers" as ViewMode,
    }
  }

  // Inventory status
  if (message.includes("在庫") || message.includes("棚卸") || message.includes("状況")) {
    return {
      content:
        "現在の在庫状況です。\n\n" +
        "出品中: 5台（うち好調2台、要対策2台、通常1台）\n" +
        "検査中: 2台（Honda Fit、Lexus NX 350h）\n" +
        "仕入待ち: 1台（BMW 320i M Sport）\n\n" +
        "注目ポイント:\n" +
        "- アルファードは問い合わせ14件で過去最高ペース\n" +
        "- C200とフォレスターは値下げまたは販路変更を検討中\n" +
        "- NX 350hの検査が本日中に完了予定\n\n" +
        "在庫一覧タブで詳細を確認できます。",
    }
  }

  // Report
  if (message.includes("レポート") || message.includes("売上") || message.includes("今日")) {
    return {
      content:
        "本日の売上見込みは約580万円です。\n\n" +
        "- 田中様（マツダ CX-5）: 成約確率 87% / 280万円\n" +
        "- 佐藤様（トヨタ アルファード）: 成約確率 72% / 598万円\n\n" +
        "エージェント稼働状況:\n" +
        "- 本日の処理タスク: 158件\n" +
        "- トークン消費: 707K / 2,150K（33%）\n" +
        "- 自動処理率: 94.2%（前月比 +2.1%）\n\n" +
        "全エージェントが正常稼働中です。",
    }
  }

  // Default
  return {
    content: `了解しました。「${message}」について関連エージェントに指示を出しました。\n\n処理結果は承認キューまたはアクティビティフィードに表示されます。\n\n何か他にありますか？`,
  }
}

export function CommandChat({ onNavigate }: { onNavigate?: (view: ViewMode) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (text?: string, navigateDirectly?: ViewMode) => {
    // If it's a quick action with direct navigation, navigate immediately
    if (navigateDirectly) {
      onNavigate?.(navigateDirectly)
      return
    }

    const message = text || input.trim()
    if (!message) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getSimulatedResponse(message)
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        cards: response.cards,
        navigateTo: response.navigateTo,
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 1500)
  }

  const handleCardAction = (messageId: string, action: "confirm" | "edit") => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.cards) return msg
        return {
          ...msg,
          cards: msg.cards.map((card) => ({
            ...card,
            status: action === "confirm" ? ("processing" as const) : ("draft" as const),
          })),
        }
      })
    )

    if (action === "confirm") {
      setIsTyping(true)
      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "assistant",
          content:
            "登録を受け付けました。各エージェントがバックグラウンドで処理を開始します。\n\n- 価格算定エージェント: 市場調査を開始\n- 仕入エージェント: オークション監視に追加\n- 顧客マッチングエージェント: マッチング候補を自動検索\n\n処理完了時に承認キューで結果をお伝えします。",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)
      }, 1000)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Symphony AI</h2>
        <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
          オンライン
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-2">
              <div className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                    msg.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3.5 py-2.5",
                    msg.role === "assistant"
                      ? "bg-secondary text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="whitespace-pre-line text-xs leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1.5 text-[10px]",
                      msg.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/60"
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Navigate action */}
              {msg.navigateTo && (
                <div className="ml-9 mr-4">
                  <button
                    onClick={() => onNavigate?.(msg.navigateTo!)}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {msg.navigateTo === "inventory" ? "在庫一覧タブへ移動" : "顧客一覧タブへ移動"}
                  </button>
                </div>
              )}

              {/* Structured cards */}
              {msg.cards?.map((card, idx) => (
                <div key={idx} className="ml-9 mr-4">
                  <div
                    className={cn(
                      "overflow-hidden rounded-lg border",
                      card.status === "processing"
                        ? "border-success/30 bg-success/5"
                        : "border-primary/30 bg-card"
                    )}
                  >
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                      {card.type === "vehicle-draft" ? (
                        <Car className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Users className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="text-xs font-medium text-foreground">{card.title}</span>
                      {card.status === "processing" && (
                        <span className="ml-auto rounded-full bg-success/20 px-2 py-0.5 text-[10px] text-success">
                          処理中
                        </span>
                      )}
                    </div>
                    <div className="px-3 py-2">
                      {card.fields.map((field, fIdx) => (
                        <div
                          key={fIdx}
                          className={cn(
                            "flex items-baseline justify-between py-1.5",
                            fIdx < card.fields.length - 1 && "border-b border-border/50"
                          )}
                        >
                          <span className="text-[10px] text-muted-foreground">{field.label}</span>
                          <span className="text-xs font-medium text-foreground">{field.value}</span>
                        </div>
                      ))}
                    </div>
                    {card.status === "draft" && (
                      <div className="flex gap-2 border-t border-border px-3 py-2">
                        <button
                          onClick={() => handleCardAction(msg.id, "confirm")}
                          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          この内容で登録
                        </button>
                        <button
                          onClick={() => handleCardAction(msg.id, "edit")}
                          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          修正する
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-xl bg-secondary px-3.5 py-2.5">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1.5 overflow-x-auto px-4 pb-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.label, action.navigateTo)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <action.icon className="h-3 w-3" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="車両登録、顧客追加、質問など何でも..."
            className="flex-1 rounded-lg border border-border bg-secondary px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="h-10 w-10 rounded-lg bg-primary p-0 text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">送���</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
