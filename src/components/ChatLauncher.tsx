"use client"

import { useEffect, useState } from "react"

export function ChatLauncher() {\n  const [label, setLabel] = useState("")\n  useEffect(() => {\n    const full = "How can I help?"\n    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setLabel(full); return }\n    let i = 0\n    const timer = window.setInterval(() => {\n      i += 1\n      setLabel(full.slice(0, i))\n      if (i >= full.length) window.clearInterval(timer)\n    }, 68)\n    return () => window.clearInterval(timer)\n  }, [])
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
