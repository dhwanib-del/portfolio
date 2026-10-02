"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Msg = { role: "user" | "assistant"; content: string; href?: string; linkLabel?: string }
type Mode = "ai" | "portfolio" | "offline"

const SUGGESTIONS = [
  { label: "Design superpower", query: "What does Dhwani do best?", n: "01" },
  { label: "The BRIEFS story", query: "Tell me about BRIEFS", n: "02" },
  { label: "AI, thoughtfully", query: "How does she use AI?", n: "03" },
  { label: "Open to a move?", query: "Is she open to relocating?", n: "04" },
]

export function Chat() {
  const [mode, setMode] = useState<Mode>("portfolio")
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    fetch("/api/ask").then((r) => r.json()).then((d) => setMode(d.enabled ? d.mode || "portfolio" : "offline")).catch(() => setMode("offline"))
    const on = () => { opener.current = document.activeElement as HTMLElement; setOpen(true) }
    window.addEventListener("open-chat", on)
    return () => window.removeEventListener("open-chat", on)
  }, [])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])
  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [msgs, busy])

  const close = () => { setOpen(false); setTimeout(() => opener.current?.focus(), 0) }

  const send = useCallback(async (text: string) => {
    const m = text.trim()
    if (!m || busy || mode === "offline") return
    setInput(""); setErr("")
    const next = [...msgs, { role: "user" as const, content: m }]
    setMsgs(next); setBusy(true)
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: m, history: msgs }) })
      const d = await r.json()
      if (!r.ok || d.error) throw new Error(d.error)
      setMode(d.mode || mode)
      setMsgs([...next, { role: "assistant", content: d.reply, href: d.href, linkLabel: d.linkLabel }])
    } catch {
      setErr("I couldn't answer that just now. Try again, or email Dhwani.")
    } finally { setBusy(false) }
  }, [msgs, busy, mode])

  if (!open) return null
  return (
    <section id="portfolio-chat" className="chat" role="dialog" aria-modal="false" aria-labelledby="chat-h" onKeyDown={(e) => e.key === "Escape" && close()}>
      <div className="chat-top">
        <div className="chat-identity">
          <span className="chat-mark" lang="hi" aria-hidden="true">ध्वनि<span>?</span></span>
          <div className="chat-identity-copy">
            <p className="chat-overline">A LITTLE PORTFOLIO SIDEKICK</p>
            <h2 id="chat-h">DhwaniGPT <span className={"chat-live " + (mode === "offline" ? "is-offline" : "")} aria-hidden="true" /></h2>
            <p>{mode === "ai" ? "AI-assisted · grounded in published work." : mode === "offline" ? "Offline for now · email Dhwani instead." : "Portfolio facts only · no guessing."}</p>
          </div>
        </div>
        <button type="button" className="tour-x" aria-label="Close chat" onClick={close}>×</button>
      </div>
      <div className="chat-log" aria-live="polite">
        <p className="chat-msg a">Hey! Ask me about a project, Dhwani’s process, or what she’s looking for.</p>
        {msgs.map((m, i) => <div key={i} className={"chat-message " + (m.role === "user" ? "user" : "assistant")}>
          <p className={"chat-msg " + (m.role === "user" ? "u" : "a")}>{m.content}</p>
          {m.href && <a className="chat-source" href={m.href}>{m.linkLabel || "Open source ↗"}</a>}
        </div>)}
        {busy && <p className="chat-msg a"><span className="dots" aria-label="Thinking"><i /><i /><i /></span></p>}
        {err && <p className="chat-err" role="alert">{err}</p>}
        <div ref={endRef} />
      </div>
      {mode !== "offline" && msgs.length === 0 && (
        <div className="chat-sugs">
          <p className="chat-sugs-label">PICK A THREAD <span aria-hidden="true">↘</span></p>
          <div className="chat-sugs-grid">{SUGGESTIONS.map((s) => <button key={s.n} type="button" onClick={() => send(s.query)}><span className="chat-sug-index">{s.n}</span><span>{s.label}</span><span className="chat-sug-arrow" aria-hidden="true">↗</span></button>)}</div>
        </div>
      )}
      {mode !== "offline" ? <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <label htmlFor="chat-in" className="sr-only">Ask about Dhwani</label>
        <input id="chat-in" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me something…" maxLength={600} disabled={busy} />
        <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}>Send <span aria-hidden="true">↗</span></button>
      </form> : <div className="chat-form"><a className="btn btn-primary" href="mailto:dhwanib@umich.edu">Email Dhwani ↗</a></div>}
      <p className="chat-footnote">No private details, please. This chat isn’t saved.</p>
    </section>
  )
}
