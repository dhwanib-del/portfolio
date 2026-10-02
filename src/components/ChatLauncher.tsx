"use client"

export function ChatLauncher() {
  return (
    <button
      type="button"
      className="footer-chat-launcher"
      onClick={() => window.dispatchEvent(new Event("open-chat"))}
      aria-haspopup="dialog"
      aria-controls="portfolio-chat"
    >
      How can I help? <span aria-hidden>↗</span>
    </button>
  )
}
