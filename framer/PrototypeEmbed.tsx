// PrototypeEmbed — a clickable Figma prototype inside a case study, with honest loading/failure states.
//
// The design-system contract lists this as "still to be implemented" (PrototypeExplorer).
// - Paste any figma.com proto/design share link; it is converted to an embed URL.
// - Load: "On click" (default) shows a cover with a Load button so visitors don't download Figma's
//   player just by scrolling; "Automatic" loads when the frame scrolls into view.
// - If the frame hasn't loaded after the timeout, or the link isn't a Figma URL, a failure state
//   explains why. "Open in Figma" is always available as the fallback.
// - Full screen uses the Fullscreen API, falling back to opening Figma in a new tab.
// - Aspect ratio is separate for desktop and phones (<640px container).
// - Theme: --db-* tokens with fallbacks; "Theme" control can force dark/light. Poppins only.
// Logic mirrors src/lib/case-ui (case-ui block below) in the Next.js portfolio repo — keep in sync.
//
// @framerSupportedLayoutWidth any
// @framerSupportedLayoutHeight auto

import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

/* ---------- case-ui (mirror of src/lib/case-ui) ---------- */
type FigmaLink = { embedUrl: string; openUrl: string } | null
function figmaEmbed(input: string | undefined | null): FigmaLink {
    if (!input) return null
    let url: URL
    try {
        url = new URL(input.trim())
    } catch {
        return null
    }
    const host = url.hostname.replace(/^www\./, "")
    if (host === "embed.figma.com") return { embedUrl: url.toString(), openUrl: url.toString().replace("embed.figma.com", "www.figma.com") }
    if (host !== "figma.com") return null
    const kind = url.pathname.split("/")[1]
    if (!["proto", "design", "file", "board", "deck", "slides"].includes(kind)) return null
    const embed = new URL(url.pathname, "https://embed.figma.com")
    url.searchParams.forEach((v, k) => embed.searchParams.set(k, v))
    embed.searchParams.set("embed-host", "portfolio")
    if (kind === "proto" && !embed.searchParams.has("scaling")) embed.searchParams.set("scaling", "scale-down")
    return { embedUrl: embed.toString(), openUrl: url.toString() }
}
/* ---------- /case-ui ---------- */

type State = "idle" | "loading" | "ready" | "failed"
type Props = {
    url: string
    title: string
    note: string
    loadMode: "click" | "auto"
    ratio: string
    phoneRatio: string
    timeout: number
    showOpen: boolean
    radius: number
    theme: "auto" | "dark" | "light"
    accent: string
    style?: React.CSSProperties
}

const FONT = "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const RATIOS: Record<string, string> = { "16:10": "16 / 10", "16:9": "16 / 9", "4:3": "4 / 3", "1:1": "1 / 1", "3:4": "3 / 4", "9:16": "9 / 16" }
const THEMES = {
    dark: { "--db-bg": "#000000", "--db-surface": "#111111", "--db-surface-2": "#1F1F1F", "--db-text": "#FFFFFF", "--db-text-2": "rgba(255,255,255,0.6)", "--db-line": "rgba(255,255,255,0.1)", "--db-on-accent": "#0A0A0A" },
    light: { "--db-bg": "#FFFFFF", "--db-surface": "#EEEEEE", "--db-surface-2": "#E0E0E0", "--db-text": "#0A0A0A", "--db-text-2": "rgba(0,0,0,0.62)", "--db-line": "rgba(0,0,0,0.12)", "--db-on-accent": "#FFFFFF" },
} as const
const CSS_ID = "db-prototype-embed-css"
const CSS = `.db-pe-btn:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 2px }`

export default function PrototypeEmbed(props: Props) {
    const {
        url = "", title = "Interactive prototype", note = "", loadMode = "click", ratio = "16:10", phoneRatio = "3:4",
        timeout = 15, showOpen = true, radius = 20, theme = "auto", accent = "", style,
    } = props
    const isStatic = useIsStaticRenderer()
    const link = figmaEmbed(url)
    const root = useRef<HTMLElement | null>(null)
    const frame = useRef<HTMLDivElement>(null)
    const [state, setState] = useState<State>(link ? "idle" : "failed")
    const [width, setWidth] = useState(1024)

    useEffect(() => {
        if (typeof document === "undefined" || document.getElementById(CSS_ID)) return
        const el = document.createElement("style")
        el.id = CSS_ID
        el.textContent = CSS
        document.head.appendChild(el)
    }, [])

    useLayoutEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Reset when the URL changes in the properties panel.
    useEffect(() => {
        setState(figmaEmbed(url) ? "idle" : "failed")
    }, [url])

    // Automatic mode: load when scrolled into view.
    useEffect(() => {
        if (loadMode !== "auto" || state !== "idle" || isStatic || !frame.current || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState("loading"); io.disconnect() } }, { rootMargin: "200px" })
        io.observe(frame.current)
        return () => io.disconnect()
    }, [loadMode, state, isStatic])

    useEffect(() => {
        if (state !== "loading") return
        const t = window.setTimeout(() => setState((s) => (s === "loading" ? "failed" : s)), Math.max(5, timeout) * 1000)
        return () => window.clearTimeout(t)
    }, [state, timeout])

    const fullscreen = () => {
        const el = frame.current
        if (el?.requestFullscreen) el.requestFullscreen().catch(() => link && window.open(link.openUrl, "_blank", "noopener"))
        else if (link) window.open(link.openUrl, "_blank", "noopener")
    }

    const phone = width < 640
    const aspect = RATIOS[phone ? phoneRatio : ratio] || "16 / 10"
    const themeVars = theme === "auto" ? {} : THEMES[theme]
    const accentVar = accent ? { "--db-accent": accent } : {}
    const text = "var(--db-text, #FFFFFF)"
    const text2 = "var(--db-text-2, rgba(255,255,255,0.6))"
    const line = "var(--db-line, rgba(255,255,255,0.1))"
    const acc = "var(--db-accent, #F3500F)"
    const ghost: React.CSSProperties = {
        display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 16px", borderRadius: 999,
        border: `1px solid ${line}`, background: "var(--db-surface, #111111)", color: text, font: `500 14px/1 ${FONT}`, cursor: "pointer", textDecoration: "none",
    }
    const cover: React.CSSProperties = { position: "absolute", inset: 0, display: "grid", placeContent: "center", justifyItems: "center", gap: 12, padding: 24, textAlign: "center" }

    return (
        <figure ref={root} data-db-keep style={{ ...style, ...themeVars, ...accentVar, margin: 0, width: "100%", fontFamily: FONT, color: text, border: `1px solid ${line}`, borderRadius: radius, overflow: "hidden", background: "var(--db-surface, #111111)" } as React.CSSProperties}>
            <div ref={frame} style={{ position: "relative", width: "100%", aspectRatio: aspect, background: "var(--db-surface-2, #1F1F1F)" }}>
                {state === "idle" && (
                    <div style={cover}>
                        <p style={{ margin: 0, fontSize: "clamp(20px, 2.4vw, 28px)", fontWeight: 600, letterSpacing: "-0.03em" }}>{title}</p>
                        {note && <p style={{ margin: 0, fontSize: 14, color: text2, maxWidth: "46ch" }}>{note}</p>}
                        {loadMode === "click" && (
                            <button type="button" className="db-pe-btn" onClick={() => !isStatic && setState("loading")} style={{ ...ghost, minHeight: 48, padding: "0 22px", border: 0, background: acc, color: "var(--db-on-accent, #0A0A0A)", fontWeight: 600, fontSize: 15 }}>
                                Load interactive prototype
                            </button>
                        )}
                        {loadMode === "click" && <p style={{ margin: 0, fontSize: 12, color: text2 }}>Loads Figma&apos;s player (about 5–10 MB).</p>}
                    </div>
                )}
                {(state === "loading" || state === "ready") && link && !isStatic && (
                    <iframe src={link.embedUrl} title={`${title} (interactive Figma prototype)`} allowFullScreen onLoad={() => setState("ready")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                )}
                {state === "loading" && (
                    <p role="status" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", margin: 0, padding: "10px 16px", borderRadius: 999, background: "rgba(18,18,18,.82)", color: "#fff", fontSize: 14, pointerEvents: "none" }}>
                        Loading prototype…
                    </p>
                )}
                {state === "failed" && (
                    <div role="alert" style={cover}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{link ? "The prototype couldn't load here." : "Add a Figma prototype link."}</p>
                        <p style={{ margin: 0, fontSize: 14, color: text2, maxWidth: "46ch" }}>
                            {link ? "The file may be private or blocked on this network." : url ? "This isn't a figma.com proto or design link." : "Paste a share link in the properties panel."}
                        </p>
                        {link && <button type="button" className="db-pe-btn" style={ghost} onClick={() => setState("loading")}>Try again</button>}
                    </div>
                )}
            </div>
            <figcaption style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderTop: `1px solid ${line}`, fontSize: 13, color: text2 }}>
                <span>{state === "ready" ? "Click inside to interact. Some prototypes need a Figma sign-in." : title}</span>
                <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {state === "ready" && <button type="button" className="db-pe-btn" style={ghost} onClick={fullscreen}>Full screen</button>}
                    {showOpen && link && <a className="db-pe-btn" style={ghost} href={link.openUrl} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>}
                </span>
            </figcaption>
        </figure>
    )
}

addPropertyControls(PrototypeEmbed, {
    url: { type: ControlType.String, title: "Figma URL", placeholder: "https://www.figma.com/proto/…", description: "Any figma.com proto or design share link." },
    title: { type: ControlType.String, title: "Title", defaultValue: "Interactive prototype" },
    note: { type: ControlType.String, title: "Note", defaultValue: "", displayTextArea: true, description: "One line under the title, e.g. whose prototype it is." },
    loadMode: { type: ControlType.Enum, title: "Load", options: ["click", "auto"], optionTitles: ["On click", "Automatic"], defaultValue: "click", displaySegmentedControl: true },
    ratio: { type: ControlType.Enum, title: "Ratio", options: Object.keys(RATIOS), defaultValue: "16:10" },
    phoneRatio: { type: ControlType.Enum, title: "Phone ratio", options: Object.keys(RATIOS), defaultValue: "3:4", description: "Used when the component is narrower than 640px." },
    timeout: { type: ControlType.Number, title: "Timeout", defaultValue: 15, min: 5, max: 60, step: 1, unit: "s", description: "Show the failure state after this long." },
    showOpen: { type: ControlType.Boolean, title: "Open in Figma", defaultValue: true },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 20, min: 0, max: 48, unit: "px" },
    theme: { type: ControlType.Enum, title: "Theme", options: ["auto", "dark", "light"], optionTitles: ["Site", "Dark", "Light"], defaultValue: "auto", displaySegmentedControl: true },
    accent: { type: ControlType.Color, title: "Accent", description: "Empty = site vibe accent." },
})
