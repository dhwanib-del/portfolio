// WorldIntro v5 (Oct 22) — "design the hero, pick a vibe".
// Once per session, skippable, fast. A glass Figma-style card floats over the site: "hi, i'm Dhwani"
// (Dhwani in Pinyon Script) is a selected text layer with handles, and a multiplayer cursor
// labelled "you" sits on it. The vibes are a record crate (Orange · warm house, Blue · lo-fi,
// Pink · pop, Yellow · game day). Picking one recolors the layer's fill, the cursor clicks it in,
// and the track's waveform bounces once in the new color. "enter" commits; "skip"/Esc just close.
// Performance: blur only on the card, no loops (every animation is finite, ~0.9s in, 0.3s out),
// no rAF; the modal downgrades to non-modal + pointer-events:none during the fade, then unmounts.
// Reduced motion: no animation, instant close.
// Unchanged contract (from v1–v4): same vibe ids/colors, apply() sets --vibe-a/b/c + --vibe-accent
// (the nav maps it to --db-accent; light mode gets the ink override), saves db_vibe / vibe /
// custom-vibe-colors, dispatches "db-vibe", db_intro_seen in sessionStorage, the light/dark
// switch via the nav's sun/moon, the vibe chip + custom colors after the intro, and the inlined
// site polish layer (glass nav, fluid case type, font + arrow cleanup).
import * as React from "react"
import {
    startTransition,
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
} from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType, RenderTarget } from "framer"


type Vibe = {
    id: string
    name: string
    title: string
    accent: string
    a: string
    b: string
    c: string
}
const VIBES: Vibe[] = [
    {
        id: "ember",
        name: "Orange",
        title: "Orange",
        accent: "#F3500F",
        a: "rgba(255,140,60,.38)",
        b: "rgba(243,80,15,.50)",
        c: "rgba(255,203,5,.16)",
    },
    {
        id: "goblue",
        name: "Blue",
        title: "Blue",
        accent: "#38BDF8",
        a: "rgba(125,211,252,.32)",
        b: "rgba(56,189,248,.50)",
        c: "rgba(2,132,199,.22)",
    },
    {
        id: "afterhours",
        name: "Pink",
        title: "Pink",
        accent: "#FF4D8D",
        a: "rgba(255,177,153,.32)",
        b: "rgba(255,77,141,.46)",
        c: "rgba(123,92,255,.20)",
    },
    {
        id: "greenroom",
        name: "Yellow",
        title: "Yellow",
        accent: "#FACC15",
        a: "rgba(254,240,138,.35)",
        b: "rgba(250,204,21,.48)",
        c: "rgba(234,179,8,.22)",
    },
]
const DEFAULT_COLORS: [string, string] = ["#8B5CF6", "#F3500F"]
const LEGACY: Record<string, string> = {
    cherry: "afterhours",
    nightshift: "goblue",
}
const validHex = (x: unknown): x is string =>
    typeof x === "string" && /^#[0-9a-f]{6}$/i.test(x)
function rgb(hex: string) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
}
function lum(r: number, g: number, b: number) {
    const ch = (n: number) => {
        const s = n / 255
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}
function ink(hex: string) {
    const c = rgb(hex)
    for (let k = 100; k >= 0; k -= 2) {
        const v = c.map((x) => Math.round((x * k) / 100)) as [
            number,
            number,
            number,
        ]
        if ((lum(224, 224, 224) + 0.05) / (lum(...v) + 0.05) >= 4.5)
            return "#" + v.map((x) => x.toString(16).padStart(2, "0")).join("")
    }
    return "#000000"
}
const onAccent = (hex: string) =>
    lum(...rgb(hex)) > 0.22 ? "#0a0a0a" : "#ffffff"
function custom(colors: [string, string]): Vibe {
    const rgba = (hex: string, a: number) => `rgba(${rgb(hex).join(",")},${a})`
    return {
        id: "custom",
        name: "Custom",
        title: "Custom",
        accent: colors[1],
        a: rgba(colors[0], 0.34),
        b: rgba(colors[1], 0.48),
        c: rgba(colors[0], 0.18),
    }
}
function apply(v: Vibe, save: boolean) {
    const root = document.documentElement
    root.dataset.vibe = v.id
    for (const key of ["a", "b", "c"] as const)
        root.style.setProperty(`--vibe-${key}`, v[key])
    root.style.setProperty("--vibe-accent", v.accent)
    root.style.setProperty("--vibe-accent-ink", ink(v.accent))
    root.style.setProperty("--vibe-on-accent", onAccent(v.accent))
    let inkStyle = document.getElementById("db-vibe-ink")
    if (!inkStyle) {
        inkStyle = document.createElement("style")
        inkStyle.id = "db-vibe-ink"
        document.head.appendChild(inkStyle)
    }
    inkStyle.textContent =
        ':root[data-db-theme="light"]{--db-accent:var(--vibe-accent-ink)!important}'
    if (save)
        try {
            localStorage.setItem("vibe", v.id)
            localStorage.setItem(
                "db_vibe",
                JSON.stringify({
                    id: v.id,
                    a: v.a,
                    b: v.b,
                    c: v.c,
                    accent: v.accent,
                })
            )
        } catch {}
    window.dispatchEvent(
        new CustomEvent("db-vibe", {
            detail: {
                id: v.id,
                a: v.a,
                b: v.b,
                c: v.c,
                accent: v.accent,
                preview: !save,
            },
        })
    )
}
function restore(defaultVibe: string) {
    let colors: [string, string] = [...DEFAULT_COLORS],
        id = defaultVibe
    try {
        const saved = JSON.parse(
            localStorage.getItem("custom-vibe-colors") || "null"
        )
        if (Array.isArray(saved) && validHex(saved[0]) && validHex(saved[1]))
            colors = [saved[0], saved[1]]
        const raw = localStorage.getItem("db_vibe")
        let stored: unknown = null
        if (raw)
            try {
                stored = JSON.parse(raw)
            } catch {
                stored = raw
            }
        const value =
            typeof stored === "string"
                ? stored
                : (stored as { id?: unknown } | null)?.id
        id =
            typeof value === "string"
                ? value
                : localStorage.getItem("vibe") || defaultVibe
    } catch {}
    return {
        colors,
        vibe:
            id === "custom"
                ? custom(colors)
                : VIBES.find((v) => v.id === (LEGACY[id] || id)) || VIBES[0],
    }
}

// ── Site polish ──────────────────────────────────────────────────────────────────────────────
const ARROW =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 12h15'/%3E%3Cpath d='M13 6l6 6-6 6'/%3E%3C/svg%3E\")"

const SP_CSS = `
:root{--sp-glass:rgba(28,28,30,.46);--sp-glass-strong:rgba(22,22,24,.72);--sp-edge:rgba(255,255,255,.13);--sp-hi:rgba(255,255,255,.16);--sp-drop:0 12px 32px -14px rgba(0,0,0,.55)}
:root[data-db-theme="light"]{--sp-glass:rgba(255,255,255,.56);--sp-glass-strong:rgba(255,255,255,.82);--sp-edge:rgba(0,0,0,.08);--sp-hi:rgba(255,255,255,.95);--sp-drop:0 12px 30px -16px rgba(0,0,0,.28)}
[data-dbnav]>nav,[data-dbnav]>div:not([aria-hidden]){background:var(--sp-glass) !important;-webkit-backdrop-filter:blur(22px) saturate(180%) !important;backdrop-filter:blur(22px) saturate(180%) !important;border:.5px solid var(--sp-edge) !important;box-shadow:inset 0 1px 0 var(--sp-hi),var(--sp-drop) !important}
[data-dbnav]>#dbnav-sheet{background:var(--sp-glass-strong) !important}
[data-dbnav]>nav{padding:4px 4px 4px 12px !important;gap:4px !important}
[data-dbnav]>nav .dbnav-tab{min-height:32px !important;padding:0 12px !important;font-size:14px !important;letter-spacing:0 !important}
[data-dbnav]>nav .dbnav-tab>span[aria-hidden]{bottom:3px !important}
[data-dbnav]>nav>button{width:32px !important;height:32px !important}
[data-dbnav]>nav>span[aria-hidden]:first-child{gap:5px !important}
[data-dbnav]>nav>span[aria-hidden]:first-child>span{width:8px !important;height:8px !important;opacity:.85}
[data-dbnav]>div:not([aria-hidden]):not(#dbnav-sheet){min-height:48px !important;padding:2px 2px 2px 14px !important}
[data-dbnav] .dbnav-tab:hover{color:var(--db-text) !important}
[data-csnav]>div:not([aria-hidden]),[data-csnav]>nav,[data-csnav]>button{background:var(--sp-glass) !important;-webkit-backdrop-filter:blur(22px) saturate(180%) !important;backdrop-filter:blur(22px) saturate(180%) !important;border:.5px solid var(--sp-edge) !important;box-shadow:inset 0 1px 0 var(--sp-hi),var(--sp-drop) !important}
[data-csnav]>nav{background:var(--sp-glass-strong) !important}
@media (prefers-reduced-transparency: reduce){
[data-dbnav]>nav,[data-dbnav]>div:not([aria-hidden]),[data-csnav]>div:not([aria-hidden]),[data-csnav]>nav,[data-csnav]>button{-webkit-backdrop-filter:none !important;backdrop-filter:none !important;background:var(--db-surface,#111) !important}
}
:root[data-db-case] :is([data-cs-rail],nav.csr-m,[data-framer-name="Chapter sidebar"],[data-framer-name="ChapterSidebar"],[data-framer-name="Design Studio Nav"]){display:none !important}
.framer-text{overflow-wrap:break-word}
[data-sp-font]{font-family:'Poppins','Poppins Placeholder',sans-serif !important;--framer-font-family:'Poppins','Poppins Placeholder',sans-serif !important}
.sw-pill-arrow,.ts-work-arrow,.sp-arrow{display:inline-block !important;width:1.05em;height:1.05em;font-size:inherit;color:transparent !important;background:currentColor;-webkit-mask:${ARROW} center/contain no-repeat;mask:${ARROW} center/contain no-repeat;vertical-align:-.16em;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.sw-pill-arrow,.ts-work-arrow{background:var(--db-text,#fff)}
.sw-link .sw-pill-arrow{background:currentColor}
a:hover .sp-arrow,a:focus-visible .sp-arrow,.ts-work-cta:hover .ts-work-arrow,.sw-link:hover .sw-pill-arrow{transform:translateX(3px) !important}
:root[data-db-case] .db-case-cta svg{display:none !important}
:root[data-db-case] .db-case-cta::after{content:"";flex-shrink:0;width:44px;height:44px;border-radius:999px;background:var(--db-accent,#F3500F);-webkit-mask:none;transition:transform .3s cubic-bezier(.16,1,.3,1);background-image:${ARROW.replace("stroke='black'", "stroke='%230A0A0A'")};background-repeat:no-repeat;background-position:center;background-size:20px}
:root[data-db-case] .db-case-cta:hover::after,:root[data-db-case] .db-case-cta:focus-visible::after{transform:translateX(4px)}
@media (prefers-reduced-motion: reduce){.sp-arrow,.sw-pill-arrow,.ts-work-arrow,:root[data-db-case] .db-case-cta::after{transition:none !important}}
`

const OFF_FONTS = /(^|[\s,"'])(Inter|Satoshi|Cormorant Garamond|Cormorant)(["',\s]|$)/i
const CTA =
    /^(open the (live )?prototype|view (the )?(live )?prototype|view (the )?work|view final (project|report)|see the (live )?prototype|explore the prototype)/i
const GLYPH = /\s*[↗↖→➝➜⟶›»]\s*$/

function fontPass() {
    document
        .querySelectorAll<HTMLElement>(
            ".framer-text:not([data-sp-font]), [data-framer-component-type='RichTextContainer']:not([data-sp-font])"
        )
        .forEach((el) => {
            if (el.closest("[data-sp-keep-font]")) return
            const ff = getComputedStyle(el).fontFamily || ""
            if (/Pinyon/i.test(ff)) return
            if (OFF_FONTS.test(ff)) el.setAttribute("data-sp-font", "")
        })
}

function fluidPass() {
    if (!document.documentElement.hasAttribute("data-db-case")) return
    document
        .querySelectorAll<HTMLElement>(
            "h1.framer-text, h2.framer-text, h3.framer-text, p.framer-text"
        )
        .forEach((el) => {
            if (el.closest("[data-csnav],[data-dbnav],[data-db-keep]")) return
            let base = parseFloat(el.dataset.spBase || "")
            if (!base) {
                base = parseFloat(getComputedStyle(el).fontSize)
                if (!base) return
                el.dataset.spBase = String(base)
            }
            if (base < 26) return
            const min = Math.max(22, Math.round(base * 0.6))
            const vw = (base / 12.8).toFixed(3)
            const v = `clamp(${min}px, ${vw}vw, ${base}px)`
            if (el.style.fontSize === v) return
            el.style.fontSize = v
            el.style.setProperty("--framer-font-size", v)
        })
}

function ctaPass() {
    document.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
        if (a.dataset.spCta || a.closest("[data-dbnav],[data-csnav]")) return
        const text = (a.textContent || "").trim()
        if (!CTA.test(text)) return
        a.dataset.spCta = "1"
        if (a.querySelector(".ts-work-arrow,.sw-pill-arrow,.sp-arrow")) return
        const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT)
        let last: Text | null = null
        while (walker.nextNode()) {
            const n = walker.currentNode as Text
            if ((n.nodeValue || "").trim()) last = n
        }
        if (last && GLYPH.test(last.nodeValue || "")) {
            last.nodeValue = (last.nodeValue || "").replace(GLYPH, "")
        }
        if (!document.documentElement.hasAttribute("data-db-case")) {
            a.querySelectorAll("svg").forEach((s) => {
                const r = s.getBoundingClientRect()
                if (r.width <= 40) (s as SVGElement).style.display = "none"
            })
            const host =
                (last && (last.parentElement as HTMLElement)) ||
                (a as HTMLElement)
            if (!host.querySelector(".sp-arrow")) {
                const i = document.createElement("span")
                i.className = "sp-arrow"
                i.setAttribute("aria-hidden", "true")
                i.style.marginLeft = "0.45em"
                host.appendChild(i)
            }
        }
    })
}

let polishStarted = false
function startPolish() {
    if (polishStarted || typeof document === "undefined") return
    polishStarted = true
    if (!document.getElementById("sp-css")) {
        const s = document.createElement("style")
        s.id = "sp-css"
        s.textContent = SP_CSS
        document.head.appendChild(s)
    }
    let t: ReturnType<typeof setTimeout> | undefined
    const run = () => {
        clearTimeout(t)
        t = setTimeout(() => {
            try {
                fontPass()
                fluidPass()
                ctaPass()
            } catch {}
        }, 120)
    }
    run()
    setTimeout(run, 900)
    setTimeout(run, 2500)
    new MutationObserver(run).observe(document.body, {
        childList: true,
        subtree: true,
    })
    window.addEventListener("resize", run)
}

export type WorldIntroProps = {
    showWhen?: "session" | "always" | "never"
    showSwitcher?: boolean
    switcherSide?: "left" | "right"
    defaultVibe?: string
    canvasPreview?: boolean
}

function Arrow() {
    return (
        <svg
            className="wi-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 12h15" />
            <path d="M13 6l6 6-6 6" />
        </svg>
    )
}
function Eq() {
    return (
        <span className="wi-eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
        </span>
    )
}
function Disc({ color, size = 22 }: { color: string; size?: number }) {
    return (
        <span
            className="wi-disc"
            aria-hidden="true"
            style={{ width: size, height: size, "--d": color } as CSSProperties}
        />
    )
}

// Set the site theme the same way the nav's sun/moon does: click it, so all of its theme work runs.
// Without a nav on the page, set the attribute + storage + event ourselves.
function setSiteTheme(want: "light" | "dark") {
    if (typeof document === "undefined") return
    const html = document.documentElement
    if (html.getAttribute("data-db-theme") === want) return
    const btn = document.querySelector<HTMLButtonElement>(
        `button[aria-label="${want === "light" ? "Switch to light mode" : "Switch to dark mode"}"]`
    )
    if (btn) {
        btn.click()
        return
    }
    try {
        localStorage.setItem("db_theme", want)
    } catch {}
    html.setAttribute("data-db-theme", want)
    html.style.colorScheme = want
    try {
        window.dispatchEvent(new CustomEvent("db-theme", { detail: { theme: want } }))
    } catch {}
}

function Sun() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
        </svg>
    )
}
function Moon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
    )
}

// What each color sounds like. Labels only: the vibe ids, colors and storage are unchanged.
const TRACKS: Record<string, { genre: string; bpm: number }> = {
    ember: { genre: "warm house", bpm: 124 },
    goblue: { genre: "lo-fi", bpm: 82 },
    afterhours: { genre: "pop", bpm: 118 },
    greenroom: { genre: "game day", bpm: 140 },
    custom: { genre: "your mix", bpm: 100 },
}
const track = (v: Vibe) => TRACKS[v.id] || TRACKS.custom

// A short static waveform, a different shape per track. It bounces once when the track changes.
function Wave({ id }: { id: string }) {
    let seed = 7
    for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 9973
    const bars = Array.from({ length: 36 }, (_, i) => {
        const a = Math.sin(seed * 0.37 + i * 1.31) * 0.5 + 0.5
        const b = Math.sin(i * 0.42 + (seed % 11)) * 0.5 + 0.5
        return 0.16 + 0.84 * (0.45 * a + 0.55 * b)
    })
    return (
        <span className="wi-wave" aria-hidden="true">
            {bars.map((h, i) => (
                <i
                    key={i}
                    style={
                        {
                            height: `${Math.round(h * 100)}%`,
                            animationDelay: `${i * 9}ms`,
                        } as CSSProperties
                    }
                />
            ))}
        </span>
    )
}

function Pointer() {
    return (
        <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true">
            <path
                d="M1.5 1.5 14 11.2l-5.6.6-3.1 5.9z"
                fill="currentColor"
                stroke="#fff"
                strokeWidth="1.3"
                strokeLinejoin="round"
            />
        </svg>
    )
}

/** @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any */
export default function WorldIntro({
    showWhen = "session",
    showSwitcher = true,
    switcherSide = "left",
    defaultVibe = "ember",
    canvasPreview = RenderTarget.current() === RenderTarget.canvas,
}: WorldIntroProps) {
    const [ready, setReady] = useState(false),
        [open, setOpen] = useState(false),
        [leaving, setLeaving] = useState(false)
    const [selected, setSelected] = useState<Vibe>(VIBES[0]),
        [colors, setColors] = useState<[string, string]>(DEFAULT_COLORS)
    const [menu, setMenu] = useState(false),
        [customOpen, setCustomOpen] = useState(false)
    const [light, setLight] = useState(false)
    const [tap, setTap] = useState(0)
    const dialog = useRef<HTMLDialogElement>(null),
        trigger = useRef<HTMLButtonElement>(null),
        panel = useRef<HTMLDivElement>(null)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
        uid = useId()

    useEffect(() => {
        if (!canvasPreview) startPolish()
    }, [canvasPreview])

    // Follow the site theme (the nav's sun/moon sets data-db-theme; otherwise the OS setting)
    useEffect(() => {
        if (typeof window === "undefined") return
        const root = document.documentElement
        const mq = window.matchMedia("(prefers-color-scheme: light)")
        const sync = () => {
            const t = root.getAttribute("data-db-theme")
            setLight(t ? t === "light" : mq.matches)
        }
        sync()
        const mo = new MutationObserver(sync)
        mo.observe(root, { attributes: true, attributeFilter: ["data-db-theme"] })
        mq.addEventListener("change", sync)
        return () => {
            mo.disconnect()
            mq.removeEventListener("change", sync)
        }
    }, [])

    useEffect(() => {
        if (canvasPreview) return
        const root = document.documentElement
        let owns = false
        const acquire = () => {
            if (root.dataset.dbWorldOwner && root.dataset.dbWorldOwner !== uid)
                return
            owns = true
            root.dataset.dbWorldOwner = uid
            const saved = restore(defaultVibe)
            apply(saved.vibe, false)
            let seen = false
            try {
                seen = !!sessionStorage.getItem("db_intro_seen")
            } catch {}
            startTransition(() => {
                setSelected(saved.vibe)
                setColors(saved.colors)
                setReady(true)
                setOpen(
                    showWhen === "always" || (showWhen === "session" && !seen)
                )
            })
        }
        acquire()
        window.addEventListener("db-world-owner-release", acquire)
        return () => {
            window.removeEventListener("db-world-owner-release", acquire)
            if (timer.current) clearTimeout(timer.current)
            if (owns && root.dataset.dbWorldOwner === uid) {
                delete root.dataset.dbWorldOwner
                window.dispatchEvent(new Event("db-world-owner-release"))
            }
        }
    }, [showWhen, defaultVibe, canvasPreview, uid])

    // While open: modal dialog (native focus containment + inert page), scroll locked.
    useEffect(() => {
        const d = dialog.current
        if (!open || !d) return
        const previous =
                document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null,
            overflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        document.documentElement.dataset.dbIntro = "open"
        if (!d.open) d.showModal()
        d.querySelector<HTMLButtonElement>(
            ".wi-crate [aria-checked='true'], .wi-crate [tabindex='0']"
        )?.focus({ preventScroll: true })
        return () => {
            document.body.style.overflow = overflow
            delete document.documentElement.dataset.dbIntro
            const main = document.getElementById("main")
            if (previous && previous !== document.body && previous.isConnected)
                previous.focus({ preventScroll: true })
            else if (main) {
                if (!main.hasAttribute("tabindex")) main.tabIndex = -1
                main.focus({ preventScroll: true })
            }
        }
    }, [open])

    useEffect(() => {
        if (!menu) return
        panel.current
            ?.querySelector<HTMLButtonElement>("button[aria-checked='true']")
            ?.focus()
        const close = () => {
            setMenu(false)
            apply(selected, false)
        }
        const outside = (e: PointerEvent | FocusEvent) => {
            if (
                e.target instanceof Node &&
                !panel.current?.contains(e.target) &&
                !trigger.current?.contains(e.target)
            )
                close()
        }
        const key = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape") {
                close()
                trigger.current?.focus()
            }
        }
        document.addEventListener("pointerdown", outside)
        document.addEventListener("focusin", outside)
        document.addEventListener("keydown", key)
        return () => {
            document.removeEventListener("pointerdown", outside)
            document.removeEventListener("focusin", outside)
            document.removeEventListener("keydown", key)
        }
    }, [menu, selected])

    function choose(v: Vibe) {
        if (v.id !== selected.id || v.id === "custom") setTap((n) => n + 1)
        setSelected(v)
        if (!canvasPreview) apply(v, true)
        if (v.id === "custom")
            try {
                localStorage.setItem("custom-vibe-colors", JSON.stringify(colors))
            } catch {}
        if (!open && menu) {
            setMenu(false)
            trigger.current?.focus()
        }
    }
    // Enter and skip both close; enter also commits the vibe on screen. One short fade, then the
    // dialog unmounts. The modal is downgraded first so the page is clickable during the fade.
    function close(commit: boolean) {
        if (leaving || canvasPreview) return
        if (commit) apply(selected, true)
        try {
            sessionStorage.setItem("db_intro_seen", "1")
        } catch {}
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
        const d = dialog.current
        if (reduce || !d) {
            setOpen(false)
            return
        }
        try {
            d.close()
            d.show()
        } catch {}
        setLeaving(true)
        timer.current = setTimeout(() => {
            timer.current = null
            setOpen(false)
            setLeaving(false)
        }, 300)
    }
    function arrows(e: KeyboardEvent<HTMLDivElement>) {
        if (
            ![
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
            ].includes(e.key)
        )
            return
        const buttons = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>(
                    "button[role='radio']"
                )
            ),
            i = buttons.indexOf(document.activeElement as HTMLButtonElement)
        const next =
            e.key === "Home"
                ? 0
                : e.key === "End"
                  ? buttons.length - 1
                  : (i +
                        (e.key === "ArrowRight" || e.key === "ArrowDown"
                            ? 1
                            : -1) +
                        buttons.length) %
                    buttons.length
        e.preventDefault()
        buttons[next]?.focus()
        choose(VIBES[next])
    }

    function pickMode(m: "light" | "dark") {
        setLight(m === "light")
        if (!canvasPreview) setSiteTheme(m)
    }
    const modeSwitch = (
        <div className="wi-mode" role="radiogroup" aria-label="Theme">
            {(["dark", "light"] as const).map((m) => {
                const on = (m === "light") === light
                return (
                    <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        tabIndex={on ? 0 : -1}
                        onClick={() => pickMode(m)}
                        onKeyDown={(e) => {
                            if (
                                [
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "ArrowUp",
                                    "ArrowDown",
                                ].includes(e.key)
                            ) {
                                e.preventDefault()
                                const to = light ? "dark" : "light"
                                pickMode(to)
                                e.currentTarget.parentElement
                                    ?.querySelector<HTMLButtonElement>(
                                        `[data-m="${to}"]`
                                    )
                                    ?.focus()
                            }
                        }}
                        data-m={m}
                    >
                        {m === "dark" ? <Moon /> : <Sun />}
                        <span>{m}</span>
                    </button>
                )
            })}
        </div>
    )

    // The record crate: one radio per vibe. Arrows move + apply, Enter confirms (in the intro).
    const crate = (inIntro: boolean) => (
        <div
            className="wi-crate"
            role="radiogroup"
            aria-labelledby={inIntro ? `${uid}-pick` : `${uid}-pick-m`}
            onKeyDown={arrows}
        >
            {VIBES.map((v) => {
                const on = selected.id === v.id
                const t = track(v)
                return (
                    <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={`${v.title}, ${t.genre}`}
                        tabIndex={
                            on || (selected.id === "custom" && v.id === "ember")
                                ? 0
                                : -1
                        }
                        className="wi-rec"
                        style={{ "--t": v.accent } as CSSProperties}
                        onMouseEnter={
                            inIntro ? undefined : () => apply(v, false)
                        }
                        onMouseLeave={
                            inIntro ? undefined : () => apply(selected, false)
                        }
                        onClick={() => choose(v)}
                        onKeyDown={
                            inIntro
                                ? (e) => {
                                      if (e.key === "Enter") {
                                          e.preventDefault()
                                          close(true)
                                      }
                                  }
                                : undefined
                        }
                    >
                        <Disc color={v.accent} size={30} />
                        <span className="wi-rec-t">
                            <strong>{v.title}</strong>
                            <span>{t.genre}</span>
                        </span>
                        <span className="wi-rec-end" aria-hidden="true">
                            {on ? (
                                <Eq key={tap} />
                            ) : (
                                <span className="wi-bpm">{t.bpm}</span>
                            )}
                        </span>
                    </button>
                )
            })}
        </div>
    )

    const t = track(selected)
    const hex = selected.accent.slice(1).toUpperCase()
    const vars = {
        "--wi-accent": selected.accent,
        "--wi-ink": light ? ink(selected.accent) : selected.accent,
        "--wi-on": onAccent(selected.accent),
        "--wi-a": selected.a,
        "--wi-b": selected.b,
        "--wi-c": selected.c,
    } as CSSProperties

    const card = (
        <div className="wi-card" data-light={light}>
            <div className="wi-top">
                <span className="wi-tool" aria-hidden="true">
                    <Pointer />
                </span>
                <span className="wi-file">
                    dhwani<span className="wi-dim">.fig</span>
                    <span className="wi-crumb"> / hero</span>
                </span>
                <span className="wi-avatars" aria-hidden="true">
                    <b className="wi-av-d">D</b>
                    <b className="wi-av-you">you</b>
                </span>
            </div>
            <div className="wi-body">
                <div className="wi-stage">
                    <span className="wi-frame-label" aria-hidden="true">
                        # hero
                    </span>
                    <div className="wi-frame">
                        <div className="wi-sel">
                            <h1 id={`${uid}-title`} className="wi-title">
                                <span className="wi-hi">hi, i&#8217;m </span>
                                <span className="wi-name">Dhwani</span>
                            </h1>
                            <i className="wi-h wi-h1" aria-hidden="true" />
                            <i className="wi-h wi-h2" aria-hidden="true" />
                            <i className="wi-h wi-h3" aria-hidden="true" />
                            <i className="wi-h wi-h4" aria-hidden="true" />
                            <span className="wi-dims" aria-hidden="true">
                                Text · Fill #{hex}
                            </span>
                            <span className="wi-cursor" aria-hidden="true">
                                <span className="wi-cursor-in" key={tap}>
                                    <Pointer />
                                    <b>you</b>
                                </span>
                                {tap > 0 && (
                                    <i className="wi-ripple" key={`r${tap}`} />
                                )}
                            </span>
                        </div>
                        <div className="wi-deck">
                            <Wave key={selected.id} id={selected.id} />
                            <p className="wi-now" aria-live="polite">
                                <span className="wi-now-k">now playing</span>
                                <span className="wi-now-t">
                                    {selected.title.toLowerCase()} — {t.genre}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="wi-panel">
                    <div className="wi-panel-head">
                        <h2 id={`${uid}-pick`}>pick a vibe</h2>
                        <span className="wi-meta" aria-hidden="true">
                            side A · {VIBES.length} tracks
                        </span>
                    </div>
                    {crate(true)}
                    <div className="wi-props">
                        <div className="wi-prop">
                            <span className="wi-prop-k">Fill</span>
                            <span className="wi-fill">
                                <i aria-hidden="true" />
                                {hex}
                                <em>100%</em>
                            </span>
                        </div>
                        <div className="wi-prop">
                            <span className="wi-prop-k">Theme</span>
                            {modeSwitch}
                        </div>
                    </div>
                    <div className="wi-actions">
                        <button
                            type="button"
                            className="wi-skip"
                            onClick={() => close(false)}
                        >
                            skip <kbd>esc</kbd>
                        </button>
                        <button
                            type="button"
                            className="wi-enter"
                            onClick={() => close(true)}
                        >
                            enter <Arrow />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    if (canvasPreview)
        return (
            <>
                <style>{CSS}</style>
                <div className="wi-canvas" style={vars} data-light={light}>
                    {card}
                </div>
            </>
        )
    if (!ready) return null
    return (
        <>
            <style>{CSS}</style>
            {createPortal(
                <>
                    {open && (
                        <dialog
                            ref={dialog}
                            className="wi-dialog"
                            aria-labelledby={`${uid}-title`}
                            data-leaving={leaving}
                            data-light={light}
                            style={vars}
                            onCancel={(e) => {
                                e.preventDefault()
                                close(false)
                            }}
                        >
                            {card}
                        </dialog>
                    )}
                    {!open && showSwitcher && (
                        <div
                            className="wi-switcher"
                            data-side={switcherSide}
                            style={
                                {
                                    "--wi-accent": selected.accent,
                                } as CSSProperties
                            }
                        >
                            {menu && (
                                <div
                                    ref={panel}
                                    id={`${uid}-menu`}
                                    className="wi-popover"
                                >
                                    <p className="wi-sec">Theme</p>
                                    {modeSwitch}
                                    <p
                                        className="wi-sec wi-sec-gap"
                                        id={`${uid}-pick-m`}
                                    >
                                        Pick a vibe
                                    </p>
                                    {crate(false)}
                                    <button
                                        className="wi-remix-toggle"
                                        type="button"
                                        aria-expanded={customOpen}
                                        onClick={() => setCustomOpen((x) => !x)}
                                    >
                                        {customOpen ? "Close" : "Custom colors"}
                                    </button>
                                    {customOpen && (
                                        <div className="wi-remix">
                                            {([0, 1] as const).map((index) => (
                                                <label key={index}>
                                                    {index ? "to" : "from"}
                                                    <input
                                                        type="color"
                                                        value={colors[index]}
                                                        aria-label={
                                                            index
                                                                ? "Second gradient color"
                                                                : "First gradient color"
                                                        }
                                                        onChange={(e) => {
                                                            const next: [
                                                                string,
                                                                string,
                                                            ] = [...colors]
                                                            next[index] =
                                                                e.target.value
                                                            setColors(next)
                                                            apply(
                                                                custom(next),
                                                                false
                                                            )
                                                        }}
                                                    />
                                                </label>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    choose(custom(colors))
                                                }
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                ref={trigger}
                                className="wi-chip"
                                type="button"
                                aria-expanded={menu}
                                aria-controls={`${uid}-menu`}
                                aria-label={`Change vibe. Current: ${selected.title}`}
                                onClick={() => {
                                    if (menu) apply(selected, false)
                                    setMenu((x) => !x)
                                }}
                            >
                                <Disc color={selected.accent} size={18} />
                                <span className="wi-chip-t">
                                    {selected.title.toLowerCase()}
                                </span>
                                <Eq />
                            </button>
                        </div>
                    )}
                </>,
                document.body
            )}
        </>
    )
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Poppins:wght@400;500;600&display=swap");
@property --wi-a{syntax:'<color>';inherits:true;initial-value:transparent}
@property --wi-b{syntax:'<color>';inherits:true;initial-value:transparent}
@property --wi-c{syntax:'<color>';inherits:true;initial-value:transparent}
@property --wi-accent{syntax:'<color>';inherits:true;initial-value:#F3500F}
@property --wi-ink{syntax:'<color>';inherits:true;initial-value:#F3500F}

/* tokens: the site's --db-* when the nav is on the page, black/white fallbacks otherwise */
.wi-dialog,.wi-canvas{--wi-bg:var(--db-bg,#000);--wi-text:var(--db-text,#fff);--wi-text-2:var(--db-text-2,rgba(255,255,255,.6));--wi-line:var(--db-line,rgba(255,255,255,.1));--wi-edge:rgba(255,255,255,.14);--wi-hi:rgba(255,255,255,.12);--wi-glass:rgba(16,16,18,.66);--wi-soft:rgba(255,255,255,.05);--wi-dot:rgba(255,255,255,.09);--wi-drop:0 40px 90px -30px rgba(0,0,0,.85);color-scheme:dark;transition:--wi-a .5s ease,--wi-b .5s ease,--wi-c .5s ease,--wi-accent .35s ease,--wi-ink .35s ease}
.wi-dialog[data-light=true],.wi-canvas[data-light=true]{--wi-bg:var(--db-bg,#fff);--wi-text:var(--db-text,#0a0a0a);--wi-text-2:var(--db-text-2,rgba(0,0,0,.62));--wi-line:var(--db-line,rgba(0,0,0,.12));--wi-edge:rgba(255,255,255,.9);--wi-hi:rgba(255,255,255,.95);--wi-glass:rgba(255,255,255,.7);--wi-soft:rgba(0,0,0,.035);--wi-dot:rgba(0,0,0,.1);--wi-drop:0 40px 80px -36px rgba(0,0,0,.35);color-scheme:light}

.wi-dialog{box-sizing:border-box;position:fixed;inset:0;width:100%;max-width:none;height:100%;height:100dvh;max-height:none;margin:0;padding:16px;border:0;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;z-index:2147483000;color:var(--wi-text);background-color:color-mix(in srgb,var(--wi-bg) 80%,transparent);background-image:radial-gradient(42% 46% at 26% 30%,var(--wi-b),transparent 70%),radial-gradient(40% 44% at 76% 72%,var(--wi-a),transparent 70%),radial-gradient(30% 30% at 62% 18%,var(--wi-c),transparent 70%),radial-gradient(var(--wi-dot) 1px,transparent 1.3px);background-size:auto,auto,auto,22px 22px;animation:wi-fade .2s ease-out both}
.wi-dialog::backdrop{background:transparent}
.wi-dialog[data-leaving=true]{pointer-events:none;opacity:0;transition:opacity .3s ease}
.wi-dialog[data-leaving=true] .wi-card{transform:scale(1.015);opacity:0;transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .26s ease}

.wi-card,.wi-switcher{font-family:'Poppins','Poppins Placeholder',sans-serif}
.wi-card *,.wi-switcher *{box-sizing:border-box}
.wi-card button,.wi-switcher button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.wi-card :focus-visible,.wi-switcher :focus-visible{outline:2px solid var(--wi-accent,#F3500F);outline-offset:2px}
.wi-card h1,.wi-card h2,.wi-card p{margin:0}

/* the glass card */
.wi-card{position:relative;width:min(940px,100%);border-radius:24px;overflow:hidden;color:var(--wi-text);background:var(--wi-glass);-webkit-backdrop-filter:blur(26px) saturate(170%);backdrop-filter:blur(26px) saturate(170%);border:1px solid var(--wi-line);box-shadow:inset 0 1px 0 var(--wi-hi),var(--wi-drop);animation:wi-rise .45s cubic-bezier(.16,1,.3,1) both}
@media (prefers-reduced-transparency: reduce){.wi-card{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--db-surface,#111)}.wi-card[data-light=true]{background:var(--db-surface,#f2f2f2)}}

.wi-top{display:flex;align-items:center;gap:10px;height:46px;padding:0 12px 0 10px;border-bottom:1px solid var(--wi-line);font-size:12.5px}
.wi-tool{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:var(--wi-accent);color:var(--wi-on)}
.wi-tool svg path{stroke:none}
.wi-file{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
.wi-dim,.wi-crumb{color:var(--wi-text-2);font-weight:400}
.wi-avatars{margin-left:auto;display:flex}
.wi-avatars b{height:24px;min-width:24px;padding:0 7px;margin-left:-5px;display:grid;place-items:center;border-radius:999px;font-size:10.5px;font-weight:600;border:2px solid var(--wi-bg)}
.wi-av-d{background:var(--wi-text);color:var(--wi-bg)}
.wi-av-you{background:var(--wi-accent);color:var(--wi-on)}

.wi-body{display:grid;grid-template-columns:minmax(0,1fr) 300px}

/* canvas side */
.wi-stage{position:relative;padding:34px 30px 28px;background-image:radial-gradient(var(--wi-dot) 1px,transparent 1.3px);background-size:18px 18px;display:flex;flex-direction:column;justify-content:center;min-height:360px}
.wi-frame-label{position:absolute;left:30px;top:12px;font-size:11px;color:var(--wi-text-2)}
.wi-frame{position:relative;display:flex;flex-direction:column;gap:22px;padding:42px clamp(22px,4vw,44px) 26px;border-radius:16px;background:var(--wi-soft);border:1px solid var(--wi-line)}
.wi-sel{position:relative;align-self:flex-start;padding:4px 14px 8px 8px;border:1px solid var(--wi-ink)}
.wi-title{display:flex;flex-direction:column;font-weight:400}
.wi-hi{font:500 clamp(17px,2vw,22px)/1.2 'Poppins',sans-serif;letter-spacing:-.01em;color:var(--wi-text);opacity:.9;animation:wi-up .4s .08s cubic-bezier(.16,1,.3,1) both}
.wi-name{display:block;padding:0 .12em 0 .02em;font:400 clamp(70px,9.4vw,118px)/1.08 'Pinyon Script',cursive;color:var(--wi-ink);animation:wi-write .55s .14s cubic-bezier(.65,0,.35,1) both}
.wi-h{position:absolute;width:8px;height:8px;background:#fff;border:1px solid var(--wi-ink);animation:wi-pop .22s cubic-bezier(.34,1.56,.64,1) both}
.wi-h1{left:-4.5px;top:-4.5px;animation-delay:.3s}.wi-h2{right:-4.5px;top:-4.5px;animation-delay:.34s}.wi-h3{left:-4.5px;bottom:-4.5px;animation-delay:.38s}.wi-h4{right:-4.5px;bottom:-4.5px;animation-delay:.42s}
.wi-dims{position:absolute;left:50%;top:calc(100% + 8px);transform:translateX(-50%);padding:2px 7px;border-radius:4px;background:var(--wi-ink);color:var(--wi-bg);font-size:10.5px;font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums;animation:wi-fade .25s .42s both}
.wi-dialog:not([data-light=true]) .wi-dims,.wi-canvas:not([data-light=true]) .wi-dims{color:var(--wi-on)}
.wi-cursor{position:absolute;left:calc(100% - 6px);top:calc(100% - 6px);pointer-events:none;animation:wi-glide .5s .32s cubic-bezier(.16,1,.3,1) both}
.wi-cursor-in{display:flex;flex-direction:column;align-items:flex-start;color:var(--wi-accent);transform-origin:2px 2px;animation:wi-press .22s ease-out}
.wi-cursor-in b{margin:-3px 0 0 13px;padding:3px 8px;border-radius:5px 999px 999px 999px;background:var(--wi-accent);color:var(--wi-on);font-size:11px;font-weight:600;line-height:1.3}
.wi-ripple{position:absolute;left:-10px;top:-10px;width:24px;height:24px;border-radius:50%;border:2px solid var(--wi-accent);opacity:0;animation:wi-ripple .5s ease-out}
.wi-deck{display:flex;align-items:center;gap:16px;margin-top:20px;min-width:0}
.wi-deck>*{flex-shrink:0}.wi-deck .wi-now{flex-shrink:1}
.wi-wave{display:flex;align-items:center;gap:2px;height:28px;flex:0 1 210px;min-width:120px}
.wi-wave i{flex:1;min-width:2px;max-width:4px;border-radius:2px;background:var(--wi-accent);opacity:.9;transform-origin:center;animation:wi-bounce .42s cubic-bezier(.34,1.56,.64,1) both}
.wi-now{display:flex;flex-direction:column;min-width:0;font-size:12px;line-height:1.35}
.wi-now-k{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--wi-text-2)}
.wi-now-t{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* inspector side */
.wi-panel{display:flex;flex-direction:column;gap:14px;padding:18px 16px 16px;border-left:1px solid var(--wi-line)}
.wi-panel-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:0 4px}
.wi-panel-head h2{font-size:15px;font-weight:600;letter-spacing:-.01em}
.wi-meta{font-size:11px;color:var(--wi-text-2)}
.wi-crate{display:grid;gap:4px}
.wi-rec{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:11px;min-height:52px;padding:7px 10px 7px 8px;border:1px solid transparent;border-radius:12px;background:transparent;color:var(--wi-text);text-align:left;transition:background .2s,border-color .2s}
.wi-rec:hover{background:var(--wi-soft)}
.wi-card .wi-rec:focus-visible{outline:1.5px solid var(--t);outline-offset:2px}
.wi-rec[aria-checked=true]{background:color-mix(in srgb,var(--t) 14%,transparent);border-color:color-mix(in srgb,var(--t) 40%,transparent)}
.wi-rec-t{display:flex;flex-direction:column;min-width:0;line-height:1.3}
.wi-rec-t strong{font-size:13.5px;font-weight:500}
.wi-rec-t span{font-size:11.5px;color:var(--wi-text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wi-rec-end{display:flex;align-items:center;min-width:22px;justify-content:flex-end}
.wi-bpm{font-size:11px;color:var(--wi-text-2);font-variant-numeric:tabular-nums}
.wi-bpm::after{content:" bpm"}
.wi-disc{display:inline-block;flex-shrink:0;border-radius:50%;background:radial-gradient(circle,#0b0b0d 0 8%,var(--d) 9% 36%,#141416 37% 100%);box-shadow:inset 0 0 0 1px #ffffff1a,0 0 0 1px #0000000f;transition:transform .45s cubic-bezier(.16,1,.3,1)}
.wi-rec[aria-checked=true] .wi-disc{transform:rotate(200deg)}
.wi-eq{display:inline-flex;align-items:flex-end;gap:2px;height:14px}
.wi-eq i{width:3px;height:100%;border-radius:1px;background:var(--t,var(--wi-accent));transform-origin:bottom;transform:scaleY(.6)}
.wi-rec .wi-eq i{animation:wi-eq .26s ease-in-out 4 alternate backwards}
.wi-eq i:nth-child(2){animation-delay:-.1s;transform:scaleY(1)}.wi-eq i:nth-child(3){animation-delay:-.18s;transform:scaleY(.4)}.wi-eq i:nth-child(4){animation-delay:-.05s;transform:scaleY(.8)}
.wi-props{display:grid;gap:8px;padding:12px 4px 0;border-top:1px solid var(--wi-line)}
.wi-prop{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:34px}
.wi-prop-k{font-size:12px;font-weight:500}
.wi-fill{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-variant-numeric:tabular-nums}
.wi-fill i{width:18px;height:18px;border-radius:5px;background:var(--wi-accent);box-shadow:inset 0 0 0 1px #00000026}
.wi-fill em{font-style:normal;color:var(--wi-text-2)}
.wi-mode{display:inline-grid;grid-template-columns:1fr 1fr;gap:2px;padding:3px;border-radius:10px;background:var(--wi-soft);border:1px solid var(--wi-line)}
.wi-mode button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:30px;padding:0 10px;border:0;border-radius:7px;background:transparent;color:var(--wi-text-2);font-size:12px;font-weight:500;transition:background .2s,color .2s}
.wi-mode button[aria-checked=true]{background:var(--wi-bg);color:var(--wi-text);box-shadow:0 1px 3px #0000002e}
.wi-mode svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.wi-actions{display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:4px}
.wi-skip{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 12px;border:0;border-radius:999px;background:transparent;color:var(--wi-text-2);font-size:13.5px;font-weight:500}
.wi-skip:hover{color:var(--wi-text);background:var(--wi-soft)}
.wi-skip kbd{font:500 10px 'Poppins',sans-serif;padding:2px 5px;border-radius:4px;border:1px solid var(--wi-line)}
.wi-enter{flex:1;display:inline-flex;align-items:center;justify-content:space-between;gap:12px;min-height:46px;padding:0 7px 0 20px;border:0;border-radius:999px;background:var(--wi-accent);color:var(--wi-on);font-size:14.5px;font-weight:600;box-shadow:0 10px 26px -12px var(--wi-accent);transition:transform .2s cubic-bezier(.16,1,.3,1)}
.wi-enter:hover{transform:translateY(-1px)}
.wi-enter .wi-arrow{width:32px;height:32px;padding:7px;border-radius:999px;background:#00000024;transition:transform .25s cubic-bezier(.16,1,.3,1)}
.wi-enter:hover .wi-arrow{transform:translateX(3px)}

/* after the intro: the little vibe chip (static; no running animation) */
.wi-switcher{position:fixed;bottom:max(16px,env(safe-area-inset-bottom));left:16px;z-index:55;color:var(--db-text,#fff);pointer-events:none}
.wi-switcher[data-side=right]{left:auto;right:16px}
.wi-chip{pointer-events:auto;display:flex;align-items:center;gap:9px;min-height:44px;padding:0 14px 0 10px;border-radius:999px;border:.5px solid var(--sp-edge,#ffffff22);background:var(--sp-glass,#121212d0);-webkit-backdrop-filter:blur(22px) saturate(180%);backdrop-filter:blur(22px) saturate(180%);box-shadow:inset 0 1px 0 var(--sp-hi,#ffffff22),var(--sp-drop,0 10px 30px -12px #000);color:inherit;font-size:12px;font-weight:500}
.wi-chip .wi-eq i{background:var(--wi-accent)}
.wi-popover{pointer-events:auto;position:absolute;bottom:calc(100% + 10px);left:0;width:min(290px,calc(100vw - 32px));padding:14px 10px 12px;border-radius:18px;border:.5px solid var(--sp-edge,#ffffff22);background:var(--db-surface,#141416);box-shadow:var(--db-shadow,0 20px 40px -20px #000);color:var(--db-text,#fff);--wi-text:var(--db-text,#fff);--wi-text-2:var(--db-text-2,#aaa);--wi-line:var(--db-line,#ffffff22);--wi-soft:color-mix(in srgb,var(--db-text,#fff) 6%,transparent);--wi-bg:var(--db-bg,#000)}
.wi-switcher[data-side=right] .wi-popover{left:auto;right:0}
.wi-sec{margin:0 4px 8px;font-size:12px;font-weight:600}
.wi-sec-gap{margin-top:14px}
.wi-popover .wi-mode{display:grid;margin:0 4px}
.wi-remix-toggle{margin:8px 4px 0;min-height:36px;padding:0;border:0;background:none;color:var(--wi-text-2);font-size:12px;text-decoration:underline;text-underline-offset:4px}
.wi-remix{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:8px 4px 0;font-size:12px;color:var(--wi-text-2)}
.wi-remix label{display:flex;align-items:center;gap:6px}
.wi-remix input{width:34px;height:34px;padding:2px;border:1px solid var(--wi-line);border-radius:8px;background:none}
.wi-remix>button{min-height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--wi-line);background:transparent;color:var(--wi-text);font-size:12px}

/* Framer canvas preview */
.wi-canvas{width:100%;height:100%;min-height:640px;display:grid;place-items:center;padding:24px;color:var(--wi-text);background-color:var(--wi-bg);background-image:radial-gradient(42% 46% at 26% 30%,var(--wi-b),transparent 70%),radial-gradient(40% 44% at 76% 72%,var(--wi-a),transparent 70%),radial-gradient(var(--wi-dot) 1px,transparent 1.3px);background-size:auto,auto,22px 22px}

@keyframes wi-fade{from{opacity:0}}
@keyframes wi-rise{from{opacity:0;transform:translateY(14px) scale(.985)}}
@keyframes wi-up{from{opacity:0;transform:translateY(6px)}}
@keyframes wi-write{from{clip-path:inset(-30% 100% -30% 0)}to{clip-path:inset(-30% -10% -30% 0)}}
@keyframes wi-pop{from{transform:scale(0)}}
@keyframes wi-glide{from{opacity:0;transform:translate(46px,34px)}}
@keyframes wi-press{50%{transform:scale(.82)}}
@keyframes wi-ripple{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.6)}}
@keyframes wi-bounce{0%{transform:scaleY(.12)}}
@keyframes wi-eq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}

/* tablet + phone: stacked, compact */
@media (max-width:820px){
.wi-body{grid-template-columns:minmax(0,1fr)}
.wi-panel{border-left:0;border-top:1px solid var(--wi-line)}
.wi-stage{min-height:0;padding:30px 18px 20px}
.wi-crate{grid-template-columns:1fr 1fr}
}
@media (max-width:600px){
.wi-dialog{padding:10px;align-items:start}
.wi-card{border-radius:20px}
.wi-top{height:42px}
.wi-crumb{display:none}
.wi-stage{padding:28px 12px 16px}
.wi-frame-label{left:14px;top:8px}
.wi-frame{padding:30px 16px 18px;gap:14px}
.wi-name{font-size:clamp(56px,17vw,84px)}
.wi-hi{font-size:16px}
.wi-deck{margin-top:18px;gap:12px}
.wi-wave{flex-basis:auto;height:22px}.wi-wave i:nth-child(n+21){display:none}
.wi-dialog{--wi-glass:rgba(16,16,18,.8)}.wi-dialog[data-light=true]{--wi-glass:rgba(255,255,255,.82)}
.wi-panel{padding:14px 12px 12px;gap:12px}
.wi-rec{grid-template-columns:24px minmax(0,1fr);gap:8px;min-height:48px;padding:6px 8px}
.wi-rec .wi-disc{width:24px !important;height:24px !important}
.wi-rec-end{display:none}
.wi-props{grid-template-columns:auto 1fr;gap:6px 12px;padding-top:10px}
.wi-prop{min-height:32px}
.wi-prop:last-child{justify-content:flex-end;gap:8px}
.wi-mode button{padding:0 8px}
.wi-chip-t{max-width:40vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
}
@media (max-width:360px){.wi-prop-k{display:none}.wi-props{grid-template-columns:1fr 1fr}}

@media (prefers-reduced-motion: reduce){
.wi-dialog,.wi-card,.wi-hi,.wi-name,.wi-h,.wi-dims,.wi-cursor,.wi-cursor-in,.wi-ripple,.wi-wave i,.wi-eq i{animation:none !important}
.wi-dialog,.wi-canvas,.wi-disc,.wi-rec,.wi-enter,.wi-enter .wi-arrow{transition:none !important}
.wi-ripple{display:none}
}
`

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
        optionTitles: VIBES.map((v) => v.title),
        defaultValue: "ember",
    },
    showSwitcher: {
        type: ControlType.Boolean,
        title: "Vibe chip",
        defaultValue: true,
    },
    switcherSide: {
        type: ControlType.Enum,
        title: "Chip side",
        options: ["left", "right"],
        defaultValue: "left",
        hidden: (p: any) => !p.showSwitcher,
    },
})
