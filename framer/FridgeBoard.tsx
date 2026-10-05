// FridgeBoard v5 (Oct 5) — the fridge door now BLENDS into the Home hero. `door` = "glass"
// (default: a barely-there frosted panel whose edges dissolve via mask-image, slim translucent
// handle, no hard shadow), "none" (items float straight on the page) or "steel" (the v4 look).
// Calmer default collage: hello label, postcard quote, photo strip, receipt, place magnets,
// letter magnets ("hi!"), chai + a small marigold accent; `extras` brings back the note, tile,
// bangles, flower sprig and glitter star. Saturation down ~15%, soft contact shadows from
// --db-shadow. Everything stays inside the frame with breathing room.
// v4 brief, kept for reference — a scrapbook steel fridge door with a desi-maximalist layer, for one
// corner of the home hero (~340x460, scales down to fit its frame).
// Brief (adapted from the owner's references, nothing copied): brushed-steel door (dark = deep
// graphite steel, light = soft silver) with a tall chrome bar handle, densely but tidily layered
// with her paper ephemera — photo-booth strip on the right edge under gingham washi tape, a vintage
// airmail postcard carrying the quote in handwriting, a torn lined note with a red line + smiley
// sticker, a long receipt "the set so far" in a chrome bulldog clip, souvenir enamel place
// magnets, a block-print tile (maroon / mustard / magenta / emerald / gold), a marigold garland
// across the corner, a cutting-chai glass magnet, a bangle stack, the rotating hello in chunky
// display type on mustard paper, glossy plastic alphabet magnets spelling DHWANI, a pressed
// flower sprig, glitter star stickers and up to 2 uploadable polaroids.
// Interactions: drag (pointer events), arrow keys nudge 8px, double-click / double-tap resets with
// a staggered hop home, hover wiggle, squash-and-bounce on drop, magnets snap. Reduced motion =
// no motion. Paper has grain, soft shadows and a slight curl. Theme-aware in light and dark.
import * as React from "react"
import { useCallback, useEffect, useId, useMemo, useRef, useState, startTransition } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget, useIsStaticRenderer } from "framer"

type Img = any

interface FridgeBoardProps {
    door: "glass" | "steel" | "none"
    extras: boolean
    hellos: string
    quote: string
    places: string
    receiptLines: string
    magnetWord: string
    noteLine: string
    photo1: Img
    photo2: Img
    photo3: Img
    photo1Alt: string
    photo2Alt: string
    photo3Alt: string
    stripCaption: string
    pin1: Img
    pin1Caption: string
    pin1Alt: string
    pin2: Img
    pin2Caption: string
    pin2Alt: string
    showHint: boolean
    hintText: string
    compact: boolean
    style?: React.CSSProperties
}

const HAND = "'Caveat', 'Segoe Print', cursive"
const SANS = "'Poppins', 'Inter', system-ui, sans-serif"
const MONO = "'IBM Plex Mono', 'Courier New', monospace"
const DISPLAY = "'Rozha One', 'Baloo Tamma 2', Georgia, serif"
const TOY = "'Fredoka', 'Baloo 2', system-ui, sans-serif"
const INK = "#2b2a44"

const DESIGN_W = 340
const PAD = 4
const NUDGE = 8

type Kind = "box" | "free"
type Item = { id: string; label: string; x: number; y: number; r: number; w?: number; kind: Kind; node: React.ReactNode }
type Pos = { x: number; y: number; r?: number; z?: number }

const tf = (x: number, y: number, r: number, s: number) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), Math.max(a, b))
const list = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean)

function play(el: Element | null, cls: string) {
    if (!el) return
    const n = el as HTMLElement
    n.classList.remove("dbf-drop", "dbf-snap", "dbf-hop")
    void n.offsetWidth
    n.classList.add(cls)
    const done = (e: AnimationEvent) => {
        if (e.target !== n) return
        n.classList.remove(cls)
        n.removeEventListener("animationend", done)
    }
    n.addEventListener("animationend", done)
}

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .24 0 0 0 0 .18 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`
const BRUSH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.55 .012' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)'/%3E%3C/svg%3E")`

/* ---------- small crafted pieces ---------- */

function Washi({ left, top = -7, w = 40, r = -4, kind = "gingham" }: { left: string | number; top?: number; w?: number; r?: number; kind?: "gingham" | "mint" | "lilac" }) {
    return <span aria-hidden className={`dbf-washi ${kind}`} style={{ left, top, width: w, transform: `rotate(${r}deg)` }} />
}

function Photo({ img, alt, placeholder }: { img: Img; alt: string; placeholder: string }) {
    if (img && img.src) {
        return <img src={img.src} srcSet={img.srcSet} sizes="90px" alt={alt || img.alt || ""} draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    }
    return <span aria-hidden style={{ display: "block", width: "100%", height: "100%", background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.4), rgba(255,255,255,0) 50%), ${placeholder}` }} />
}

function Smiley() {
    return (
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden style={{ display: "block" }}>
            <circle cx="10" cy="10" r="9" fill="#fff" />
            <circle cx="10" cy="10" r="7.4" fill="#ffd23f" />
            <circle cx="7.6" cy="8.6" r="1" fill="#3a2a10" />
            <circle cx="12.4" cy="8.6" r="1" fill="#3a2a10" />
            <path d="M6.8 11.4q3.2 3 6.4 0" fill="none" stroke="#3a2a10" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
    )
}

function GlitterStar({ uid, s = 20 }: { uid: string; s?: number }) {
    const d = "M12 2.5 14.6 8.4 21 9 16.2 13.2 17.6 19.5 12 16.2 6.4 19.5 7.8 13.2 3 9 9.4 8.4Z"
    const dots = [[9, 9], [13.5, 7.5], [11, 12.5], [15, 12], [8.5, 14], [12.5, 15.5], [10.5, 5.5]]
    return (
        <svg width={s} height={s} viewBox="0 0 24 22" aria-hidden style={{ display: "block", overflow: "visible" }}>
            <defs>
                <linearGradient id={`${uid}glit`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff1a8" />
                    <stop offset=".5" stopColor="#f7c948" />
                    <stop offset="1" stopColor="#f08bb4" />
                </linearGradient>
            </defs>
            <path d={d} fill="#fff" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round" />
            <path d={d} fill={`url(#${uid}glit)`} strokeLinejoin="round" />
            {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".55" fill="#fff" opacity=".9" />)}
        </svg>
    )
}

/* ---------- souvenir enamel place magnets ---------- */

type Palette = { bg: string; fg: string; icon: "pennant" | "leaf" | "flower" | "dot" }
const PLACE_PALETTES: Record<string, Palette> = {
    "ann arbor": { bg: "#FFD447", fg: "#14315c", icon: "pennant" },
    "east lansing": { bg: "#1f5a47", fg: "#ffffff", icon: "leaf" },
    bangalore: { bg: "#F59A23", fg: "#4a1408", icon: "flower" },
}
PLACE_PALETTES["bengaluru"] = PLACE_PALETTES.bangalore
const EXTRA_PALETTES: Palette[] = [
    { bg: "#b9264f", fg: "#fff4e0", icon: "dot" },
    { bg: "#2a7fb8", fg: "#ffffff", icon: "dot" },
    { bg: "#7a3e9d", fg: "#fff4e0", icon: "dot" },
    { bg: "#e8d9b0", fg: "#5a2a14", icon: "dot" },
]

function PlaceIcon({ kind, fg, bg }: { kind: Palette["icon"]; fg: string; bg: string }) {
    const s = { width: 11, height: 11, flex: "none" as const, display: "block" }
    if (kind === "pennant")
        return (
            <svg viewBox="0 0 12 12" style={s} aria-hidden>
                <path d="M2 1v10.5" stroke={fg} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M2.4 1.6 11 4.6 2.4 7.6Z" fill={fg} />
                <path d="M2.4 4 7 4.6 2.4 5.2Z" fill={bg} />
            </svg>
        )
    if (kind === "leaf")
        return (
            <svg viewBox="0 0 12 12" style={s} aria-hidden>
                <path d="M1.8 10.4C1.4 4.6 5 1.8 10.4 1.6c.2 5.4-3 8.9-8.6 8.8Z" fill={fg} />
                <path d="M2.2 10 7.4 4.8" stroke={bg} strokeWidth=".9" strokeLinecap="round" />
            </svg>
        )
    if (kind === "flower")
        return (
            <svg viewBox="0 0 12 12" style={s} aria-hidden>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <ellipse key={a} cx="6" cy="2.9" rx="1.5" ry="2.4" fill="#ffe08a" transform={`rotate(${a} 6 6)`} />)}
                <circle cx="6" cy="6" r="2" fill={fg} />
            </svg>
        )
    return <svg viewBox="0 0 12 12" style={s} aria-hidden><circle cx="6" cy="6" r="3" fill={fg} /></svg>
}

function PlaceMagnet({ name, pal }: { name: string; pal: Palette }) {
    return (
        <span className="dbf-enamel-rim">
            <span className="dbf-enamel" style={{ background: pal.bg, color: pal.fg }}>
                <PlaceIcon kind={pal.icon} fg={pal.fg} bg={pal.bg} />
                <span style={{ position: "relative" }}>{name}</span>
            </span>
        </span>
    )
}

/* ---------- desi + kitsch magnets ---------- */

function BlockTile() {
    const petals = [0, 45, 90, 135, 180, 225, 270, 315]
    return (
        <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden style={{ display: "block" }}>
            <rect width="58" height="58" fill="#d9a23a" />
            <rect x="3" y="3" width="52" height="52" fill="#7a1f2b" />
            {Array.from({ length: 9 }).map((_, i) => (
                <g key={i}>
                    <circle cx={6 + i * 5.75} cy="6" r="1" fill="#f3d27a" />
                    <circle cx={6 + i * 5.75} cy="52" r="1" fill="#f3d27a" />
                    <circle cx="6" cy={6 + i * 5.75} r="1" fill="#f3d27a" />
                    <circle cx="52" cy={6 + i * 5.75} r="1" fill="#f3d27a" />
                </g>
            ))}
            {[[10, 10], [48, 10], [10, 48], [48, 48]].map(([x, y], i) => (
                <g key={i}>
                    <path d={`M${x} ${y - 4}q3 4 0 8q-3-4 0-8Z`} fill="#1f7a5a" />
                    <path d={`M${x - 4} ${y}q4 3 8 0q-4-3-8 0Z`} fill="#1f7a5a" />
                    <circle cx={x} cy={y} r="1.6" fill="#e9b949" />
                </g>
            ))}
            <circle cx="29" cy="29" r="17" fill="none" stroke="#e9b949" strokeWidth="1" strokeDasharray="1.5 2" />
            {petals.map((a) => <path key={`l${a}`} d="M29 29 Q33 21 29 13 Q25 21 29 29Z" fill="#1f7a5a" transform={`rotate(${a + 22.5} 29 29)`} />)}
            {petals.map((a) => <ellipse key={a} cx="29" cy="20.5" rx="3.6" ry="6.4" fill="#c2185b" transform={`rotate(${a} 29 29)`} />)}
            {petals.map((a) => <ellipse key={`h${a}`} cx="29" cy="20" rx="1.2" ry="3" fill="#f06292" transform={`rotate(${a} 29 29)`} />)}
            <circle cx="29" cy="29" r="5" fill="#e9b949" />
            <circle cx="29" cy="29" r="2.2" fill="#7a1f2b" />
        </svg>
    )
}

function ChaiGlass({ uid }: { uid: string }) {
    return (
        <svg width="28" height="40" viewBox="0 0 28 40" aria-hidden style={{ display: "block" }}>
            <defs>
                <linearGradient id={`${uid}chai`} x1="0" x2="1">
                    <stop offset="0" stopColor="#b8733a" />
                    <stop offset=".45" stopColor="#d9a066" />
                    <stop offset="1" stopColor="#a5612b" />
                </linearGradient>
            </defs>
            <path d="M10 8c-1.6-2 1.6-3.4 0-5.6M16 7.4c-1.6-2 1.6-3.4 0-5.6" fill="none" className="dbf-steam" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M3 10h22l-2.6 26.5a2.4 2.4 0 0 1-2.4 2.1H8a2.4 2.4 0 0 1-2.4-2.1Z" fill="rgba(235,245,250,.35)" stroke="rgba(255,255,255,.75)" strokeWidth=".9" />
            <path d="M4.2 17h19.6l-1.9 19.4a2.2 2.2 0 0 1-2.2 1.9H8.3a2.2 2.2 0 0 1-2.2-1.9Z" fill={`url(#${uid}chai)`} />
            <ellipse cx="14" cy="17" rx="9.8" ry="1.6" fill="#ecc89a" />
            {[7, 10.5, 14, 17.5, 21].map((x) => <path key={x} d={`M${x} 11.5 L${x + (x - 14) * 0.08} 37`} stroke="rgba(255,255,255,.45)" strokeWidth=".8" />)}
            <ellipse cx="14" cy="10" rx="11" ry="1.8" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1" />
            <path d="M5.6 13 7.2 34" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity=".8" />
        </svg>
    )
}

function Bangles() {
    const rings = [
        { y: 10, c: "#d4a72c", w: 3.2 },
        { y: 15.5, c: "#c2185b", w: 3.6 },
        { y: 21, c: "#1f7a5a", w: 3.6 },
        { y: 26.5, c: "#d4a72c", w: 3.2 },
    ]
    return (
        <svg width="44" height="36" viewBox="0 0 44 36" aria-hidden style={{ display: "block" }}>
            {rings.map((r, i) => (
                <g key={i}>
                    <ellipse cx="22" cy={r.y} rx="18" ry="5.6" fill="none" stroke={r.c} strokeWidth={r.w} />
                    <path d={`M8 ${r.y - 2.6}q14-5.4 28 0`} fill="none" stroke="rgba(255,255,255,.6)" strokeWidth=".9" strokeLinecap="round" />
                    {r.c !== "#d4a72c" && [10, 17, 24, 31].map((x) => <circle key={x} cx={x + 1} cy={r.y + 4.6} r=".7" fill="#f3d27a" />)}
                </g>
            ))}
        </svg>
    )
}

function FlowerSprig() {
    return (
        <svg width="28" height="58" viewBox="0 0 28 58" aria-hidden style={{ display: "block", overflow: "visible" }}>
            <path d="M14 57C13 44 15 30 12 14" fill="none" stroke="#8a8a52" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M13.4 36c-4-1.5-6.5-4.6-7-8 3.6.4 6.4 3 7 8ZM13.6 28c3.8-1.2 6.2-4 6.8-7.4-3.4.4-6.2 3-6.8 7.4ZM13.2 46c-3.6-.8-6-3.2-6.8-6.2 3.2 0 5.8 2 6.8 6.2Z" fill="#a3a86a" opacity=".9" />
            {[[12, 12, "#d9a0b4"], [18, 19, "#c8b3dc"], [7.5, 21, "#e7b7a6"]].map(([x, y, c], i) => (
                <g key={i}>
                    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={Number(x)} cy={Number(y) - 2.6} rx="1.6" ry="2.6" fill={String(c)} opacity=".9" transform={`rotate(${a} ${x} ${y})`} />)}
                    <circle cx={Number(x)} cy={Number(y)} r="1.1" fill="#d6b45a" />
                </g>
            ))}
            <rect x="3" y="31" width="22" height="8" rx="1" fill="rgba(255,252,240,.55)" transform="rotate(-12 14 35)" />
        </svg>
    )
}

function BulldogClip() {
    return (
        <svg width="34" height="24" viewBox="0 0 34 24" aria-hidden style={{ display: "block" }}>
            <defs>
                <linearGradient id="dbfclip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f4f6f8" />
                    <stop offset=".5" stopColor="#a9b0b7" />
                    <stop offset="1" stopColor="#6e757c" />
                </linearGradient>
            </defs>
            <path d="M9 12C9 3 12 1 17 1s8 2 8 11" fill="none" stroke="#c9ced3" strokeWidth="1.6" />
            <path d="M11 12C11 5 13 3.4 17 3.4s6 1.6 6 8.6" fill="none" stroke="#8e959c" strokeWidth="1.2" />
            <path d="M3 11h28l-2.4 11.5H5.4Z" fill="url(#dbfclip)" stroke="rgba(0,0,0,.25)" strokeWidth=".6" />
            <path d="M4.2 13h25.6" stroke="#fff" strokeWidth=".8" opacity=".8" />
        </svg>
    )
}

function Garland({ compact }: { compact: boolean }) {
    const pts: { x: number; y: number; t: number }[] = []
    const n = compact ? 6 : 7
    for (let i = 0; i <= n; i++) {
        const t = i / n
        const x = (1 - t) * (1 - t) * 258 + 2 * (1 - t) * t * 310 + t * t * 330
        const y = (1 - t) * (1 - t) * -4 + 2 * (1 - t) * t * 30 + t * t * 76
        pts.push({ x, y, t })
    }
    return (
        <svg aria-hidden width={DESIGN_W} height="90" viewBox={`0 0 ${DESIGN_W} 90`} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 60, overflow: "visible", filter: "var(--dbf-dim)" }}>
            <path d="M258 -4Q310 30 330 76" fill="none" stroke="#c9b48a" strokeWidth="1" />
            {pts.map((p, i) => (
                <g key={i} transform={`translate(${p.x} ${p.y}) scale(.78)`} style={{ filter: "drop-shadow(0 1.5px 1.5px var(--dbf-sh))" }}>
                    {i % 4 === 2 ? (
                        <path d="M0 0q5-6 10-2q-5 6-10 2Z" fill="#3f8a4a" transform="rotate(30)" />
                    ) : (
                        <>
                            <circle r="6.2" fill={i % 2 ? "#ffb300" : "#f57c00"} />
                            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => <circle key={a} cx={5.2 * Math.cos((a * Math.PI) / 180)} cy={5.2 * Math.sin((a * Math.PI) / 180)} r="1.9" fill={i % 2 ? "#ffc933" : "#fb8c1e"} />)}
                            <circle r="3.2" fill={i % 2 ? "#f59f00" : "#e06600"} />
                            <circle cx="-1.6" cy="-1.8" r="1.1" fill="#fff" opacity=".35" />
                        </>
                    )}
                </g>
            ))}
        </svg>
    )
}

const LETTER_COLORS = [
    ["#e53935", "#9e1b18"],
    ["#fbc02d", "#b38300"],
    ["#1e88e5", "#0d4c97"],
    ["#43a047", "#1b5e20"],
    ["#8e24aa", "#4a148c"],
    ["#fb8c00", "#b45a00"],
]

function Letter({ ch, i }: { ch: string; i: number }) {
    const [c, d] = LETTER_COLORS[i % LETTER_COLORS.length]
    return (
        <span style={{ position: "relative", display: "block", fontFamily: TOY, fontWeight: 700, fontSize: 30, lineHeight: 1, color: c, textShadow: `0 1.5px 0 ${d}, 0 2.5px 0 ${d}`, padding: "0 1px" }}>
            {ch}
            <span aria-hidden className="dbf-gloss">{ch}</span>
        </span>
    )
}

/* ---------- component ---------- */

/**
 * @framerIntrinsicWidth 340
 * @framerIntrinsicHeight 460
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function FridgeBoard(props: FridgeBoardProps) {
    const {
        door = "glass",
        extras = false,
        hellos = "hello, नमस्ते, ನಮಸ್ಕಾರ",
        quote = "the best work happens when people feel seen enough to speak up.",
        places = "Ann Arbor, East Lansing, Bangalore",
        receiptLines = "matcha ×2, research, one more prototype, dj set @ 1am",
        magnetWord = "hi!",
        noteLine = "ask the 'dumb' question.",
        photo1, photo2, photo3,
        photo1Alt = "Photo-booth frame 1", photo2Alt = "Photo-booth frame 2", photo3Alt = "Photo-booth frame 3",
        stripCaption = "photo booth",
        pin1, pin1Caption = "", pin1Alt = "",
        pin2, pin2Caption = "", pin2Alt = "",
        showHint = true,
        hintText = "drag things around · double-tap to reset",
        compact = false,
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const interactive = !isStatic && !onCanvas
    const reduced = !!useReducedMotion()
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
    const H = compact ? 420 : 460

    const rootRef = useRef<HTMLDivElement>(null)
    const doorRef = useRef<HTMLElement>(null)
    const itemEls = useRef<Record<string, HTMLDivElement | null>>({})
    const inView = useInView(rootRef)
    const [scale, setScale] = useState(1)
    const scaleRef = useRef(1)

    useEffect(() => {
        const el = rootRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => {
            const w = e.contentRect.width
            const h = e.contentRect.height
            let s = h > 10 ? Math.min(w / DESIGN_W, h / H) : w / DESIGN_W
            if (!isFinite(s) || s <= 0) s = 1
            s = Math.min(s, 1.3)
            if (Math.abs(s - scaleRef.current) < 0.002) return
            scaleRef.current = s
            startTransition(() => setScale(s))
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [H])

    // rotating hello
    const words = useMemo(() => list(hellos), [hellos])
    const [wi, setWi] = useState(0)
    useEffect(() => {
        if (!interactive || !inView || words.length < 2) return
        const id = window.setInterval(() => startTransition(() => setWi((i) => (i + 1) % words.length)), 2200)
        return () => window.clearInterval(id)
    }, [interactive, inView, words.length])
    const activeWord = words.length ? wi % words.length : 0

    // positions
    const [pos, setPos] = useState<Record<string, Pos>>({})
    const zTop = useRef(20)
    const drag = useRef<null | { id: string; el: HTMLElement; sx: number; sy: number; ox: number; oy: number; x: number; y: number; minX: number; maxX: number; minY: number; maxY: number; r: number; z: number; moved: boolean }>(null)
    const dragMoved = useRef(false)
    const lastTap = useRef({ t: 0, x: 0, y: 0 })

    const reset = useCallback(() => {
        const door = doorRef.current
        if (!reduced && door) {
            door.classList.add("is-resetting")
            Object.keys(itemEls.current).forEach((k) => {
                const n = itemEls.current[k]
                if (n) play(n.firstElementChild, "dbf-hop")
            })
            window.setTimeout(() => door.classList.remove("is-resetting"), 1600)
        }
        startTransition(() => setPos({}))
    }, [reduced])

    // content
    const placeList = useMemo(() => list(places).slice(0, compact ? 3 : 5), [places, compact])
    const lines = useMemo(() => list(receiptLines).slice(0, 5), [receiptLines])
    const letters = useMemo(() => Array.from(magnetWord).filter((c) => c.trim()).slice(0, 10), [magnetWord])
    const has1 = !!(pin1 && pin1.src)
    const has2 = !compact && !!(pin2 && pin2.src)
    const showPin1 = has1 || onCanvas
    const showPin2 = has2 || (onCanvas && !compact)
    const hasPins = showPin1 || showPin2
    const stripEmpty = !(photo1 && photo1.src) && !(photo2 && photo2.src) && !(photo3 && photo3.src)

    const placeAnchors = hasPins
        ? compact
            ? [[214, 280, 3], [212, 316, -3], [140, 312, 2]]
            : [[136, 306, -3], [130, 342, 3], [214, 372, -2], [60, 392, 2], [250, 404, -3]]
        : [[148, 222, -4], [158, 260, 3], [146, 298, -2], [212, 330, 3], [150, 340, -3]]

    const items: Item[] = []

    // hello — mustard paper label, chunky display type
    items.push({
        id: "hello", label: `Hello label: ${words.join(", ")}`, x: 36, y: 22, r: -3, kind: "box",
        node: (
            <div className="dbf-mustard dbf-grain">
                <span aria-hidden className="dbf-goldmag" />
                <span aria-hidden style={{ display: "grid", justifyItems: "center" }}>
                    {words.map((w, i) => (
                        <span key={i} className="dbf-word" style={{ gridArea: "1 / 1", whiteSpace: "nowrap", opacity: i === activeWord ? 1 : 0, transform: i === activeWord ? "none" : "translateY(3px)" }}>{w}</span>
                    ))}
                </span>
            </div>
        ),
    })

    // postcard with the quote
    items.push({
        id: "postcard", label: `Postcard: ${quote}`, x: 34, y: 72, r: -2, w: 184, kind: "box",
        node: (
            <div className="dbf-airmail">
                <div className="dbf-postcard dbf-grain">
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 7.5, letterSpacing: ".34em", textAlign: "center", color: "#6b5a44", marginBottom: 4 }}>POST CARD</div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <p style={{ margin: 0, flex: "1 1 0", fontFamily: HAND, fontWeight: 500, fontSize: 15, lineHeight: "16px", color: INK }}>{quote}</p>
                        <div style={{ width: 1, background: "rgba(107,90,68,.35)" }} />
                        <div style={{ width: 46, position: "relative" }}>
                            <svg width="24" height="28" viewBox="0 0 24 28" aria-hidden style={{ display: "block", marginLeft: "auto" }}>
                                <rect width="24" height="28" fill="#fbf7ee" />
                                <rect x="2.5" y="2.5" width="19" height="23" fill="#2f6f5e" />
                                <circle cx="12" cy="11" r="4.2" fill="#e9b949" />
                                <path d="M2.5 25.5 9 17l4 4.5 3.5-3.5 5 7.5Z" fill="#7a1f2b" />
                                {Array.from({ length: 7 }).map((_, i) => <g key={i}><circle cx={i * 4} cy="0" r="1.2" fill="#f6eedb" /><circle cx={i * 4} cy="28" r="1.2" fill="#f6eedb" /></g>)}
                                {Array.from({ length: 8 }).map((_, i) => <g key={i}><circle cx="0" cy={i * 4} r="1.2" fill="#f6eedb" /><circle cx="24" cy={i * 4} r="1.2" fill="#f6eedb" /></g>)}
                            </svg>
                            <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden style={{ position: "absolute", left: -6, top: 14 }}>
                                <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(50,50,90,.5)" strokeWidth=".9" />
                                <path d="M16 6q4.5-3 9 0t9 0M16 10q4.5-3 9 0t9 0M16 14q4.5-3 9 0t9 0" fill="none" stroke="rgba(50,50,90,.45)" strokeWidth=".8" />
                            </svg>
                            {[34, 42, 50].map((t) => <div key={t} style={{ position: "absolute", left: 0, right: 0, top: t, height: 1, background: "rgba(107,90,68,.3)" }} />)}
                        </div>
                    </div>
                </div>
            </div>
        ),
    })

    // photo-booth strip on the right edge
    const PH = ["linear-gradient(150deg,#c9a27a,#7a5a3e)", "linear-gradient(150deg,#b38a8a,#6a4a5a)", "linear-gradient(150deg,#8aa3b3,#4a5a6a)"]
    items.push({
        id: "strip", label: "Photo-booth strip", x: 262, y: 94, r: 3, w: 54, kind: "box",
        node: (
            <div className="dbf-grain" style={{ position: "relative", background: "#fbfaf6", padding: "5px 5px 0", display: "grid", gap: 4 }}>
                <Washi left={4} top={-7} w={44} r={-5} />
                {[photo1, photo2, photo3].map((p, i) => (
                    <div key={i} style={{ height: 46, overflow: "hidden", background: "#ddd" }}>
                        <Photo img={p} alt={[photo1Alt, photo2Alt, photo3Alt][i]} placeholder={PH[i]} />
                    </div>
                ))}
                <span style={{ fontFamily: HAND, fontWeight: 600, fontSize: 11.5, color: "#4a3f36", textAlign: "center", lineHeight: 1, padding: "3px 0 5px" }}>{stripEmpty && onCanvas ? "add photos" : stripCaption}</span>
            </div>
        ),
    })

    // receipt in a bulldog clip
    items.push({
        id: "receipt", label: `Receipt, the set so far: ${lines.join(", ")}`, x: 40, y: 208, r: -3, w: 86, kind: "box",
        node: (
            <div className="dbf-receipt dbf-grain">
                <span aria-hidden style={{ position: "absolute", left: "50%", top: -15, marginLeft: -17, zIndex: 3, filter: "drop-shadow(0 2px 1.5px rgba(0,0,0,.35))" }}><BulldogClip /></span>
                <div style={{ textAlign: "center", fontWeight: 600, fontSize: 8.5, letterSpacing: ".06em" }}>THE SET SO FAR</div>
                <div style={{ textAlign: "center", fontSize: 7, opacity: 0.7, marginTop: 2 }}>no. 0042 · open late</div>
                <div className="dbf-dash" />
                {lines.map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 3, fontSize: 8, lineHeight: 1.35 }}>
                        <span style={{ opacity: 0.6 }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{l}</span>
                    </div>
                ))}
                <div className="dbf-dash" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontWeight: 600 }}><span>TOTAL</span><span>worth it</span></div>
                <div aria-hidden style={{ height: 12, marginTop: 6, background: "repeating-linear-gradient(90deg, #333 0 1px, transparent 1px 2.5px, #333 2.5px 4.5px, transparent 4.5px 5.5px, #333 5.5px 6px, transparent 6px 8px)" }} />
                <span aria-hidden className="dbf-zig" />
            </div>
        ),
    })

    // torn lined note (extra)
    if (extras) items.push({
        id: "note", label: `Note to self: ${noteLine}`, x: 140, y: 186, r: 3, w: 90, kind: "box",
        node: (
            <div className="dbf-note dbf-grain">
                <div style={{ fontFamily: HAND, fontWeight: 600, fontSize: 14, lineHeight: "15px", color: INK }}>note to self —</div>
                <div style={{ fontFamily: HAND, fontWeight: 600, fontSize: 15, lineHeight: "15px", color: "#c62828", marginTop: 1 }}>{noteLine}</div>
                <span aria-hidden style={{ position: "absolute", right: 4, bottom: 3, transform: "rotate(12deg)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.25))" }}><Smiley /></span>
            </div>
        ),
    })

    // block-print tile
    if (extras && !compact) items.push({ id: "tile", label: "Block-print tile", x: 262, y: 292, r: 5, w: 58, kind: "box", node: <div className="dbf-grain" style={{ position: "relative" }}><BlockTile /></div> })

    // polaroids
    const polaroid = (img: Img, cap: string, alt: string, n: number, empty: boolean) => (
        <div className="dbf-grain" style={{ position: "relative", background: "#fdfcf8", padding: "5px 5px 0" }}>
            <Washi left={n === 1 ? 14 : 22} top={-6} w={34} r={n === 1 ? -6 : 5} kind={n === 1 ? "mint" : "lilac"} />
            <div style={{ height: 60, overflow: "hidden", background: empty ? "transparent" : "#eee", border: empty ? "1.5px dashed rgba(0,0,0,.22)" : "none", display: "grid", placeItems: "center" }}>
                {empty ? <span style={{ fontFamily: SANS, fontSize: 8.5, color: "rgba(0,0,0,.45)", textAlign: "center", padding: 4 }}>pin {n}: add an image</span> : <Photo img={img} alt={alt} placeholder="#eee" />}
            </div>
            <span style={{ display: "block", fontFamily: HAND, fontWeight: 600, fontSize: 13, lineHeight: 1, color: INK, textAlign: "center", padding: "4px 2px 6px", minHeight: 19, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{cap}</span>
        </div>
    )
    if (showPin1) items.push({ id: "pin1", label: pin1Alt || pin1Caption || "Pinned photo", x: 140, y: 208, r: -4, w: 70, kind: "box", node: polaroid(pin1, pin1Caption, pin1Alt, 1, !has1) })
    if (showPin2) items.push({ id: "pin2", label: pin2Alt || pin2Caption || "Pinned photo", x: 212, y: 276, r: 5, w: 70, kind: "box", node: polaroid(pin2, pin2Caption, pin2Alt, 2, !has2) })

    // place magnets
    let extra = 0
    placeList.forEach((name, i) => {
        const pal = PLACE_PALETTES[name.toLowerCase()] || EXTRA_PALETTES[extra++ % EXTRA_PALETTES.length]
        const [x, y, r] = placeAnchors[i]
        items.push({ id: `place${i}`, label: `${name} magnet`, x, y, r, kind: "free", node: <PlaceMagnet name={name} pal={pal} /> })
    })

    // little things
    items.push({ id: "chai", label: "Cutting chai glass magnet", x: 46, y: compact ? 346 : 356, r: -5, w: 28, kind: "free", node: <ChaiGlass uid={uid} /> })
    if (extras) {
        items.push({ id: "spark1", label: "Glitter star sticker", x: 210, y: 62, r: 12, w: 20, kind: "free", node: <GlitterStar uid={`${uid}a`} /> })
        if (!compact) {
            items.push({ id: "bangles", label: "Stack of bangles magnet", x: 84, y: 364, r: 6, w: 44, kind: "free", node: <Bangles /> })
            items.push({ id: "sprig", label: "Pressed flower sprig, taped", x: 288, y: 370, r: 8, w: 28, kind: "free", node: <FlowerSprig /> })
        }
    }

    // alphabet magnets
    const LW = 28
    const lx = Math.round((DESIGN_W - letters.length * LW) / 2)
    const ly = compact ? 362 : 394
    const jy = [0, 4, -2, 3, -1, 2, -3, 1, 4, -2]
    const jr = [-8, 6, -4, 9, -6, 5, -3, 7, -7, 4]
    letters.forEach((ch, i) => {
        items.push({ id: `letter${i}`, label: `Letter magnet ${ch}`, x: lx + i * LW, y: ly + jy[i], r: jr[i], kind: "free", node: <Letter ch={ch} i={i} /> })
    })

    /* ---------- interaction ---------- */

    const bounds = (el: HTMLElement, it: Item) => ({
        minX: PAD - it.x, maxX: DESIGN_W - PAD - it.x - el.offsetWidth,
        minY: PAD - it.y, maxY: H - PAD - it.y - el.offsetHeight,
    })

    const onDown = (e: React.PointerEvent<HTMLDivElement>, it: Item) => {
        if (!interactive || (e.pointerType === "mouse" && e.button !== 0)) return
        const el = e.currentTarget
        try { el.setPointerCapture(e.pointerId) } catch {}
        const cur = pos[it.id] || { x: 0, y: 0 }
        const z = ++zTop.current
        el.style.zIndex = String(z)
        drag.current = { id: it.id, el, sx: e.clientX, sy: e.clientY, ox: cur.x, oy: cur.y, x: cur.x, y: cur.y, ...bounds(el, it), r: cur.r ?? it.r, z, moved: false }
    }
    const onMove = (e: React.PointerEvent<HTMLDivElement>, it: Item) => {
        const d = drag.current
        if (!d || d.id !== it.id) return
        const s = scaleRef.current || 1
        const dx = (e.clientX - d.sx) / s
        const dy = (e.clientY - d.sy) / s
        if (!d.moved) {
            if (Math.hypot(dx, dy) < 3) return
            d.moved = true
            d.el.classList.add("is-lifted")
        }
        d.x = clamp(d.ox + dx, d.minX, d.maxX)
        d.y = clamp(d.oy + dy, d.minY, d.maxY)
        d.el.style.transform = tf(d.x, d.y, d.r * 0.3, 1.06)
    }
    const onUp = (e: React.PointerEvent<HTMLDivElement>, it: Item) => {
        const d = drag.current
        if (!d || d.id !== it.id) return
        drag.current = null
        try { d.el.releasePointerCapture(e.pointerId) } catch {}
        if (d.moved) {
            dragMoved.current = true
            d.el.classList.remove("is-lifted")
            const r = it.r + (Math.random() * 6 - 3)
            d.el.style.transform = tf(d.x, d.y, r, 1)
            if (!reduced) play(d.el.firstElementChild, it.kind === "free" ? "dbf-snap" : "dbf-drop")
            const { x, y, z } = d
            startTransition(() => setPos((p) => ({ ...p, [it.id]: { x, y, r, z } })))
        } else {
            const { z } = d
            startTransition(() => setPos((p) => ({ ...p, [it.id]: { ...(p[it.id] || { x: 0, y: 0 }), z } })))
        }
    }
    const onKey = (e: React.KeyboardEvent<HTMLDivElement>, it: Item) => {
        const k = e.key
        const dir = k === "ArrowLeft" ? [-1, 0] : k === "ArrowRight" ? [1, 0] : k === "ArrowUp" ? [0, -1] : k === "ArrowDown" ? [0, 1] : null
        if (!dir) return
        e.preventDefault()
        const b = bounds(e.currentTarget, it)
        const cur = pos[it.id] || { x: 0, y: 0 }
        const x = clamp(cur.x + dir[0] * NUDGE, b.minX, b.maxX)
        const y = clamp(cur.y + dir[1] * NUDGE, b.minY, b.maxY)
        startTransition(() => setPos((p) => ({ ...p, [it.id]: { ...cur, x, y } })))
    }
    const onDoorPointerUp = (e: React.PointerEvent<HTMLElement>) => {
        if (!interactive || e.pointerType === "mouse") return
        if (dragMoved.current) { dragMoved.current = false; return }
        const now = Date.now()
        const L = lastTap.current
        if (now - L.t < 320 && Math.hypot(e.clientX - L.x, e.clientY - L.y) < 30) {
            lastTap.current = { t: 0, x: 0, y: 0 }
            reset()
        } else lastTap.current = { t: now, x: e.clientX, y: e.clientY }
    }

    const LIGHT = `
        --st-base: #d3d7db; --st-sheen: .6; --st-line: .35; --st-line2: .04;
        --dbf-sh: var(--db-shadow, rgba(0,0,0,.12)); --dbf-sh2: rgba(0,0,0,.06);
        --dbf-handle: linear-gradient(90deg, #8f969d, #ffffff 42%, #c3c8cd 62%, #858c93);
        --dbf-hint: rgba(35,40,48,.6); --dbf-steam: rgba(90,90,100,.45); --dbf-dim: saturate(.85);
        --dbf-edge: rgba(255,255,255,.8);
    `
    const css = `
        .dbf-root {
            --st-base: #2b2f34; --st-sheen: .07; --st-line: .03; --st-line2: .12;
            --dbf-sh: var(--db-shadow, rgba(0,0,0,.25)); --dbf-sh2: rgba(0,0,0,.14);
            --dbf-handle: linear-gradient(90deg, #4f555b, #d9dee2 42%, #868d94 62%, #43484d);
            --dbf-hint: rgba(232,236,240,.6); --dbf-steam: rgba(255,255,255,.55); --dbf-dim: brightness(.95) saturate(.85);
            --dbf-edge: rgba(255,255,255,.12);
        }
        :root[data-db-theme="light"] .dbf-root, [data-db-theme="light"] .dbf-root { ${LIGHT} }
        @media (prefers-color-scheme: light) { :root:not([data-db-theme]) .dbf-root { ${LIGHT} } }
        .door-steel {
            background-color: var(--st-base);
            background-image:
                linear-gradient(100deg, rgba(255,255,255,0) 8%, rgba(255,255,255,var(--st-sheen)) 46%, rgba(255,255,255,0) 72%),
                ${BRUSH},
                repeating-linear-gradient(0deg, rgba(255,255,255,var(--st-line)) 0 1px, rgba(0,0,0,var(--st-line2)) 1px 2px, rgba(0,0,0,0) 2px 3px);
            box-shadow: inset 0 1px 0 var(--dbf-edge), inset 0 0 0 1px rgba(0,0,0,.18), inset 0 -16px 28px -18px rgba(0,0,0,.35), 0 26px 46px -26px rgba(0,0,0,.45), 0 2px 6px var(--dbf-sh2);
        }
        .dbf-panel { position:absolute; inset:0; border-radius: inherit; pointer-events:none; z-index:0;
            background: rgba(255,255,255,.04);
            background: color-mix(in srgb, var(--db-text, #ffffff) 4%, transparent);
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            border: 1px solid var(--db-line, rgba(255,255,255,.1));
            -webkit-mask-image: radial-gradient(ellipse closest-side at 50% 50%, #000 60%, rgba(0,0,0,0) 100%);
            mask-image: radial-gradient(ellipse closest-side at 50% 50%, #000 60%, rgba(0,0,0,0) 100%); }
        .door-glass .dbf-handle { left:12px; top:130px; width:4px; height:150px; border-radius:2px; box-shadow:none;
            background: rgba(255,255,255,.2); background: color-mix(in srgb, var(--db-text, #ffffff) 22%, transparent); }
        .door-glass .dbf-handle::before, .door-glass .dbf-handle::after { display:none; }
        .dbf-handle { position:absolute; left:10px; top:28px; width:9px; height:300px; border-radius:5px; background: var(--dbf-handle);
            box-shadow: 4px 6px 9px var(--dbf-sh), inset 0 0 0 .5px rgba(0,0,0,.25); z-index: 1; }
        .dbf-handle::before, .dbf-handle::after { content:""; position:absolute; left:-2px; width:13px; height:10px; border-radius:3px; background: var(--dbf-handle); box-shadow: 0 2px 3px var(--dbf-sh2); }
        .dbf-handle::before { top:-4px } .dbf-handle::after { bottom:-4px }
        .dbf-item { position:absolute; outline:none; -webkit-tap-highlight-color: transparent; transition: transform .55s cubic-bezier(.34,1.56,.64,1); }
        .is-resetting .dbf-item { transition-delay: calc(var(--i) * 30ms); }
        .dbf-item.is-lifted { transition: none; cursor: grabbing !important; }
        .dbf-item:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; border-radius: 4px; }
        .dbf-anim { transform-origin: 50% 0%; transition: transform .25s ease; }
        .dbf-skin-box { filter: var(--dbf-dim); box-shadow: 0 1px 1px var(--dbf-sh2), 0 9px 11px -8px var(--dbf-sh); transition: box-shadow .25s ease; }
        .dbf-skin-free { filter: var(--dbf-dim) drop-shadow(0 2.5px 2px var(--dbf-sh)); transition: filter .25s ease; }
        .is-lifted .dbf-skin-box { box-shadow: 0 2px 3px var(--dbf-sh2), 0 18px 22px -10px var(--dbf-sh); }
        .is-lifted .dbf-skin-free { filter: var(--dbf-dim) drop-shadow(0 10px 7px var(--dbf-sh)); }
        @media (hover: hover) and (pointer: fine) {
            .dbf-live .dbf-item:not(.is-lifted):hover > .dbf-anim { transform: translateY(-3px); animation: dbf-wiggle .7s ease-in-out; }
            .dbf-live .dbf-item:not(.is-lifted):hover .dbf-skin-box { box-shadow: 0 2px 3px var(--dbf-sh2), 0 13px 16px -9px var(--dbf-sh); }
        }
        @keyframes dbf-wiggle { 0% { transform: translateY(-3px) rotate(0) } 25% { transform: translateY(-3px) rotate(-3deg) } 50% { transform: translateY(-3px) rotate(2.5deg) } 75% { transform: translateY(-3px) rotate(-1.2deg) } 100% { transform: translateY(-3px) rotate(0) } }
        .dbf-item > .dbf-anim.dbf-drop { transform-origin: 50% 100%; animation: dbf-squash .5s cubic-bezier(.3,.7,.4,1) !important; }
        .dbf-item > .dbf-anim.dbf-snap { transform-origin: 50% 50%; animation: dbf-snap .38s ease-out !important; }
        .dbf-item > .dbf-anim.dbf-hop { transform-origin: 50% 100%; animation: dbf-hop .6s cubic-bezier(.3,.7,.4,1) both !important; animation-delay: calc(var(--i) * 30ms) !important; }
        @keyframes dbf-squash { 0% { transform: scale(1.07,.9) } 35% { transform: scale(.95,1.06) } 65% { transform: scale(1.02,.98) } 100% { transform: none } }
        @keyframes dbf-snap { 0% { transform: scale(1.14) } 6% { transform: scale(.9) } 35% { transform: scale(1.04) } 100% { transform: none } }
        @keyframes dbf-hop { 0% { transform: none } 30% { transform: translateY(-12px) scale(.97,1.04) } 58% { transform: translateY(0) scale(1.06,.93) } 80% { transform: scale(.98,1.02) } 100% { transform: none } }
        .dbf-grain { position: relative; }
        .dbf-grain::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius: inherit; opacity:.4; mix-blend-mode: multiply;
            background-image: linear-gradient(135deg, rgba(0,0,0,0) 78%, rgba(0,0,0,.07)), ${GRAIN}; }
        .dbf-washi { position:absolute; height:13px; z-index:3; opacity:.9;
            clip-path: polygon(3% 0, 97% 0, 100% 15%, 96% 30%, 100% 48%, 97% 66%, 100% 84%, 96% 100%, 3% 100%, 0 86%, 4% 70%, 0 52%, 3% 34%, 0 16%); }
        .dbf-washi.gingham { background-color:#e86a6a; background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 3px, rgba(255,255,255,0) 3px 6px), repeating-linear-gradient(90deg, rgba(255,255,255,.5) 0 3px, rgba(255,255,255,0) 3px 6px); }
        .dbf-washi.mint { background-color: rgba(160,220,195,.85); background-image: repeating-linear-gradient(-45deg, rgba(255,255,255,.45) 0 3px, rgba(255,255,255,0) 3px 7px); }
        .dbf-washi.lilac { background-color: rgba(200,185,235,.85); background-image: radial-gradient(circle, rgba(255,255,255,.85) 1px, rgba(255,255,255,0) 1.4px); background-size: 6px 6px; }
        .dbf-mustard { padding: 8px 14px 7px; background-color:#e6b23e; color:#6b1626; border-radius:2px;
            font-family: ${DISPLAY}; font-weight: 400; font-size: 21px; line-height: 1.1; font-synthesis: none;
            box-shadow: inset 0 0 0 2.5px #e6b23e, inset 0 0 0 3.5px #7a1f2b, inset 0 0 0 5px #e6b23e, inset 0 0 0 5.6px rgba(122,31,43,.6); }
        .dbf-goldmag { position:absolute; top:-6px; left:50%; margin-left:-7px; width:14px; height:14px; border-radius:50%; z-index:3;
            background: radial-gradient(circle at 34% 30%, #fff8d8 0 12%, #e9c45a 40%, #a67c1f); box-shadow: 0 2px 2px rgba(0,0,0,.35); }
        .dbf-airmail { padding: 4px; background: repeating-linear-gradient(-45deg, #c8102e 0 6px, #f6eedb 6px 10px, #1f4e9c 10px 16px, #f6eedb 16px 20px); }
        .dbf-postcard { background:#f6eedb; padding: 6px 8px 9px; }
        .dbf-receipt { background:#fdfdfa; color:#2e2e2e; font-family: ${MONO}; padding: 12px 7px 10px; }
        .dbf-dash { border-top: 1px dashed rgba(0,0,0,.35); margin: 5px 0; }
        .dbf-zig { position:absolute; left:0; right:0; bottom:-5px; height:6px;
            background: linear-gradient(-45deg, rgba(0,0,0,0) 4px, #fdfdfa 0), linear-gradient(45deg, rgba(0,0,0,0) 4px, #fdfdfa 0); background-size: 8px 8px; background-repeat: repeat-x; background-position: 0 -2px; }
        .dbf-note { background-color:#fffef6; padding: 14px 8px 10px 16px;
            background-image: linear-gradient(90deg, rgba(0,0,0,0) 11px, rgba(220,80,80,.5) 11px, rgba(220,80,80,.5) 12px, rgba(0,0,0,0) 12px), repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 14px, rgba(90,130,200,.3) 14px 15px);
            background-position: 0 0, 0 13px;
            clip-path: polygon(0 4%, 6% 0, 13% 5%, 21% 1%, 29% 6%, 37% 1%, 45% 5%, 53% 0, 61% 5%, 69% 1%, 77% 6%, 85% 1%, 93% 5%, 100% 1%, 100% 100%, 0 100%); }
        .dbf-enamel-rim { display:inline-block; padding:1.5px; border-radius: 9px; background: linear-gradient(160deg, #fff3c4, #c9a24a 45%, #8a6a24 80%, #e8cf85); }
        .dbf-enamel { position:relative; display:inline-flex; align-items:center; gap:4px; padding:4px 8px 4px 6px; border-radius: 7.5px;
            font: 600 8.5px/1 ${SANS}; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap;
            box-shadow: inset 0 1.5px 0 rgba(255,255,255,.45), inset 0 -1.5px 0 rgba(0,0,0,.18); }
        .dbf-enamel::after { content:""; position:absolute; left:2px; right:2px; top:1px; height:45%; border-radius: 6px; background: linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0)); pointer-events:none; }
        .dbf-gloss { position:absolute; inset:0; padding: 0 1px; color: transparent; text-shadow:none; pointer-events:none;
            background: linear-gradient(180deg, rgba(255,255,255,.75) 0 22%, rgba(255,255,255,0) 52%); -webkit-background-clip: text; background-clip: text; }
        .dbf-word { transition: opacity .6s ease, transform .6s ease; }
        .dbf-steam { stroke: var(--dbf-steam); }
        .dbf-reset { position:absolute; right:10px; bottom:10px; z-index:200; padding:6px 10px; border-radius:999px; border:0;
            background: #fbfaf6; color: #2b2a44; font: 500 11px ${SANS}; cursor:pointer; clip-path: inset(50%); opacity:0; }
        .dbf-reset:focus-visible { clip-path:none; opacity:1; outline: 2px solid var(--db-accent, #F3500F); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
            .dbf-root *, .dbf-root *::before, .dbf-root *::after { animation: none !important; transition: none !important; }
        }
    `

    const descId = `${uid}desc`

    return (
        <div ref={rootRef} className="dbf-root" style={{ position: "relative", width: "100%", height: "100%", minHeight: H * scale, overflow: "hidden", ...style }}>
            <style>{css}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Rozha+One&family=Baloo+Tamma+2:wght@800&family=Fredoka:wght@700&family=IBM+Plex+Mono:wght@400;600&display=swap" />
            <section
                ref={doorRef}
                role="region"
                aria-label="fridge door"
                aria-describedby={descId}
                className={`dbf-door door-${door} ${interactive ? "dbf-live" : "dbf-static"}`}
                onDoubleClick={interactive ? reset : undefined}
                onPointerUp={onDoorPointerUp}
                style={{ position: "absolute", left: "50%", top: "50%", width: DESIGN_W, height: H, marginLeft: -DESIGN_W / 2, marginTop: -H / 2, transform: `scale(${scale})`, transformOrigin: "50% 50%", borderRadius: 18, overflow: "hidden", userSelect: "none", WebkitUserSelect: "none", fontFamily: SANS, boxSizing: "border-box", isolation: "isolate" }}
            >
                <span id={descId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                    A fridge door scrapbook: a postcard, a receipt, a photo strip, a hello label, place magnets, a chai glass, a marigold garland and alphabet magnets spelling {letters.join("")}. Items can be moved with a mouse, touch, or the arrow keys. Double-click the door to put everything back.
                </span>
                {door === "glass" && <span aria-hidden className="dbf-panel" />}
                {door !== "none" && <span aria-hidden className="dbf-handle" />}
                {items.map((it, i) => {
                    const p = pos[it.id]
                    return (
                        <div
                            key={it.id}
                            ref={(n) => { itemEls.current[it.id] = n }}
                            className="dbf-item"
                            tabIndex={0}
                            role="group"
                            aria-roledescription="movable item"
                            aria-label={it.label}
                            onPointerDown={(e) => onDown(e, it)}
                            onPointerMove={(e) => onMove(e, it)}
                            onPointerUp={(e) => onUp(e, it)}
                            onPointerCancel={(e) => onUp(e, it)}
                            onKeyDown={(e) => onKey(e, it)}
                            style={{ ...({ "--i": i } as React.CSSProperties), left: it.x, top: it.y, width: it.w, transform: tf(p ? p.x : 0, p ? p.y : 0, p && p.r !== undefined ? p.r : it.r, 1), zIndex: p && p.z ? p.z : i + 2, touchAction: interactive ? "none" : "auto", cursor: interactive ? "grab" : "default" }}
                        >
                            <div className="dbf-anim">
                                <div className={it.kind === "box" ? "dbf-skin-box" : "dbf-skin-free"}>{it.node}</div>
                            </div>
                        </div>
                    )
                })}
                <Garland compact={compact} />
                {showHint && !compact && (
                    <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: HAND, fontWeight: 600, fontSize: 12.5, color: "var(--dbf-hint)", pointerEvents: "none" }}>
                        {hintText}
                    </span>
                )}
                {interactive && (
                    <button type="button" className="dbf-reset" onClick={reset}>Reset fridge</button>
                )}
            </section>
        </div>
    )
}

FridgeBoard.displayName = "Fridge Door"

addPropertyControls(FridgeBoard, {
    door: { type: ControlType.Enum, title: "Door", options: ["glass", "steel", "none"], optionTitles: ["Glass", "Steel", "None"], defaultValue: "glass", displaySegmentedControl: true },
    extras: { type: ControlType.Boolean, title: "Extra trinkets", defaultValue: false },
    hellos: { type: ControlType.String, title: "Hellos (comma list)", defaultValue: "hello, नमस्ते, ನಮಸ್ಕಾರ" },
    quote: { type: ControlType.String, title: "Postcard quote", displayTextArea: true, defaultValue: "the best work happens when people feel seen enough to speak up." },
    places: { type: ControlType.String, title: "Places (comma list)", defaultValue: "Ann Arbor, East Lansing, Bangalore" },
    receiptLines: { type: ControlType.String, title: "Receipt lines (comma list)", defaultValue: "matcha ×2, research, one more prototype, dj set @ 1am" },
    magnetWord: { type: ControlType.String, title: "Letter magnets", defaultValue: "hi!" },
    noteLine: { type: ControlType.String, title: "Note (red line)", defaultValue: "ask the 'dumb' question." },
    photo1: { type: ControlType.ResponsiveImage, title: "Strip photo 1" },
    photo1Alt: { type: ControlType.String, title: "Strip 1 alt", defaultValue: "Photo-booth frame 1" },
    photo2: { type: ControlType.ResponsiveImage, title: "Strip photo 2" },
    photo2Alt: { type: ControlType.String, title: "Strip 2 alt", defaultValue: "Photo-booth frame 2" },
    photo3: { type: ControlType.ResponsiveImage, title: "Strip photo 3" },
    photo3Alt: { type: ControlType.String, title: "Strip 3 alt", defaultValue: "Photo-booth frame 3" },
    stripCaption: { type: ControlType.String, title: "Strip caption", defaultValue: "photo booth" },
    pin1: { type: ControlType.ResponsiveImage, title: "Pin 1 image" },
    pin1Caption: { type: ControlType.String, title: "Pin 1 caption", defaultValue: "" },
    pin1Alt: { type: ControlType.String, title: "Pin 1 alt", defaultValue: "" },
    pin2: { type: ControlType.ResponsiveImage, title: "Pin 2 image" },
    pin2Caption: { type: ControlType.String, title: "Pin 2 caption", defaultValue: "" },
    pin2Alt: { type: ControlType.String, title: "Pin 2 alt", defaultValue: "" },
    showHint: { type: ControlType.Boolean, title: "Hint", defaultValue: true },
    hintText: { type: ControlType.String, title: "Hint text", defaultValue: "drag things around · double-tap to reset", hidden: (p: any) => !p.showHint },
    compact: { type: ControlType.Boolean, title: "Compact", defaultValue: false },
})
