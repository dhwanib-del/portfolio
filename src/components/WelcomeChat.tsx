"use client"

import { useEffect, useState } from "react"

const GREETING = "Hello, I’m Dhwani. How can I help you?"

export function WelcomeChat() {
  const [typed, setTyped] = useState("")
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(GREETING)
      return
    }
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTyped(GREETING.slice(0, index))
      if (index >= GREETING.length) window.clearInterval(timer)
    }, 34)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="welcome-chat">
      <span className="welcome-chat-dot" aria-hidden="true">✳</span>
      <span className="sr-only">{GREETING}</span>
      <span className="welcome-chat-text" aria-hidden="true">{typed}<i /></span>
      <button type="button" className="welcome-chat-button" onClick={() => window.dispatchEvent(new Event("open-chat"))}>
        Ask DhwaniGPT <span aria-hidden="true">↗</span>
      </button>
    </div>
  )
}
