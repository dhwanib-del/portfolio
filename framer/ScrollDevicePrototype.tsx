import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/**
 * Device Studio — refined, scroll-revealed prototype player.
 * 1. Scroll unveils a laptop / tablet through a controlled 3D pose.
 * 2. The CTA loads a real Figma prototype on demand.
 * 3. Interactive mode removes the sticky scroll presentation, so Figma feels usable.
 * No external libraries, no remote images, and no fabricated UI screenshots.
 */

type Device = "macbook" | "ipad"
type Props = {
    device: Device
    figmaUrl: string
    title: string
    eyebrow: string
    description: string
    buttonText: string
    accent: string
    appearance: "auto" | "dark" | "light"
    scrollHeight: number
    maxWidth: number
    rounded: number
    showProgress: boolean
    showHeader: boolean
    autoLoad: boolean
    style?: React.CSSProperties
}

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n))
const smooth = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x) }
const FONT = "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

function getFigma(input: string) {
    try {
        const url = new URL(input.trim())
        if (url.protocol !== "https:") return null
        const host = url.hostname.toLowerCase().replace(/^www\./, "")
        if (host !== "figma.com" && host !== "embed.figma.com") return null
        const path = url.pathname.split("/")[1]
        if (!["proto", "design", "file"].includes(path)) return null
        const original = new URL(url.toString())
        original.hostname = "www.figma.com"
        const embed = new URL(url.toString())
        embed.hostname = "embed.figma.com"
        embed.searchParams.set("embed-host", "portfolio")
        if (path === "proto" && !embed.searchParams.has("scaling")) embed.searchParams.set("scaling", "scale-down")
        return { original: original.toString(), embed: embed.toString() }
    } catch { return null }
}

export default function ScrollDevicePrototype(props: Props) {
    const {
        device = "macbook", figmaUrl = "", title = "Take it for a spin.",
        eyebrow = "INTERACTIVE PROTOTYPE", description = "A closer look at the experience, from the inside.",
        buttonText = "Explore the prototype", accent = "#F3500F", appearance = "auto",
        scrollHeight = 195, maxWidth = 1040, rounded = 18,
        showProgress = true, showHeader = true, autoLoad = false, style,
    } = props

    const root = React.useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = React.useState(0)
    const [reduceMotion, setReduceMotion] = React.useState(false)
    const [lightScheme, setLightScheme] = React.useState(false)
    const [launched, setLaunched] = React.useState(false)
    const [frameReady, setFrameReady] = React.useState(false)
    const [expanded, setExpanded] = React.useState(false)
    const [compact, setCompact] = React.useState(false)
    const [hasInteracted, setHasInteracted] = React.useState(false)
    const validLink = React.useMemo(() => getFigma(figmaUrl), [figmaUrl])
    const isFramerCanvas = RenderTarget.current() === RenderTarget.canvas

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
        const theme = window.matchMedia("(prefers-color-scheme: light)")
        const sync = () => { setReduceMotion(motion.matches); setLightScheme(theme.matches) }
        sync()
        motion.addEventListener?.("change", sync)
        theme.addEventListener?.("change", sync)
        return () => { motion.removeEventListener?.("change", sync); theme.removeEventListener?.("change", sync) }
    }, [])

    React.useEffect(() => {
        const el = root.current
        if (!el || typeof window === "undefined") return
        const ob = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 680))
        ob.observe(el)
        return () => ob.disconnect()
    }, [])

    React.useEffect(() => {
        if (typeof window === "undefined" || isFramerCanvas || launched) return
        let raf = 0
        const update = () => {
            raf = 0
            const section = root.current
            if (!section) return
            const bounds = section.getBoundingClientRect()
            const total = Math.max(1, bounds.height - window.innerHeight)
            setScroll(clamp(-bounds.top / total))
        }
        const request = () => { if (!raf) raf = requestAnimationFrame(update) }
        update()
        window.addEventListener("scroll", request, { passive: true })
        window.addEventListener("resize", request)
        return () => { window.removeEventListener("scroll", request); window.removeEventListener("resize", request); cancelAnimationFrame(raf) }
    }, [isFramerCanvas, launched, scrollHeight])

    React.useEffect(() => {
        setLaunched(false); setFrameReady(false); setHasInteracted(false)
    }, [figmaUrl, device])

    React.useEffect(() => {
        if (!autoLoad || !validLink || launched || isFramerCanvas || hasInteracted) return
        if (scroll >= .94 || reduceMotion) { setLaunched(true); setHasInteracted(true) }
    }, [autoLoad, validLink, launched, isFramerCanvas, scroll, reduceMotion, hasInteracted])

    React.useEffect(() => {
        if (!expanded || typeof document === "undefined") return
        const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false) }
        document.addEventListener("keydown", onEscape)
        return () => document.removeEventListener("keydown", onEscape)
    }, [expanded])

    const light = appearance === "light" || (appearance === "auto" && lightScheme)
    const bg = light ? "#F6F6F4" : "#000000"
    const panel = light ? "#FFFFFF" : "#111111"
    const ink = light ? "#111113" : "#FFFFFF"
    const sub = light ? "#55565D" : "#A2A2A9"
    const rule = light ? "rgba(0,0,0,.12)" : "rgba(255,255,255,.13)"
    const bright = light ? "rgba(0,0,0,.13)" : "rgba(255,255,255,.16)"

    const p = reduceMotion || isFramerCanvas || launched ? 1 : smooth((scroll - .06) / .76)
    const ready = p > .965
    const enter = () => {
        if (!validLink) return
        setHasInteracted(true)
        setLaunched(true)
        setFrameReady(false)
    }
    const leave = () => {
        setLaunched(false)
        setFrameReady(false)
        setExpanded(false)
    }

    const isMac = device === "macbook"
    const baseWidth = Math.max(400, maxWidth)
    const deviceWidth = isMac ? baseWidth : Math.min(baseWidth * .65, 720)
    const camera = isMac ? `rotateX(${(1 - p) * -83}deg)` : `rotateX(${(1-p) * 23}deg) rotateY(${(1-p) * -40}deg)`
    const screenRadius = isMac ? 11 : 30

    const screen = (
        <div style={{ position: "absolute", inset: isMac ? "2.0% 1.4% 1.6%" : "1.65%", overflow: "hidden", borderRadius: isMac ? 5 : Math.max(15, screenRadius - 11), background: "#09090C", isolation: "isolate", transform: "translateZ(0)" }}>
            {launched && validLink && !isFramerCanvas ? (
                <>
                    <iframe
                        key={validLink.embed}
                        title={`${title}: interactive Figma prototype`}
                        src={validLink.embed}
                        allowFullScreen
                        onLoad={() => setFrameReady(true)}
                        style={{ width: "100%", height: "100%", display: "block", border: 0, background: "#141417" }}
                    />
                    {!frameReady && <div role="status" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#0F0F12", color: "#DDD", font: `500 12px ${FONT}` }}>Connecting to Figma<span style={{ color: accent }}>…</span></div>}
                </>
            ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 25, textAlign: "center", gap: "clamp(12px,2vw,24px)", background: "radial-gradient(ellipse at 50% 110%, rgba(120,118,128,.12), transparent 60%),#0B0B0D" }}>
                    <div style={{ width: "clamp(32px,5vw,56px)", height: "clamp(32px,5vw,56px)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.2)", borderRadius: "50%", fontSize: "clamp(14px,2vw,23px)", color: "#F9F9F9" }}>↗</div>
                    <div style={{ color: "#fff", fontSize: "clamp(15px,2.3vw,26px)", fontWeight: 600, letterSpacing: "-.045em", lineHeight: 1.2 }}>Your design, in motion.</div>
                    <div style={{ color: "#B2B2B7", fontSize: "clamp(10px,1.15vw,13px)", maxWidth: 310, lineHeight: 1.6 }}>Not a recording. Explore the real prototype when the reveal is complete.</div>
                    <button type="button" onClick={enter} disabled={!ready || !validLink || isFramerCanvas} style={{ marginTop: 2, font: `600 clamp(10px,1.1vw,13px) ${FONT}`, color: "#FFFFFF", padding: "12px 20px", minHeight: 42, background: ready && validLink ? accent : "#34343A", border: "1px solid rgba(255,255,255,.13)", borderRadius: 999, cursor: ready && validLink ? "pointer" : "default", transition: "background .25s ease" }}>{!validLink ? "Add Figma URL in properties" : ready ? `${buttonText} ↗` : "Scroll to open ↓"}</button>
                </div>
            )}
        </div>
    )

    const deviceNode = (
        <div style={{ width: "100%", maxWidth: deviceWidth, flexShrink: 0, margin: "0 auto", transform: `translate3d(0,${(1-p)*20}px,0) scale(${.93+.07*p})`, opacity: .75 + .25*p, transition: reduceMotion ? "none" : launched ? "transform .42s cubic-bezier(.22,1,.36,1), opacity .2s" : "opacity .12s linear", perspective: isMac ? "1900px" : "1500px", position: "relative" }}>
            {isMac ? (
                <>
                    <div style={{ width: "91%", margin: "0 auto", aspectRatio: "16 / 10", position: "relative", transformOrigin: "50% 100%", transform: camera, transformStyle: "preserve-3d", borderRadius: "14px 14px 5px 5px", border: "1px solid #64646B", padding: "0.7%", boxSizing: "border-box", background: "linear-gradient(145deg,#6F7077 0%,#222329 4%,#151519 96%,#72737A 100%)", boxShadow: "0 1px 0 rgba(255,255,255,.4) inset,0 30px 65px rgba(0,0,0,.38)" }}>
                        <div style={{ position: "absolute", inset: "0.8%", borderRadius: 7, background: "#050506", overflow: "hidden" }}>{screen}</div>
                        <span aria-hidden style={{ position: "absolute", top: "0.62%", left: "49.65%", width: "0.7%", aspectRatio: 1, borderRadius: "50%", background: "#44464F", boxShadow: "inset 0 0 1px #8e8e96" }} />
                    </div>
                    <div aria-hidden style={{ height: "clamp(10px,2vw,23px)", width: "100%", margin: "-1px auto 0", background: "linear-gradient(180deg,#B0B1B5 0%,#7F8087 30%,#585960 76%,#2D2E33 100%)", border: "1px solid #797A82", borderRadius: "2px 2px 36% 36% / 2px 2px 72% 72%", boxShadow: "0 19px 38px rgba(0,0,0,.25)", position: "relative" }}>
                        <span style={{ position: "absolute", left: "42%", width: "16%", top: 0, height: "40%", borderRadius: "0 0 15px 15px", background: "linear-gradient(#62636A,#92939A)", boxShadow: "0 1px 2px rgba(0,0,0,.2) inset" }}/>
                    </div>
                    <div aria-hidden style={{ width: "74%", height: 25, borderRadius: "50%", margin: "-7px auto 0", background: "rgba(0,0,0,.24)", filter: "blur(18px)", transform: `scale(${.65+.35*p})` }}/>
                </>
            ) : (
                <div style={{ position: "relative", width: compact ? "min(80%,420px)" : "min(75%,590px)", aspectRatio: "4 / 3", margin: "0 auto", borderRadius: screenRadius, padding: "1.4%", boxSizing: "border-box", background: "linear-gradient(135deg,#74747B,#28282E 7%,#151519 93%,#74747B)", border: "1px solid #6C6C73", boxShadow: "0 30px 70px rgba(0,0,0,.4),0 1px 1px rgba(255,255,255,.25) inset", transform: camera, transformStyle: "preserve-3d" }}>
                    {screen}
                    <span aria-hidden style={{ position: "absolute", width: 5, height: 5, background: "#4A4C55", top: "50%", left: 7, borderRadius: 100, transform: "translateY(-50%)" }}/>
                </div>
            )}
        </div>
    )

    return (
        <section ref={root} style={{ ...style, position: "relative", width: "100%", height: isFramerCanvas ? "auto" : `${Math.max(145, scrollHeight)}vh`, minHeight: isFramerCanvas ? 530 : undefined, background: bg, color: ink, fontFamily: FONT, boxSizing: "border-box", isolation: "isolate", overflow: "clip" }}>
            <div style={{ position: isFramerCanvas ? "relative" : "sticky", top: 0, width: "100%", height: isFramerCanvas ? "auto" : "100vh", minHeight: 530, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", padding: compact ? "36px 18px 30px" : "clamp(26px,4vw,58px)", maxWidth: 1600, margin: "0 auto", overflow: "hidden" }}>
                {showHeader && <div style={{ maxWidth: maxWidth, width: "100%", margin: "0 auto clamp(22px,4vh,46px)", display: "flex", gap: 14, justifyContent: "space-between", alignItems: "start" }}>
                    <div><div style={{ font: `600 10px ${FONT}`, letterSpacing: ".14em", color: accent }}>{eyebrow.toUpperCase()}</div><h2 style={{ margin: "12px 0 9px", fontSize: "clamp(25px,4vw,48px)", fontWeight: 600, letterSpacing: "-.055em", lineHeight: 1.1 }}>{title}</h2><p style={{ margin: 0, fontSize: "clamp(12px,1.15vw,14px)", lineHeight: 1.6, color: sub, maxWidth: 450 }}>{description}</p></div>
                    {!compact && <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".1em", padding: "10px 13px", borderRadius: 99, border: `1px solid ${rule}`, whiteSpace: "nowrap", color: sub }}>{isMac ? "MACBOOK" : "IPAD"} · INTERACTIVE</div>}
                </div>}
                <div style={{ flex: "0 1 auto", width: "100%", maxHeight: compact ? "65vh" : "min(62vh,750px)", display: "grid", placeItems: "center", perspective: "1600px", minHeight: 0 }}>
                    {deviceNode}
                </div>
                <div style={{ width: "100%", maxWidth, margin: "clamp(18px,3.8vh,42px) auto 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, minHeight: 40, color: sub, font: `500 11px ${FONT}` }}>
                    <span style={{ letterSpacing: ".08em", whiteSpace: "nowrap" }}>{launched ? "LIVE · EXPLORE THE PROTOTYPE" : ready ? "READY WHEN YOU ARE" : "SCROLL TO REVEAL"}</span>
                    {showProgress && !launched && <div role="progressbar" aria-label="Device reveal progress" aria-valuenow={Math.round(p*100)} aria-valuemin={0} aria-valuemax={100} style={{ width: "min(160px,25%)", height: 2, background: rule, borderRadius: 5, overflow: "hidden" }}><div style={{ width: `${p * 100}%`, background: accent, height: "100%" }}/></div>}
                    {launched && validLink && <button type="button" onClick={() => setExpanded(true)} style={{ font: `500 11px ${FONT}`, color: ink, background: panel, border: `1px solid ${rule}`, borderRadius: 99, minHeight: 40, padding: "0 16px", cursor: "pointer" }}>Full screen ↗</button>}
                    {launched && <button type="button" onClick={leave} style={{ font: `500 11px ${FONT}`, color: ink, background: panel, border: `1px solid ${rule}`, borderRadius: 99, minHeight: 40, padding: "0 16px", cursor: "pointer" }}>Replay reveal ↺</button>}
                    {validLink && <a href={validLink.original} target="_blank" rel="noopener noreferrer" style={{ color: ink, textDecoration: "none", borderBottom: `1px solid ${bright}`, paddingBottom: 3, whiteSpace: "nowrap" }}>Open in Figma ↗</a>}
                </div>
            </div>
            {expanded && validLink && <div role="dialog" aria-modal="true" aria-label="Expanded Figma prototype" style={{ position: "fixed", inset: 12, zIndex: 9999, display: "flex", flexDirection: "column", background: panel, color: ink, border: `1px solid ${rule}`, borderRadius: rounded, boxShadow: "0 0 0 100vmax rgba(0,0,0,.86)", overflow: "hidden" }}>
                <header style={{ padding: "10px 17px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ font: `600 11px ${FONT}` }}>LIVE PROTOTYPE</span><button onClick={() => setExpanded(false)} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${rule}`, color: ink, borderRadius: 999, cursor: "pointer" }}>Close ✕</button></header>
                <iframe src={validLink.embed} title="Expanded interactive Figma prototype" allowFullScreen style={{ flex: 1, border: 0, width: "100%" }}/>
            </div>}
        </section>
    )
}

addPropertyControls(ScrollDevicePrototype, {
    device: { type: ControlType.Enum, title: "Device", options: ["macbook", "ipad"], optionTitles: ["MacBook", "iPad (landscape)"], defaultValue: "macbook" },
    figmaUrl: { type: ControlType.String, title: "Figma Prototype URL", placeholder: "https://www.figma.com/proto/..." },
    title: { type: ControlType.String, title: "Headline", defaultValue: "Take it for a spin." },
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "INTERACTIVE PROTOTYPE" },
    description: { type: ControlType.String, title: "Description", defaultValue: "A closer look at the experience, from the inside." },
    buttonText: { type: ControlType.String, title: "CTA", defaultValue: "Explore the prototype" },
    appearance: { type: ControlType.Enum, title: "Theme", options: ["auto", "dark", "light"], optionTitles: ["Follow system", "Dark", "Light"], defaultValue: "auto" },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#F3500F" },
    scrollHeight: { type: ControlType.Number, title: "Scroll height", min: 145, max: 320, step: 5, defaultValue: 195, unit: "vh" },
    maxWidth: { type: ControlType.Number, title: "Device max width", min: 480, max: 1400, step: 20, defaultValue: 1040, unit: "px" },
    showHeader: { type: ControlType.Boolean, title: "Show heading", defaultValue: true },
    showProgress: { type: ControlType.Boolean, title: "Show progress", defaultValue: true },
    autoLoad: { type: ControlType.Boolean, title: "Auto-load Figma", defaultValue: false },
})
