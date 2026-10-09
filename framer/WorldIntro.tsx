import { useCallback, useEffect, useRef, useState, startTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/**
 * WorldIntro v2 — "Pick your vibe"
 * Dhwani: "fix the start microinteraction, make it WAY better… very responsive…
 * have users pick different breathing colors of the background gradient and change
 * everything based on that"
 *
 * 1. Stars + "hi, i'm Dhwani" assemble.
 * 2. Breathing color orbs. Hover/focus previews the palette on the whole screen.
 * 3. Pick one → it floods out from where you clicked and the site is already retinted.
 * The choice is saved (localStorage "db_vibe"), written to CSS variables on :root
 * (--vibe-a, --vibe-b, --vibe-c, --vibe-accent) and broadcast as a "db-vibe" event, so
 * AuroraBackground (Follow vibe) and FigmaCursorFollower pick it up everywhere.
 * After the intro, a small "vibe" chip stays in the corner to switch any time.
 * Keyboard: Tab/←/→ to move, Enter to pick, Esc to skip/close. Reduced motion respected.
 * Oct 2: colors follow the site theme tokens (--db-*) for light/dark.
 * (Only the corner vibe chip/switcher; the full-screen intro stays its own dark scene.)
 * Oct 3: palette = Orange / Sky Blue / Pink / Yellow + custom two-color gradient (from the Next.js site); light-mode accent ink.
 * Oct 5 (click-through audit): the Framer wrapper around this component never catches clicks; the
 * intro stops catching the moment a vibe is picked (during the 1s flood + fade); the corner switcher
 * only catches on the chip and its open menu.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */

type Vibe = {
    id: string
    name: string
    a: string
    b: string
    c: string
    accent: string
    swatch: [string, string, string]
    tempo: number
}

const VIBES: Vibe[] = [
    { id: "ember", name: "Orange", a: "rgba(255,140,60,0.38)", b: "rgba(243,80,15,0.50)", c: "rgba(255,203,5,0.16)", accent: "#F3500F", swatch: ["#FFB36B", "#F3500F", "#5A1400"], tempo: 4.2 },
    { id: "goblue", name: "Sky Blue", a: "rgba(125,211,252,0.32)", b: "rgba(56,189,248,0.50)", c: "rgba(2,132,199,0.22)", accent: "#38BDF8", swatch: ["#BAE6FD", "#38BDF8", "#0C4A6E"], tempo: 5.2 },
    { id: "afterhours", name: "Pink", a: "rgba(255,177,153,0.32)", b: "rgba(255,77,141,0.46)", c: "rgba(123,92,255,0.20)", accent: "#FF4D8D", swatch: ["#FFC2A8", "#FF4D8D", "#4A0E2A"], tempo: 3.6 },
    { id: "greenroom", name: "Yellow", a: "rgba(254,240,138,0.35)", b: "rgba(250,204,21,0.48)", c: "rgba(234,179,8,0.22)", accent: "#FACC15", swatch: ["#FEF08A", "#FACC15", "#713F12"], tempo: 6.8 },
]

/** Retired ids → nearest current preset. Anything else unknown → ember. */
const LEGACY: Record<string, string> = { nightshift: "goblue", cherry: "afterhours" }

const STORE_KEY = "db_vibe"
const CUSTOM_KEY = "custom-vibe-colors"
const SESSION_KEY = "db_intro_seen"
const INK_STYLE_ID = "db-vibe-ink"
const FONT = "'Poppins','Inter',sans-serif"
const DEFAULT_CUSTOM: [string, string] = ["#8B5CF6", "#F3500F"]

function presetFor(id: string | null | undefined): Vibe {
    const key = id ? LEGACY[id] || id : "ember"
    return VIBES.find((v) => v.id === key) || VIBES[0]
}

function parseHex(hex: string): [number, number, number] {
    const value = hex.replace("#", "")
    const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value
    const n = Number.parseInt(full, 16)
    if (Number.isNaN(n)) return [0, 0, 0]
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("").toUpperCase()
}

function isHex(v: unknown): v is string {
    return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v)
}

function hexRgba(hex: string, alpha: number) {
    const [r, g, b] = parseHex(hex)
    return `rgba(${r},${g},${b},${alpha})`
}

function luminance(r: number, g: number, b: number) {
    const ch = (x: number) => {
        const s = x / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

/** Darken the accent (mix with black in small steps) until it reaches ≥4.5:1 on #FFFFFF. */
function inkOnWhite(hex: string): string {
    const [r, g, b] = parseHex(hex)
    for (let t = 0; t <= 1.0001; t += 0.02) {
        const k = 1 - t
        const rr = Math.round(r * k), gg = Math.round(g * k), bb = Math.round(b * k)
        if (1.05 / (luminance(rr, gg, bb) + 0.05) >= 4.5) return toHex(rr, gg, bb)
    }
    return "#000000"
}

function makeCustomVibe(first: string, second: string): Vibe {
    return {
        id: "custom",
        name: "Custom",
        a: hexRgba(first, 0.34),
        b: hexRgba(second, 0.48),
        c: hexRgba(first, 0.18),
        accent: second,
        swatch: [first, second, "#17131F"],
        tempo: 5.2,
    }
}

function readCustomColors(): [string, string] | null {
    try {
        const raw = localStorage.getItem(CUSTOM_KEY)
        if (!raw) return null
        const arr = JSON.parse(raw)
        if (Array.isArray(arr) && isHex(arr[0]) && isHex(arr[1])) return [arr[0], arr[1]]
    } catch {}
    return null
}

function readVibe(): Vibe | null {
    try {
        const raw = localStorage.getItem(STORE_KEY)
        if (!raw) return null
        const id = JSON.parse(raw)?.id
        if (typeof id !== "string") return null
        if (id === "custom") {
            const cols = readCustomColors()
            return cols ? makeCustomVibe(cols[0], cols[1]) : null
        }
        return presetFor(id)
    } catch {
        return null
    }
}

function ensureInkStyle() {
    if (document.getElementById(INK_STYLE_ID)) return
    const el = document.createElement("style")
    el.id = INK_STYLE_ID
    el.textContent = `:root[data-db-theme="light"]{--db-accent: var(--vibe-accent-ink) !important}`
    document.head.appendChild(el)
}

function applyVibe(v: Vibe, persist: boolean) {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.style.setProperty("--vibe-a", v.a)
    root.style.setProperty("--vibe-b", v.b)
    root.style.setProperty("--vibe-c", v.c)
    root.style.setProperty("--vibe-accent", v.accent)
    root.style.setProperty("--vibe-accent-ink", inkOnWhite(v.accent))
    root.setAttribute("data-vibe", v.id)
    try {
        ensureInkStyle()
    } catch {}
    if (persist) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ id: v.id, a: v.a, b: v.b, c: v.c, accent: v.accent }))
        } catch {}
    }
    try {
        window.dispatchEvent(
            new CustomEvent("db-vibe", { detail: { id: v.id, a: v.a, b: v.b, c: v.c, accent: v.accent, preview: !persist } })
        )
    } catch {}
}

/** Make the component's own Framer wrappers click-through (stops at the first fixed one or a shared parent). */
function passThrough(start: HTMLElement | null) {
    let el: HTMLElement | null = start
    for (let i = 0; el && i < 5; i++) {
        el.style.pointerEvents = "none"
        if (window.getComputedStyle(el).position === "fixed") break
        const up: HTMLElement | null = el.parentElement
        if (!up || up === document.body || up.id === "main") break
        const kids = Array.from(up.children).filter((c) => !/^(STYLE|LINK|SCRIPT|TEMPLATE)$/.test(c.tagName))
        if (kids.length !== 1) break
        el = up
    }
}

function seenThisSession(): boolean {
    try {
        return !!sessionStorage.getItem(SESSION_KEY)
    } catch {
        return false
    }
}
function markSeen() {
    try {
        sessionStorage.setItem(SESSION_KEY, "1")
    } catch {}
}

const STARS = Array.from({ length: 140 }, (_, i) => ({
    x: (i * 73.137 + 11.5) % 100,
    y: (i * 43.21 + 37.8) % 100,
    r: i % 7 === 0 ? 1.9 : i % 4 === 0 ? 1.2 : 0.65,
    op: 0.1 + (i % 8) * 0.04,
    dur: 2.4 + (i % 5) * 0.85,
    del: (i % 11) * 0.33,
    layer: i % 3,
}))

interface Props {
    cursorName?: string
    accentColor?: string
    showWhen?: "session" | "always" | "never"
    showSwitcher?: boolean
    switcherSide?: "left" | "right"
    defaultVibe?: string
    autoEnter?: boolean
    autoDelay?: number
}

function Orb({ v, size, reduced, active, ring = "rgba(255,255,255,0.9)" }: { v: Vibe; size: number | string; reduced: boolean; active: boolean; ring?: string }) {
    return (
        <span
            aria-hidden="true"
            style={{
                position: "relative",
                display: "block",
                width: size,
                height: size,
                borderRadius: "50%",
                background: `radial-gradient(circle at 34% 30%, ${v.swatch[0]} 0%, ${v.swatch[1]} 46%, ${v.swatch[2]} 100%)`,
                boxShadow: active ? `0 0 0 2px ${ring}, 0 0 40px 6px ${v.swatch[1]}AA` : `0 0 28px 2px ${v.swatch[1]}66`,
                animation: reduced ? "none" : `vibe-breathe ${v.tempo}s ease-in-out infinite`,
                transition: "box-shadow 0.3s ease",
            }}
        />
    )
}

/** Two native color pickers + "Use this gradient". `dark` = intro scene styling; otherwise site tokens. */
function CustomPanel({
    colors,
    onChange,
    onUse,
    dark,
    id,
}: {
    colors: [string, string]
    onChange: (index: 0 | 1, value: string) => void
    onUse: (e: React.MouseEvent<HTMLButtonElement>) => void
    dark: boolean
    id?: string
}) {
    const text = dark ? "#F5F0E8" : "var(--db-text, rgba(255,255,255,0.9))"
    const text2 = dark ? "rgba(255,255,255,0.6)" : "var(--db-text-2, rgba(255,255,255,0.6))"
    const line = dark ? "rgba(255,255,255,0.18)" : "var(--db-glass-line, rgba(255,255,255,0.14))"
    const accent = dark ? colors[1] : "var(--db-accent, #F3500F)"
    const field = (index: 0 | 1, label: string) => (
        <label
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", color: text2, fontSize: 11, fontWeight: 500, letterSpacing: "0.03em" }}
        >
            <input
                type="color"
                className="vibe-color"
                value={colors[index]}
                onInput={(e) => onChange(index, (e.target as HTMLInputElement).value)}
                onChange={(e) => onChange(index, e.target.value)}
                style={{ width: 44, height: 44, padding: 3, border: `1px solid ${line}`, borderRadius: "50%", background: "transparent", cursor: "pointer" }}
            />
            {label}
        </label>
    )
    return (
        <div
            id={id}
            style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: text,
                fontFamily: FONT,
            }}
        >
            <span
                aria-hidden="true"
                style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, border: `1px solid ${line}` }}
            />
            {field(0, "First color")}
            {field(1, "Second color")}
            <button
                type="button"
                className="vibe-ui-btn"
                onClick={onUse}
                style={{
                    minHeight: 44,
                    padding: "0 16px",
                    borderRadius: 12,
                    border: `1px solid ${accent}`,
                    background: dark ? "rgba(255,255,255,0.08)" : "color-mix(in srgb, var(--db-accent, #F3500F) 14%, transparent)",
                    color: text,
                    fontFamily: FONT,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    cursor: "pointer",
                }}
            >
                Use this gradient
            </button>
        </div>
    )
}

export default function WorldIntro(props: Props) {
    const { showWhen = "session", showSwitcher = true, switcherSide = "left", defaultVibe = "ember" } = props

    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)
    const [stage, setStage] = useState<0 | 1 | 2>(0)
    const [current, setCurrent] = useState<Vibe>(presetFor(defaultVibe))
    const [preview, setPreview] = useState<Vibe | null>(null)
    const [flood, setFlood] = useState<{ x: number; y: number; v: Vibe } | null>(null)
    const [menu, setMenu] = useState(false)
    const [customOpen, setCustomOpen] = useState(false)
    const [customColors, setCustomColors] = useState<[string, string]>(DEFAULT_CUSTOM)
    const [reduced, setReduced] = useState(false)
    const [narrow, setNarrow] = useState(false)
    const starRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
    const chipRef = useRef<HTMLButtonElement>(null)
    const hostRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        if (typeof window === "undefined" || RenderTarget.current() === RenderTarget.canvas) return
        const el = hostRef.current
        if (el) passThrough(el.parentElement)
    }, [mounted])

    useEffect(() => {
        if (typeof window === "undefined") return
        const saved = readVibe()
        const cols = readCustomColors()
        const start = saved || presetFor(defaultVibe)
        applyVibe(start, false)
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const nw = window.matchMedia("(max-width: 640px)").matches
        const show = showWhen === "always" || (showWhen === "session" && !seenThisSession())
        startTransition(() => {
            if (cols) setCustomColors(cols)
            setCurrent(start)
            setReduced(rm)
            setNarrow(nw)
            setOpen(show)
            setMounted(true)
        })
        const onResize = () => startTransition(() => setNarrow(window.matchMedia("(max-width: 640px)").matches))
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [showWhen, defaultVibe])

    useEffect(() => {
        if (!open) return
        setStage(0)
        const t = window.setTimeout(() => startTransition(() => setStage(1)), reduced ? 150 : 1300)
        return () => clearTimeout(t)
    }, [open, reduced])

    useEffect(() => {
        if (!open || typeof document === "undefined") return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    const shown = preview || current

    const choose = useCallback(
        (v: Vibe, x?: number, y?: number) => {
            applyVibe(v, true)
            setCurrent(v)
            setPreview(null)
            setMenu(false)
            setCustomOpen(false)
            if (!open) return
            markSeen()
            if (reduced) {
                setOpen(false)
                return
            }
            const cx = x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 0)
            const cy = y ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 0)
            setFlood({ x: cx, y: cy, v })
            setStage(2)
            window.setTimeout(() => setOpen(false), 1050)
        },
        [open, reduced]
    )

    const hover = useCallback((v: Vibe | null) => {
        setPreview(v)
        if (v) applyVibe(v, false)
    }, [])

    const revert = useCallback(() => {
        setPreview(null)
        applyVibe(current, false)
    }, [current])

    const updateCustomColor = useCallback(
        (index: 0 | 1, value: string) => {
            if (!isHex(value)) return
            const next: [string, string] = [customColors[0], customColors[1]]
            next[index] = value
            setCustomColors(next)
            const v = makeCustomVibe(next[0], next[1])
            setPreview(v)
            applyVibe(v, false)
        },
        [customColors]
    )

    const chooseCustom = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            try {
                localStorage.setItem(CUSTOM_KEY, JSON.stringify(customColors))
            } catch {}
            const r = e.currentTarget.getBoundingClientRect()
            choose(makeCustomVibe(customColors[0], customColors[1]), e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2)
        },
        [customColors, choose]
    )

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            e.preventDefault()
            if (customOpen) {
                setCustomOpen(false)
                revert()
                return
            }
            choose(current)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, choose, current, customOpen, revert])

    useEffect(() => {
        if (open || !menu) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            e.preventDefault()
            setMenu(false)
            revert()
            chipRef.current?.focus()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, menu, revert])

    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1
        const f = [6, 14, 24]
        starRefs.forEach((ref, i) => {
            if (ref.current) ref.current.style.transform = `translate(${nx * f[i]}px, ${ny * f[i]}px)`
        })
    }, [])

    const arrowNav = (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return
        const btns = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("button[role='radio']"))
        const i = btns.indexOf(document.activeElement as HTMLButtonElement)
        const fwd = e.key === "ArrowRight" || e.key === "ArrowDown"
        const n = fwd ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length
        btns[n]?.focus()
        e.preventDefault()
    }

    if (!mounted) return null

    const orbSize = narrow ? "clamp(40px, 11vw, 54px)" : "clamp(64px, 7.2vw, 104px)"

    const keyframes = `
        @font-face{font-family:'Pinyon Script';src:url('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/pinyonscript/PinyonScript-Regular.ttf') format('truetype');font-display:swap;}
        @keyframes vibe-breathe{0%,100%{transform:scale(0.94);filter:saturate(1)}50%{transform:scale(1.06);filter:saturate(1.25)}}
        @keyframes vibe-drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(4vw,-3vh) scale(1.12)}100%{transform:translate(-3vw,2vh) scale(0.96)}}
        @keyframes vibe-twinkle{0%,100%{opacity:var(--so,0.2)}50%{opacity:calc(var(--so,0.2)*2.6)}}
        .vibe-orb-btn:focus-visible{outline:2px solid #fff;outline-offset:6px;border-radius:999px}
        .vibe-intro .vibe-ui-btn:focus-visible,.vibe-intro .vibe-color:focus-visible{outline:2px solid #fff;outline-offset:3px}
        .vibe-chip-btn:focus-visible,.vibe-switcher .vibe-ui-btn:focus-visible,.vibe-switcher .vibe-color:focus-visible{outline:2px solid var(--db-text, #fff);outline-offset:3px}
        .vibe-color::-webkit-color-swatch-wrapper{padding:0}
        .vibe-color::-webkit-color-swatch{border:0;border-radius:50%}
        .vibe-color::-moz-color-swatch{border:0;border-radius:50%}
        @media (prefers-reduced-motion: reduce){.vibe-intro *,.vibe-switcher *{transition:none !important}}
    `

    return (
        <>
            <style>{keyframes}</style>
            <span ref={hostRef} aria-hidden="true" style={{ display: "none" }} />

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="vibe-intro"
                        className="vibe-intro"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0.01 : 0.5, ease: [0.32, 0, 0.67, 0] }}
                        onMouseMove={onMove}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Pick a color vibe for this site"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                            overflow: "hidden",
                            background: "rgb(8,8,10)",
                            color: "#F5F0E8",
                            fontFamily: FONT,
                            userSelect: "none",
                            WebkitTapHighlightColor: "transparent",
                            pointerEvents: stage === 2 ? "none" : "auto",
                        }}
                    >
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                            {[
                                { col: shown.b, size: "80vmax", top: "-30vmax", left: "-20vmax", d: 0 },
                                { col: shown.a, size: "55vmax", top: "40%", left: "55%", d: -6 },
                                { col: shown.c, size: "45vmax", top: "55%", left: "-10%", d: -11 },
                            ].map((o, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        width: o.size,
                                        height: o.size,
                                        top: o.top,
                                        left: o.left,
                                        borderRadius: "50%",
                                        background: `radial-gradient(circle, ${o.col} 0%, rgba(0,0,0,0) 70%)`,
                                        filter: "blur(70px)",
                                        transition: "background 0.6s ease",
                                        animation: reduced ? "none" : `vibe-drift ${18 + i * 4}s ease-in-out ${o.d}s infinite alternate`,
                                    }}
                                />
                            ))}
                        </div>

                        {[0, 1, 2].map((layer) => (
                            <div
                                key={layer}
                                ref={starRefs[layer]}
                                aria-hidden="true"
                                style={{ position: "absolute", inset: "-5%", pointerEvents: "none", willChange: "transform" }}
                            >
                                {STARS.filter((s) => s.layer === layer).map((s, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            position: "absolute",
                                            left: `${s.x}%`,
                                            top: `${s.y}%`,
                                            width: s.r,
                                            height: s.r,
                                            borderRadius: "50%",
                                            background: "#fff",
                                            ["--so" as any]: s.op,
                                            opacity: s.op,
                                            animation: reduced ? "none" : `vibe-twinkle ${s.dur}s ${s.del}s ease-in-out infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                        ))}

                        <div
                            style={{
                                position: "absolute",
                                top: "clamp(18px,4vh,38px)",
                                left: "clamp(18px,5vw,58px)",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                zIndex: 5,
                            }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: shown.accent, transition: "background .4s" }} />
                            <span
                                style={{
                                    fontSize: "clamp(12px,1.2vw,14px)",
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,.6)",
                                    fontFamily: "'Noto Sans Devanagari','Mangal',serif",
                                }}
                            >
                                ध्वनि
                            </span>
                        </div>
                        <button
                            type="button"
                            className="vibe-ui-btn"
                            onClick={() => choose(current)}
                            style={{
                                position: "absolute",
                                top: "clamp(14px,3.6vh,34px)",
                                right: "clamp(14px,5vw,58px)",
                                zIndex: 6,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                color: "rgba(255,255,255,0.75)",
                                borderRadius: 999,
                                padding: "8px 16px",
                                fontFamily: FONT,
                                fontSize: 12,
                                fontWeight: 500,
                                letterSpacing: "0.04em",
                                cursor: "pointer",
                                minHeight: 44,
                            }}
                        >
                            skip →
                        </button>

                        <main
                            style={{
                                position: "relative",
                                zIndex: 4,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "clamp(18px,4vh,40px)",
                                padding: "clamp(72px,10vh,96px) 20px clamp(40px,8vh,80px)",
                                textAlign: "center",
                                overflowY: "auto",
                            }}
                        >
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    style={{ fontSize: "clamp(16px,2vw,22px)", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}
                                >
                                    hi, i'm
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        fontFamily: "'Pinyon Script',cursive",
                                        fontSize: "clamp(64px,11vw,148px)",
                                        lineHeight: 1.05,
                                        color: "#FFF8F0",
                                        textShadow: `0 0 40px ${shown.accent}55`,
                                        transition: "text-shadow .5s",
                                    }}
                                >
                                    Dhwani
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {stage >= 1 && (
                                    <motion.div
                                        key="picker"
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: stage === 2 ? 0 : 1, y: 0 }}
                                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(14px,3vh,26px)" }}
                                    >
                                        <div style={{ fontSize: "clamp(14px,1.5vw,17px)", color: "rgba(255,255,255,0.72)", maxWidth: 440, lineHeight: 1.5 }}>
                                            before you come in, pick a vibe.
                                            <br />
                                            <span style={{ color: "rgba(255,255,255,0.45)" }}>the whole site breathes in it.</span>
                                        </div>

                                        <div
                                            role="radiogroup"
                                            aria-label="Color vibes"
                                            onMouseLeave={() => hover(null)}
                                            onKeyDown={arrowNav}
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                justifyContent: "center",
                                                gap: narrow ? "16px 6px" : "clamp(18px,3vw,40px)",
                                                maxWidth: "min(720px, 94vw)",
                                            }}
                                        >
                                            {VIBES.map((v, i) => {
                                                const isOn = shown.id === v.id
                                                return (
                                                    <motion.button
                                                        key={v.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={current.id === v.id}
                                                        aria-label={`${v.name} vibe`}
                                                        className="vibe-orb-btn"
                                                        initial={{ opacity: 0, y: 16, scale: 0.8 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                        whileHover={reduced ? undefined : { y: -6 }}
                                                        whileTap={{ scale: 0.94 }}
                                                        onMouseEnter={() => hover(v)}
                                                        onFocus={() => hover(v)}
                                                        onClick={(e) => choose(v, e.clientX || undefined, e.clientY || undefined)}
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            gap: 10,
                                                            minWidth: narrow ? 58 : undefined,
                                                            background: "transparent",
                                                            border: "none",
                                                            padding: 4,
                                                            cursor: "pointer",
                                                            color: "inherit",
                                                            fontFamily: FONT,
                                                        }}
                                                    >
                                                        <Orb v={v} size={orbSize} reduced={reduced} active={isOn} />
                                                        <span
                                                            style={{
                                                                fontSize: narrow ? 10 : 13,
                                                                fontWeight: 500,
                                                                letterSpacing: "0.04em",
                                                                color: isOn ? "#fff" : "rgba(255,255,255,0.55)",
                                                                transition: "color .25s",
                                                            }}
                                                        >
                                                            {v.name}
                                                        </span>
                                                    </motion.button>
                                                )
                                            })}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                            <button
                                                type="button"
                                                className="vibe-ui-btn"
                                                aria-expanded={customOpen}
                                                aria-controls="vibe-intro-custom"
                                                onClick={() => {
                                                    if (customOpen) {
                                                        setCustomOpen(false)
                                                        revert()
                                                    } else {
                                                        setCustomOpen(true)
                                                        hover(makeCustomVibe(customColors[0], customColors[1]))
                                                    }
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    minHeight: 44,
                                                    padding: "0 16px 0 10px",
                                                    borderRadius: 999,
                                                    background: "rgba(255,255,255,0.06)",
                                                    border: "1px solid rgba(255,255,255,0.16)",
                                                    color: current.id === "custom" || customOpen ? "#fff" : "rgba(255,255,255,0.7)",
                                                    fontFamily: FONT,
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    letterSpacing: "0.04em",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${customColors[0]}, ${customColors[1]})` }}
                                                />
                                                Custom gradient
                                            </button>
                                            {customOpen && (
                                                <div
                                                    style={{
                                                        padding: 12,
                                                        borderRadius: 18,
                                                        background: "rgba(16,16,18,0.6)",
                                                        border: "1px solid rgba(255,255,255,0.12)",
                                                        backdropFilter: "blur(16px)",
                                                        WebkitBackdropFilter: "blur(16px)",
                                                        maxWidth: "min(460px, 92vw)",
                                                    }}
                                                >
                                                    <CustomPanel id="vibe-intro-custom" colors={customColors} onChange={updateCustomColor} onUse={chooseCustom} dark />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)" }}>
                                            {narrow ? "tap one · you can change it later" : "hover to preview · click to enter · esc to skip"}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </main>

                        {flood && (
                            <motion.div
                                aria-hidden="true"
                                initial={{ clipPath: `circle(0px at ${flood.x}px ${flood.y}px)`, opacity: 1 }}
                                animate={{ clipPath: `circle(160vmax at ${flood.x}px ${flood.y}px)`, opacity: [1, 1, 0] }}
                                transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], opacity: { times: [0, 0.6, 1], duration: 1.0 } }}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    zIndex: 20,
                                    pointerEvents: "none",
                                    background: `radial-gradient(circle at ${flood.x}px ${flood.y}px, ${flood.v.swatch[0]} 0%, ${flood.v.swatch[1]} 30%, ${flood.v.swatch[2]} 75%)`,
                                }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {showSwitcher && !open && (
                <div
                    className="vibe-switcher"
                    style={{
                        position: "fixed",
                        bottom: "clamp(14px,3vh,24px)",
                        [switcherSide]: "clamp(14px,3vw,24px)",
                        zIndex: 9998,
                        pointerEvents: "none",
                        fontFamily: FONT,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: switcherSide === "left" ? "flex-start" : "flex-end",
                        gap: 10,
                    }}
                >
                    <AnimatePresence>
                        {menu && (
                            <motion.div
                                key="menu"
                                id="vibe-menu"
                                role="dialog"
                                aria-label="Color vibe options"
                                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: reduced ? 0.01 : 0.22 }}
                                onMouseLeave={revert}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    padding: 10,
                                    width: "min(340px, calc(100vw - 28px))",
                                    borderRadius: 22,
                                    background: "var(--db-glass, rgba(16,16,18,0.72))",
                                    border: "1px solid var(--db-glass-line, rgba(255,255,255,0.12))",
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    boxShadow: "var(--db-shadow, 0 16px 40px rgba(0,0,0,0.5))",
                                    color: "var(--db-text, rgba(255,255,255,0.9))",
                                    pointerEvents: "auto",
                                }}
                            >
                                <div
                                    role="radiogroup"
                                    aria-label="Change color vibe"
                                    onKeyDown={arrowNav}
                                    style={{ display: "flex", justifyContent: "space-around", gap: 4 }}
                                >
                                    {VIBES.map((v) => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={current.id === v.id}
                                            aria-label={`${v.name} vibe`}
                                            title={v.name}
                                            className="vibe-chip-btn"
                                            onMouseEnter={() => hover(v)}
                                            onFocus={() => hover(v)}
                                            onClick={() => choose(v)}
                                            style={{
                                                width: 44,
                                                height: 44,
                                                display: "grid",
                                                placeItems: "center",
                                                padding: 0,
                                                border: "none",
                                                borderRadius: "50%",
                                                background: "transparent",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Orb v={v} size={32} reduced={reduced} active={current.id === v.id} ring="var(--db-text, rgba(255,255,255,0.9))" />
                                        </button>
                                    ))}
                                </div>
                                <div style={{ borderTop: "1px solid var(--db-glass-line, rgba(255,255,255,0.12))", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "0 4px" }}>
                                        <strong style={{ fontSize: 12, fontWeight: 600, color: "var(--db-text, rgba(255,255,255,0.9))" }}>Custom gradient</strong>
                                        <span style={{ fontSize: 11, color: "var(--db-text-2, rgba(255,255,255,0.6))" }}>
                                            {current.id === "custom" ? "in use" : "pick two colors"}
                                        </span>
                                    </div>
                                    <CustomPanel colors={customColors} onChange={updateCustomColor} onUse={chooseCustom} dark={false} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        ref={chipRef}
                        type="button"
                        className="vibe-chip-btn"
                        aria-expanded={menu}
                        aria-controls="vibe-menu"
                        aria-label={`Change the site's color vibe. Current: ${current.name}`}
                        onClick={() => {
                            if (menu) revert()
                            setMenu((m) => !m)
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 14px 8px 10px",
                            minHeight: 44,
                            borderRadius: 999,
                            border: "1px solid var(--db-glass-line, rgba(255,255,255,0.14))",
                            background: "var(--db-glass, rgba(16,16,18,0.6))",
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            boxShadow: "var(--db-shadow, none)",
                            color: "var(--db-text, rgba(255,255,255,0.8))",
                            fontFamily: FONT,
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            cursor: "pointer",
                            pointerEvents: "auto",
                        }}
                    >
                        <Orb v={current} size={22} reduced={reduced} active={false} />
                        <span aria-hidden="true">
                            <span style={{ color: "var(--db-text-2, rgba(255,255,255,0.6))" }}>vibe · </span>
                            {current.name.toLowerCase()}
                        </span>
                    </button>
                </div>
            )}
        </>
    )
}

addPropertyControls(WorldIntro, {
    showWhen: {
        type: ControlType.Enum,
        title: "Show intro",
        options: ["session", "always", "never"],
        optionTitles: ["Once per visit", "Every load", "Never"],
        defaultValue: "session",
    },
    defaultVibe: {
        type: ControlType.Enum,
        title: "Default vibe",
        options: VIBES.map((v) => v.id),
        optionTitles: VIBES.map((v) => v.name),
        defaultValue: "ember",
    },
    showSwitcher: { type: ControlType.Boolean, title: "Vibe chip", defaultValue: true },
    switcherSide: {
        type: ControlType.Enum,
        title: "Chip side",
        options: ["left", "right"],
        optionTitles: ["Left", "Right"],
        defaultValue: "left",
        displaySegmentedControl: true,
        hidden: (p: any) => !p.showSwitcher,
    },
    cursorName: { type: ControlType.String, title: "Cursor Name", defaultValue: "dhwani", hidden: () => true },
    accentColor: { type: ControlType.Color, title: "Accent", defaultValue: "#F3500F", hidden: () => true },
})
