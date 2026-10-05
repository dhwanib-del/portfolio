// FridgeBoard v3 (Oct 4) — a small, very cute "fridge door" for one corner of the home hero.
// Brief: "make it a lot cuter" but crafted, never gaudy or clip-art. A soft retro pastel fridge
// door (rounded Smeg-like enamel; colour = vibe accent mixed with lots of cream in light mode, a
// cozy deeper tone in dark mode), chunky rounded handle, tiny shine, rubber-seal edge.
// Items, all inline SVG/CSS: puffy magnets with dot eyes + blush (smiling matcha with steam, star
// with a face, sleepy cloud, heart), souvenir place badges (Ann Arbor pennant, East Lansing leaf,
// Bangalore marigold), a photo-booth strip under washi tape with a heart pin, a lined index card
// quote with a heart pin (Caveat), up to 2 uploadable polaroids, a Loop-style earplug, a Tic Tac,
// a speech-bubble magnet that cycles "hello · नमस्ते · ನಮಸ್ಕಾರ" every ~2.2s, and soft twinkles.
// Micro-interactions: hover wiggle (±3deg) + lift, squash-and-bounce on drop, magnets snap-pop,
// double-click / double-tap reset hops everything home with a stagger. Arrow keys nudge 8px.
// prefers-reduced-motion = no motion. Designed ~340x460, scales to fit its frame.
import * as React from "react"
import { useCallback, useEffect, useId, useMemo, useRef, useState, startTransition } from "react"
import { useInView, useReducedMotion } from "framer-motion"
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

const HAND = "'Caveat', 'Noto Sans Devanagari', 'Noto Sans Kannada', 'Segoe Print', cursive"
const SANS = "'Poppins', 'Inter', system-ui, sans-serif"
const INK = "#3d2c2e"
const HEART = "M14 24C6 18.5 2 14.3 2 9.2 2 5.3 5 2.5 8.6 2.5c2.3 0 4.2 1.2 5.4 3 1.2-1.8 3.1-3 5.4-3C23 2.5 26 5.3 26 9.2c0 5.1-4 9.3-12 14.8Z"

const DESIGN_W = 340
const PAD = 6
const NUDGE = 8

type Kind = "box" | "free"
type Item = { id: string; label: string; x: number; y: number; r: number; w?: number; kind: Kind; node: React.ReactNode }
type Pos = { x: number; y: number; r?: number; z?: number }

const tf = (x: number, y: number, r: number, s: number) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), Math.max(a, b))

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

/* ---------- little crafted bits ---------- */

function Face({ cx, cy, gap = 8, sleepy = false }: { cx: number; cy: number; gap?: number; sleepy?: boolean }) {
    const l = cx - gap / 2
    const r = cx + gap / 2
    return (
        <g>
            {sleepy ? (
                <>
                    <path d={`M${l - 1.5} ${cy}q1.5 1.3 3 0`} stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
                    <path d={`M${r - 1.5} ${cy}q1.5 1.3 3 0`} stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <circle cx={l} cy={cy} r="1.3" fill={INK} />
                    <circle cx={r} cy={cy} r="1.3" fill={INK} />
                    <circle cx={l + 0.45} cy={cy - 0.45} r=".42" fill="#fff" />
                    <circle cx={r + 0.45} cy={cy - 0.45} r=".42" fill="#fff" />
                </>
            )}
            <path d={`M${cx - 1.6} ${cy + 2.3}q1.6 1.5 3.2 0`} stroke={INK} strokeWidth="1" fill="none" strokeLinecap="round" />
            <ellipse cx={l - 2.4} cy={cy + 2.6} rx="2.1" ry="1.2" fill="#ff8fa6" opacity=".55" />
            <ellipse cx={r + 2.4} cy={cy + 2.6} rx="2.1" ry="1.2" fill="#ff8fa6" opacity=".55" />
        </g>
    )
}

function HeartPin({ left = "50%", top = -7 }: { left?: string; top?: number }) {
    return (
        <span aria-hidden className="dbf-heartpin" style={{ left, top }}>
            <svg width="15" height="14" viewBox="0 0 28 26" style={{ display: "block", overflow: "visible" }}>
                <path d={HEART} style={{ fill: "color-mix(in srgb, var(--db-accent, #F3500F) 72%, #ffffff)" }} />
                <path d={HEART} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1.2" />
                <ellipse cx="8.8" cy="8.4" rx="3.2" ry="2" fill="#fff" opacity=".75" transform="rotate(-32 8.8 8.4)" />
            </svg>
        </span>
    )
}

function Washi({ left, top = -7, w = 44, r = -4, dots = false }: { left: string | number; top?: number; w?: number; r?: number; dots?: boolean }) {
    return <span aria-hidden className={dots ? "dbf-washi dots" : "dbf-washi"} style={{ left, top, width: w, transform: `rotate(${r}deg)` }} />
}

function PuffMagnet({ color }: { color: string }) {
    return <span aria-hidden className="dbf-puff" style={{ background: `radial-gradient(circle at 34% 30%, #fff 0 12%, rgba(255,255,255,0) 46%), ${color}` }} />
}

function Photo({ img, alt, placeholder }: { img: Img; alt: string; placeholder: string }) {
    if (img && img.src) {
        return <img src={img.src} srcSet={img.srcSet} sizes="90px" alt={alt || img.alt || ""} draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    }
    return <span aria-hidden style={{ display: "block", width: "100%", height: "100%", background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.45), rgba(255,255,255,0) 50%), ${placeholder}` }} />
}

/* ---------- souvenir place badges ---------- */

type Palette = { bg: string; fg: string; stitch: string; icon: "pennant" | "leaf" | "flower" | "heart" }
const PLACE_PALETTES: Record<string, Palette> = {
    "ann arbor": { bg: "#FFE27D", fg: "#1F3A66", stitch: "rgba(31,58,102,.4)", icon: "pennant" },
    "east lansing": { bg: "#5E9A80", fg: "#FFFBF2", stitch: "rgba(255,251,242,.6)", icon: "leaf" },
    bangalore: { bg: "#FFBE6A", fg: "#6A2B12", stitch: "rgba(106,43,18,.32)", icon: "flower" },
}
PLACE_PALETTES["bengaluru"] = PLACE_PALETTES.bangalore
const EXTRA_PALETTES: Palette[] = [
    { bg: "#DCD0F7", fg: "#3B2F66", stitch: "rgba(59,47,102,.32)", icon: "heart" },
    { bg: "#C5EBD9", fg: "#1E4F3C", stitch: "rgba(30,79,60,.3)", icon: "heart" },
    { bg: "#FFD0DC", fg: "#6A2338", stitch: "rgba(106,35,56,.3)", icon: "heart" },
    { bg: "#CFE5FA", fg: "#1D3F63", stitch: "rgba(29,63,99,.3)", icon: "heart" },
]

function BadgeIcon({ kind, fg, bg }: { kind: Palette["icon"]; fg: string; bg: string }) {
    const s = { width: 11, height: 11, flex: "none" as const, display: "block" }
    if (kind === "pennant")
        return (
            <svg viewBox="0 0 12 12" style={s} aria-hidden>
                <path d="M2 1v10.5" stroke={fg} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M2.4 1.6 11 4.6 2.4 7.6Z" fill={fg} strokeLinejoin="round" />
                <path d="M2.4 4 7 4.6 2.4 5.2Z" fill={bg} />
            </svg>
        )
    if (kind === "leaf")
        return (
            <svg viewBox="0 0 12 12" style={s} aria-hidden>
                <path d="M1.8 10.4C1.4 4.6 5 1.8 10.4 1.6c.2 5.4-3 8.9-8.6 8.8Z" fill="#cdeccc" />
                <path d="M2.2 10 7.4 4.8" stroke="#3f7a60" strokeWidth=".9" strokeLinecap="round" />
            </svg>
        )
    if (kind === "flower")
        return (
            <svg viewBox="0 0 12 12" style={s} aria-hidden>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <ellipse key={a} cx="6" cy="2.9" rx="1.5" ry="2.4" fill="#ff8c2b" transform={`rotate(${a} 6 6)`} />)}
                <circle cx="6" cy="6" r="2" fill="#ffe08a" />
            </svg>
        )
    return <svg viewBox="0 0 28 26" style={{ ...s, width: 10, height: 9 }} aria-hidden><path d={HEART} fill={fg} opacity=".75" /></svg>
}

function PlaceBadge({ name, pal }: { name: string; pal: Palette }) {
    return (
        <span className="dbf-badge" style={{ background: pal.bg, color: pal.fg }}>
            <span aria-hidden style={{ position: "absolute", inset: 2.5, borderRadius: 8, border: `1px dashed ${pal.stitch}`, pointerEvents: "none" }} />
            <BadgeIcon kind={pal.icon} fg={pal.fg} bg={pal.bg} />
            <span style={{ position: "relative" }}>{name}</span>
        </span>
    )
}

/* ---------- puffy trinkets ---------- */

function Matcha({ uid }: { uid: string }) {
    return (
        <svg width="48" height="58" viewBox="0 0 50 60" aria-hidden style={{ display: "block" }}>
            <defs>
                <linearGradient id={`${uid}cup`} x1="0" x2="1">
                    <stop offset="0" stopColor="#c4e5ab" />
                    <stop offset=".4" stopColor="#dcf0cb" />
                    <stop offset="1" stopColor="#a9d48c" />
                </linearGradient>
            </defs>
            <path className="dbf-steam" d="M19 15c-3.2-3 3.2-5.2 0-8.5" fill="none" strokeWidth="1.8" strokeLinecap="round" />
            <path className="dbf-steam s2" d="M28 14c-3.2-3 3.2-5.2 0-8.5" fill="none" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M39 29c6.5 0 7.5 9.5.5 11.5" fill="none" stroke="#b5d99a" strokeWidth="4.2" strokeLinecap="round" />
            <path d="M39 29c6.5 0 7.5 9.5.5 11.5" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M8 24h32l-2.4 22.5a9 9 0 0 1-9 8.1h-9.2a9 9 0 0 1-9-8.1Z" fill={`url(#${uid}cup)`} />
            <ellipse cx="24" cy="24" rx="16.4" ry="3.8" fill="#f8f2e8" />
            <ellipse cx="24" cy="24.4" rx="13.8" ry="2.7" fill="#8fc46e" />
            <path d="M24 26c-1.8-1.1-2.6-1.9-2.6-2.8 0-.7.6-1.2 1.2-1.2.6 0 1 .3 1.4.8.4-.5.8-.8 1.4-.8.7 0 1.2.5 1.2 1.2 0 .9-.8 1.7-2.6 2.8Z" fill="#f4fbe9" />
            <path d="M11.6 29 13 44" stroke="rgba(255,255,255,.75)" strokeWidth="1.8" strokeLinecap="round" />
            <Face cx={24} cy={37} gap={9} />
        </svg>
    )
}

function Star({ uid }: { uid: string }) {
    const d = "M18 6.5 22 14 30.4 15.5 24.5 21.6 25.6 30 18 26.3 10.4 30 11.5 21.6 5.6 15.5 14 14Z"
    return (
        <svg width="32" height="32" viewBox="0 0 36 36" aria-hidden style={{ display: "block", overflow: "visible" }}>
            <defs>
                <linearGradient id={`${uid}star`} x1="0" y1="0" x2=".6" y2="1">
                    <stop offset="0" stopColor="#ffe9a6" />
                    <stop offset="1" stopColor="#ffcf5c" />
                </linearGradient>
            </defs>
            <path d={d} fill={`url(#${uid}star)`} stroke={`url(#${uid}star)`} strokeWidth="4.5" strokeLinejoin="round" />
            <ellipse cx="13.6" cy="13.4" rx="2.4" ry="1.4" fill="#fff" opacity=".8" transform="rotate(-35 13.6 13.4)" />
            <Face cx={18} cy={19.5} gap={7} />
        </svg>
    )
}

function Cloud({ uid }: { uid: string }) {
    return (
        <svg width="46" height="31" viewBox="0 0 50 34" aria-hidden style={{ display: "block" }}>
            <defs>
                <linearGradient id={`${uid}cloud`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e2eaf8" />
                </linearGradient>
            </defs>
            <path d="M13 30h25a8 8 0 0 0 1.2-15.9A11.5 11.5 0 0 0 17.3 11.6 9.2 9.2 0 0 0 13 30Z" fill={`url(#${uid}cloud)`} stroke="rgba(110,130,170,.2)" strokeWidth=".8" />
            <ellipse cx="22" cy="13.6" rx="3.4" ry="1.6" fill="#fff" transform="rotate(-18 22 13.6)" />
            <Face cx={26} cy={21} gap={8} sleepy />
        </svg>
    )
}

function Heart({ uid }: { uid: string }) {
    return (
        <svg width="26" height="24" viewBox="0 0 28 26" aria-hidden style={{ display: "block" }}>
            <defs>
                <linearGradient id={`${uid}heart`} x1="0" y1="0" x2=".5" y2="1">
                    <stop offset="0" stopColor="#ffc4d1" />
                    <stop offset="1" stopColor="#ff94ae" />
                </linearGradient>
            </defs>
            <path d={HEART} fill={`url(#${uid}heart)`} />
            <ellipse cx="8.8" cy="8.4" rx="3.4" ry="2.1" fill="#fff" opacity=".8" transform="rotate(-32 8.8 8.4)" />
            <circle cx="19.5" cy="7.6" r="1" fill="#fff" opacity=".7" />
        </svg>
    )
}

function Earplug() {
    return (
        <svg width="52" height="26" viewBox="0 0 56 28" aria-hidden style={{ display: "block" }}>
            <circle cx="13" cy="14" r="9" fill="none" className="dbf-accsoft-stroke" strokeWidth="6" />
            <path d="M7.4 9.2a7.6 7.6 0 0 1 8.2-3" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="20.5" y="10.8" width="10" height="6.4" rx="3.2" className="dbf-accsoft-fill" />
            <ellipse cx="33" cy="14" rx="3.2" ry="7.6" fill="#ebe5f3" stroke="rgba(90,70,110,.15)" strokeWidth=".6" />
            <ellipse cx="39" cy="14" rx="4" ry="6.4" fill="#f3eff8" stroke="rgba(90,70,110,.15)" strokeWidth=".6" />
            <path d="M41 8.6c6 0 10 2.4 10 5.4s-4 5.4-10 5.4Z" fill="#f9f6fc" stroke="rgba(90,70,110,.15)" strokeWidth=".6" />
            <path d="M43 10.4c3.2.3 5.4 1.3 6.2 2.6" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
    )
}

function TicTac() {
    const mints = [[7.5, 16], [14.5, 18], [8, 24.5], [14, 26.5], [7.5, 33], [14.5, 35]]
    return (
        <svg width="20" height="40" viewBox="0 0 22 44" aria-hidden style={{ display: "block" }}>
            <rect x="2" y="7" width="18" height="35" rx="6" fill="rgba(255,255,255,.62)" stroke="rgba(80,120,100,.25)" strokeWidth=".8" />
            {mints.map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx="3.2" ry="2.2" fill="#fdfffe" stroke="rgba(80,120,100,.18)" strokeWidth=".5" transform={`rotate(${i % 2 ? 14 : -10} ${cx} ${cy})`} />)}
            <rect x="4" y="10" width="1.8" height="28" rx=".9" fill="#fff" opacity=".85" />
            <rect x="1" y="1.5" width="20" height="8.5" rx="3.5" fill="#9fe0bd" />
            <rect x="2.4" y="2.4" width="17.2" height="2.6" rx="1.3" fill="#fff" opacity=".5" />
        </svg>
    )
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
    return (
        <svg aria-hidden className="dbf-sparkle" width={s} height={s} viewBox="0 0 10 10" style={{ position: "absolute", left: x, top: y, animationDelay: `${delay}s` }}>
            <path d="M5 0C5.6 3.4 6.6 4.4 10 5 6.6 5.6 5.6 6.6 5 10 4.4 6.6 3.4 5.6 0 5 3.4 4.4 4.4 3.4 5 0Z" />
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

    const reset = useCallback(() => {
        const door = doorRef.current
        if (!reduced && door) {
            door.classList.add("is-resetting")
            Object.keys(itemEls.current).forEach((k) => {
                const n = itemEls.current[k]
                if (n) play(n.firstElementChild, "dbf-hop")
            })
            window.setTimeout(() => door.classList.remove("is-resetting"), 1200)
        }
        startTransition(() => setPos({}))
    }, [reduced])

    // content
    const placeList = useMemo(() => places.split(",").map((s) => s.trim()).filter(Boolean).slice(0, compact ? 3 : 5), [places, compact])
    const has1 = !!(pin1 && pin1.src)
    const has2 = !compact && !!(pin2 && pin2.src)
    const showPin1 = has1 || onCanvas
    const showPin2 = has2 || (onCanvas && !compact)
    const hasPins = showPin1 || showPin2
    const stripEmpty = !(photo1 && photo1.src) && !(photo2 && photo2.src) && !(photo3 && photo3.src)

    const placeAnchors = hasPins
        ? [[34, 258, -4], [120, 300, 3], [212, 304, -3], [146, 336, 4], [232, 340, -3]]
        : [[146, 190, -4], [206, 232, 5], [136, 266, -2], [34, 258, 3], [222, 290, -4]]

    const items: Item[] = []

    items.push({
        id: "hello", label: `Hello magnet: ${words.join(", ")}`, x: 146, y: 16, r: -3, kind: "free",
        node: (
            <span className="dbf-bubble">
                <span aria-hidden style={{ display: "grid" }}>
                    {words.map((w, i) => (
                        <span key={i} className="dbf-word" style={{ gridArea: "1 / 1", whiteSpace: "nowrap", opacity: i === activeWord ? 1 : 0, transform: i === activeWord ? "none" : "translateY(3px)" }}>{w}</span>
                    ))}
                </span>
                <svg aria-hidden width="9" height="8" viewBox="0 0 28 26" style={{ display: "block", flex: "none" }}>
                    <path d={HEART} style={{ fill: "color-mix(in srgb, var(--db-accent, #F3500F) 70%, #ffffff)" }} />
                </svg>
                <span aria-hidden className="dbf-bubble-tail" />
            </span>
        ),
    })

    const PH = ["linear-gradient(150deg,#ffd9c2,#f5b8a0)", "linear-gradient(150deg,#ffd3df,#e9a9c0)", "linear-gradient(150deg,#d4e6f7,#a9c6e6)"]
    items.push({
        id: "strip", label: "Photo-booth strip", x: 36, y: 38, r: -5, w: 78, kind: "box",
        node: (
            <div style={{ position: "relative", background: "#fffdf8", padding: "6px 6px 0", display: "grid", gap: 5, borderRadius: 3 }}>
                <Washi left={10} top={-7} w={44} r={-8} />
                <HeartPin left="82%" top={-5} />
                {[photo1, photo2, photo3].map((p, i) => (
                    <div key={i} style={{ height: 54, overflow: "hidden", borderRadius: 3, background: "#eee" }}>
                        <Photo img={p} alt={[photo1Alt, photo2Alt, photo3Alt][i]} placeholder={PH[i]} />
                    </div>
                ))}
                <span style={{ fontFamily: HAND, fontWeight: 600, fontSize: 15, color: "#5a4646", textAlign: "center", lineHeight: 1, padding: "3px 0 6px" }}>{stripEmpty && onCanvas ? "add photos ↑" : stripCaption}</span>
            </div>
        ),
    })

    items.push({
        id: "quote", label: `Quote card: ${quote}`, x: 128, y: 62, r: 3, w: 176, kind: "box",
        node: (
            <div className="dbf-card">
                <HeartPin />
                <p style={{ margin: 0, fontFamily: HAND, fontWeight: 500, fontSize: 19, lineHeight: "20px", color: "#4a3a3c" }}>{quote}</p>
            </div>
        ),
    })

    const polaroid = (img: Img, cap: string, alt: string, n: number, empty: boolean) => (
        <div style={{ position: "relative", background: "#fffdf9", padding: "5px 5px 0", borderRadius: 3 }}>
            {n === 1 ? <Washi left="50%" top={-6} w={34} r={4} dots /> : <PuffMagnet color="#d9cdf5" />}
            <div style={{ height: 64, overflow: "hidden", borderRadius: 2, background: empty ? "transparent" : "#eee", border: empty ? "1.5px dashed rgba(0,0,0,.2)" : "none", display: "grid", placeItems: "center" }}>
                {empty ? <span style={{ fontFamily: SANS, fontSize: 9, color: "rgba(0,0,0,.4)", textAlign: "center", padding: 4 }}>pin {n}: add an image</span> : <Photo img={img} alt={alt} placeholder="#eee" />}
            </div>
            <span style={{ display: "block", fontFamily: HAND, fontWeight: 600, fontSize: 14, lineHeight: 1, color: "#4a3a3c", textAlign: "center", padding: "4px 2px 6px", minHeight: 20, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{cap}</span>
        </div>
    )
    if (showPin1) items.push({ id: "pin1", label: pin1Alt || pin1Caption || "Pinned photo", x: 134, y: 188, r: -4, w: 76, kind: "box", node: polaroid(pin1, pin1Caption, pin1Alt, 1, !has1) })
    if (showPin2) items.push({ id: "pin2", label: pin2Alt || pin2Caption || "Pinned photo", x: 226, y: 196, r: 5, w: 76, kind: "box", node: polaroid(pin2, pin2Caption, pin2Alt, 2, !has2) })

    let extra = 0
    placeList.forEach((name, i) => {
        const pal = PLACE_PALETTES[name.toLowerCase()] || EXTRA_PALETTES[extra++ % EXTRA_PALETTES.length]
        const [x, y, r] = placeAnchors[i]
        items.push({ id: `place${i}`, label: `${name} badge`, x, y, r, kind: "free", node: <PlaceBadge name={name} pal={pal} /> })
    })

    items.push({ id: "matcha", label: "Smiling matcha cup magnet", x: 36, y: compact ? 330 : 350, r: -6, w: 48, kind: "free", node: <Matcha uid={uid} /> })
    items.push({ id: "star", label: "Little star magnet", x: 94, y: compact ? 352 : 372, r: 10, w: 32, kind: "free", node: <Star uid={uid} /> })
    items.push({ id: "heart", label: "Heart magnet", x: compact ? 150 : 292, y: compact ? 360 : 396, r: -8, w: 26, kind: "free", node: <Heart uid={uid} /> })
    if (!compact) {
        items.push({ id: "cloud", label: "Sleepy cloud magnet", x: 132, y: 388, r: 4, w: 46, kind: "free", node: <Cloud uid={uid} /> })
        items.push({ id: "earplug", label: "Loop-style earplug", x: 188, y: 394, r: -8, w: 52, kind: "free", node: <Earplug /> })
        items.push({ id: "tictac", label: "Tic Tac box", x: 256, y: 366, r: 16, w: 20, kind: "free", node: <TicTac /> })
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
        --dbf-door: color-mix(in srgb, var(--db-accent, #F3500F) 18%, #fff7f0);
        --dbf-glow: .55; --dbf-seal: rgba(140,90,80,.12); --dbf-sealhi: .6; --dbf-shine: .7;
        --dbf-sh: rgba(150,95,85,.28); --dbf-sh2: rgba(150,95,85,.12);
        --dbf-handle: linear-gradient(90deg, #ece5df, #ffffff 40%, #ddd3cb 88%);
        --dbf-hint: rgba(110,75,70,.55); --dbf-steam: rgba(150,115,115,.45);
        --dbf-sparkle: #ffffff; --dbf-dim: brightness(1);
    `
    const css = `
        .dbf-root {
            --dbf-door: color-mix(in srgb, var(--db-accent, #F3500F) 22%, #3b3340);
            --dbf-glow: .12; --dbf-seal: rgba(0,0,0,.26); --dbf-sealhi: .07; --dbf-shine: .16;
            --dbf-sh: rgba(12,6,18,.5); --dbf-sh2: rgba(12,6,18,.25);
            --dbf-handle: linear-gradient(90deg, #6f6675, #bdb3c3 40%, #6c6372 88%);
            --dbf-hint: rgba(255,238,230,.55); --dbf-steam: rgba(255,255,255,.55);
            --dbf-sparkle: #ffe7b0; --dbf-dim: brightness(.93) saturate(.9);
            --dbf-acc-soft: color-mix(in srgb, var(--db-accent, #F3500F) 68%, #ffffff);
        }
        :root[data-db-theme="light"] .dbf-root, [data-db-theme="light"] .dbf-root { ${LIGHT} }
        @media (prefers-color-scheme: light) { :root:not([data-db-theme]) .dbf-root { ${LIGHT} } }
        .dbf-door {
            background-color: var(--dbf-door);
            background-image: radial-gradient(130% 90% at 18% 0%, rgba(255,255,255,var(--dbf-glow)), rgba(255,255,255,0) 55%), linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.06));
            box-shadow: inset 0 0 0 3px var(--dbf-seal), inset 0 2px 0 3px rgba(255,255,255,var(--dbf-sealhi)), inset 0 -10px 22px -14px rgba(0,0,0,.18), 0 22px 40px -22px var(--dbf-sh), 0 2px 6px var(--dbf-sh2);
        }
        .dbf-shine { position:absolute; border-radius:6px; background: rgba(255,255,255,var(--dbf-shine)); transform: rotate(32deg); pointer-events:none; }
        .dbf-handle { position:absolute; left:12px; top:80px; width:13px; height:126px; border-radius:8px; background: var(--dbf-handle);
            box-shadow: 2px 4px 8px var(--dbf-sh), inset 0 -2px 0 rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6); }
        .dbf-handle::before, .dbf-handle::after { content:""; position:absolute; left:9px; width:10px; height:9px; border-radius:4px; background: var(--dbf-handle);
            box-shadow: 1px 2px 3px var(--dbf-sh2); z-index:-1; }
        .dbf-handle::before { top:10px } .dbf-handle::after { bottom:10px }
        .dbf-item { position:absolute; outline:none; -webkit-tap-highlight-color: transparent;
            transition: transform .55s cubic-bezier(.34,1.56,.64,1); }
        .is-resetting .dbf-item { transition-delay: calc(var(--i) * 40ms); }
        .dbf-item.is-lifted { transition: none; cursor: grabbing !important; }
        .dbf-item:focus-visible { outline: 2px dashed color-mix(in srgb, var(--db-accent, #F3500F) 80%, #fff); outline-offset: 4px; border-radius: 10px; }
        .dbf-anim { transform-origin: 50% 0%; transition: transform .25s ease; }
        .dbf-skin-box { filter: var(--dbf-dim); box-shadow: 0 1px 1px var(--dbf-sh2), 0 6px 12px -6px var(--dbf-sh); transition: box-shadow .25s ease; border-radius: 3px; }
        .dbf-skin-free { filter: var(--dbf-dim) drop-shadow(0 2.5px 2.5px var(--dbf-sh)); transition: filter .25s ease; }
        .is-lifted .dbf-skin-box { box-shadow: 0 2px 3px var(--dbf-sh2), 0 18px 24px -10px var(--dbf-sh); }
        .is-lifted .dbf-skin-free { filter: var(--dbf-dim) drop-shadow(0 10px 8px var(--dbf-sh)); }
        @media (hover: hover) and (pointer: fine) {
            .dbf-live .dbf-item:not(.is-lifted):hover > .dbf-anim { transform: translateY(-3px); animation: dbf-wiggle .7s ease-in-out; }
            .dbf-live .dbf-item:not(.is-lifted):hover .dbf-skin-box { box-shadow: 0 2px 3px var(--dbf-sh2), 0 12px 18px -9px var(--dbf-sh); }
        }
        @keyframes dbf-wiggle { 0% { transform: translateY(-3px) rotate(0) } 25% { transform: translateY(-3px) rotate(-3deg) } 50% { transform: translateY(-3px) rotate(2.5deg) } 75% { transform: translateY(-3px) rotate(-1.2deg) } 100% { transform: translateY(-3px) rotate(0) } }
        .dbf-item > .dbf-anim.dbf-drop { transform-origin: 50% 100%; animation: dbf-squash .5s cubic-bezier(.3,.7,.4,1) !important; }
        .dbf-item > .dbf-anim.dbf-snap { transform-origin: 50% 50%; animation: dbf-snap .38s ease-out !important; }
        .dbf-item > .dbf-anim.dbf-hop { transform-origin: 50% 100%; animation: dbf-hop .6s cubic-bezier(.3,.7,.4,1) both !important; animation-delay: calc(var(--i) * 40ms) !important; }
        @keyframes dbf-squash { 0% { transform: scale(1.07,.9) } 35% { transform: scale(.95,1.06) } 65% { transform: scale(1.02,.98) } 100% { transform: none } }
        @keyframes dbf-snap { 0% { transform: scale(1.14) } 6% { transform: scale(.9) } 35% { transform: scale(1.04) } 100% { transform: none } }
        @keyframes dbf-hop { 0% { transform: none } 30% { transform: translateY(-12px) scale(.97,1.04) } 58% { transform: translateY(0) scale(1.06,.93) } 80% { transform: scale(.98,1.02) } 100% { transform: none } }
        .dbf-washi { position:absolute; height:14px; z-index:3; opacity:.93; margin-left:0;
            background-color: color-mix(in srgb, var(--db-accent, #F3500F) 30%, #fff3f5);
            background-image: repeating-linear-gradient(-45deg, rgba(255,255,255,.6) 0 3px, rgba(255,255,255,0) 3px 7px);
            clip-path: polygon(3% 0, 97% 0, 100% 15%, 96% 30%, 100% 48%, 97% 66%, 100% 84%, 96% 100%, 3% 100%, 0 86%, 4% 70%, 0 52%, 3% 34%, 0 16%); }
        .dbf-washi.dots { margin-left:-17px; background-color: #cfe6f6; background-image: radial-gradient(circle, rgba(255,255,255,.9) 1.1px, rgba(255,255,255,0) 1.5px); background-size: 6px 6px; }
        .dbf-heartpin { position:absolute; margin-left:-7.5px; z-index:4; filter: drop-shadow(1px 2px 1.5px rgba(0,0,0,.25)); }
        .dbf-puff { position:absolute; top:-7px; left:50%; margin-left:-8px; width:16px; height:16px; border-radius:50%; z-index:3;
            box-shadow: inset 0 -2px 2px rgba(0,0,0,.08), 0 2px 3px rgba(0,0,0,.22); }
        .dbf-card { position:relative; background-color:#fffdf7; border-radius:6px; padding: 24px 14px 12px;
            background-image: linear-gradient(180deg, rgba(0,0,0,0) 15px, rgba(240,128,150,.5) 15px, rgba(240,128,150,.5) 16px, rgba(0,0,0,0) 16px),
                repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 19px, rgba(120,160,210,.22) 19px 20px);
            background-position: 0 0, 0 25px; background-repeat: no-repeat, repeat; }
        .dbf-badge { position:relative; display:inline-flex; align-items:center; gap:4px; padding:5px 9px 5px 7px; border-radius:10px;
            font: 600 9px/1 ${SANS}; letter-spacing:.08em; text-transform:uppercase; white-space:nowrap;
            box-shadow: inset 0 1.5px 0 rgba(255,255,255,.55), inset 0 -2px 0 rgba(0,0,0,.08); }
        .dbf-bubble { position:relative; display:inline-flex; align-items:center; gap:6px; padding:5px 12px 6px; border-radius:14px;
            background: #fff4ee; background: color-mix(in srgb, var(--db-accent, #F3500F) 20%, #fffaf5); color:#4b3440;
            font: 600 18px/1.05 ${HAND}; box-shadow: inset 0 1.5px 0 rgba(255,255,255,.7), inset 0 -2px 0 rgba(0,0,0,.05); }
        .dbf-bubble-tail { position:absolute; left:14px; bottom:-4px; width:10px; height:10px; border-radius:2px; transform: rotate(45deg); background: inherit; z-index:-1; }
        .dbf-word { transition: opacity .6s ease, transform .6s ease; }
        .dbf-steam { stroke: var(--dbf-steam); }
        .dbf-accsoft-stroke { stroke: var(--dbf-acc-soft); }
        .dbf-accsoft-fill { fill: var(--dbf-acc-soft); }
        .dbf-sparkle { fill: var(--dbf-sparkle); pointer-events:none; animation: dbf-twinkle 2.8s ease-in-out infinite; transform-origin: 50% 50%; }
        @keyframes dbf-twinkle { 0%, 100% { opacity:.25; transform: scale(.6) rotate(0) } 50% { opacity:1; transform: scale(1) rotate(25deg) } }
        .dbf-paused .dbf-sparkle { animation-play-state: paused; }
        .dbf-static .dbf-sparkle { animation: none; opacity: .85; }
        .dbf-reset { position:absolute; right:12px; bottom:12px; z-index:200; padding:6px 10px; border-radius:999px; border:0;
            background: #fffaf5; color: #4b3440; font: 500 11px ${SANS}; cursor:pointer; clip-path: inset(50%); opacity:0; }
        .dbf-reset:focus-visible { clip-path:none; opacity:1; outline: 2px dashed color-mix(in srgb, var(--db-accent, #F3500F) 80%, #fff); outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
            .dbf-root *, .dbf-root *::before, .dbf-root *::after { animation: none !important; transition: none !important; }
            .dbf-sparkle { opacity: .85; }
        }
    `

    const descId = `${uid}desc`
    const sparkles = [[118, 22, 8, 0], [316, 84, 7, 0.9], [308, 268, 9, 1.7], [30, 232, 6, 0.4]]

    return (
        <div ref={rootRef} className="dbf-root" style={{ position: "relative", width: "100%", height: "100%", minHeight: H * scale, overflow: "hidden", ...style }}>
            <style>{css}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Noto+Sans+Devanagari:wght@500&family=Noto+Sans+Kannada:wght@500&display=swap" />
            <section
                ref={doorRef}
                role="region"
                aria-label="fridge door"
                aria-describedby={descId}
                className={`dbf-door ${interactive ? "dbf-live" : "dbf-static"} ${inView ? "" : "dbf-paused"}`}
                onDoubleClick={interactive ? reset : undefined}
                onPointerUp={onDoorPointerUp}
                style={{ position: "absolute", left: "50%", top: "50%", width: DESIGN_W, height: H, marginLeft: -DESIGN_W / 2, marginTop: -H / 2, transform: `scale(${scale})`, transformOrigin: "50% 50%", borderRadius: 34, overflow: "hidden", userSelect: "none", WebkitUserSelect: "none", fontFamily: SANS, boxSizing: "border-box", isolation: "isolate" }}
            >
                <span id={descId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                    A cute fridge door with a photo strip, a quote card, place badges and little magnets. Items can be moved with a mouse, touch, or the arrow keys. Double-click the door to put everything back.
                </span>
                <span aria-hidden className="dbf-shine" style={{ right: 30, top: 14, width: 6, height: 34 }} />
                <span aria-hidden className="dbf-shine" style={{ right: 20, top: 46, width: 4, height: 12 }} />
                <span aria-hidden className="dbf-handle" />
                {sparkles.map(([x, y, s, d], i) => <Sparkle key={i} x={x} y={y} s={s} delay={d} />)}
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
                            style={{ ...({ "--i": i } as React.CSSProperties), left: it.x, top: it.y, width: it.w, transform: tf(p ? p.x : 0, p ? p.y : 0, p && p.r !== undefined ? p.r : it.r, 1), zIndex: p && p.z ? p.z : i + 1, touchAction: interactive ? "none" : "auto", cursor: interactive ? "grab" : "default" }}
                        >
                            <div className="dbf-anim">
                                <div className={it.kind === "box" ? "dbf-skin-box" : "dbf-skin-free"}>{it.node}</div>
                            </div>
                        </div>
                    )
                })}
                {showHint && !compact && (
                    <span aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: HAND, fontWeight: 600, fontSize: 15, color: "var(--dbf-hint)", pointerEvents: "none" }}>
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
