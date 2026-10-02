"use client"
// Gallery wall (rebuilt from Dhwani's Framer GalleryWall). Drag polaroids, stickies, stamps, vinyl,
// playlist, field note and matcha doodle around a board. Rebuilt smaller and accessible:
//  • Dragging is optional fun; "Shuffle" and "Reset" buttons do the same without dragging (WCAG 2.5.7).
//  • Everything written on the board is also in a screen-reader list.
//  • The board scales to fit any screen width; items are paper objects, so they read in both themes.
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type Kind = "polaroid" | "sticky" | "stamp" | "vinyl" | "playlist" | "fieldnote" | "doodle"
type Item = { id: string; kind: Kind; x: number; y: number; tilt: number; text: string }

const BOARD_W = 860
const BOARD_H = 520

const ITEMS: Item[] = [
  { id: "dj", kind: "polaroid", x: 22, y: 60, tilt: -5, text: "dj set @ btb · 1am" },
  { id: "cafe", kind: "polaroid", x: 218, y: 32, tilt: 3, text: "angell hall basement. always." },
  { id: "campus", kind: "polaroid", x: 468, y: 78, tilt: -2, text: "diag in october > everything" },
  { id: "brain", kind: "sticky", x: 148, y: 255, tilt: 2, text: "professional\noverthinker\n(it's a skill)" },
  { id: "3yr", kind: "sticky", x: 362, y: 268, tilt: -4, text: "bs psych\nin 3 years" },
  { id: "psych", kind: "sticky", x: 600, y: 230, tilt: 5, text: "studied why\npeople do\nirrational things" },
  { id: "blr", kind: "stamp", x: 30, y: 320, tilt: -2, text: "BANGALORE · where it started" },
  { id: "a2", kind: "stamp", x: 500, y: 330, tilt: 3, text: "ANN ARBOR · where it's going" },
  { id: "vinyl", kind: "vinyl", x: 318, y: 80, tilt: 6, text: "late night mix" },
  { id: "mix", kind: "playlist", x: 668, y: 40, tilt: -3, text: "the rotation rn" },
  { id: "note", kind: "fieldnote", x: 710, y: 270, tilt: 4, text: "overheard at a usability test: \"why does nothing do what I think it should do?\"" },
  { id: "matcha", kind: "doodle", x: 200, y: 390, tilt: -6, text: "matcha szn" },
]

const HAND = "'Patrick Hand', 'Comic Sans MS', cursive"
const STICKY: Record<string, [string, string, string]> = {
  brain: ["#FFF176", "#333", "#e53935"],
  "3yr": ["#B2EBF2", "#1a4a52", "#1976d2"],
  psych: ["#F8BBD9", "#4a1a2a", "#c2185b"],
}
const TRACKS = [["something about us", "daft punk"], ["fukumean", "gunna"], ["escapism.", "raye"], ["creepin'", "metro boomin"], ["golden hour", "jvke"]]
const SCENE: Record<string, string> = {
  dj: "radial-gradient(circle at 30% 70%, #BF7FFF55, transparent 40%), radial-gradient(circle at 72% 70%, #F3500F55, transparent 40%), #0c0014",
  cafe: "radial-gradient(circle at 45% 55%, #ff9a3c44, transparent 45%), linear-gradient(#140900, #0b0700)",
  campus: "radial-gradient(circle at 30% 30%, #c46200aa 0 8%, transparent 9%), radial-gradient(circle at 65% 25%, #b85500aa 0 7%, transparent 8%), radial-gradient(circle at 80% 55%, #d07000aa 0 6%, transparent 7%), linear-gradient(#080d05, #0a0d02)",
}

function Piece({ it }: { it: Item }) {
  switch (it.kind) {
    case "polaroid":
      return (
        <div style={{ width: 140, background: "#F5F0E8", borderRadius: 3, padding: "10px 10px 34px", boxShadow: "0 6px 24px rgba(0,0,0,.45)" }}>
          <div style={{ height: 116, borderRadius: 2, background: SCENE[it.id] }} />
          <p style={{ margin: "9px 0 0", font: `13px/1.3 ${HAND}`, color: "#444", textAlign: "center" }}>{it.text}</p>
        </div>
      )
    case "sticky": {
      const [bg, fg, pin] = STICKY[it.id]
      return (
        <div style={{ width: 128, minHeight: 116, background: bg, padding: "20px 12px 12px", boxShadow: "3px 3px 14px rgba(0,0,0,.28)", position: "relative" }}>
          <span style={{ position: "absolute", top: -8, left: "50%", marginLeft: -7, width: 14, height: 14, borderRadius: "50%", background: pin, boxShadow: "0 2px 5px rgba(0,0,0,.4)" }} />
          <p style={{ margin: 0, font: `14px/1.45 ${HAND}`, color: fg, whiteSpace: "pre-line" }}>{it.text}</p>
        </div>
      )
    }
    case "stamp": {
      const [city, sub] = it.text.split(" · ")
      const c = it.id === "blr" ? "#FF6B35" : "#18A0FB"
      return (
        <div style={{ width: 118, height: 118, borderRadius: "50%", border: `2.5px solid ${c}`, background: "#111", display: "grid", placeItems: "center", textAlign: "center", boxShadow: "0 4px 22px rgba(0,0,0,.45)" }}>
          <div>
            <div style={{ font: "800 10px var(--font-sans)", letterSpacing: ".2em", color: c }}>{city}</div>
            <div style={{ font: "10px var(--font-sans)", color: "rgba(255,255,255,.7)", marginTop: 4 }}>{sub}</div>
          </div>
        </div>
      )
    }
    case "vinyl":
      return (
        <div style={{ width: 118, height: 118, borderRadius: "50%", background: "repeating-radial-gradient(#111 0 3px, #1c1c1c 3px 5px)", display: "grid", placeItems: "center", boxShadow: "0 6px 20px rgba(0,0,0,.5)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #c080ff, #6b20ee)", display: "grid", placeItems: "center", font: "800 6px var(--font-sans)", letterSpacing: ".1em", color: "rgba(0,0,0,.6)" }}>DHWANI</div>
        </div>
      )
    case "playlist":
      return (
        <div style={{ width: 180, background: "#0f0f0f", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 8px 32px rgba(0,0,0,.55)", color: "#fafafa" }}>
          <div style={{ font: "600 12px var(--font-sans)" }}>dhwani&apos;s mix</div>
          <div style={{ font: "10px var(--font-sans)", color: "rgba(255,255,255,.6)", marginBottom: 8 }}>{it.text}</div>
          {TRACKS.map(([t, a], i) => (
            <div key={t} style={{ font: "11px/1.35 var(--font-sans)", marginTop: 4 }}>
              <span style={{ color: i === 0 ? "#F3500F" : "#fafafa" }}>{t}</span>
              <span style={{ color: "rgba(255,255,255,.55)" }}> · {a}</span>
            </div>
          ))}
        </div>
      )
    case "fieldnote":
      return (
        <div style={{ width: 150, background: "#fefce8", padding: "14px 12px 14px 26px", boxShadow: "2px 3px 14px rgba(0,0,0,.25)", position: "relative", font: `13px/1.5 ${HAND}`, color: "#333" }}>
          <span style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: "rgba(210,70,70,.3)" }} />
          <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>field note</div>
          {it.text}
        </div>
      )
    case "doodle":
      return (
        <svg width="88" height="108" viewBox="0 0 88 108" aria-hidden>
          <path d="M22 46 L26 95 L62 95 L66 46 Z" fill="#2a1800" />
          <ellipse cx="44" cy="45" rx="22" ry="6" fill="#5a9a5a" />
          <rect x="51" y="18" width="4" height="28" rx="2" fill="#c8a46a" />
          <path d="M66 57 Q78 57 78 67 Q78 77 66 77" fill="none" stroke="#3d2500" strokeWidth="3" strokeLinecap="round" />
          <text x="44" y="106" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="10" fill="var(--text-2)">matcha szn</text>
        </svg>
      )
  }
}

export function GalleryWall({ title = "where i've touched grass" }: { title?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState(() => ITEMS.map((i) => ({ x: i.x, y: i.y, tilt: i.tilt })))
  const [top, setTop] = useState<string | null>(null)
  const [round, setRound] = useState(0) // remount motion nodes after shuffle/reset
  const reduce = useReducedMotion()

  useEffect(() => {
    const fit = () => wrap.current && setScale(Math.min(1, wrap.current.clientWidth / BOARD_W))
    fit()
    const ro = new ResizeObserver(fit)
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])

  const shuffle = () => {
    setPos(ITEMS.map(() => ({ x: Math.round(Math.random() * (BOARD_W - 190)), y: Math.round(Math.random() * (BOARD_H - 170)), tilt: Math.round(Math.random() * 12 - 6) })))
    setRound((r) => r + 1)
  }
  const reset = () => { setPos(ITEMS.map((i) => ({ x: i.x, y: i.y, tilt: i.tilt }))); setRound((r) => r + 1) }

  return (
    <section className="gw" aria-labelledby="gw-h">
      <div className="gw-head">
        <div>
          <h2 id="gw-h" className="h2">{title}</h2>
          <p className="lede" style={{ marginTop: 6 }}>Drag things around, or shuffle the board.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn" onClick={shuffle}>Shuffle</button>
          <button type="button" className="btn" onClick={reset}>Reset</button>
        </div>
      </div>
      <ul className="sr-only">{ITEMS.map((i) => <li key={i.id}>{i.text.replace(/\n/g, " ")}</li>)}</ul>
      <div ref={wrap} className="gw-frame" style={{ height: BOARD_H * scale }} aria-hidden="true">
        <div className="gw-board" style={{ width: BOARD_W, height: BOARD_H, transform: `scale(${scale})` }}>
          {ITEMS.map((it, i) => (
            <motion.div key={it.id + round} drag={!reduce} dragMomentum={false} dragElastic={0}
              onDragStart={() => setTop(it.id)} whileDrag={{ scale: 1.04 }}
              initial={reduce ? false : { x: pos[i].x, y: pos[i].y - 12, rotate: pos[i].tilt, opacity: 0 }}
              animate={{ x: pos[i].x, y: pos[i].y, rotate: pos[i].tilt, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: reduce ? 0 : i * 0.03 }}
              style={{ position: "absolute", top: 0, left: 0, zIndex: top === it.id ? 50 : 1, cursor: reduce ? "default" : "grab", touchAction: "none" }}>
              <Piece it={it} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
