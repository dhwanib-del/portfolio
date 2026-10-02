"use client"
// "Talk to me" companion: a second cursor labelled "dhwani" that trails the visitor's pointer
// (mouse/trackpad only, never under reduced motion). Says hi once per visit, gives a one-line hook
// over each project, and says NDA over anything marked data-nda. Plus a status pill (open to work ·
// Ann Arbor live time) that opens a short tour. Everything it says is decorative (aria-hidden);
// the same information is on the page as real text.
import { useEffect, useRef, useState } from "react"
import { projects } from "@/content/site"

const GREETING = "hey, talk to me 👋 i've worked on a lot of things: research, design, prototyping."
const HINTS: Record<string, string> = Object.fromEntries(projects.map((p) => [`/work/${p.slug}`, p.hint]))

function etTime() {
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Detroit" }).format(new Date()).toLowerCase()
  } catch { return "" }
}

export function Companion() {
  const [pt, setPt] = useState({ x: -200, y: -200 })
  const [vw, setVw] = useState({ w: 1200, h: 800 })
  const [on, setOn] = useState(false)
  const [say, setSay] = useState("")
  const [greet, setGreet] = useState(false)
  const [time, setTime] = useState("")
  const [open, setOpen] = useState(false)
  const pillRef = useRef<HTMLButtonElement>(null)
  const headRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setTime(etTime())
    const clock = setInterval(() => setTime(etTime()), 30000)
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let seen = false
    try { seen = !!sessionStorage.getItem("greet-seen"); sessionStorage.setItem("greet-seen", "1") } catch {}
    let g: ReturnType<typeof setTimeout> | undefined
    if (!seen) { setGreet(true); g = setTimeout(() => setGreet(false), 7000) }
    if (!fine || reduced) return () => { clearInterval(clock); if (g) clearTimeout(g) }

    let raf = 0
    let active: Element | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => { setPt({ x: e.clientX, y: e.clientY }); setOn(true); setVw({ w: window.innerWidth, h: window.innerHeight }) })
      const t = e.target instanceof Element ? e.target : null
      const nda = t?.closest("[data-nda]") ?? null
      const link = nda || t?.closest("a[href]") || null
      if (link === active) return
      active = link
      if (timer) clearTimeout(timer)
      setSay("")
      if (!link) return
      let msg = ""
      if (nda) msg = HINTS["/work/prime-video"]
      else try { msg = HINTS[new URL(link.getAttribute("href") || "", location.href).pathname.replace(/\/$/, "")] || "" } catch {}
      if (msg) timer = setTimeout(() => { setGreet(false); setSay(msg) }, 300)
    }
    const leave = () => { setOn(false); setSay(""); active = null }
    document.addEventListener("pointermove", move)
    document.documentElement.addEventListener("pointerleave", leave)
    return () => {
      clearInterval(clock); if (g) clearTimeout(g); if (timer) clearTimeout(timer)
      cancelAnimationFrame(raf)
      document.removeEventListener("pointermove", move)
      document.documentElement.removeEventListener("pointerleave", leave)
    }
  }, [])

  useEffect(() => { if (open) headRef.current?.focus() }, [open])

  const text = say || (greet && on ? GREETING : "")
  const cx = pt.x + 26
  const cy = pt.y + 22
  const bw = 260
  const left = Math.max(12, Math.min(cx + 14, vw.w - bw - 12))
  const top = cy > vw.h - 120 ? Math.max(12, cy - 96) : cy + 26

  return (
    <>
      {on && (
        <div aria-hidden className="companion" style={{ transform: `translate(${cx}px, ${cy}px)` }}>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 1l5.5 13 2-5.5L14 6.5z" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1" /></svg>
          <span>dhwani</span>
        </div>
      )}
      {on && text && (
        <div aria-hidden className="companion-say" style={{ left, top, width: bw }}>{text}</div>
      )}

      {!open ? (
        <button ref={pillRef} type="button" className="status-pill" aria-expanded={false} aria-controls="tour"
          aria-label={`Open to work. Ann Arbor, ${time} Eastern. Open a quick tour of Dhwani's work`} onClick={() => setOpen(true)}>
          <span aria-hidden className="status-dot" />
          <span aria-hidden>open to work · ann arbor {time} ET</span>
        </button>
      ) : (
        <div id="tour" role="dialog" aria-modal="false" aria-labelledby="tour-h" className="tour"
          onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setTimeout(() => pillRef.current?.focus(), 0) } }}>
          <div className="tour-top">
            <span>open to work · ann arbor {time} ET</span>
            <button type="button" aria-label="Close" className="tour-x" onClick={() => { setOpen(false); setTimeout(() => pillRef.current?.focus(), 0) }}>×</button>
          </div>
          <h2 id="tour-h" ref={headRef} tabIndex={-1}>Hey, I&apos;m Dhwani 👋</h2>
          <p>Product and UX designer at UMSI, graduating May 2027. Looking for product, UX and experience design roles. Based in Ann Arbor, happy to move.</p>
          <ul className="tour-list">
            {projects.map((p) => (
              <li key={p.slug}>
                {p.nda ? <span>{p.title} <em>· NDA</em></span> : <a href={`/work/${p.slug}`}>{p.title}</a>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
