// MessageBubble v3. Dhwani (Oct 2): keep the little text bubble, own voice, but say the relevant
// info (roles, grad date, location, open to work). v3: the old saved message list on the homepage
// instance kept overriding the new lines ("studying @ umich"), so the list control is now "Lines".
//  • Colors come from the site tokens (--db-*, set by PortfolioNav).
//  • Screen readers get every line once (visually hidden list); the rotating bubble is aria-hidden.
//  • Pauses on hover; doesn't rotate under reduced motion (WCAG 2.2.2).
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, startTransition } from "react"

const DEFAULT_LINES = [
    "hi, i'm dhwani 👋",
    "product · ux · experience designer",
    "ms @ umich · graduating may 2027",
    "i design for people making decisions under pressure",
    "ann arbor based · open to moving anywhere ✈️",
    "open to work · let's build something →",
]

const css = `
    .mbubble-wrap { position: relative; display: inline-flex; flex-direction: column; align-items: flex-start; min-height: 48px; max-width: 100%; }
    .mbubble { background: var(--db-glass, rgba(18,18,18,0.82)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--db-glass-line, rgba(255,255,255,0.12)); border-radius: 20px 20px 20px 5px; padding: 12px 20px; display: inline-flex; align-items: center; box-shadow: var(--db-shadow, 0 2px 16px rgba(0,0,0,0.2)); white-space: nowrap; max-width: 100%; box-sizing: border-box; color: var(--db-text, #fff); }
    .mbubble-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    @media (max-width: 600px) { .mbubble { white-space: normal; word-break: break-word; max-width: calc(100vw - 48px); } }
`

interface Props {
    lines?: string[]
    intervalSeconds?: number
    fontSize?: number
    startIndex?: number
}

export default function MessageBubble(props: Props) {
    const { lines = DEFAULT_LINES, intervalSeconds = 3.5, fontSize = 16, startIndex = 1 } = props
    const list = lines && lines.length ? lines : DEFAULT_LINES
    const [currentIndex, setCurrentIndex] = useState(Math.min(startIndex ?? 1, list.length - 1))
    const [typing, setTyping] = useState(false)
    const [paused, setPaused] = useState(false)
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        startTransition(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches))
    }, [])

    useEffect(() => {
        if (paused || reduced) return
        let t = 0
        const id = window.setInterval(() => {
            startTransition(() => setTyping(true))
            t = window.setTimeout(() => {
                startTransition(() => {
                    setCurrentIndex((i) => (i + 1) % list.length)
                    setTyping(false)
                })
            }, 900)
        }, intervalSeconds * 1000)
        return () => {
            window.clearInterval(id)
            window.clearTimeout(t)
        }
    }, [list, intervalSeconds, paused, reduced])

    return (
        <>
            <style>{css}</style>
            <div className="mbubble-wrap" onMouseEnter={() => startTransition(() => setPaused(true))} onMouseLeave={() => startTransition(() => setPaused(false))}>
                <ul className="mbubble-sr">
                    {list.map((m, i) => (
                        <li key={i}>{m}</li>
                    ))}
                </ul>
                <div aria-hidden="true">
                    <AnimatePresence mode="wait">
                        {typing ? (
                            <motion.div key="typing" className="mbubble" initial={{ opacity: 0, scale: 0.9, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -6 }} transition={{ duration: 0.18, ease: "easeOut" }}>
                                <div style={{ display: "flex", gap: 5, alignItems: "center", height: 20 }}>
                                    {[0, 1, 2].map((i) => (
                                        <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "var(--db-text-2, rgba(255,255,255,0.6))" }} />
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key={currentIndex} className="mbubble" initial={reduced ? false : { opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -10 }} transition={{ duration: 0.22, ease: "easeOut" }} style={{ fontSize, fontFamily: "inherit", lineHeight: 1.5 }}>
                                {list[currentIndex]}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}

addPropertyControls(MessageBubble, {
    lines: { type: ControlType.Array, control: { type: ControlType.String }, defaultValue: DEFAULT_LINES, title: "Lines" },
    intervalSeconds: { type: ControlType.Number, defaultValue: 3.5, min: 1.5, max: 8, step: 0.5, title: "Interval (s)" },
    startIndex: { type: ControlType.Number, defaultValue: 1, min: 0, max: 10, step: 1, title: "Start Index" },
    fontSize: { type: ControlType.Number, defaultValue: 16, min: 12, max: 28, step: 1, title: "Font Size" },
})
