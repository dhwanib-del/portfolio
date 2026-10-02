"use client"
// "Pick your vibe" loading intro (ported from Dhwani's WorldIntro). Stars + "hi, i'm Dhwani" assemble,
// then five breathing color orbs. Hover/focus previews; pick one → it floods out from the click and the
// whole site is retinted (CSS vars --vibe-a/b/c/accent + html[data-vibe], saved in localStorage).
// Plays once per visit. A small vibe chip (bottom-left) switches it any time.
// Keyboard: Tab/←/→ to move, Enter to pick, Esc to skip. Dialog semantics. Reduced motion respected.
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

type Vibe = { id: string; name: string; a: string; b: string; c: string; accent: string; swatch: [string, string, string]; tempo: number }

export const VIBES: Vibe[] = [
  { id: "ember", name: "Ember", a: "rgba(255,140,60,0.38)", b: "rgba(243,80,15,0.50)", c: "rgba(255,203,5,0.16)", accent: "#F3500F", swatch: ["#FFB36B", "#F3500F", "#5A1400"], tempo: 4.2 },
  { id: "goblue", name: "Go Blue", a: "rgba(255,203,5,0.30)", b: "rgba(0,63,122,0.72)", c: "rgba(255,203,5,0.20)", accent: "#FFCB05", swatch: ["#FFCB05", "#0B4F9C", "#00274C"], tempo: 5.2 },
  { id: "nightshift", name: "Nightshift", a: "rgba(0,229,255,0.22)", b: "rgba(123,92,255,0.55)", c: "rgba(255,77,141,0.18)", accent: "#9B7BFF", swatch: ["#7DE8FF", "#7B5CFF", "#23124F"], tempo: 6.4 },
  { id: "afterhours", name: "Afterhours", a: "rgba(255,177,153,0.32)", b: "rgba(255,77,141,0.46)", c: "rgba(123,92,255,0.20)", accent: "#FF4D8D", swatch: ["#FFC2A8", "#FF4D8D", "#4A0E2A"], tempo: 3.6 },
  { id: "greenroom", name: "Greenroom", a: "rgba(13,153,255,0.30)", b: "rgba(27,196,125,0.45)", c: "rgba(255,255,255,0.10)", accent: "#1BC47D", swatch: ["#9DF5CF", "#1BC47D", "#063B2A"], tempo: 7.2 },
]

function applyVibe(v: Vibe, persist: boolean) {
  const r = document.documentElement
  r.style.setProperty("--vibe-a", v.a)
  r.style.setProperty("--vibe-b", v.b)
  r.style.setProperty("--vibe-c", v.c)
  r.style.setProperty("--vibe-accent", v.accent)
  r.setAttribute("data-vibe", v.id)
  if (persist) try { localStorage.setItem("vibe", v.id) } catch {}
}

const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: (i * 73.137 + 11.5) % 100, y: (i * 43.21 + 37.8) % 100,
  r: i % 7 === 0 ? 1.9 : i % 4 === 0 ? 1.2 : 0.65, op: 0.1 + (i % 8) * 0.04, dur: 2.4 + (i % 5) * 0.85, del: (i % 11) * 0.33,
}))

function Orb({ v, size, active }: { v: Vibe; size: string | number; active: boolean }) {
  return (
    <span aria-hidden className="orb" style={{
      width: size, height: size,
      background: `radial-gradient(circle at 34% 30%, ${v.swatch[0]} 0%, ${v.swatch[1]} 46%, ${v.swatch[2]} 100%)`,
      boxShadow: active ? `0 0 0 2px rgba(255,255,255,.9), 0 0 40px 6px ${v.swatch[1]}AA` : `0 0 28px 2px ${v.swatch[1]}66`,
      animationDuration: `${v.tempo}s`,
    }} />
  )
}

export function Intro() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState(0)
  const [current, setCurrent] = useState<Vibe>(VIBES[0])
  const [preview, setPreview] = useState<Vibe | null>(null)
  const [flood, setFlood] = useState<{ x: number; y: number; v: Vibe } | null>(null)
  const [menu, setMenu] = useState(false)
  const [reduced, setReduced] = useState(false)
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let saved: Vibe | undefined
    try { saved = VIBES.find((v) => v.id === localStorage.getItem("vibe")) } catch {}
    const start = saved || VIBES[0]
    applyVibe(start, false)
    setCurrent(start)
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    let seen = false
    try { seen = !!sessionStorage.getItem("intro-seen") } catch {}
    const force = new URLSearchParams(window.location.search).has("intro")
    if (!seen || force) {
      lastFocus.current = document.activeElement as HTMLElement
      setOpen(true)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    setStage(0)
    const t = setTimeout(() => setStage(1), reduced ? 100 : 1200)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { clearTimeout(t); document.body.style.overflow = prev }
  }, [open, reduced])

  const close = useCallback(() => {
    try { sessionStorage.setItem("intro-seen", "1") } catch {}
    setOpen(false)
    setTimeout(() => (document.getElementById("main") as HTMLElement | null)?.focus?.(), 50)
  }, [])

  const choose = useCallback((v: Vibe, x?: number, y?: number) => {
    applyVibe(v, true)
    setCurrent(v)
    setPreview(null)
    setMenu(false)
    if (!open) return
    if (reduced) return close()
    setFlood({ x: x ?? window.innerWidth / 2, y: y ?? window.innerHeight / 2, v })
    setStage(2)
    setTimeout(close, 1000)
  }, [open, reduced, close])

  const hover = (v: Vibe | null) => { setPreview(v); if (v) applyVibe(v, false) }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); choose(current) } }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, choose, current])

  if (!mounted) return null
  const shown = preview || current

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div key="intro" className="intro" role="dialog" aria-modal="true" aria-label="Pick a color vibe for this site"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <div aria-hidden className="intro-orbs">
              {[{ c: shown.b, s: "80vmax", t: "-30vmax", l: "-20vmax" }, { c: shown.a, s: "55vmax", t: "40%", l: "55%" }, { c: shown.c, s: "45vmax", t: "55%", l: "-10%" }].map((o, i) => (
                <div key={i} style={{ width: o.s, height: o.s, top: o.t, left: o.l, background: `radial-gradient(circle, ${o.c} 0%, rgba(0,0,0,0) 70%)`, animationDelay: `${-i * 5}s` }} />
              ))}
            </div>
            <div aria-hidden className="intro-stars">
              {STARS.map((s, i) => (
                <span key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.op, animationDuration: `${s.dur}s`, animationDelay: `${s.del}s` }} />
              ))}
            </div>
            <button type="button" className="intro-skip" onClick={() => choose(current)}>skip →</button>
            <div className="intro-main">
              <div>
                <motion.p className="intro-hi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>hi, i&apos;m</motion.p>
                <motion.p className="intro-name" style={{ textShadow: `0 0 40px ${shown.accent}55` }}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>Dhwani</motion.p>
              </div>
              {stage >= 1 && (
                <motion.div className="intro-pick" initial={{ opacity: 0, y: 14 }} animate={{ opacity: stage === 2 ? 0 : 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <p className="intro-ask">before you come in, pick a vibe.<br /><span>the whole site breathes in it.</span></p>
                  <div role="radiogroup" aria-label="Color vibes" className="intro-vibes" onMouseLeave={() => hover(null)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
                      const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"))
                      const i = btns.indexOf(document.activeElement as HTMLButtonElement)
                      btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length]?.focus()
                      e.preventDefault()
                    }}>
                    {VIBES.map((v) => (
                      <button key={v.id} type="button" role="radio" aria-checked={current.id === v.id} className="intro-vibe"
                        onMouseEnter={() => hover(v)} onFocus={() => hover(v)} onClick={(e) => choose(v, e.clientX || undefined, e.clientY || undefined)}>
                        <Orb v={v} size="clamp(46px, 8vw, 96px)" active={shown.id === v.id} />
                        <span>{v.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="intro-hint">hover to preview · click to enter · esc to skip</p>
                </motion.div>
              )}
            </div>
            {flood && (
              <motion.div aria-hidden className="intro-flood"
                initial={{ clipPath: `circle(0px at ${flood.x}px ${flood.y}px)`, opacity: 1 }}
                animate={{ clipPath: `circle(160vmax at ${flood.x}px ${flood.y}px)`, opacity: [1, 1, 0] }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                style={{ background: `radial-gradient(circle at ${flood.x}px ${flood.y}px, ${flood.v.swatch[0]} 0%, ${flood.v.swatch[1]} 30%, ${flood.v.swatch[2]} 75%)` }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <div className="vibe-chip-wrap">
          {menu && (
            <div role="radiogroup" aria-label="Change color vibe" className="vibe-menu" onMouseLeave={() => { setPreview(null); applyVibe(current, false) }}>
              {VIBES.map((v) => (
                <button key={v.id} type="button" role="radio" aria-checked={current.id === v.id} aria-label={`${v.name} vibe`} title={v.name}
                  onMouseEnter={() => hover(v)} onFocus={() => hover(v)} onClick={() => choose(v)}>
                  <Orb v={v} size={30} active={current.id === v.id} />
                </button>
              ))}
            </div>
          )}
          <button type="button" className="vibe-chip" aria-expanded={menu} aria-label={`Change the site's color vibe. Current: ${current.name}`} onClick={() => setMenu((m) => !m)}>
            <Orb v={current} size={20} active={false} />
            <span aria-hidden>vibe · {current.name.toLowerCase()}</span>
          </button>
        </div>
      )}
    </>
  )
}
