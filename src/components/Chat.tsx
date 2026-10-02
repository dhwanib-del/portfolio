"use client"
// DhwaniGPT panel (rebuilt from Dhwani's Framer DhwaniGPT). Only appears when the backend is on
// (/api/ask GET → enabled). Opens from the tour ("Ask a question") via the "open-chat" event.
// AI-native basics: says it's AI, answers only from the portfolio, suggestion chips to start,
// clear loading and error states, Esc closes, focus returns, replies announced politely.
import { useCallback, useEffect, useRef, useState } from "react"

type Msg = { role: "user" | "assistant"; content: string }
const SUGGESTIONS = ["What does Dhwani do best?", "Tell me about BRIEFS", "How does she use AI?", "Is she open to relocating?"]

export function Chat() {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    fetch("/api/ask").then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => {})
    const on = () => { opener.current = document.activeElement as HTMLElement; setOpen(true) }
    window.addEventListener("open-chat", on)
    return () => window.removeEventListener("open-chat", on)
  }, [])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])
  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [msgs, busy])

  const close = () => { setOpen(false); setTimeout(() => opener.current?.focus(), 0) }

  const send = useCallback(async (text: string) => {
    const m = text.trim()
    if (!m || busy) return
    setInput(""); setErr("")
    const next = [...msgs, { role: "user" as const, content: m }]
    setMsgs(next); setBusy(true)
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: m, history: msgs }) })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error)
      setMsgs([...next, { role: "assistant", content: d.reply }])
    } catch {
      setErr("I couldn't answer that right now. Try again, or contact Dhwani directly.")
    } finally { setBusy(false) }
  }, [msgs, busy])

  if (!enabled || !open) return null
  return (
    <div className="chat" role="dialog" aria-modal="false" aria-labelledby="chat-h" onKeyDown={(e) => e.key === "Escape" && close()}>
      <div className="chat-top">
        <div>
          <h2 id="chat-h">DhwaniGPT</h2>
          <p>An AI that answers only from this portfolio. It can be wrong.</p>
        </div>
        <button type="button" className="tour-x" aria-label="Close chat" onClick={close}>×</button>
      </div>
      <div className="chat-log" aria-live="polite">
        <p className="chat-msg a">Hi! Ask me about Dhwani&apos;s work, how she uses AI, or what she&apos;s looking for.</p>
        {msgs.map((m, i) => <p key={i} className={`chat-msg ${m.role === "user" ? "u" : "a"}`}>{m.content}</p>)}
        {busy && <p className="chat-msg a"><span className="dots" aria-label="Thinking"><i /><i /><i /></span></p>}
        {err && <p className="chat-err" role="alert">{err}</p>}
        <div ref={endRef} />
      </div>
      {msgs.length === 0 && (
        <div className="chat-sugs">{SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}</div>
      )}
      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <label htmlFor="chat-in" className="sr-only">Ask about Dhwani</label>
        <input id="chat-in" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about Dhwani…" maxLength={600} disabled={busy} />
        <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}>Send</button>
      </form>
    </div>
  )
}
