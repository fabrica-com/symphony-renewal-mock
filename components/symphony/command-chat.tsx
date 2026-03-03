"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: ChatMessage[] = [
  {
    id: "sys-1",
    role: "assistant",
    content:
      "おはようございます。本日の状況をお伝えします。\n\n5つのエージェントが稼働中です。承認キューに5件の依頼があります。\n\n特に注目すべきは、USS東京で BMW 320i M Sport のオークションが45分後に開始されます。3名の顧客希望と合致しており、入札承認をお待ちしています。\n\nまた、メルセデス C200 の値下げ提案もご確認ください。21日間問い合わせゼロのため、早期対応が推奨されます。",
    timestamp: new Date("2026-03-03T09:00:00Z"),
  },
]

const quickActions = [
  "今日の売上見込みは？",
  "在庫で動きが悪い車両は？",
  "今週のオークション予定",
  "全エージェントのステータス",
]

export function CommandChat() {
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

  const handleSend = (text?: string) => {
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

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "今日の売上見込みは？":
          "本日の売上見込みは約580万円です。\n\n- 田中様（マツダ CX-5）: 成約確率 87% → 280万円\n- 佐藤様（トヨタ RAV4）: 成約確率 72% → 298万円\n\n顧客マッチングエージェントが両案件をフォロー中です。田中様には本日午後にパーソナライズ提案を送信予定です。",
        "在庫で動きが悪い車両は？":
          "掲載14日以上で反応の薄い車両が3台あります。\n\n1. メルセデス C200（21日・問い合わせ0件）→ 値下げ承認を提出済み\n2. スバル フォレスター 2021（18日・問い合わせ1件）→ 価格算定エージェントが分析中\n3. 日産 ノート e-POWER（16日・問い合わせ2件）→ 写真の差し替えを検討中\n\nC200の値下げ承認を優先してご対応ください。",
        "今週のオークション予定":
          "今週のオークションスケジュール:\n\n本日 10:00 - USS東京（BMW 320i M Sport 入札承認済み待ち）\n明日 13:00 - HAA神戸（監視対象: 5台）\n3/5 09:00 - JU岐阜（監視対象: 3台）\n3/6 11:00 - USS名古屋（監視対象: 8台）\n\n仕入エージェントが全オークションを監視しています。予算枠の残りは今月あと1,200万円です。",
        "全エージェントのステータス":
          "各エージェントの状況:\n\n[稼働中] 価格算定エージェント - トヨタ クラウンの分析中（トークン: 28%使用）\n[稼働中] 顧客マッチングエージェント - 12件の照合中（トークン: 51%使用）\n[稼働中] 出品エージェント - 3台の写真・説明文生成中（トークン: 51%使用）\n[承認待ち] 車両検査エージェント - Honda Fitのレポート承認待ち（トークン: 30%使用）\n[待機中] 仕入エージェント - 次回スキャンまで14分（トークン: 16%使用）\n\n全体のトークン効率は94.2%で先月比+2.1%向上しています。",
      }

      const response =
        responses[message] ||
        `了解しました。「${message}」について調査します。\n\n関連するエージェントにタスクを振り分けました。数分以内に結果をお伝えします。\n\nなお、現在承認キューに5件の依頼がありますので、そちらもご確認ください。`

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 1500)
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
            <div
              key={msg.id}
              className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}
            >
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
            key={action}
            onClick={() => handleSend(action)}
            className="flex-shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {action}
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
            placeholder="質問や指示を入力..."
            className="flex-1 rounded-lg border border-border bg-secondary px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim()}
            className="h-10 w-10 rounded-lg bg-primary p-0 text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">送信</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
