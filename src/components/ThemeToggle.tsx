"use client"
// Sun/moon button. Default follows the OS; a click saves an explicit choice (localStorage "theme").
import { useEffect, useState } from "react"

type Theme = "light" | "dark"

function current(): Theme {
  const set = document.documentElement.getAttribute("data-theme")
  if (set === "light" || set === "dark") return set
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(current())
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const on = () => setTheme(current())
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])

  const toggle = () => {
    const next: Theme = current() === "light" ? "dark" : "light"
    document.documentElement.setAttribute("data-theme", next)
    try { localStorage.setItem("theme", next) } catch {}
    setTheme(next)
  }

  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode"
  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label={label} title={label}>
      {theme === "light" ? (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      ) : (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      )}
    </button>
  )
}
