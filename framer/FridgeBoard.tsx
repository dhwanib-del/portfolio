// FridgeBoard v2 (Oct 4) — a small, refined "fridge door" for one corner of the home hero.
// Brief: smaller + responsive (designed ~340x460, scales to fit its frame), a tasteful enamel /
// brushed-metal door with a subtle handle, and a cute pin-up feel: a taped photo-booth strip
// (3 uploadable photos), a quote card on a pushpin, souvenir place magnets (Ann Arbor maize+blue,
// East Lansing green+white, Bangalore marigold), up to 2 uploadable polaroids on magnets, crafted
// SVG trinkets (matcha, star, Loop-style earplug, Tic Tac) and a label-maker magnet that cycles
// "hello · नमस्ते · ನಮಸ್ಕಾರ" every ~2.2s with a soft crossfade.
// Everything is draggable (pointer events, lift + shadow, rotation settles on drop), arrow keys
// nudge 8px, double-click / double-tap the door resets. Theme-aware via --db-* CSS vars; the
// vibe accent (--db-accent) drives pins and magnets. Respects prefers-reduced-motion.
import * as React from "react"
import { useCallback, useEffect, useId, useMemo, useRef, useState, startTransition } from "react"
import { useInView } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget, useIsStaticRenderer } from "framer"

type Img = any

interface FridgeBoardProps {
    hellos: string
    quote: string
    places: string
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

const SERIF = "'Instrument Serif', Georgia, serif"
const HAND = "'Caveat', 'Segoe Print', cursive"
const SANS = "'Poppins', 'Inter', system-ui, sans-serif"
const MONO = "'IBM Plex Mono', 'Noto Sans Devanagari', 'Noto Sans Kannada', ui-monospace, monospace"

const DESIGN_W = 340
const PAD = 6
const NUDGE = 8

type Kind = "box" | "free"
type Item = { id: string; label: string; x: number; y: number; r: number; w?: number; kind: Kind; node: React.ReactNode }
type Pos = { x: number; y: number; r?: number; z?: number }

const tf = (x: number, y: number, r: number, s: number) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), Math.max(a, b))

/* ---------- small pieces ---------- */

function Tape({ r = -3, left = "50%", w = 40 }: { r?: number; left?: string; w?: number }) {
    return <span aria-hidden className="dbf-tape" style={{ left, width: w, marginLeft: -w / 2, transform: `rotate(${r}deg)` }} />
}
function Pushpin() {
    return <span aria-hidden className="dbf-pushpin" />
}
function RoundMagnet() {
    return <span aria-hidden className="dbf-magnet" />
}

function Photo({ img, alt, placeholder }: { img: Img; alt: string; placeholder: string }) {
    if (img && img.src) {
        return <img src={img.src} srcSet={img.srcSet} sizes="90px" alt={alt || img.alt || ""} draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    }
    return <span aria-hidden style={{ display: "block", width: "100%", height: "100%", background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.35), rgba(255,255,255,0) 45%), ${placeholder}` }} />
}

/* ---------- place magnets ---------- */

type Palette = { bg: string; fg: string; ring: string; radius: number; icon: "tree" | "leaf" | "flower" | "dot" }
const PLACE_PALETTES: Record<string, Palette> = {
    "ann arbor": { bg: "linear-gradient(180deg,#FFD43B,#F2BE00)", fg: "#00274C", ring: "rgba(0,39,76,.85)", radius: 5, icon: "tree" },
    "east lansing": { bg: "linear-gradient(180deg,#22594a,#173f35)", fg: "#ffffff", ring: "rgba(255,255,255,.8)", radius: 999, icon: "leaf" },
    bangalore: { bg: "linear-gradient(180deg,#F8B347,#EC8A22)", fg: "#5A1B0E", ring: "rgba(255,246,222,.9)", radius: 9, icon: "flower" },
}
PLACE_PALETTES["bengaluru"] = PLACE_PALETTES.bangalore
const EXTRA_PALETTES: Palette[] = [
    { bg: "linear-gradient(180deg,#d6cbf0,#bba9e6)", fg: "#2B2350", ring: "rgba(255,255,255,.8)", radius: 8, icon: "dot" },
    { bg: "linear-gradient(180deg,#b3e3d2,#8fd0b9)", fg: "#123A2E", ring: "rgba(255,255,255,.8)", radius: 999, icon: "dot" },
    { bg: "linear-gradient(180deg,#f9c6d4,#f2a6bb)", fg: "#4A1A2A", ring: "rgba(255,255,255,.85)", radius: 6, icon: "dot" },
    { bg: "linear-gradient(180deg,#bcdcf5,#93c3ea)", fg: "#10304d", ring: "rgba(255,255,255,.85)", radius: 999, icon: "dot" },
]

function MagnetIcon({ kind, color }: { kind: Palette["icon"]; color: string }) {
    const s = { width: 10, height: 10, flex: "none" as const }
    if (kind === "tree") return <svg viewBox="0 0 10 10" style={s} aria-hidden><path d="M5 .8 8.6 6H6.1v3H3.9V6H1.4Z" fill={color} /></svg>
    if (kind === "leaf") return <svg viewBox="0 0 10 10" style={s} aria-hidden><path d="M1.6 8.6C1.4 3.6 4.6 1.4 9 1.2c.1 4.6-2.6 7.6-7.4 7.4Z" fill={color} /><path d="M1.8 8.4 6.4 3.8" stroke="rgba(0,0,0,.35)" strokeWidth=".8" /></svg>
    if (kind === "flower")
        return (
            <svg viewBox="0 0 10 10" style={s} aria-hidden>
                {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={5 + 2.6 * Math.cos((a * Math.PI) / 180)} cy={5 + 2.6 * Math.sin((a * Math.PI) / 180)} r="1.9" fill="#fff3d6" />)}
                <circle cx="5" cy="5" r="1.7" fill={color} />
            </svg>
        )
    return <svg viewBox="0 0 10 10" style={s} aria-hidden><circle cx="5" cy="5" r="2.6" fill={color} /></svg>
}

function PlaceMagnet({ name, pal }: { name: string; pal: Palette }) {
    return (
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px 6px 8px", borderRadius: pal.radius, background: pal.bg, color: pal.fg, fontFamily: SANS, fontWeight: 600, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), inset 0 -1.5px 0 rgba(0,0,0,.18), 0 1.5px 0 rgba(0,0,0,.22)" }}>
            <span aria-hidden style={{ position: "absolute", inset: 2.5, borderRadius: pal.radius, border: `1px solid ${pal.ring}`, pointerEvents: "none" }} />
            <span aria-hidden style={{ position: "absolute", left: 2, right: 2, top: 1, height: "48%", borderRadius: pal.radius, background: "linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,0))", pointerEvents: "none" }} />
            <MagnetIcon kind={pal.icon} color={pal.fg} />
            <span style={{ position: "relative" }}>{name}</span>
        </span>
    )
}

/* ---------- trinkets ---------- */

function Matcha({ uid }: { uid: string }) {
    return (
        <svg width="52" height="56" viewBox="0 0 52 56" aria-hidden style={{ display: "block" }}>
            <defs>
                <linearGradient id={`${uid}cup`} x1="0" x2="1">
                    <stop offset="0" stopColor="#e6dccb" />
                    <stop offset=".35" stopColor="#fbf8f1" />
                    <stop offset="1" stopColor="#d8ccb8" />
                </linearGradient>
                <radialGradient id={`${uid}tea`} cx=".4" cy=".35" r=".8">
                    <stop offset="0" stopColor="#c3dd96" />
                    <stop offset="1" stopColor="#6f9c46" />
                </radialGradient>
            </defs>
            <path d="M41 22c7.5 0 8.5 9.5 1 12.5" fill="none" stroke="#e2d8c6" strokeWidth="4" strokeLinecap="round" />
            <path d="M41 22c7.5 0 8.5 9.5 1 12.5" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M6.5 15h35l-3.4 32.4c-.3 3-2.5 5.1-5.5 5.1H15.4c-3 0-5.2-2.1-5.5-5.1Z" fill={`url(#${uid}cup)`} />
            <path d="M9.6 40h28.8l-.7 7.3c-.3 3-2.5 5.2-5.5 5.2H15.8c-3 0-5.2-2.2-5.5-5.2Z" fill="#8db866" opacity=".9" />
            <path d="M9.6 40h28.8" stroke="rgba(255,255,255,.55)" strokeWidth=".8" />
            <path d="M24 25.5c3.2 2.6 3.2 6.6 0 9.2-3.2-2.6-3.2-6.6 0-9.2Z" fill="#7aa652" />
            <path d="M24 26.5v7.4" stroke="#5b8a3a" strokeWidth=".7" />
            <ellipse cx="24" cy="15" rx="17.5" ry="4.2" fill="#f1eadc" stroke="rgba(0,0,0,.1)" strokeWidth=".6" />
            <ellipse cx="24" cy="15.4" rx="15" ry="3" fill={`url(#${uid}tea)`} />
            <path d="M17 15.2c2.6-1.6 5.6.9 8.4-.4 1.6-.7 3.2-.6 4.6.3" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth=".9" strokeLinecap="round" />
            <path d="M10.5 19.5 12.6 42" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    )
}

function Star({ uid }: { uid: string }) {
    return (
        <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden style={{ display: "block", overflow: "visible" }}>
            <defs>
                <linearGradient id={`${uid}star`} x1="0" y1="0" x2=".7" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity=".55" />
                    <stop offset=".55" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity=".12" />
                </linearGradient>
            </defs>
            <path d="M16 3.2 19.7 11.3 28.5 12.3 21.9 18.2 23.8 26.9 16 22.4 8.2 26.9 10.1 18.2 3.5 12.3 12.3 11.3Z" style={{ fill: "var(--db-accent, #F3500F)", stroke: "var(--db-accent, #F3500F)" }} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M16 3.2 19.7 11.3 28.5 12.3 21.9 18.2 23.8 26.9 16 22.4 8.2 26.9 10.1 18.2 3.5 12.3 12.3 11.3Z" fill={`url(#${uid}star)`} stroke={`url(#${uid}star)`} strokeWidth="2.6" strokeLinejoin="round" />
            <circle cx="12.6" cy="13.4" r="1.3" fill="#fff" opacity=".85" />
        </svg>
    )
}

function Earplug() {
    return (
        <svg width="66" height="32" viewBox="0 0 66 32" aria-hidden style={{ display: "block" }}>
            <circle cx="15" cy="16" r="10.5" fill="none" style={{ stroke: "var(--db-accent, #F3500F)" }} strokeWidth="6.5" />
            <circle cx="15" cy="16" r="10.5" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="6.5" strokeDasharray="0 33 33 0" />
            <path d="M8.2 10.4a9 9 0 0 1 9.6-3.5" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="24.5" y="12.4" width="11" height="7.2" rx="2.2" style={{ fill: "var(--db-accent, #F3500F)" }} />
            <rect x="24.5" y="12.4" width="11" height="7.2" rx="2.2" fill="rgba(0,0,0,.18)" />
            <ellipse cx="39" cy="16" rx="3.6" ry="9" fill="#d5dade" stroke="rgba(0,0,0,.12)" strokeWidth=".6" />
            <ellipse cx="45.5" cy="16" rx="4.6" ry="7.6" fill="#e3e7ea" stroke="rgba(0,0,0,.12)" strokeWidth=".6" />
            <path d="M48 9.6c7.2 0 12 2.9 12 6.4s-4.8 6.4-12 6.4Z" fill="#eff2f4" stroke="rgba(0,0,0,.12)" strokeWidth=".6" />
            <path d="M50 11.6c4 .3 6.6 1.6 7.4 3" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M38 9.4v4" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".8" />
        </svg>
    )
}

function TicTac() {
    const mints = [[8, 18], [16, 20], [8.5, 27], [15.5, 29], [8, 36], [16, 38], [11.5, 43.5]]
    return (
        <svg width="24" height="50" viewBox="0 0 24 50" aria-hidden style={{ display: "block" }}>
            <rect x="2" y="8" width="20" height="40" rx="5" fill="rgba(240,248,244,.55)" stroke="rgba(0,0,0,.2)" strokeWidth=".8" />
            {mints.map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx="3.6" ry="2.4" fill="#fbfefc" stroke="rgba(0,0,0,.14)" strokeWidth=".5" transform={`rotate(${i % 2 ? 14 : -10} ${cx} ${cy})`} />)}
            <rect x="4.2" y="11" width="2" height="33" rx="1" fill="#fff" opacity=".75" />
            <rect x="1" y="1.5" width="22" height="9.5" rx="3" fill="#2fb46b" />
            <rect x="2.2" y="2.4" width="19.6" height="3" rx="1.5" fill="#fff" opacity=".35" />
            <rect x="1" y="9" width="22" height="2" fill="rgba(0,0,0,.15)" />
        </svg>
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
        hellos = "hello, नमस्ते, ನಮಸ್ಕಾರ",
        quote = "the best work happens when people feel seen enough to speak up.",
        places = "Ann Arbor, East Lansing, Bangalore",
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
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
    const H = compact ? 420 : 460

    const rootRef = useRef<HTMLDivElement>(null)
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
    const words = useMemo(() => hellos.split(",").map((s) => s.trim()).filter(Boolean), [hellos])
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

    const reset = useCallback(() => startTransition(() => setPos({})), [])

    // content
    const placeList = useMemo(() => places.split(",").map((s) => s.trim()).filter(Boolean).slice(0, compact ? 3 : 5), [places, compact])
    const has1 = !!(pin1 && pin1.src)
    const has2 = !compact && !!(pin2 && pin2.src)
    const showPin1 = has1 || onCanvas
    const showPin2 = has2 || (onCanvas && !compact)
    const hasPins = showPin1 || showPin2
    const stripEmpty = !(photo1 && photo1.src) && !(photo2 && photo2.src) && !(photo3 && photo3.src)

    const placeAnchors = hasPins
        ? [[28, 258, -4], [118, 290, 3], [214, 292, -3], [150, 326, 4], [232, 332, -3]]
        : [[146, 184, -4], [204, 226, 5], [134, 258, -2], [28, 258, 3], [218, 280, -4]]

    const items: Item[] = []

    items.push({
        id: "hello", label: `Hello magnet: ${words.join(", ")}`, x: 140, y: 18, r: -2, kind: "free",
        node: (
            <span className="dbf-hello" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px 5px 6px", borderRadius: 4, background: "var(--db-accent, #F3500F)", color: "#fff", fontFamily: MONO, fontWeight: 500, fontSize: 12, letterSpacing: ".05em", lineHeight: 1.2, boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), inset 0 -1.5px 0 rgba(0,0,0,.2), 0 1.5px 0 rgba(0,0,0,.2)" }}>
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", flex: "none", background: "radial-gradient(circle at 35% 30%, #fff, #c9ced3 55%, #8a9097)", boxShadow: "0 1px 1px rgba(0,0,0,.35)" }} />
                <span aria-hidden style={{ display: "grid", textShadow: "0 1px 0 rgba(0,0,0,.22)" }}>
                    {words.map((w, i) => (
                        <span key={i} className="dbf-word" style={{ gridArea: "1 / 1", whiteSpace: "nowrap", opacity: i === activeWord ? 1 : 0 }}>{w}</span>
                    ))}
                </span>
                <span aria-hidden style={{ position: "absolute", left: 1, right: 1, top: 1, height: "45%", borderRadius: 3, background: "linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,0))", pointerEvents: "none" }} />
            </span>
        ),
    })

    const PH = ["linear-gradient(150deg,#ecc9a3,#b9875f)", "linear-gradient(150deg,#dcb3bd,#9a6f88)", "linear-gradient(150deg,#bccfdc,#6f8ba3)"]
    items.push({
        id: "strip", label: "Photo-booth strip", x: 30, y: 36, r: -5, w: 80, kind: "box",
        node: (
            <div style={{ position: "relative", background: "#f7f4ee", padding: "6px 6px 0", display: "grid", gap: 5 }}>
                <Tape r={-4} w={42} />
                {[photo1, photo2, photo3].map((p, i) => (
                    <div key={i} style={{ height: 54, overflow: "hidden", background: "#ddd" }}>
                        <Photo img={p} alt={[photo1Alt, photo2Alt, photo3Alt][i]} placeholder={PH[i]} />
                    </div>
                ))}
                <span style={{ fontFamily: HAND, fontSize: 14, color: "#3a332a", textAlign: "center", lineHeight: 1, padding: "3px 0 6px" }}>{stripEmpty && onCanvas ? "add photos ↑" : stripCaption}</span>
            </div>
        ),
    })

    items.push({
        id: "quote", label: `Quote card: ${quote}`, x: 128, y: 58, r: 3, w: 172, kind: "box",
        node: (
            <div style={{ position: "relative", background: "#fffaf0", padding: "16px 14px 13px", borderRadius: 2, backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 92%, rgba(0,0,0,.04))" }}>
                <Pushpin />
                <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.2, color: "#2a2620" }}>“{quote}”</p>
            </div>
        ),
    })

    const polaroid = (img: Img, cap: string, alt: string, n: number, empty: boolean) => (
        <div style={{ position: "relative", background: "#fff", padding: "5px 5px 0" }}>
            <RoundMagnet />
            <div style={{ height: 66, overflow: "hidden", background: empty ? "transparent" : "#eee", border: empty ? "1.5px dashed rgba(0,0,0,.25)" : "none", display: "grid", placeItems: "center" }}>
                {empty ? <span style={{ fontFamily: SANS, fontSize: 9, color: "rgba(0,0,0,.45)", textAlign: "center", padding: 4 }}>pin {n}: add an image</span> : <Photo img={img} alt={alt} placeholder="#ddd" />}
            </div>
            <span style={{ display: "block", fontFamily: HAND, fontSize: 13, lineHeight: 1, color: "#2b2b2b", textAlign: "center", padding: "4px 2px 6px", minHeight: 19, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{cap}</span>
        </div>
    )
    if (showPin1) items.push({ id: "pin1", label: pin1Alt || pin1Caption || "Pinned photo", x: 136, y: 180, r: -4, w: 78, kind: "box", node: polaroid(pin1, pin1Caption, pin1Alt, 1, !has1) })
    if (showPin2) items.push({ id: "pin2", label: pin2Alt || pin2Caption || "Pinned photo", x: 228, y: 188, r: 5, w: 78, kind: "box", node: polaroid(pin2, pin2Caption, pin2Alt, 2, !has2) })

    let extra = 0
    placeList.forEach((name, i) => {
        const pal = PLACE_PALETTES[name.toLowerCase()] || EXTRA_PALETTES[extra++ % EXTRA_PALETTES.length]
        const [x, y, r] = placeAnchors[i]
        items.push({ id: `place${i}`, label: `${name} magnet`, x, y, r, kind: "free", node: <PlaceMagnet name={name} pal={pal} /> })
    })

    items.push({ id: "matcha", label: "Matcha cup magnet", x: 32, y: compact ? 336 : 352, r: -6, w: 52, kind: "free", node: <Matcha uid={uid} /> })
    items.push({ id: "star", label: "Star magnet", x: 96, y: compact ? 352 : 370, r: 12, w: 30, kind: "free", node: <Star uid={uid} /> })
    if (!compact) {
        items.push({ id: "earplug", label: "Loop-style earplug", x: 140, y: 378, r: -8, w: 66, kind: "free", node: <Earplug /> })
        items.push({ id: "tictac", label: "Tic Tac box", x: 240, y: 360, r: 18, w: 24, kind: "free", node: <TicTac /> })
    }

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
    const onDoorPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive || e.pointerType === "mouse") return
        if (dragMoved.current) { dragMoved.current = false; return }
        const now = Date.now()
        const L = lastTap.current
        if (now - L.t < 320 && Math.hypot(e.clientX - L.x, e.clientY - L.y) < 30) {
            lastTap.current = { t: 0, x: 0, y: 0 }
            reset()
        } else lastTap.current = { t: now, x: e.clientX, y: e.clientY }
    }

    const css = `
        .dbf-door {
            background-color: #3b3e42;
            background-color: color-mix(in srgb, var(--db-surface-2, #26282b) 72%, #a3a9b0 28%);
            background-image:
                linear-gradient(100deg, rgba(0,0,0,.2) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,.09) 50%, rgba(255,255,255,0) 68%, rgba(0,0,0,.16) 100%),
                repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0 1px, rgba(0,0,0,.02) 1px 2px, transparent 2px 4px);
            border: 1px solid var(--db-line, rgba(255,255,255,.12));
            box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -18px 30px -18px rgba(0,0,0,.35), 0 28px 50px -28px rgba(0,0,0,.6), 0 2px 6px rgba(0,0,0,.16);
        }
        :root[data-db-theme="light"] .dbf-door {
            box-shadow: inset 0 1px 0 rgba(255,255,255,.75), inset 0 -18px 30px -18px rgba(0,0,0,.1), 0 24px 44px -26px rgba(40,30,20,.32), 0 1px 3px rgba(0,0,0,.08);
        }
        .dbf-handle { position:absolute; left:10px; top:66px; width:7px; height:150px; border-radius:5px;
            background: linear-gradient(90deg, #7f858b, #e6e9ec 45%, #a0a6ac 80%, #80868c);
            box-shadow: 1px 3px 6px rgba(0,0,0,.3), inset 0 0 0 .5px rgba(0,0,0,.2); }
        .dbf-handle::before, .dbf-handle::after { content:""; position:absolute; left:-2px; width:11px; height:7px; border-radius:3px;
            background: linear-gradient(90deg, #8b9197, #d7dbdf, #8b9197); box-shadow: 0 1px 2px rgba(0,0,0,.25); }
        .dbf-handle::before { top:6px } .dbf-handle::after { bottom:6px }
        .dbf-item { position:absolute; transform-origin:50% 40%; outline:none; -webkit-tap-highlight-color: transparent;
            transition: transform .5s cubic-bezier(.34,1.56,.64,1); }
        .dbf-item.is-lifted { transition: none; cursor: grabbing !important; }
        .dbf-item:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; border-radius: 4px; }
        .dbf-skin-box { box-shadow: 0 1px 1px rgba(0,0,0,.12), 0 6px 12px -5px rgba(0,0,0,.45); transition: box-shadow .25s ease; }
        .is-lifted .dbf-skin-box { box-shadow: 0 2px 3px rgba(0,0,0,.12), 0 18px 26px -10px rgba(0,0,0,.5); }
        .dbf-skin-free { filter: drop-shadow(0 3px 3px rgba(0,0,0,.32)); transition: filter .25s ease; }
        .is-lifted .dbf-skin-free { filter: drop-shadow(0 11px 9px rgba(0,0,0,.32)); }
        .dbf-tape { position:absolute; top:-8px; height:15px; z-index:2; opacity:.9;
            background: rgba(245,236,214,.85);
            background: color-mix(in srgb, var(--db-accent, #F3500F) 28%, rgba(248,242,228,.9));
            clip-path: polygon(0 8%, 6% 0, 12% 10%, 18% 0, 82% 0, 88% 8%, 94% 0, 100% 10%, 100% 92%, 94% 100%, 88% 90%, 82% 100%, 18% 100%, 12% 92%, 6% 100%, 0 90%);
            box-shadow: 0 1px 2px rgba(0,0,0,.12); }
        .dbf-pushpin { position:absolute; top:-6px; left:50%; margin-left:-7px; width:14px; height:14px; border-radius:50%; z-index:2;
            background: radial-gradient(circle at 34% 30%, rgba(255,255,255,.9) 0 9%, rgba(255,255,255,0) 40%), var(--db-accent, #F3500F);
            box-shadow: inset 0 -2px 3px rgba(0,0,0,.28), 1.5px 3px 3px rgba(0,0,0,.35); }
        .dbf-magnet { position:absolute; top:-7px; left:50%; margin-left:-8px; width:16px; height:16px; border-radius:50%; z-index:2;
            background: linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,0) 55%), var(--db-accent, #F3500F);
            box-shadow: inset 0 -2px 0 rgba(0,0,0,.2), 0 2px 3px rgba(0,0,0,.35); }
        .dbf-word { transition: opacity .6s ease; }
        .dbf-reset { position:absolute; right:10px; bottom:10px; z-index:200; padding:6px 10px; border-radius:999px; border:1px solid var(--db-line, rgba(255,255,255,.2));
            background: var(--db-surface, #141414); color: var(--db-text, #fff); font: 500 11px ${SANS}; cursor:pointer;
            clip-path: inset(50%); opacity:0; }
        .dbf-reset:focus-visible { clip-path:none; opacity:1; outline: 2px solid var(--db-accent, #F3500F); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
            .dbf-item, .dbf-word, .dbf-skin-box, .dbf-skin-free { transition: none !important; }
        }
    `

    const descId = `${uid}desc`

    return (
        <div ref={rootRef} style={{ position: "relative", width: "100%", height: "100%", minHeight: H * scale, overflow: "hidden", ...style }}>
            <style>{css}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Instrument+Serif&family=IBM+Plex+Mono:wght@500&family=Noto+Sans+Devanagari:wght@500&family=Noto+Sans+Kannada:wght@500&display=swap" />
            <section
                role="region"
                aria-label="fridge door"
                aria-describedby={descId}
                className="dbf-door"
                onDoubleClick={interactive ? reset : undefined}
                onPointerUp={onDoorPointerUp}
                style={{ position: "absolute", left: "50%", top: "50%", width: DESIGN_W, height: H, marginLeft: -DESIGN_W / 2, marginTop: -H / 2, transform: `scale(${scale})`, transformOrigin: "50% 50%", borderRadius: "22px 22px 14px 14px", overflow: "hidden", userSelect: "none", WebkitUserSelect: "none", fontFamily: SANS, boxSizing: "border-box" }}
            >
                <span id={descId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                    A fridge door with a photo strip, a quote, place magnets and little trinkets. Items can be moved with a mouse, touch, or the arrow keys. Double-click the door to put everything back.
                </span>
                <span aria-hidden className="dbf-handle" />
                {items.map((it, i) => {
                    const p = pos[it.id]
                    return (
                        <div
                            key={it.id}
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
                            style={{ left: it.x, top: it.y, width: it.w, transform: tf(p ? p.x : 0, p ? p.y : 0, p && p.r !== undefined ? p.r : it.r, 1), zIndex: p && p.z ? p.z : i + 1, touchAction: interactive ? "none" : "auto", cursor: interactive ? "grab" : "default" }}
                        >
                            <div className={it.kind === "box" ? "dbf-skin-box" : "dbf-skin-free"}>{it.node}</div>
                        </div>
                    )
                })}
                {showHint && !compact && (
                    <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: HAND, fontSize: 15, color: "var(--db-text-2, rgba(255,255,255,.7))", opacity: 0.75, pointerEvents: "none" }}>
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
    hellos: { type: ControlType.String, title: "Hellos (comma list)", defaultValue: "hello, नमस्ते, ನಮಸ್ಕಾರ" },
    quote: { type: ControlType.String, title: "Quote", displayTextArea: true, defaultValue: "the best work happens when people feel seen enough to speak up." },
    places: { type: ControlType.String, title: "Places (comma list)", defaultValue: "Ann Arbor, East Lansing, Bangalore" },
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
