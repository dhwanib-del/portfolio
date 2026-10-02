"use client"

import { useEffect, useState } from "react"

export function ChatLauncher() {
  const [label, setLabel] = useState("")
  useEffect(() => {
    const full = "How can I help?"
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setLabel(full); return }
    let i = 0
    const timer = window.setInterval(() => {
      i += 1
      setLabel(full.slice(0, i))
      if (i >= full.length) window.clearInterval(timer)
    }, 68)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <button
      type="button"
      className="footer-chat-launcher"
      onClick={() => window.dispatchEvent(new Event("open-chat"))}
      aria-haspopup="dialog"
      aria-controls="portfolio-chat"
    >
      <span className="typing-label">{label}<i aria-hidden="true" /></span> <span aria-hidden>↗</span>
    </button>
  )
}
