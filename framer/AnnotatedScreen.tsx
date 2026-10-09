// AnnotatedScreen — pin callouts on a case-study screenshot or video.
//
// Owner request: "in my case studies, can we highlight certain things — even what's shown on the
// screen — pinpoint certain things and say 'This is the feature' or 'This is Hick's law'? Also
// shorten the case studies." One annotated screen replaces paragraphs of text.
//
// - media (image) or video (video wins). fit contain|cover, ratio auto|16:9|4:3|3:2|1:1|9:16,
//   radius, frame none|subtle|device-dark.
// - notes: numbered pins at x/y % with kind (feature, UX principle, decision, research insight,
//   result), title, body, preferred side, optional ring/box highlight sized by boxW/boxH (% of media).
// - mode: hover (card on hover/focus/tap), guided (Next → stepper, media dimmed except the
//   highlighted area), all (every card shown).
// - showLegend (kind chips + counts), toggleLabel (switch to hide annotations), caption.
// - Phones (<640px container): pins stay, cards become a list under the media.
// - Keyboard: pins are buttons in order, arrows move between them, Esc closes.
// - Oct 9 (case-study brief): layout "side" puts the notes beside the screen (phone screens stay
//   readable; the explanation is always there as text), mediaMax caps the screen width, enlarge
//   opens the original screen in a dialog (close button, Esc, focus returns), alt sets alt text.
// - Respects prefers-reduced-motion. Theme tokens (--db-*) with fallbacks; root is data-db-keep
//   because it handles light/dark itself.

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useInView } from "framer-motion"
import * as React from "react"
import { createPortal } from "react-dom"
import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, startTransition } from "react"

type Kind = "feature" | "principle" | "decision" | "research" | "metric"
type Side = "auto" | "left" | "right" | "top" | "bottom"
type Note = {
    x?: number
    y?: number
    kind?: Kind
    title?: string
    body?: string
    side?: Side
    highlight?: "none" | "ring" | "box"
    boxW?: number
    boxH?: number
}

const KIND_LABEL: Record<Kind, string> = {
    feature: "Feature",
    principle: "UX principle",
    decision: "Decision",
    research: "Research insight",
    metric: "Result",
}
const KIND_ORDER: Kind[] = ["feature", "principle", "decision", "research", "metric"]

// Kind colours, tuned per theme for contrast (≥4.5:1 for text on surface / pin labels).
const KIND_DARK: Record<Kind, { c: string; on: string }> = {
    feature: { c: "var(--db-accent, #F3500F)", on: "var(--db-on-accent, #0A0A0A)" },
    principle: { c: "#A78BFA", on: "#120A2A" },
    decision: { c: "#FBBF24", on: "#1F1400" },
    research: { c: "#2DD4BF", on: "#032421" },
    metric: { c: "#4ADE80", on: "#04210F" },
}
const KIND_LIGHT: Record<Kind, { c: string; on: string }> = {
    feature: { c: "var(--db-accent, #C2410C)", on: "var(--db-on-accent, #FFFFFF)" },
    principle: { c: "#6D28D9", on: "#FFFFFF" },
    decision: { c: "#B45309", on: "#FFFFFF" },
    research: { c: "#0F766E", on: "#FFFFFF" },
    metric: { c: "#15803D", on: "#FFFFFF" },
}

const DEFAULT_NOTES: Note[] = [
    {
        x: 22,
        y: 30,
        kind: "principle",
        title: "Hick's Law",
        body: "Three actions, not twelve. Fewer choices, faster decisions under pressure.",
        side: "auto",
        highlight: "none",
        boxW: 20,
        boxH: 14,
    },
    {
        x: 64,
        y: 48,
        kind: "feature",
        title: "One-glance status",
        body: "Who has it and what's next, without opening the case.",
        side: "auto",
        highlight: "box",
        boxW: 26,
        boxH: 16,
    },
    {
        x: 40,
        y: 78,
        kind: "decision",
        title: "Search first",
        body: "Dispatchers search before they browse, so search leads.",
        side: "auto",
        highlight: "none",
        boxW: 20,
        boxH: 14,
    },
]

const RATIOS: Record<string, number> = { "16:9": 16 / 9, "4:3": 4 / 3, "3:2": 3 / 2, "1:1": 1, "9:16": 9 / 16 }
const FONT = "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const MONO = "'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace"
const PIN = 28
const GAP = 14
const PAD = 10
const CSS_ID = "db-annotated-screen-css"
const CSS = `
@keyframes dbAsPulse { 0% { transform: scale(1); opacity: .55 } 70% { transform: scale(2.1); opacity: 0 } 100% { transform: scale(2.1); opacity: 0 } }
@keyframes dbAsDraw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
@keyframes dbAsIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
.db-as-pin:focus-visible, .db-as-btn:focus-visible, .db-as-row:focus-visible { outline: 2px solid var(--db-text, #FAFAFA); outline-offset: 3px }
`

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const num = (v: any, d: number) => (typeof v === "number" && isFinite(v) ? v : d)

function useDbLight(): boolean {
    const [light, setLight] = useState(false)
    useEffect(() => {
        if (typeof document === "undefined") return
        const html = document.documentElement
        const read = () => {
            const attr = html.getAttribute("data-db-theme")
            let l = attr === "light"
            if (!attr && typeof window !== "undefined" && window.matchMedia) {
                l = window.matchMedia("(prefers-color-scheme: light)").matches
            }
            startTransition(() => setLight(l))
        }
        read()
        window.addEventListener("db-theme", read)
        let mo: MutationObserver | null = null
        if (typeof MutationObserver !== "undefined") {
            mo = new MutationObserver(read)
            mo.observe(html, { attributes: true, attributeFilter: ["data-db-theme"] })
        }
        return () => {
            window.removeEventListener("db-theme", read)
            if (mo) mo.disconnect()
        }
    }, [])
    return light
}

function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduced(mq.matches)
        const on = (e: MediaQueryListEvent) => startTransition(() => setReduced(e.matches))
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [])
    return reduced
}

// Normalised geometry for a note, in px, given the media box size.
function geom(n: Note, w: number, h: number) {
    const cx = (clamp(num(n.x, 50), 0, 100) / 100) * w
    const cy = (clamp(num(n.y, 50), 0, 100) / 100) * h
    const hl = n.highlight || "none"
    const bw = (clamp(num(n.boxW, 20), 1, 100) / 100) * w
    const bh = (clamp(num(n.boxH, 14), 1, 100) / 100) * h
    let px = cx
    let py = cy
    let r = 0
    if (hl === "box") {
        px = cx - bw / 2
        py = cy - bh / 2
    } else if (hl === "ring") {
        r = bw / 2
        px = cx - r * Math.SQRT1_2
        py = cy - r * Math.SQRT1_2
    }
    return { cx, cy, px: clamp(px, 0, w), py: clamp(py, 0, h), hl, bw, bh, r }
}

function placeCard(side: Side, px: number, py: number, cw: number, ch: number, w: number, h: number) {
    const fits = {
        right: px + GAP + cw <= w - PAD,
        left: px - GAP - cw >= PAD,
        bottom: py + GAP + ch <= h - PAD,
        top: py - GAP - ch >= PAD,
    }
    const opposite: Record<string, Side> = { right: "left", left: "right", top: "bottom", bottom: "top" }
    let s: Side = side
    if (s === "auto") {
        s = px > w / 2 ? (fits.left ? "left" : fits.right ? "right" : py > h / 2 ? "top" : "bottom") : fits.right ? "right" : fits.left ? "left" : py > h / 2 ? "top" : "bottom"
    } else if (!fits[s as "left"] && fits[opposite[s] as "left"]) {
        s = opposite[s]
    }
    let left = 0
    let top = 0
    if (s === "right" || s === "left") {
        left = s === "right" ? px + GAP : px - GAP - cw
        top = py - ch / 2
    } else {
        left = px - cw / 2
        top = s === "bottom" ? py + GAP : py - GAP - ch
    }
    left = clamp(left, PAD, Math.max(PAD, w - cw - PAD))
    top = clamp(top, PAD, Math.max(PAD, h - ch - PAD))
    // Leader-line end: nearest point on the card's facing edge.
    let ax = 0
    let ay = 0
    if (s === "right" || s === "left") {
        ax = s === "right" ? left : left + cw
        ay = clamp(py, top + 12, top + ch - 12)
    } else {
        ay = s === "bottom" ? top : top + ch
        ax = clamp(px, left + 14, left + cw - 14)
    }
    return { left, top, side: s, ax, ay }
}

/**
 * @framerIntrinsicWidth 880
 * @framerIntrinsicHeight 600
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function AnnotatedScreen(props: any) {
    const {
        media,
        video,
        fit = "contain",
        ratio = "auto",
        radius = 16,
        frame = "subtle",
        notes: notesProp,
        mode = "hover",
        showLegend = true,
        toggleLabel = "Show annotations",
        caption = "",
        layout = "overlay",
        mediaMax = 0,
        enlarge = true,
        alt = "",
        style,
    } = props

    const notes: Note[] = Array.isArray(notesProp) ? notesProp : DEFAULT_NOTES
    const isStatic = useIsStaticRenderer()
    const light = useDbLight()
    const reducedPref = useReducedMotion()
    const reduced = reducedPref || isStatic
    const palette = light ? KIND_LIGHT : KIND_DARK
    const uid = useMemo(() => "das" + Math.random().toString(36).slice(2, 8), [])

    const rootRef = useRef<HTMLElement | null>(null)
    const boxRef = useRef<HTMLDivElement | null>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const pinRefs = useRef<(HTMLButtonElement | null)[]>([])
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const rowRefs = useRef<(HTMLDivElement | null)[]>([])
    const hoverTimer = useRef<any>(null)
    const scrollOnSelect = useRef(false)
    const inView = useInView(rootRef as any, { margin: "120px" })

    const [size, setSize] = useState({ w: 0, h: 0 })
    const [intrinsic, setIntrinsic] = useState<number | null>(null)
    const [cardH, setCardH] = useState<number[]>([])
    const [visible, setVisible] = useState(true)
    const [active, setActive] = useState<number | null>(mode === "guided" ? 0 : null)
    const [locked, setLocked] = useState(false)
    const [rootW, setRootW] = useState(0)
    const [zoom, setZoom] = useState(false)
    const zoomBtnRef = useRef<HTMLButtonElement | null>(null)
    const closeRef = useRef<HTMLButtonElement | null>(null)

    const set = useCallback((i: number | null) => startTransition(() => setActive(i)), [])

    // Reset selection when mode changes (canvas edits).
    useEffect(() => {
        startTransition(() => {
            setActive(mode === "guided" ? 0 : null)
            setLocked(false)
        })
    }, [mode])

    useEffect(() => {
        if (active !== null && active >= notes.length) set(notes.length ? notes.length - 1 : null)
    }, [notes.length, active, set])

    // Inject keyframes once.
    useEffect(() => {
        if (typeof document === "undefined") return
        if (document.getElementById(CSS_ID)) return
        const el = document.createElement("style")
        el.id = CSS_ID
        el.textContent = CSS
        document.head.appendChild(el)
    }, [])

    // Measure the media box.
    useLayoutEffect(() => {
        const el = boxRef.current
        if (!el) return
        const read = () => {
            const r = el.getBoundingClientRect()
            startTransition(() =>
                setSize((s) => (Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5 ? s : { w: r.width, h: r.height }))
            )
        }
        read()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(read)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Measure the whole component (decides side-by-side vs stacked in "side" layout).
    useLayoutEffect(() => {
        const el = rootRef.current
        if (!el) return
        const read = () => {
            const w = el.getBoundingClientRect().width
            startTransition(() => setRootW((o) => (Math.abs(o - w) < 0.5 ? o : w)))
        }
        read()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(read)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Enlarge dialog: Esc closes, focus moves in and returns to the button.
    useEffect(() => {
        if (!zoom || typeof document === "undefined") return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const t = setTimeout(() => closeRef.current && closeRef.current.focus(), 0)
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                startTransition(() => setZoom(false))
            } else if (e.key === "Tab") {
                e.preventDefault()
                if (closeRef.current) closeRef.current.focus()
            }
        }
        document.addEventListener("keydown", onKey)
        return () => {
            clearTimeout(t)
            document.body.style.overflow = prev
            document.removeEventListener("keydown", onKey)
            const b = zoomBtnRef.current
            if (b) b.focus()
        }
    }, [zoom])

    const videoSrc = typeof video === "string" && video ? video : ""
    const imgSrc = media && media.src ? media.src : ""

    // Intrinsic size for ratio=auto (also catches images already loaded before hydration).
    useEffect(() => {
        const im = imgRef.current
        if (!videoSrc && im && im.complete && im.naturalWidth) startTransition(() => setIntrinsic(im.naturalWidth / im.naturalHeight))
    }, [imgSrc, videoSrc])

    // Video: autoplay only in view and without reduced motion.
    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        if (inView && !reduced) {
            const p = v.play()
            if (p && typeof p.catch === "function") p.catch(() => {})
        } else v.pause()
    }, [inView, reduced, videoSrc])

    const aspect = ratio === "auto" ? intrinsic || 16 / 10 : RATIOS[ratio] || 16 / 10
    const side = layout === "side"
    const sideBySide = side && rootW >= 640
    // "phone" = notes render as a list instead of cards on the media.
    const phone = side || (size.w > 0 && size.w < 640)
    const altText = alt || (media && media.alt) || caption || "Annotated screen"
    const showAll = mode === "all"
    const shownActive = isStatic && mode === "hover" && active === null ? 0 : active
    const cardW = Math.min(280, Math.max(160, size.w - PAD * 2))
    const on = visible && notes.length > 0

    // Measure card heights for placement.
    useLayoutEffect(() => {
        if (phone) return
        const next = notes.map((_, i) => {
            const el = cardRefs.current[i]
            return el ? el.offsetHeight : 0
        })
        startTransition(() => setCardH((prev) => (prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next)))
    })

    // Phone list: bring the active row into view when selected from a pin.
    useEffect(() => {
        if (!phone || active === null || !scrollOnSelect.current) return
        scrollOnSelect.current = false
        const row = rowRefs.current[active]
        if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" })
    }, [active, phone, reduced])

    // Click outside closes a locked card in hover mode.
    useEffect(() => {
        if (typeof document === "undefined" || mode !== "hover" || !locked) return
        const onDown = (e: PointerEvent) => {
            const root = rootRef.current
            if (root && !root.contains(e.target as Node)) {
                startTransition(() => {
                    setLocked(false)
                    setActive(null)
                })
            }
        }
        document.addEventListener("pointerdown", onDown)
        return () => document.removeEventListener("pointerdown", onDown)
    }, [mode, locked])

    const enter = (i: number) => {
        if (mode !== "hover" || locked) return
        clearTimeout(hoverTimer.current)
        set(i)
    }
    const leave = () => {
        if (mode !== "hover" || locked) return
        clearTimeout(hoverTimer.current)
        hoverTimer.current = setTimeout(() => set(null), 140)
    }
    useEffect(() => () => clearTimeout(hoverTimer.current), [])

    const tapPin = (i: number) => {
        scrollOnSelect.current = true
        if (mode === "hover") {
            if (locked && active === i) {
                startTransition(() => {
                    setLocked(false)
                    setActive(null)
                })
            } else {
                startTransition(() => {
                    setLocked(true)
                    setActive(i)
                })
            }
        } else set(i)
    }

    const focusPin = (i: number) => {
        const el = pinRefs.current[i]
        if (el) el.focus()
    }
    const onPinKey = (e: React.KeyboardEvent, i: number) => {
        const n = notes.length
        let to: number | null = null
        if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % n
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i - 1 + n) % n
        else if (e.key === "Home") to = 0
        else if (e.key === "End") to = n - 1
        else if (e.key === "Escape") {
            e.preventDefault()
            startTransition(() => {
                setLocked(false)
                setActive(null)
            })
            return
        }
        if (to !== null) {
            e.preventDefault()
            focusPin(to)
            if (mode !== "all") set(to)
        }
    }
    const onRootKey = (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && active !== null && mode !== "all") {
            startTransition(() => {
                setLocked(false)
                setActive(null)
            })
        }
    }

    const step = (d: number) => {
        const n = notes.length
        if (!n) return
        const cur = active === null ? -1 : active
        const next = cur + d >= n ? 0 : cur + d < 0 ? 0 : cur + d
        scrollOnSelect.current = true
        set(next)
    }

    // Which notes show a card / highlight on the media.
    const isOpen = (i: number) => on && (showAll || shownActive === i)
    const dimOn = on && mode === "guided" && shownActive !== null && !!notes[shownActive] && size.w > 0

    // ---- styles ----
    const r = Math.max(0, num(radius, 16))
    const frameStyle: React.CSSProperties =
        frame === "device-dark"
            ? {
                  padding: 9,
                  borderRadius: r + 9,
                  background: "#0C0C0E",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, var(--db-shadow, 0 24px 60px rgba(0,0,0,0.35))",
              }
            : frame === "subtle"
              ? {
                    padding: 0,
                    borderRadius: r,
                    boxShadow: "var(--db-shadow, 0 18px 50px rgba(0,0,0,0.28))",
                }
              : { padding: 0 }

    const textCol = "var(--db-text, #FAFAFA)"
    const text2 = "var(--db-text-2, rgba(255,255,255,0.68))"
    const line = "var(--db-line, rgba(255,255,255,0.12))"
    const glass = light ? "var(--db-glass, rgba(255,255,255,0.86))" : "var(--db-glass, rgba(18,18,20,0.78))"
    const shadow = "var(--db-shadow, 0 12px 32px rgba(0,0,0,0.30))"

    const counts = useMemo(() => {
        const c: Partial<Record<Kind, number>> = {}
        notes.forEach((n) => {
            const k = (n.kind || "feature") as Kind
            c[k] = (c[k] || 0) + 1
        })
        return c
    }, [notes])

    const kindOf = (n: Note): Kind => (KIND_LABEL[n.kind as Kind] ? (n.kind as Kind) : "feature")

    const renderCardBody = (n: Note, i: number, inList: boolean) => {
        const k = kindOf(n)
        return (
            <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {inList ? null : (
                        <span aria-hidden style={{ fontFamily: MONO, fontSize: 11, color: text2 }}>
                            {String(i + 1).padStart(2, "0")}
                        </span>
                    )}
                    <span
                        style={{
                            fontFamily: MONO,
                            fontSize: 11,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: palette[k].c,
                            fontWeight: 600,
                        }}
                    >
                        {KIND_LABEL[k]}
                    </span>
                </div>
                <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: textCol }}>{n.title || "Untitled"}</div>
            </>
        )
    }

    return (
        <figure
            ref={rootRef as any}
            data-db-keep=""
            onKeyDown={onRootKey}
            style={{
                position: "relative",
                width: "100%",
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontFamily: FONT,
                color: textCol,
                ...style,
            }}
        >
            {sideBySide ? (
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <div style={{ flex: `0 1 ${mediaMax > 0 ? mediaMax : 360}px`, minWidth: 0 }}>
            <div style={{ ...frameStyle, width: "100%", maxWidth: mediaMax > 0 ? mediaMax : undefined, margin: mediaMax > 0 && !sideBySide ? "0 auto" : undefined, boxSizing: "border-box" }}>
                <div ref={boxRef} style={{ position: "relative", width: "100%", aspectRatio: String(aspect) }}>
                    {/* Clipped media layer */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            overflow: "hidden",
                            borderRadius: r,
                            background: "var(--db-surface, #111111)",
                            border: frame === "subtle" ? `1px solid ${line}` : "none",
                        }}
                    >
                        {videoSrc ? (
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                muted
                                loop
                                playsInline
                                autoPlay={!reduced}
                                controls={reduced && !isStatic}
                                aria-label={caption || "Annotated product video"}
                                onLoadedMetadata={(e) => {
                                    const v = e.currentTarget
                                    if (v.videoWidth) startTransition(() => setIntrinsic(v.videoWidth / v.videoHeight))
                                }}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain", display: "block" }}
                            />
                        ) : imgSrc ? (
                            <img
                                ref={imgRef}
                                src={imgSrc}
                                srcSet={media.srcSet}
                                alt={altText}
                                draggable={false}
                                onLoad={(e) => {
                                    const im = e.currentTarget
                                    if (im.naturalWidth) startTransition(() => setIntrinsic(im.naturalWidth / im.naturalHeight))
                                }}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain", display: "block" }}
                            />
                        ) : (
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: light
                                        ? "radial-gradient(120% 90% at 20% 10%, rgba(0,0,0,0.04), transparent 60%), linear-gradient(135deg, #F2F2F4 0%, #E6E6EA 100%)"
                                        : "radial-gradient(120% 90% at 20% 10%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(135deg, #17171A 0%, #0E0E10 100%)",
                                    pointerEvents: "none",
                                }}
                            >
                                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: text2 }}>add a screenshot or video →</span>
                            </div>
                        )}

                        {/* Guided dim with a cut-out around the active area */}
                        {size.w > 0 ? (
                            <svg
                                aria-hidden
                                width={size.w}
                                height={size.h}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    pointerEvents: "none",
                                    opacity: dimOn ? 1 : 0,
                                    transition: reduced ? "none" : "opacity 260ms ease",
                                }}
                            >
                                <defs>
                                    <mask id={uid + "-m"}>
                                        <rect width={size.w} height={size.h} fill="white" />
                                        {dimOn && shownActive !== null
                                            ? (() => {
                                                  const g = geom(notes[shownActive], size.w, size.h)
                                                  if (g.hl === "box")
                                                      return <rect x={g.cx - g.bw / 2 - 6} y={g.cy - g.bh / 2 - 6} width={g.bw + 12} height={g.bh + 12} rx={10} fill="black" />
                                                  if (g.hl === "ring") return <circle cx={g.cx} cy={g.cy} r={g.r + 6} fill="black" />
                                                  return <circle cx={g.cx} cy={g.cy} r={Math.max(44, Math.min(size.w, size.h) * 0.1)} fill="black" />
                                              })()
                                            : null}
                                    </mask>
                                </defs>
                                <rect width={size.w} height={size.h} fill="rgba(0,0,0,0.55)" mask={`url(#${uid}-m)`} />
                            </svg>
                        ) : null}
                    </div>

                    {/* Highlights + leader lines (decorative) */}
                    {on && size.w > 0 ? (
                        <svg aria-hidden width={size.w} height={size.h} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
                            {notes.map((n, i) => {
                                if (!isOpen(i)) return null
                                const g = geom(n, size.w, size.h)
                                const col = palette[kindOf(n)].c
                                const anim: React.CSSProperties = reduced ? {} : { animation: "dbAsDraw 700ms cubic-bezier(.2,.7,.2,1) both" }
                                const out: React.ReactNode[] = []
                                if (g.hl === "box")
                                    out.push(
                                        <rect
                                            key={"h" + i + "-" + shownActive}
                                            x={g.cx - g.bw / 2}
                                            y={g.cy - g.bh / 2}
                                            width={g.bw}
                                            height={g.bh}
                                            rx={8}
                                            fill="none"
                                            stroke={col}
                                            strokeWidth={2}
                                            pathLength={1}
                                            style={{ ...(reduced ? {} : { strokeDasharray: 1 }), ...anim }}
                                        />
                                    )
                                else if (g.hl === "ring")
                                    out.push(
                                        <circle
                                            key={"h" + i + "-" + shownActive}
                                            cx={g.cx}
                                            cy={g.cy}
                                            r={g.r}
                                            fill="none"
                                            stroke={col}
                                            strokeWidth={2}
                                            pathLength={1}
                                            style={{ ...(reduced ? {} : { strokeDasharray: 1 }), ...anim }}
                                        />
                                    )
                                if (!phone) {
                                    const cw = cardW
                                    const ch = cardH[i] || 96
                                    const p = placeCard((n.side || "auto") as Side, g.px, g.py, cw, ch, size.w, size.h)
                                    out.push(<line key={"l" + i} x1={g.px} y1={g.py} x2={p.ax} y2={p.ay} stroke={col} strokeOpacity={0.75} strokeWidth={1.25} />)
                                    out.push(<circle key={"d" + i} cx={p.ax} cy={p.ay} r={2.5} fill={col} />)
                                }
                                return <g key={i}>{out}</g>
                            })}
                        </svg>
                    ) : null}

                    {/* Cards on the media (wide screens) */}
                    {on && !phone && size.w > 0
                        ? notes.map((n, i) => {
                              const g = geom(n, size.w, size.h)
                              const ch = cardH[i] || 96
                              const p = placeCard((n.side || "auto") as Side, g.px, g.py, cardW, ch, size.w, size.h)
                              const open = isOpen(i)
                              return (
                                  <div
                                      key={"c" + i}
                                      id={`${uid}-card-${i}`}
                                      ref={(el) => {
                                          cardRefs.current[i] = el
                                      }}
                                      role="note"
                                      aria-hidden={!open}
                                      onMouseEnter={() => enter(i)}
                                      onMouseLeave={leave}
                                      style={{
                                          position: "absolute",
                                          left: p.left,
                                          top: p.top,
                                          width: cardW,
                                          boxSizing: "border-box",
                                          padding: "12px 14px",
                                          borderRadius: 12,
                                          background: glass,
                                          border: `1px solid ${line}`,
                                          boxShadow: shadow,
                                          backdropFilter: "blur(14px) saturate(140%)",
                                          WebkitBackdropFilter: "blur(14px) saturate(140%)",
                                          visibility: open ? "visible" : "hidden",
                                          opacity: open ? 1 : 0,
                                          animation: open && !reduced ? "dbAsIn 220ms ease both" : "none",
                                          pointerEvents: open ? "auto" : "none",
                                          zIndex: open ? 3 : 1,
                                      }}
                                  >
                                      {renderCardBody(n, i, false)}
                                      {n.body ? <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.45, color: text2 }}>{n.body}</div> : null}
                                  </div>
                              )
                          })
                        : null}

                    {/* Pins */}
                    {on && size.w > 0 ? (
                        <div role="group" aria-label="Annotations" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                            {notes.map((n, i) => {
                                const g = geom(n, size.w, size.h)
                                const k = kindOf(n)
                                const col = palette[k]
                                const sel = shownActive === i
                                const label = `${i + 1}: ${n.title || "Annotation"} (${KIND_LABEL[k]})`
                                return (
                                    <button
                                        key={"p" + i}
                                        ref={(el) => {
                                            pinRefs.current[i] = el
                                        }}
                                        type="button"
                                        className="db-as-pin"
                                        aria-label={label}
                                        aria-expanded={mode === "all" ? undefined : sel}
                                        aria-controls={phone ? `${uid}-row-${i}` : `${uid}-card-${i}`}
                                        onClick={() => tapPin(i)}
                                        onMouseEnter={() => enter(i)}
                                        onMouseLeave={leave}
                                        onFocus={() => {
                                            if (mode === "hover" && !locked) set(i)
                                        }}
                                        onKeyDown={(e) => onPinKey(e, i)}
                                        style={{
                                            position: "absolute",
                                            left: g.px,
                                            top: g.py,
                                            width: PIN,
                                            height: PIN,
                                            marginLeft: -PIN / 2,
                                            marginTop: -PIN / 2,
                                            padding: 0,
                                            border: `2px solid ${light ? "#FFFFFF" : "rgba(10,10,10,0.85)"}`,
                                            borderRadius: 999,
                                            background: col.c,
                                            color: col.on,
                                            fontFamily: FONT,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            cursor: "pointer",
                                            pointerEvents: "auto",
                                            boxShadow: sel ? `0 0 0 3px ${col.c}55, 0 4px 14px rgba(0,0,0,0.35)` : "0 4px 14px rgba(0,0,0,0.35)",
                                            transform: sel && !reduced ? "scale(1.08)" : "none",
                                            transition: reduced ? "none" : "transform 160ms ease, box-shadow 160ms ease",
                                            zIndex: sel ? 4 : 2,
                                        }}
                                    >
                                        <span
                                            aria-hidden
                                            style={{
                                                position: "absolute",
                                                inset: -2,
                                                borderRadius: 999,
                                                background: col.c,
                                                pointerEvents: "none",
                                                opacity: 0,
                                                animation: reduced || !inView ? "none" : `dbAsPulse 2.4s ease-out ${i * 0.35}s infinite`,
                                            }}
                                        />
                                        <span style={{ position: "relative" }}>{i + 1}</span>
                                    </button>
                                )
                            })}
                        </div>
                    ) : null}
                    {/* Enlarge */}
                    {enlarge && (imgSrc || videoSrc) ? (
                        <button
                            ref={zoomBtnRef}
                            type="button"
                            className="db-as-btn"
                            aria-label="Enlarge screen"
                            aria-haspopup="dialog"
                            onClick={() => startTransition(() => setZoom(true))}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 10,
                                zIndex: 5,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: `1px solid ${line}`,
                                background: glass,
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                color: textCol,
                                fontFamily: FONT,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "zoom-in",
                                boxShadow: shadow,
                            }}
                        >
                            <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M7 1h4v4M5 11H1V7M11 1 7 5M1 11l4-4" />
                            </svg>
                            Enlarge
                        </button>
                    ) : null}
                </div>
            </div>

                    </div>
                    <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Guided stepper */}
            {on && mode === "guided" ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <button type="button" className="db-as-btn" onClick={() => step(-1)} disabled={!shownActive} style={btn(line, text2, !shownActive)}>
                        ← Back
                    </button>
                    <span aria-live="polite" style={{ fontFamily: MONO, fontSize: 12, color: text2, letterSpacing: "0.06em" }}>
                        {shownActive === null ? "—" : shownActive + 1} / {notes.length}
                    </span>
                    <button
                        type="button"
                        className="db-as-btn"
                        onClick={() => step(1)}
                        style={{
                            ...btn(line, textCol, false),
                            background: "var(--db-accent, #F3500F)",
                            color: "var(--db-on-accent, #0A0A0A)",
                            border: "1px solid transparent",
                            fontWeight: 600,
                        }}
                    >
                        {shownActive !== null && shownActive >= notes.length - 1 ? "Start over ↺" : "Next →"}
                    </button>
                </div>
            ) : null}

            {/* Phone list */}
            {on && phone ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {notes.map((n, i) => {
                        const k = kindOf(n)
                        const open = showAll || shownActive === i
                        return (
                            <div
                                key={"r" + i}
                                id={`${uid}-row-${i}`}
                                ref={(el) => {
                                    rowRefs.current[i] = el
                                }}
                                className="db-as-row"
                                role="button"
                                tabIndex={0}
                                aria-expanded={open}
                                onClick={() => (mode === "all" ? null : open && mode === "hover" ? set(null) : set(i))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        if (mode !== "all") set(open && mode === "hover" ? null : i)
                                    }
                                }}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    background: open ? glass : "transparent",
                                    border: `1px solid ${open ? palette[k].c : line}`,
                                    boxShadow: open ? shadow : "none",
                                    cursor: mode === "all" ? "default" : "pointer",
                                    transition: reduced ? "none" : "background 180ms ease, border-color 180ms ease",
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        flex: "0 0 auto",
                                        width: 24,
                                        height: 24,
                                        borderRadius: 999,
                                        background: palette[k].c,
                                        color: palette[k].on,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                    {renderCardBody(n, i, true)}
                                    {open && n.body ? <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.45, color: text2 }}>{n.body}</div> : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : null}

                    </div>
                </div>
            ) : (
                <>
            <div style={{ ...frameStyle, width: "100%", maxWidth: mediaMax > 0 ? mediaMax : undefined, margin: mediaMax > 0 && !sideBySide ? "0 auto" : undefined, boxSizing: "border-box" }}>
                <div ref={boxRef} style={{ position: "relative", width: "100%", aspectRatio: String(aspect) }}>
                    {/* Clipped media layer */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            overflow: "hidden",
                            borderRadius: r,
                            background: "var(--db-surface, #111111)",
                            border: frame === "subtle" ? `1px solid ${line}` : "none",
                        }}
                    >
                        {videoSrc ? (
                            <video
                                ref={videoRef}
                                src={videoSrc}
                                muted
                                loop
                                playsInline
                                autoPlay={!reduced}
                                controls={reduced && !isStatic}
                                aria-label={caption || "Annotated product video"}
                                onLoadedMetadata={(e) => {
                                    const v = e.currentTarget
                                    if (v.videoWidth) startTransition(() => setIntrinsic(v.videoWidth / v.videoHeight))
                                }}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain", display: "block" }}
                            />
                        ) : imgSrc ? (
                            <img
                                ref={imgRef}
                                src={imgSrc}
                                srcSet={media.srcSet}
                                alt={altText}
                                draggable={false}
                                onLoad={(e) => {
                                    const im = e.currentTarget
                                    if (im.naturalWidth) startTransition(() => setIntrinsic(im.naturalWidth / im.naturalHeight))
                                }}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain", display: "block" }}
                            />
                        ) : (
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: light
                                        ? "radial-gradient(120% 90% at 20% 10%, rgba(0,0,0,0.04), transparent 60%), linear-gradient(135deg, #F2F2F4 0%, #E6E6EA 100%)"
                                        : "radial-gradient(120% 90% at 20% 10%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(135deg, #17171A 0%, #0E0E10 100%)",
                                    pointerEvents: "none",
                                }}
                            >
                                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: text2 }}>add a screenshot or video →</span>
                            </div>
                        )}

                        {/* Guided dim with a cut-out around the active area */}
                        {size.w > 0 ? (
                            <svg
                                aria-hidden
                                width={size.w}
                                height={size.h}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    pointerEvents: "none",
                                    opacity: dimOn ? 1 : 0,
                                    transition: reduced ? "none" : "opacity 260ms ease",
                                }}
                            >
                                <defs>
                                    <mask id={uid + "-m"}>
                                        <rect width={size.w} height={size.h} fill="white" />
                                        {dimOn && shownActive !== null
                                            ? (() => {
                                                  const g = geom(notes[shownActive], size.w, size.h)
                                                  if (g.hl === "box")
                                                      return <rect x={g.cx - g.bw / 2 - 6} y={g.cy - g.bh / 2 - 6} width={g.bw + 12} height={g.bh + 12} rx={10} fill="black" />
                                                  if (g.hl === "ring") return <circle cx={g.cx} cy={g.cy} r={g.r + 6} fill="black" />
                                                  return <circle cx={g.cx} cy={g.cy} r={Math.max(44, Math.min(size.w, size.h) * 0.1)} fill="black" />
                                              })()
                                            : null}
                                    </mask>
                                </defs>
                                <rect width={size.w} height={size.h} fill="rgba(0,0,0,0.55)" mask={`url(#${uid}-m)`} />
                            </svg>
                        ) : null}
                    </div>

                    {/* Highlights + leader lines (decorative) */}
                    {on && size.w > 0 ? (
                        <svg aria-hidden width={size.w} height={size.h} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
                            {notes.map((n, i) => {
                                if (!isOpen(i)) return null
                                const g = geom(n, size.w, size.h)
                                const col = palette[kindOf(n)].c
                                const anim: React.CSSProperties = reduced ? {} : { animation: "dbAsDraw 700ms cubic-bezier(.2,.7,.2,1) both" }
                                const out: React.ReactNode[] = []
                                if (g.hl === "box")
                                    out.push(
                                        <rect
                                            key={"h" + i + "-" + shownActive}
                                            x={g.cx - g.bw / 2}
                                            y={g.cy - g.bh / 2}
                                            width={g.bw}
                                            height={g.bh}
                                            rx={8}
                                            fill="none"
                                            stroke={col}
                                            strokeWidth={2}
                                            pathLength={1}
                                            style={{ ...(reduced ? {} : { strokeDasharray: 1 }), ...anim }}
                                        />
                                    )
                                else if (g.hl === "ring")
                                    out.push(
                                        <circle
                                            key={"h" + i + "-" + shownActive}
                                            cx={g.cx}
                                            cy={g.cy}
                                            r={g.r}
                                            fill="none"
                                            stroke={col}
                                            strokeWidth={2}
                                            pathLength={1}
                                            style={{ ...(reduced ? {} : { strokeDasharray: 1 }), ...anim }}
                                        />
                                    )
                                if (!phone) {
                                    const cw = cardW
                                    const ch = cardH[i] || 96
                                    const p = placeCard((n.side || "auto") as Side, g.px, g.py, cw, ch, size.w, size.h)
                                    out.push(<line key={"l" + i} x1={g.px} y1={g.py} x2={p.ax} y2={p.ay} stroke={col} strokeOpacity={0.75} strokeWidth={1.25} />)
                                    out.push(<circle key={"d" + i} cx={p.ax} cy={p.ay} r={2.5} fill={col} />)
                                }
                                return <g key={i}>{out}</g>
                            })}
                        </svg>
                    ) : null}

                    {/* Cards on the media (wide screens) */}
                    {on && !phone && size.w > 0
                        ? notes.map((n, i) => {
                              const g = geom(n, size.w, size.h)
                              const ch = cardH[i] || 96
                              const p = placeCard((n.side || "auto") as Side, g.px, g.py, cardW, ch, size.w, size.h)
                              const open = isOpen(i)
                              return (
                                  <div
                                      key={"c" + i}
                                      id={`${uid}-card-${i}`}
                                      ref={(el) => {
                                          cardRefs.current[i] = el
                                      }}
                                      role="note"
                                      aria-hidden={!open}
                                      onMouseEnter={() => enter(i)}
                                      onMouseLeave={leave}
                                      style={{
                                          position: "absolute",
                                          left: p.left,
                                          top: p.top,
                                          width: cardW,
                                          boxSizing: "border-box",
                                          padding: "12px 14px",
                                          borderRadius: 12,
                                          background: glass,
                                          border: `1px solid ${line}`,
                                          boxShadow: shadow,
                                          backdropFilter: "blur(14px) saturate(140%)",
                                          WebkitBackdropFilter: "blur(14px) saturate(140%)",
                                          visibility: open ? "visible" : "hidden",
                                          opacity: open ? 1 : 0,
                                          animation: open && !reduced ? "dbAsIn 220ms ease both" : "none",
                                          pointerEvents: open ? "auto" : "none",
                                          zIndex: open ? 3 : 1,
                                      }}
                                  >
                                      {renderCardBody(n, i, false)}
                                      {n.body ? <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.45, color: text2 }}>{n.body}</div> : null}
                                  </div>
                              )
                          })
                        : null}

                    {/* Pins */}
                    {on && size.w > 0 ? (
                        <div role="group" aria-label="Annotations" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                            {notes.map((n, i) => {
                                const g = geom(n, size.w, size.h)
                                const k = kindOf(n)
                                const col = palette[k]
                                const sel = shownActive === i
                                const label = `${i + 1}: ${n.title || "Annotation"} (${KIND_LABEL[k]})`
                                return (
                                    <button
                                        key={"p" + i}
                                        ref={(el) => {
                                            pinRefs.current[i] = el
                                        }}
                                        type="button"
                                        className="db-as-pin"
                                        aria-label={label}
                                        aria-expanded={mode === "all" ? undefined : sel}
                                        aria-controls={phone ? `${uid}-row-${i}` : `${uid}-card-${i}`}
                                        onClick={() => tapPin(i)}
                                        onMouseEnter={() => enter(i)}
                                        onMouseLeave={leave}
                                        onFocus={() => {
                                            if (mode === "hover" && !locked) set(i)
                                        }}
                                        onKeyDown={(e) => onPinKey(e, i)}
                                        style={{
                                            position: "absolute",
                                            left: g.px,
                                            top: g.py,
                                            width: PIN,
                                            height: PIN,
                                            marginLeft: -PIN / 2,
                                            marginTop: -PIN / 2,
                                            padding: 0,
                                            border: `2px solid ${light ? "#FFFFFF" : "rgba(10,10,10,0.85)"}`,
                                            borderRadius: 999,
                                            background: col.c,
                                            color: col.on,
                                            fontFamily: FONT,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            cursor: "pointer",
                                            pointerEvents: "auto",
                                            boxShadow: sel ? `0 0 0 3px ${col.c}55, 0 4px 14px rgba(0,0,0,0.35)` : "0 4px 14px rgba(0,0,0,0.35)",
                                            transform: sel && !reduced ? "scale(1.08)" : "none",
                                            transition: reduced ? "none" : "transform 160ms ease, box-shadow 160ms ease",
                                            zIndex: sel ? 4 : 2,
                                        }}
                                    >
                                        <span
                                            aria-hidden
                                            style={{
                                                position: "absolute",
                                                inset: -2,
                                                borderRadius: 999,
                                                background: col.c,
                                                pointerEvents: "none",
                                                opacity: 0,
                                                animation: reduced || !inView ? "none" : `dbAsPulse 2.4s ease-out ${i * 0.35}s infinite`,
                                            }}
                                        />
                                        <span style={{ position: "relative" }}>{i + 1}</span>
                                    </button>
                                )
                            })}
                        </div>
                    ) : null}
                    {/* Enlarge */}
                    {enlarge && (imgSrc || videoSrc) ? (
                        <button
                            ref={zoomBtnRef}
                            type="button"
                            className="db-as-btn"
                            aria-label="Enlarge screen"
                            aria-haspopup="dialog"
                            onClick={() => startTransition(() => setZoom(true))}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: 10,
                                zIndex: 5,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 10px",
                                borderRadius: 999,
                                border: `1px solid ${line}`,
                                background: glass,
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                color: textCol,
                                fontFamily: FONT,
                                fontSize: 12,
                                fontWeight: 500,
                                cursor: "zoom-in",
                                boxShadow: shadow,
                            }}
                        >
                            <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M7 1h4v4M5 11H1V7M11 1 7 5M1 11l4-4" />
                            </svg>
                            Enlarge
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Guided stepper */}
            {on && mode === "guided" ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <button type="button" className="db-as-btn" onClick={() => step(-1)} disabled={!shownActive} style={btn(line, text2, !shownActive)}>
                        ← Back
                    </button>
                    <span aria-live="polite" style={{ fontFamily: MONO, fontSize: 12, color: text2, letterSpacing: "0.06em" }}>
                        {shownActive === null ? "—" : shownActive + 1} / {notes.length}
                    </span>
                    <button
                        type="button"
                        className="db-as-btn"
                        onClick={() => step(1)}
                        style={{
                            ...btn(line, textCol, false),
                            background: "var(--db-accent, #F3500F)",
                            color: "var(--db-on-accent, #0A0A0A)",
                            border: "1px solid transparent",
                            fontWeight: 600,
                        }}
                    >
                        {shownActive !== null && shownActive >= notes.length - 1 ? "Start over ↺" : "Next →"}
                    </button>
                </div>
            ) : null}

            {/* Phone list */}
            {on && phone ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {notes.map((n, i) => {
                        const k = kindOf(n)
                        const open = showAll || shownActive === i
                        return (
                            <div
                                key={"r" + i}
                                id={`${uid}-row-${i}`}
                                ref={(el) => {
                                    rowRefs.current[i] = el
                                }}
                                className="db-as-row"
                                role="button"
                                tabIndex={0}
                                aria-expanded={open}
                                onClick={() => (mode === "all" ? null : open && mode === "hover" ? set(null) : set(i))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        if (mode !== "all") set(open && mode === "hover" ? null : i)
                                    }
                                }}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    background: open ? glass : "transparent",
                                    border: `1px solid ${open ? palette[k].c : line}`,
                                    boxShadow: open ? shadow : "none",
                                    cursor: mode === "all" ? "default" : "pointer",
                                    transition: reduced ? "none" : "background 180ms ease, border-color 180ms ease",
                                }}
                            >
                                <span
                                    aria-hidden
                                    style={{
                                        flex: "0 0 auto",
                                        width: 24,
                                        height: 24,
                                        borderRadius: 999,
                                        background: palette[k].c,
                                        color: palette[k].on,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                    {renderCardBody(n, i, true)}
                                    {open && n.body ? <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.45, color: text2 }}>{n.body}</div> : null}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : null}

                </>
            )}

            {/* Legend + toggle */}
            {(showLegend && notes.length > 0) || toggleLabel ? (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, opacity: visible ? 1 : 0.5 }}>
                        {showLegend
                            ? KIND_ORDER.filter((k) => counts[k]).map((k) => (
                                  <span
                                      key={k}
                                      style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 6,
                                          padding: "4px 10px",
                                          borderRadius: 999,
                                          border: `1px solid ${line}`,
                                          fontFamily: MONO,
                                          fontSize: 11,
                                          letterSpacing: "0.06em",
                                          textTransform: "uppercase",
                                          color: text2,
                                      }}
                                  >
                                      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: palette[k].c }} />
                                      {KIND_LABEL[k]}
                                      <span style={{ color: textCol }}>{counts[k]}</span>
                                  </span>
                              ))
                            : null}
                    </div>
                    {toggleLabel ? (
                        <button
                            type="button"
                            role="switch"
                            aria-checked={visible}
                            className="db-as-btn"
                            onClick={() => startTransition(() => setVisible((v) => !v))}
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 4, cursor: "pointer", color: text2, fontFamily: FONT, fontSize: 13 }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    position: "relative",
                                    width: 30,
                                    height: 18,
                                    borderRadius: 999,
                                    background: visible ? "var(--db-accent, #F3500F)" : line,
                                    transition: reduced ? "none" : "background 160ms ease",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        top: 2,
                                        left: visible ? 14 : 2,
                                        width: 14,
                                        height: 14,
                                        borderRadius: 999,
                                        background: visible ? "var(--db-on-accent, #0A0A0A)" : textCol,
                                        transition: reduced ? "none" : "left 160ms ease",
                                    }}
                                />
                            </span>
                            {toggleLabel}
                        </button>
                    ) : null}
                </div>
            ) : null}

            {caption ? <figcaption style={{ fontSize: 13, lineHeight: 1.5, color: text2 }}>{caption}</figcaption> : null}
            {zoom && typeof document !== "undefined"
                ? createPortal(
                      <div
                          role="dialog"
                          aria-modal="true"
                          aria-label={altText}
                          onClick={() => startTransition(() => setZoom(false))}
                          style={{
                              position: "fixed",
                              inset: 0,
                              zIndex: 2147483000,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 12,
                              padding: "56px 16px 24px",
                              background: light ? "rgba(245,245,247,0.92)" : "rgba(5,5,6,0.9)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              cursor: "zoom-out",
                              fontFamily: FONT,
                          }}
                      >
                          <button
                              ref={closeRef}
                              type="button"
                              className="db-as-btn"
                              onClick={(e) => {
                                  e.stopPropagation()
                                  startTransition(() => setZoom(false))
                              }}
                              style={{
                                  position: "absolute",
                                  top: 16,
                                  right: 16,
                                  padding: "8px 14px",
                                  borderRadius: 999,
                                  border: `1px solid ${light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.22)"}`,
                                  background: light ? "#FFFFFF" : "#141416",
                                  color: light ? "#0A0A0A" : "#FAFAFA",
                                  fontFamily: FONT,
                                  fontSize: 13,
                                  cursor: "pointer",
                              }}
                          >
                              Close ✕
                          </button>
                          {videoSrc ? (
                              <video
                                  src={videoSrc}
                                  controls
                                  playsInline
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ maxWidth: "min(1200px, 100%)", maxHeight: "calc(100vh - 120px)", borderRadius: 12, display: "block" }}
                              />
                          ) : (
                              <img
                                  src={imgSrc}
                                  srcSet={media && media.srcSet}
                                  alt={altText}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ maxWidth: "min(1200px, 100%)", maxHeight: "calc(100vh - 120px)", objectFit: "contain", borderRadius: 12, display: "block", cursor: "default", boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}
                              />
                          )}
                          {caption ? (
                              <div style={{ maxWidth: 640, fontSize: 13, lineHeight: 1.5, textAlign: "center", color: light ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.75)" }}>{caption}</div>
                          ) : null}
                      </div>,
                      document.body
                  )
                : null}
        </figure>
    )
}

function btn(line: string, color: string, disabled: boolean): React.CSSProperties {
    return {
        fontFamily: FONT,
        fontSize: 13,
        padding: "8px 14px",
        borderRadius: 999,
        border: `1px solid ${line}`,
        background: "transparent",
        color,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
    }
}

addPropertyControls(AnnotatedScreen, {
    media: { type: ControlType.ResponsiveImage, title: "Image" },
    video: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mp4", "webm", "mov"],
        description: "Overrides the image when set.",
    },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        options: ["contain", "cover"],
        optionTitles: ["Contain", "Cover"],
        defaultValue: "contain",
        displaySegmentedControl: true,
    },
    ratio: {
        type: ControlType.Enum,
        title: "Ratio",
        options: ["auto", "16:9", "4:3", "3:2", "1:1", "9:16"],
        optionTitles: ["Auto", "16:9", "4:3", "3:2", "1:1", "9:16"],
        defaultValue: "auto",
    },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 16, min: 0, max: 48, step: 1, unit: "px" },
    frame: {
        type: ControlType.Enum,
        title: "Frame",
        options: ["none", "subtle", "device-dark"],
        optionTitles: ["None", "Subtle", "Device (dark)"],
        defaultValue: "subtle",
    },
    mode: {
        type: ControlType.Enum,
        title: "Mode",
        options: ["hover", "guided", "all"],
        optionTitles: ["Hover", "Guided", "All"],
        defaultValue: "hover",
        displaySegmentedControl: true,
        description: "Hover: card on hover/tap. Guided: Next → walkthrough. All: every card shown.",
    },
    notes: {
        type: ControlType.Array,
        title: "Notes",
        maxCount: 12,
        control: {
            type: ControlType.Object,
            controls: {
                x: { type: ControlType.Number, title: "X %", defaultValue: 50, min: 0, max: 100, step: 0.5, unit: "%" },
                y: { type: ControlType.Number, title: "Y %", defaultValue: 50, min: 0, max: 100, step: 0.5, unit: "%" },
                kind: {
                    type: ControlType.Enum,
                    title: "Kind",
                    options: ["feature", "principle", "decision", "research", "metric"],
                    optionTitles: ["Feature", "UX principle", "Decision", "Research insight", "Result"],
                    defaultValue: "feature",
                },
                title: { type: ControlType.String, title: "Title", defaultValue: "Hick's Law" },
                body: { type: ControlType.String, title: "Body", defaultValue: "One or two lines on why this matters.", displayTextArea: true },
                side: {
                    type: ControlType.Enum,
                    title: "Card side",
                    options: ["auto", "left", "right", "top", "bottom"],
                    optionTitles: ["Auto", "Left", "Right", "Top", "Bottom"],
                    defaultValue: "auto",
                },
                highlight: {
                    type: ControlType.Enum,
                    title: "Highlight",
                    options: ["none", "ring", "box"],
                    optionTitles: ["None", "Ring", "Box"],
                    defaultValue: "none",
                    displaySegmentedControl: true,
                    description: "X/Y is the centre of the area; the pin moves to its corner.",
                },
                boxW: {
                    type: ControlType.Number,
                    title: "Area W %",
                    defaultValue: 20,
                    min: 1,
                    max: 100,
                    step: 0.5,
                    unit: "%",
                    hidden: (p: any) => !p || p.highlight === "none" || !p.highlight,
                },
                boxH: {
                    type: ControlType.Number,
                    title: "Area H %",
                    defaultValue: 14,
                    min: 1,
                    max: 100,
                    step: 0.5,
                    unit: "%",
                    hidden: (p: any) => !p || p.highlight !== "box",
                },
            },
        },
        defaultValue: DEFAULT_NOTES,
    },
    layout: {
        type: ControlType.Enum,
        title: "Notes",
        options: ["overlay", "side"],
        optionTitles: ["On screen", "Beside"],
        defaultValue: "overlay",
        displaySegmentedControl: true,
        description: "Beside: notes sit next to the screen (good for phone screens); they stack below on narrow widths.",
    },
    mediaMax: { type: ControlType.Number, title: "Screen max W", defaultValue: 0, min: 0, max: 1600, step: 10, unit: "px", description: "0 = fill the width." },
    enlarge: { type: ControlType.Boolean, title: "Enlarge button", defaultValue: true },
    alt: { type: ControlType.String, title: "Alt text", defaultValue: "", displayTextArea: true },
    showLegend: { type: ControlType.Boolean, title: "Legend", defaultValue: true, enabledTitle: "Show", disabledTitle: "Hide" },
    toggleLabel: { type: ControlType.String, title: "Toggle label", defaultValue: "Show annotations", description: "Leave empty to hide the switch." },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "", displayTextArea: true },
})
