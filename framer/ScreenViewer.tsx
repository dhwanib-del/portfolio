// ScreenViewer — real case-study screens at their own proportions, with a zoomable viewer.
//
// Fills the gap next to AnnotatedScreen (one screen + pins) and FigmaFrameCard (experience entry):
// several screens in a row/grid/stack; click any to open a dialog with zoom (100–300%),
// previous/next, and keyboard support (← → + − 0, Esc closes, focus returns).
// - Never upscales an export past 2× its natural size in the viewer.
// - Each screen can be labeled "My work" / "Team work" / "Shared" so team output isn't read as solo.
// - Phones (<640px container): "Phone layout" picks stack or horizontal scroll.
// - Theme: --db-* tokens with fallbacks; "Theme" control can force dark/light. Poppins only.
// Logic mirrors src/lib/case-ui (case-ui block below) in the Next.js portfolio repo — keep in sync.
//
// @framerSupportedLayoutWidth any
// @framerSupportedLayoutHeight auto

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

/* ---------- case-ui (mirror of src/lib/case-ui) ---------- */
const ZOOM_STEPS = [1, 1.5, 2, 3]
function nextZoom(current: number, dir: 1 | -1): number {
    const i = ZOOM_STEPS.findIndex((z) => z >= current - 0.001)
    const idx = i === -1 ? ZOOM_STEPS.length - 1 : i
    return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, idx + dir))]
}
const wrapIndex = (i: number, n: number) => (n <= 0 ? 0 : ((i % n) + n) % n)
type ViewerAction = "prev" | "next" | "zoomIn" | "zoomOut" | "reset" | null
function viewerKey(key: string): ViewerAction {
    if (key === "ArrowLeft") return "prev"
    if (key === "ArrowRight") return "next"
    if (key === "+" || key === "=") return "zoomIn"
    if (key === "-" || key === "_") return "zoomOut"
    if (key === "0") return "reset"
    return null
}
/* ---------- /case-ui ---------- */

type Owner = "none" | "mine" | "team" | "shared"
type ScreenItem = {
    image?: { src: string; srcSet?: string; alt?: string }
    url?: string
    alt?: string
    caption?: string
    owner?: Owner
    ownerNote?: string
    width?: number
    height?: number
}
type Props = {
    screens: ScreenItem[]
    layout: "row" | "grid" | "stack"
    phoneLayout: "stack" | "scroll"
    columns: number
    gap: number
    radius: number
    maxScreenWidth: number
    zoom: boolean
    maxZoom: number
    showCaptions: boolean
    theme: "auto" | "dark" | "light"
    accent: string
    style?: React.CSSProperties
}

const FONT = "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const OWNER_LABEL: Record<Owner, string> = { none: "", mine: "My work", team: "Team work", shared: "Shared" }
const THEMES = {
    dark: { "--db-bg": "#000000", "--db-surface": "#111111", "--db-surface-2": "#1F1F1F", "--db-text": "#FFFFFF", "--db-text-2": "rgba(255,255,255,0.6)", "--db-line": "rgba(255,255,255,0.1)" },
    light: { "--db-bg": "#FFFFFF", "--db-surface": "#EEEEEE", "--db-surface-2": "#E0E0E0", "--db-text": "#0A0A0A", "--db-text-2": "rgba(0,0,0,0.62)", "--db-line": "rgba(0,0,0,0.12)" },
} as const
const CSS_ID = "db-screen-viewer-css"
const CSS = `
.db-sv-thumb:focus-visible, .db-sv-btn:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px }
.db-sv-dialog::backdrop { background: rgba(0,0,0,.78); backdrop-filter: blur(6px) }
.db-sv-thumb .db-sv-hint { opacity: 0; transition: opacity .18s }
.db-sv-thumb:hover .db-sv-hint, .db-sv-thumb:focus-visible .db-sv-hint { opacity: 1 }
@media (hover: none) { .db-sv-thumb .db-sv-hint { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .db-sv-thumb .db-sv-hint { transition: none } }
`

function srcOf(s: ScreenItem) {
    return s.image?.src || s.url || ""
}

function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
    const [w, setW] = useState(1024)
    useLayoutEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [ref])
    return w
}

/** Natural size for an image, so the viewer knows how far it may scale. */
function useNatural(src: string, w?: number, h?: number) {
    const [size, setSize] = useState<{ w: number; h: number } | null>(w && h ? { w, h } : null)
    useEffect(() => {
        if ((w && h) || !src || typeof Image === "undefined") return
        const img = new Image()
        img.onload = () => setSize({ w: img.naturalWidth, h: img.naturalHeight })
        img.src = src
    }, [src, w, h])
    return size
}

export default function ScreenViewer(props: Props) {
    const {
        screens = [], layout = "row", phoneLayout = "stack", columns = 3, gap = 24, radius = 14, maxScreenWidth = 0,
        zoom: zoomEnabled = true, maxZoom = 3, showCaptions = true, theme = "auto", accent = "", style,
    } = props
    const isStatic = useIsStaticRenderer()
    const root = useRef<HTMLDivElement>(null)
    const dialog = useRef<HTMLDialogElement>(null)
    const stage = useRef<HTMLDivElement>(null)
    const opener = useRef<HTMLButtonElement | null>(null)
    const [index, setIndex] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
    const width = useContainerWidth(root)
    const phone = width < 640
    const items = screens.filter((s) => srcOf(s))
    const current = items[index]
    const natural = useNatural(current ? srcOf(current) : "", current?.width, current?.height)
    const many = items.length > 1
    const zoomCap = Math.max(1, Math.min(3, maxZoom))

    useEffect(() => {
        if (typeof document === "undefined" || document.getElementById(CSS_ID)) return
        const el = document.createElement("style")
        el.id = CSS_ID
        el.textContent = CSS
        document.head.appendChild(el)
    }, [])

    useEffect(() => {
        const d = dialog.current
        if (!d) return
        const onClose = () => opener.current?.focus()
        d.addEventListener("close", onClose)
        return () => d.removeEventListener("close", onClose)
    }, [])

    useLayoutEffect(() => {
        const el = stage.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setStageSize({ w: e.contentRect.width, h: e.contentRect.height }))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const open = (i: number, el: HTMLButtonElement) => {
        if (!zoomEnabled || isStatic) return
        opener.current = el
        setIndex(i)
        setZoom(1)
        dialog.current?.showModal?.()
    }
    const go = (dir: 1 | -1) => {
        setIndex((i) => wrapIndex(i + dir, items.length))
        setZoom(1)
    }
    const onKeyDown = (e: React.KeyboardEvent) => {
        const a = viewerKey(e.key)
        if (!a) return
        e.preventDefault()
        if (a === "prev" && many) go(-1)
        else if (a === "next" && many) go(1)
        else if (a === "zoomIn") setZoom((z) => Math.min(zoomCap, nextZoom(z, 1)))
        else if (a === "zoomOut") setZoom((z) => nextZoom(z, -1))
        else if (a === "reset") setZoom(1)
    }

    const themeVars = theme === "auto" ? {} : THEMES[theme]
    const accentVar = accent ? { "--db-accent": accent } : {}
    const text = "var(--db-text, #FFFFFF)"
    const text2 = "var(--db-text-2, rgba(255,255,255,0.6))"
    const line = "var(--db-line, rgba(255,255,255,0.1))"
    const acc = "var(--db-accent, #F3500F)"

    const fit = natural && stageSize.w ? Math.min(stageSize.w / natural.w, stageSize.h / natural.h, 2) : 1
    const shownW = natural ? Math.round(natural.w * fit * zoom) : undefined

    const listStyle: React.CSSProperties =
        phone && phoneLayout === "scroll"
            ? { display: "flex", gap, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8 }
            : phone || layout === "stack"
              ? { display: "grid", gap }
              : layout === "grid"
                ? { display: "grid", gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`, gap, alignItems: "start" }
                : { display: "flex", flexWrap: "wrap", justifyContent: "center", gap, alignItems: "flex-start" }

    const btn: React.CSSProperties = {
        minWidth: 44, minHeight: 44, padding: "0 14px", borderRadius: 999, border: `1px solid ${line}`,
        background: "var(--db-surface, #111111)", color: text, font: `500 14px/1 ${FONT}`, cursor: "pointer",
    }

    if (!items.length) {
        return (
            <div style={{ ...style, ...themeVars, ...accentVar, fontFamily: FONT, color: text2, border: `1px dashed ${line}`, borderRadius: radius, padding: 32, textAlign: "center" } as React.CSSProperties}>
                Add screens in the properties panel →
            </div>
        )
    }

    return (
        <div ref={root} data-db-keep style={{ ...style, ...themeVars, ...accentVar, fontFamily: FONT, color: text, width: "100%" } as React.CSSProperties}>
            <ul style={{ ...listStyle, listStyle: "none", margin: 0, padding: 0 }} aria-label="Project screens">
                {items.map((s, i) => {
                    const owner = (s.owner || "none") as Owner
                    const cap = s.caption || ""
                    const itemW = maxScreenWidth > 0 ? maxScreenWidth : s.width || undefined
                    return (
                        <li key={srcOf(s) + i} style={{ flex: layout === "row" && !phone ? "1 1 0" : undefined, minWidth: phone && phoneLayout === "scroll" ? "78%" : 0, maxWidth: itemW, scrollSnapAlign: "start", width: "100%" }}>
                            <figure style={{ margin: 0, display: "grid", gap: 10 }}>
                                <button
                                    type="button"
                                    className="db-sv-thumb"
                                    onClick={(e) => open(i, e.currentTarget)}
                                    aria-label={zoomEnabled ? `Enlarge: ${cap || s.alt || `screen ${i + 1}`}` : undefined}
                                    disabled={!zoomEnabled}
                                    style={{ position: "relative", display: "block", width: "100%", padding: 0, border: 0, background: "none", cursor: zoomEnabled ? "zoom-in" : "default", borderRadius: radius, overflow: "hidden", boxShadow: `0 0 0 1px ${line}, 0 18px 40px -18px rgba(0,0,0,.6)` }}
                                >
                                    <img src={srcOf(s)} srcSet={s.image?.srcSet} alt={s.alt || s.image?.alt || cap} loading="lazy" style={{ display: "block", width: "100%", height: "auto" }} />
                                    {zoomEnabled && (
                                        <span className="db-sv-hint" aria-hidden style={{ position: "absolute", right: 10, bottom: 10, width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(18,18,18,.82)", color: "#fff", fontSize: 15 }}>⤢</span>
                                    )}
                                </button>
                                {showCaptions && (cap || owner !== "none") && (
                                    <figcaption style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 14, color: text2 }}>
                                        <span>{cap}</span>
                                        {owner !== "none" && (
                                            <span style={{ display: "inline-flex", alignItems: "center", minHeight: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, border: `1px solid ${owner === "mine" ? acc : line}`, color: owner === "mine" ? acc : text2 }}>
                                                {OWNER_LABEL[owner]}{s.ownerNote ? ` · ${s.ownerNote}` : ""}
                                            </span>
                                        )}
                                    </figcaption>
                                )}
                            </figure>
                        </li>
                    )
                })}
            </ul>

            <dialog
                ref={dialog}
                className="db-sv-dialog"
                aria-label="Screen viewer"
                onKeyDown={onKeyDown}
                onClick={(e) => { if (e.target === e.currentTarget) dialog.current?.close() }}
                style={{ width: phone ? "100vw" : "min(1400px, calc(100vw - 24px))", height: phone ? "100dvh" : "min(940px, calc(100dvh - 24px))", maxWidth: "none", maxHeight: "none", padding: 0, border: phone ? 0 : `1px solid ${line}`, borderRadius: phone ? 0 : 24, background: "var(--db-bg, #000000)", color: text, fontFamily: FONT }}
            >
                {current && (
                    <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", height: "100%" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${line}` }}>
                            <p aria-live="polite" style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>
                                {many && <span style={{ fontSize: 12, color: text2, marginRight: 10 }}>{index + 1} / {items.length}</span>}
                                {current.caption}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button type="button" className="db-sv-btn" style={{ ...btn, opacity: zoom <= 1 ? 0.4 : 1 }} disabled={zoom <= 1} onClick={() => setZoom((z) => nextZoom(z, -1))} aria-label="Zoom out">−</button>
                                <span aria-live="polite" style={{ minWidth: 48, textAlign: "center", fontSize: 13, color: text2 }}>{Math.round(zoom * 100)}%</span>
                                <button type="button" className="db-sv-btn" style={{ ...btn, opacity: zoom >= zoomCap ? 0.4 : 1 }} disabled={zoom >= zoomCap} onClick={() => setZoom((z) => Math.min(zoomCap, nextZoom(z, 1)))} aria-label="Zoom in">+</button>
                                <button type="button" className="db-sv-btn" style={btn} onClick={() => setZoom(1)}>Fit</button>
                                <button type="button" className="db-sv-btn" style={btn} onClick={() => dialog.current?.close()} autoFocus>Close</button>
                            </div>
                        </div>
                        <div ref={stage} style={{ overflow: "auto", display: "grid", placeItems: zoom > 1 ? "start" : "center", padding: 16, minHeight: 0, background: "var(--db-surface, #111111)" }}>
                            <img src={srcOf(current)} alt={current.alt || current.caption || ""} style={{ display: "block", width: shownW, maxWidth: "none", height: "auto", borderRadius: 8 }} />
                        </div>
                        {many && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${line}` }}>
                                <button type="button" className="db-sv-btn" style={btn} onClick={() => go(-1)}>← Previous</button>
                                <button type="button" className="db-sv-btn" style={btn} onClick={() => go(1)}>Next →</button>
                            </div>
                        )}
                    </div>
                )}
            </dialog>
        </div>
    )
}

addPropertyControls(ScreenViewer, {
    screens: {
        type: ControlType.Array,
        title: "Screens",
        maxCount: 12,
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.ResponsiveImage, title: "Image" },
                url: { type: ControlType.String, title: "Image URL", description: "Used when Image is empty." },
                alt: { type: ControlType.String, title: "Alt text", displayTextArea: true },
                caption: { type: ControlType.String, title: "Caption" },
                owner: {
                    type: ControlType.Enum,
                    title: "Owner",
                    options: ["none", "mine", "team", "shared"],
                    optionTitles: ["Hide", "My work", "Team work", "Shared"],
                    defaultValue: "mine",
                },
                ownerNote: { type: ControlType.String, title: "Owner note", placeholder: "Anne's flow", hidden: (p: ScreenItem) => !p.owner || p.owner === "none" },
                width: { type: ControlType.Number, title: "Native W", defaultValue: 0, min: 0, max: 6000, unit: "px", description: "Optional. Export width; prevents upscaling." },
                height: { type: ControlType.Number, title: "Native H", defaultValue: 0, min: 0, max: 12000, unit: "px" },
            },
        },
    },
    layout: { type: ControlType.Enum, title: "Layout", options: ["row", "grid", "stack"], optionTitles: ["Row", "Grid", "Stack"], defaultValue: "row", displaySegmentedControl: true },
    columns: { type: ControlType.Number, title: "Columns", defaultValue: 3, min: 1, max: 6, step: 1, hidden: (p: Props) => p.layout !== "grid" },
    phoneLayout: { type: ControlType.Enum, title: "Phone layout", options: ["stack", "scroll"], optionTitles: ["Stack", "Scroll"], defaultValue: "stack", displaySegmentedControl: true },
    gap: { type: ControlType.Number, title: "Gap", defaultValue: 24, min: 0, max: 96, unit: "px" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 14, min: 0, max: 48, unit: "px" },
    maxScreenWidth: { type: ControlType.Number, title: "Screen max W", defaultValue: 0, min: 0, max: 1600, step: 10, unit: "px", description: "0 = use native width or fill." },
    zoom: { type: ControlType.Boolean, title: "Zoom viewer", defaultValue: true },
    maxZoom: { type: ControlType.Enum, title: "Max zoom", options: [1.5, 2, 3], optionTitles: ["150%", "200%", "300%"], defaultValue: 3, hidden: (p: Props) => !p.zoom },
    showCaptions: { type: ControlType.Boolean, title: "Captions", defaultValue: true },
    theme: { type: ControlType.Enum, title: "Theme", options: ["auto", "dark", "light"], optionTitles: ["Site", "Dark", "Light"], defaultValue: "auto", displaySegmentedControl: true },
    accent: { type: ControlType.Color, title: "Accent", description: "Empty = site vibe accent." },
})
