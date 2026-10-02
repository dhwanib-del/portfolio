"use client"
// Rotating text bubble under the name. Screen readers get every line once; the rotating copy is
// aria-hidden. Pauses on hover; doesn't rotate under reduced motion.
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"

export function Bubble({ lines, interval = 3.5 }: { lines: string[]; interval?: number }) {
  const [i, setI] = useState(0)
  const [typing, setTyping] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), [])
  useEffect(() => {
    if (paused || reduced) return
    let t: ReturnType<typeof setTimeout>
    const id = setInterval(() => {
      setTyping(true)
      t = setTimeout(() => { setI((n) => (n + 1) % lines.length); setTyping(false) }, 800)
    }, interval * 1000)
    return () => { clearInterval(id); clearTimeout(t) }
  }, [paused, reduced, lines.length, interval])

  return (
    <div className="bubble-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ul className="sr-only">{lines.map((l) => <li key={l}>{l}</li>)}</ul>
      <div aria-hidden>
        <AnimatePresence mode="wait">
          {typing ? (
            <motion.div key="t" className="bubble" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.18 }}>
              <span className="dots"><i /><i /><i /></span>
            </motion.div>
          ) : (
            <motion.div key={i} className="bubble" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              {lines[i]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
