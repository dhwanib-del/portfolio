"use client"
// Site nav: glass pill (desktop) / bar + sheet (phone). Theme toggle. "work" stays marked on
// /work/* and while the homepage work section is on screen. Esc closes the sheet, focus is trapped
// while open and returns to the menu button.
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ThemeToggle } from "./ThemeToggle"

const TABS = [
  { label: "home", href: "/" },
  { label: "about me", href: "/about" },
  { label: "work", href: "/#work" },
  { label: "play", href: "/lab" },
  { label: "connect", href: "/#contact" },
]

function Lights() {
  return (
    <span aria-hidden className="nav-lights">
      <i style={{ background: "#FF5F57" }} />
      <i style={{ background: "#FFBD2E" }} />
      <i style={{ background: "#28CA41" }} />
    </span>
  )
}

export function Nav() {
  const path = usePathname() || "/"
  const [section, setSection] = useState("")
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Scroll-spy for homepage sections
  useEffect(() => {
    if (path !== "/") return setSection("")
    const ids = ["work", "contact"]
    const check = () => {
      const line = window.innerHeight * 0.4
      let found = ""
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) found = id
      }
      setSection(found)
    }
    check()
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [path])

  useEffect(() => setOpen(false), [path])

  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    sheetRef.current?.querySelector<HTMLElement>("a,button")?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        btnRef.current?.focus()
      }
      if (e.key !== "Tab") return
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(".nav-bar a, .nav-bar button, .nav-sheet a, .nav-sheet button"))
      const i = nodes.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); nodes[nodes.length - 1]?.focus() }
      else if (!e.shiftKey && i === nodes.length - 1) { e.preventDefault(); nodes[0]?.focus() }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  const isCurrent = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2)
      if (id === "work" && path.startsWith("/work")) return true
      return path === "/" && section === id
    }
    if (href === "/") return path === "/" && !section
    return path === href || path.startsWith(href + "/")
  }

  return (
    <header className="nav">
      <a href="#main" className="skip-link">Skip to content</a>
      <nav aria-label="Main" className="nav-pill">
        <Link className="nav-wordmark" href="/" aria-label="Dhwani Bagrecha home"><span lang="hi">ध्वनि</span><span className="nav-wordmark-question" aria-hidden="true">?</span></Link>
        <Lights />
        <span aria-hidden className="nav-div" />
        <ul>
          {TABS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="nav-tab" aria-current={isCurrent(t.href) ? "page" : undefined}>
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
        <span aria-hidden className="nav-div" />
        <ThemeToggle />
      </nav>

      <div className="nav-bar">
        <span className="nav-brand">
          <Lights />
          <Link href="/" className="nav-wordmark" aria-label="Dhwani Bagrecha home"><span lang="hi">ध्वनि</span><span className="nav-wordmark-question" aria-hidden="true">?</span></Link>
        </span>
        <span className="nav-bar-r">
          <ThemeToggle />
          <button ref={btnRef} type="button" className="nav-menu" aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen((o) => !o)}>
            <span aria-hidden className={open ? "nav-burger x" : "nav-burger"}><i /><i /></span>
            {open ? "close" : "menu"}
          </button>
        </span>
      </div>
      {open && (
        <>
          <div className="nav-scrim" aria-hidden onClick={() => setOpen(false)} />
          <div id="nav-sheet" ref={sheetRef} className="nav-sheet">
            <nav aria-label="Main">
              <ul>
                {TABS.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} aria-current={isCurrent(t.href) ? "page" : undefined} onClick={() => setOpen(false)}>
                      {t.label}
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
