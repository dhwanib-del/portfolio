// ScreenShowcase — one reusable block for showing real product screens in a case study.
//
// Owner request (Oct 12): "make it easy for me to add product screens to case studies and have them
// look polished and consistent" + her screen-component spec (spotlight, duo, triptych, flow strip,
// phone stack, browser showcase, before/after, zoom to explore). One component, six layouts:
//   spotlight  one big screen; with 2+ screens a small chip row picks which one is shown
//   duo / trio two or three side by side (extra screens wrap); under ~640px container width phone
//              screens become a filmstrip, other frames stack
//   filmstrip  horizontal sequence: swipe, trackpad, mouse drag, prev/next, dots, arrow keys
//   deck       overlapping stack; click/tap/swipe/arrows bring the next screen forward
//   compare    before/after slider over exactly 2 screens (drag, click, arrow keys, Home/End)
// Frames: none | phone (theme-aware bezel, no notch) | browser (minimal bar, optional URL) | soft card.
// Screens come from the Screens list (image, or Image URL when the image is empty, optional video that
// wins over the image, alt, caption, step label) or from Screens JSON (wins when filled; may start
// with "json:" because Framer drops string props that start with "["). Nothing is hard-coded.
// Enlarge opens an accessible lightbox (Esc closes, arrows move, focus is trapped and returns).
// Aspect ratio is always preserved (object-fit, never stretched); "auto" reads each file's own size.
// Images lazy-load; videos play only on screen (and only if Autoplay is on and motion isn't reduced);
// no animation loops while idle. Empty: a quiet placeholder on the Framer canvas, nothing on the site.
// Theme tokens --db-* with fallbacks; light/dark via data-db-theme on <html>; root is data-db-keep.

import * as React from "react"
import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, startTransition } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType, useIsStaticRenderer, RenderTarget } from "framer"

type Layout = "spotlight" | "duo" | "trio" | "filmstrip" | "deck" | "compare"
type FrameKind = "none" | "phone" | "browser" | "soft"
type Fit = "contain" | "cover"
type CaptionStyle = "below" | "overlay" | "none"
type Img = { src?: string; srcSet?: string; alt?: string }
type RawScreen = {
    image?: Img | string
    src?: string
    url?: string
    video?: string
    alt?: string
    caption?: string
    label?: string
}
type Screen = { key: string; src: string; srcSet: string; video: string; alt: string; caption: string; label: string }

type Props = {
    layout: Layout
    frame: FrameKind
    url: string
    screens: RawScreen[]
    screensJson: string
    fit: Fit
    ratio: "auto" | "9:19.5" | "4:3" | "16:10" | "16:9" | "1:1"
    maxWidth: number
    gap: number
    align: "left" | "center" | "right"
    background: "none" | "surface" | "accent-tint"
    captionStyle: CaptionStyle
    enlarge: boolean
    showCounter: boolean
    autoplayVideo: boolean
    ariaLabel: string
    style?: React.CSSProperties
}

const RATIOS: Record<string, number> = { "9:19.5": 9 / 19.5, "4:3": 4 / 3, "16:10": 16 / 10, "16:9": 16 / 9, "1:1": 1 }
const FONT = "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const EASE = "cubic-bezier(.2,.75,.25,1)"
const NARROW = 640
const PHONE_DEFAULT = 9 / 19.5
const WIDE_DEFAULT = 16 / 10

const TEXT = "var(--db-text, #FAFAFA)"
const TEXT2 = "var(--db-text-2, rgba(255,255,255,0.62))"
const LINE = "var(--db-line, rgba(255,255,255,0.12))"
const SURFACE = "var(--db-surface, #111111)"
const ACCENT = "var(--db-accent, #F3500F)"

const CSS = `
.db-ss-lift{transition:transform .45s ${EASE};will-change:auto}
@media (hover:hover){.db-ss-lift:hover{transform:translateY(-4px)}}
.db-ss-btn{-webkit-tap-highlight-color:transparent}
.db-ss-btn:focus-visible,.db-ss-focus:focus-visible{outline:2px solid ${ACCENT};outline-offset:3px}
.db-ss-enl{transition:opacity .2s ease}
@media (hover:hover) and (pointer:fine){.db-ss-enl{opacity:0}.db-ss-shot:hover .db-ss-enl,.db-ss-enl:focus-visible{opacity:1}}
.db-ss-strip{scrollbar-width:none;-ms-overflow-style:none}
.db-ss-strip::-webkit-scrollbar{display:none}
.db-ss-navbtn{transition:background-color .2s ease,border-color .2s ease,opacity .2s ease}
@media (hover:hover){.db-ss-navbtn:not(:disabled):hover{border-color:color-mix(in srgb, ${TEXT} 40%, transparent)}}
@keyframes dbSsIn{from{opacity:0}to{opacity:1}}
.db-ss-fade{animation:dbSsIn .35s ease both}
@media (prefers-reduced-motion:reduce){
 .db-ss-lift,.db-ss-anim,.db-ss-navbtn{transition:none!important}
 .db-ss-fade{animation:none!important}
 .db-ss-lift:hover{transform:none}
}
`

const SR_ONLY: React.CSSProperties = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const pad2 = (n: number) => String(n).padStart(2, "0")

// ---------- data ----------

function normalize(raw: RawScreen | string, i: number): Screen | null {
    if (!raw) return null
    if (typeof raw === "string") raw = { src: raw }
    const img = raw.image
    const imgSrc = img && typeof img === "object" ? img.src || "" : typeof img === "string" ? img : ""
    const srcSet = img && typeof img === "object" ? img.srcSet || "" : ""
    const src = imgSrc || (typeof raw.src === "string" ? raw.src.trim() : "") || (typeof raw.url === "string" ? raw.url.trim() : "")
    const video = typeof raw.video === "string" ? raw.video.trim() : ""
    if (!src && !video) return null
    const label = typeof raw.label === "string" ? raw.label : ""
    const caption = typeof raw.caption === "string" ? raw.caption : ""
    const imgAlt = img && typeof img === "object" ? img.alt || "" : ""
    const alt = (typeof raw.alt === "string" && raw.alt) || imgAlt || label || caption || `Screen ${i + 1}`
    return { key: `${i}|${video || src}`, src: imgSrc ? imgSrc : src, srcSet: imgSrc ? srcSet : "", video, alt, caption, label }
}

function parseJson(s: string): RawScreen[] | null {
    if (typeof s !== "string" || !s.trim()) return null
    try {
        const v = JSON.parse(s.trim().replace(/^json:\s*/i, ""))
        return Array.isArray(v) ? v : null
    } catch {
        return null
    }
}

// ---------- hooks ----------

function useDbLight(): boolean {
    const [light, setLight] = useState(false)
    useEffect(() => {
        if (typeof document === "undefined") return
        const html = document.documentElement
        const read = () => {
            const attr = html.getAttribute("data-db-theme")
            let l = attr === "light"
            if (!attr && typeof window !== "undefined" && window.matchMedia) l = window.matchMedia("(prefers-color-scheme: light)").matches
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

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

function useWidth(ref: React.RefObject<HTMLElement | null>): number {
    const [w, setW] = useState(0)
    useIsoLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        const read = () => {
            const nw = Math.round(el.getBoundingClientRect().width)
            setW((p) => (p === nw ? p : nw))
        }
        read()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(read)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    return w
}

// ---------- pieces ----------

function Icon({ d, size = 14 }: { d: string; size?: number }) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    )
}
const I_PREV = "M10 3 5 8l5 5"
const I_NEXT = "M6 3l5 5-5 5"
const I_EXPAND = "M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9"
const I_CLOSE = "M3.5 3.5l9 9M12.5 3.5l-9 9"

function Shell({ frame, url, light, children, lift }: { frame: FrameKind; url: string; light: boolean; children: React.ReactNode; lift?: boolean }) {
    const cls = lift ? "db-ss-lift" : undefined
    if (frame === "phone") {
        return (
            <div className={cls} style={{ width: "100%", containerType: "inline-size" } as React.CSSProperties}>
                <div
                    style={{
                        padding: "max(5px, 2.6cqw)",
                        borderRadius: "max(20px, 13cqw)",
                        background: light ? "#FFFFFF" : "#17171A",
                        border: `1px solid ${light ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.12)"}`,
                        boxShadow: light
                            ? "0 1px 2px rgba(0,0,0,0.05), 0 28px 50px -30px rgba(0,0,0,0.40)"
                            : "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.95)",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            borderRadius: "max(15px, 10.4cqw)",
                            overflow: "hidden",
                            background: "#000",
                            boxShadow: light ? "0 0 0 1px rgba(0,0,0,0.06)" : "none",
                            transform: "translateZ(0)",
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        )
    }
    if (frame === "browser") {
        const barBg = light ? "#F3F3F4" : "#18181B"
        return (
            <div
                className={cls}
                style={{
                    width: "100%",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1px solid ${light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
                    background: SURFACE,
                    boxShadow: light ? "0 1px 2px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)" : "0 30px 60px -32px rgba(0,0,0,0.9)",
                    transform: "translateZ(0)",
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        position: "relative",
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 12px",
                        background: barBg,
                        borderBottom: `1px solid ${light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                    }}
                >
                    {[0, 1, 2].map((k) => (
                        <span key={k} style={{ width: 8, height: 8, borderRadius: 8, background: light ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.18)" }} />
                    ))}
                    {url ? (
                        <span
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%,-50%)",
                                maxWidth: "min(380px, 56%)",
                                height: 18,
                                lineHeight: "18px",
                                padding: "0 12px",
                                borderRadius: 6,
                                background: light ? "#FFFFFF" : "#0E0E10",
                                border: `1px solid ${light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
                                color: light ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
                                fontFamily: FONT,
                                fontSize: 11,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                boxSizing: "border-box",
                            }}
                        >
                            {url}
                        </span>
                    ) : null}
                </div>
                <div style={{ position: "relative" }}>{children}</div>
            </div>
        )
    }
    if (frame === "soft") {
        return (
            <div
                className={cls}
                style={{
                    width: "100%",
                    position: "relative",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${LINE}`,
                    background: SURFACE,
                    boxShadow: light ? "0 1px 2px rgba(0,0,0,0.04), 0 22px 44px -28px rgba(0,0,0,0.30)" : "0 26px 54px -30px rgba(0,0,0,0.9)",
                    transform: "translateZ(0)",
                }}
            >
                {children}
            </div>
        )
    }
    return (
        <div className={cls} style={{ width: "100%", position: "relative", borderRadius: 12, overflow: "hidden", transform: "translateZ(0)" }}>
            {children}
        </div>
    )
}

type MediaProps = {
    s: Screen
    fit: Fit
    sizes: string
    autoplay: boolean
    reduced: boolean
    isStatic: boolean
    onNatural: (k: string, r: number) => void
    eager?: boolean
    decorative?: boolean
}

function Media({ s, fit, sizes, autoplay, reduced, isStatic, onNatural, eager, decorative }: MediaProps) {
    const vRef = useRef<HTMLVideoElement | null>(null)
    const iRef = useRef<HTMLImageElement | null>(null)
    const play = autoplay && !reduced && !isStatic

    useEffect(() => {
        const im = iRef.current
        if (im && im.complete && im.naturalWidth) onNatural(s.key, im.naturalWidth / im.naturalHeight)
        const v = vRef.current
        if (v && v.readyState >= 1 && v.videoWidth) onNatural(s.key, v.videoWidth / v.videoHeight)
    }, [s.key, onNatural])

    // Videos only run while on screen; paused (never looping) off screen.
    useEffect(() => {
        const v = vRef.current
        if (!v || isStatic) return
        if (typeof IntersectionObserver === "undefined") {
            if (play) v.play().catch(() => {})
            return
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    if (play) v.play().catch(() => {})
                } else if (!v.paused) v.pause()
            },
            { threshold: 0.25 }
        )
        io.observe(v)
        return () => io.disconnect()
    }, [s.video, play, isStatic])

    const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, display: "block" }
    if (s.video) {
        return (
            <video
                ref={vRef}
                src={s.video}
                poster={s.src || undefined}
                muted
                loop
                playsInline
                preload="metadata"
                controls={!play && !decorative}
                aria-label={decorative ? undefined : s.alt}
                aria-hidden={decorative || undefined}
                tabIndex={decorative ? -1 : undefined}
                onLoadedMetadata={(e) => {
                    const v = e.currentTarget
                    if (v.videoWidth) onNatural(s.key, v.videoWidth / v.videoHeight)
                }}
                style={fill}
            />
        )
    }
    return (
        <img
            ref={iRef}
            src={s.src}
            srcSet={s.srcSet || undefined}
            sizes={s.srcSet ? sizes : undefined}
            alt={decorative ? "" : s.alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            onLoad={(e) => {
                const im = e.currentTarget
                if (im.naturalWidth) onNatural(s.key, im.naturalWidth / im.naturalHeight)
            }}
            style={fill}
        />
    )
}

function CaptionText({ s, align }: { s: Screen; align?: "left" | "center" | "right" }) {
    if (!s.label && !s.caption) return null
    return (
        <figcaption style={{ marginTop: 14, textAlign: align || "left", fontFamily: FONT }}>
            {s.label ? (
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", color: TEXT2, lineHeight: 1.4 }}>{s.label}</div>
            ) : null}
            {s.caption ? (
                <div style={{ marginTop: s.label ? 4 : 0, fontSize: 14, lineHeight: 1.55, color: `color-mix(in srgb, ${TEXT} 84%, transparent)` }}>{s.caption}</div>
            ) : null}
        </figcaption>
    )
}

function Overlay({ s }: { s: Screen }) {
    if (!s.label && !s.caption) return null
    return (
        <div
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "40px 14px 12px",
                background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)",
                color: "#FFFFFF",
                fontFamily: FONT,
                pointerEvents: "none",
            }}
        >
            {s.label ? <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", opacity: 0.78 }}>{s.label}</div> : null}
            {s.caption ? <div style={{ marginTop: s.label ? 3 : 0, fontSize: 13, lineHeight: 1.45 }}>{s.caption}</div> : null}
        </div>
    )
}

function EnlargeBtn({ label, onClick }: { label: string; onClick: (el: HTMLElement) => void }) {
    return (
        <button
            type="button"
            className="db-ss-btn db-ss-enl"
            aria-label={label}
            aria-haspopup="dialog"
            onClick={(e) => {
                e.stopPropagation()
                onClick(e.currentTarget)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 3,
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(12,12,14,0.58)",
                color: "#FFFFFF",
                cursor: "zoom-in",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            }}
        >
            <Icon d={I_EXPAND} size={13} />
        </button>
    )
}

type ShotProps = {
    s: Screen
    i: number
    total: number
    frame: FrameKind
    url: string
    aspect: number
    fit: Fit
    captionStyle: CaptionStyle
    light: boolean
    enlarge: boolean
    onEnlarge: (i: number, el: HTMLElement) => void
    onNatural: (k: string, r: number) => void
    autoplay: boolean
    reduced: boolean
    isStatic: boolean
    sizes: string
    lift?: boolean
    belowCaption?: boolean
    captionAlign?: "left" | "center" | "right"
    decorative?: boolean
    eager?: boolean
}

function Shot(p: ShotProps) {
    const { s, frame } = p
    return (
        <figure style={{ margin: 0, width: "100%", minWidth: 0 }}>
            <Shell frame={frame} url={p.url} light={p.light} lift={p.lift}>
                <div className="db-ss-shot" style={{ position: "relative", width: "100%", aspectRatio: String(p.aspect), background: frame === "phone" ? "#000" : SURFACE }}>
                    <Media
                        s={s}
                        fit={p.fit}
                        sizes={p.sizes}
                        autoplay={p.autoplay}
                        reduced={p.reduced}
                        isStatic={p.isStatic}
                        onNatural={p.onNatural}
                        decorative={p.decorative}
                        eager={p.eager}
                    />
                    {p.captionStyle === "overlay" ? <Overlay s={s} /> : null}
                    {p.enlarge && !p.decorative ? (
                        <EnlargeBtn label={`Enlarge screen ${p.i + 1} of ${p.total}: ${s.alt}`} onClick={(el) => p.onEnlarge(p.i, el)} />
                    ) : null}
                </div>
            </Shell>
            {p.captionStyle === "below" && p.belowCaption !== false ? <CaptionText s={s} align={p.captionAlign} /> : null}
        </figure>
    )
}

function NavBtn({ dir, onClick, disabled, label }: { dir: "prev" | "next"; onClick: () => void; disabled?: boolean; label: string }) {
    return (
        <button
            type="button"
            className="db-ss-btn db-ss-navbtn"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            style={{
                width: 36,
                height: 36,
                flex: "0 0 36px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                borderRadius: 999,
                border: `1px solid ${LINE}`,
                background: "transparent",
                color: TEXT,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.35 : 1,
            }}
        >
            <Icon d={dir === "prev" ? I_PREV : I_NEXT} />
        </button>
    )
}

function Nav({
    n,
    i,
    go,
    loop,
    showCounter,
    justify,
    screens,
}: {
    n: number
    i: number
    go: (k: number) => void
    loop: boolean
    showCounter: boolean
    justify: string
    screens: Screen[]
}) {
    if (n < 2) return null
    const cur = screens[i]
    return (
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: justify, gap: 14, marginTop: 20, fontFamily: FONT }}>
            <NavBtn dir="prev" label="Previous screen" disabled={!loop && i <= 0} onClick={() => go(loop ? (i - 1 + n) % n : i - 1)} />
            <div role="group" aria-label="Choose a screen" style={{ display: "flex", alignItems: "center" }}>
                {screens.map((s, k) => (
                    <button
                        key={k}
                        type="button"
                        className="db-ss-btn"
                        aria-label={`Screen ${k + 1}${s.label ? `: ${s.label}` : ""}`}
                        aria-current={k === i ? "true" : undefined}
                        onClick={() => go(k)}
                        style={{ width: k === i ? 30 : 18, height: 24, padding: 0, border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <span
                            className="db-ss-anim"
                            style={{
                                display: "block",
                                width: k === i ? 20 : 6,
                                height: 6,
                                borderRadius: 6,
                                background: k === i ? ACCENT : `color-mix(in srgb, ${TEXT} 28%, transparent)`,
                                transition: `width .3s ${EASE}, background-color .3s ease`,
                            }}
                        />
                    </button>
                ))}
            </div>
            {showCounter ? (
                <span aria-hidden="true" style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", color: TEXT2, fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "center" }}>
                    {pad2(i + 1)} / {pad2(n)}
                </span>
            ) : null}
            <NavBtn dir="next" label="Next screen" disabled={!loop && i >= n - 1} onClick={() => go(loop ? (i + 1) % n : i + 1)} />
            <span aria-live="polite" style={SR_ONLY}>
                {`Screen ${i + 1} of ${n}${cur && cur.label ? `: ${cur.label}` : ""}`}
            </span>
        </div>
    )
}

// ---------- lightbox ----------

function Lightbox({
    screens,
    index,
    setIndex,
    onClose,
    light,
    reduced,
    returnTo,
}: {
    screens: Screen[]
    index: number
    setIndex: (i: number) => void
    onClose: () => void
    light: boolean
    reduced: boolean
    returnTo: React.MutableRefObject<HTMLElement | null>
}) {
    const dlg = useRef<HTMLDivElement | null>(null)
    const closeRef = useRef<HTMLButtonElement | null>(null)
    const n = screens.length
    const s = screens[clamp(index, 0, n - 1)]
    const idxRef = useRef(index)
    idxRef.current = index
    const swipe = useRef<number | null>(null)

    useEffect(() => {
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const t = setTimeout(() => closeRef.current && closeRef.current.focus(), 0)
        const back = returnTo.current
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                onClose()
            } else if (e.key === "ArrowRight" && n > 1) {
                e.preventDefault()
                setIndex((idxRef.current + 1) % n)
            } else if (e.key === "ArrowLeft" && n > 1) {
                e.preventDefault()
                setIndex((idxRef.current - 1 + n) % n)
            } else if (e.key === "Tab" && dlg.current) {
                const f = Array.from(dlg.current.querySelectorAll<HTMLElement>("button, video[controls]")).filter((el) => !(el as HTMLButtonElement).disabled)
                if (!f.length) return
                const first = f[0]
                const last = f[f.length - 1]
                const a = document.activeElement
                if (e.shiftKey && (a === first || !dlg.current.contains(a))) {
                    e.preventDefault()
                    last.focus()
                } else if (!e.shiftKey && (a === last || !dlg.current.contains(a))) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        document.addEventListener("keydown", onKey)
        return () => {
            clearTimeout(t)
            document.body.style.overflow = prevOverflow
            document.removeEventListener("keydown", onKey)
            if (back && back.isConnected) back.focus()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!s) return null
    const fg = light ? "#0A0A0A" : "#FAFAFA"
    const fg2 = light ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.66)"
    const btnStyle: React.CSSProperties = {
        width: 44,
        height: 44,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        borderRadius: 999,
        border: `1px solid ${light ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.2)"}`,
        background: light ? "#FFFFFF" : "#141416",
        color: fg,
        cursor: "pointer",
        flex: "0 0 44px",
    }
    return createPortal(
        <div
            ref={dlg}
            role="dialog"
            aria-modal="true"
            aria-label={`Screen ${index + 1} of ${n}: ${s.alt}`}
            data-db-keep=""
            className="db-ss-fade"
            onClick={onClose}
            onPointerDown={(e) => (swipe.current = e.clientX)}
            onPointerUp={(e) => {
                if (swipe.current == null || n < 2) return
                const dx = e.clientX - swipe.current
                swipe.current = null
                if (Math.abs(dx) > 50 && e.pointerType !== "mouse") setIndex(dx < 0 ? (index + 1) % n : (index - 1 + n) % n)
            }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483000,
                display: "flex",
                flexDirection: "column",
                background: light ? "rgba(246,246,248,0.97)" : "rgba(6,6,8,0.95)",
                fontFamily: FONT,
                color: fg,
                cursor: "zoom-out",
            }}
        >
            <style>{CSS}</style>
            <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", cursor: "default" }}>
                <div style={{ fontSize: 13, color: fg2, fontVariantNumeric: "tabular-nums", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n > 1 ? `${pad2(index + 1)} / ${pad2(n)}` : ""}
                    {s.label ? <span style={{ marginLeft: n > 1 ? 12 : 0, color: fg }}>{s.label}</span> : null}
                </div>
                <button ref={closeRef} type="button" className="db-ss-btn" aria-label="Close" onClick={onClose} style={btnStyle}>
                    <Icon d={I_CLOSE} />
                </button>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 16px" }}>
                {n > 1 ? (
                    <button
                        type="button"
                        className="db-ss-btn"
                        aria-label="Previous screen"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIndex((index - 1 + n) % n)
                        }}
                        style={btnStyle}
                    >
                        <Icon d={I_PREV} />
                    </button>
                ) : null}
                <div key={s.key} className={reduced ? undefined : "db-ss-fade"} style={{ flex: "1 1 auto", minWidth: 0, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.video ? (
                        <video
                            src={s.video}
                            poster={s.src || undefined}
                            controls
                            playsInline
                            muted
                            autoPlay={!reduced}
                            loop
                            aria-label={s.alt}
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 14, display: "block", cursor: "default" }}
                        />
                    ) : (
                        <img
                            src={s.src}
                            srcSet={s.srcSet || undefined}
                            sizes={s.srcSet ? "100vw" : undefined}
                            alt={s.alt}
                            decoding="async"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                borderRadius: 14,
                                display: "block",
                                cursor: "default",
                                boxShadow: light ? "0 24px 60px -24px rgba(0,0,0,0.35)" : "0 24px 80px rgba(0,0,0,0.5)",
                            }}
                        />
                    )}
                </div>
                {n > 1 ? (
                    <button
                        type="button"
                        className="db-ss-btn"
                        aria-label="Next screen"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIndex((index + 1) % n)
                        }}
                        style={btnStyle}
                    >
                        <Icon d={I_NEXT} />
                    </button>
                ) : null}
            </div>
            <div onClick={(e) => e.stopPropagation()} style={{ minHeight: 56, padding: "14px 16px 20px", textAlign: "center", cursor: "default" }}>
                {s.caption ? <div style={{ maxWidth: 640, margin: "0 auto", fontSize: 14, lineHeight: 1.55, color: fg2 }}>{s.caption}</div> : null}
            </div>
        </div>,
        document.body
    )
}

// ---------- layouts ----------

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 960
 */
export default function ScreenShowcase(props: Props) {
    const {
        layout = "spotlight",
        frame = "phone",
        url = "",
        screens: screensProp = [],
        screensJson = "",
        fit = "contain",
        ratio = "auto",
        maxWidth = 0,
        gap = 32,
        align = "center",
        background = "none",
        captionStyle = "below",
        enlarge = true,
        showCounter = true,
        autoplayVideo = true,
        ariaLabel = "Product screens",
        style,
    } = props

    const rootRef = useRef<HTMLDivElement | null>(null)
    const width = useWidth(rootRef)
    const light = useDbLight()
    const reduced = useReducedMotion()
    const isStatic = useIsStaticRenderer()
    let onCanvas = false
    try {
        onCanvas = RenderTarget.current() === RenderTarget.canvas
    } catch {}

    const screens = useMemo(() => {
        const fromJson = parseJson(screensJson)
        const raw = fromJson || (Array.isArray(screensProp) ? screensProp : [])
        return raw.map((r, i) => normalize(r as RawScreen, i)).filter(Boolean) as Screen[]
    }, [screensJson, screensProp])
    const n = screens.length
    const jsonBroken = !!(screensJson && screensJson.trim() && !parseJson(screensJson))

    const [naturals, setNaturals] = useState<Record<string, number>>({})
    const onNatural = useCallback((k: string, r: number) => {
        if (!isFinite(r) || r <= 0) return
        setNaturals((p) => (p[k] && Math.abs(p[k] - r) < 0.001 ? p : { ...p, [k]: r }))
    }, [])
    const fixed = ratio !== "auto" ? RATIOS[ratio] : 0
    const fallback = frame === "phone" ? PHONE_DEFAULT : WIDE_DEFAULT
    const aspectOf = (s: Screen | undefined) => fixed || (s && naturals[s.key]) || fallback

    const [lb, setLb] = useState<number | null>(null)
    const trigger = useRef<HTMLElement | null>(null)
    const openLb = useCallback((i: number, el: HTMLElement) => {
        trigger.current = el
        startTransition(() => setLb(i))
    }, [])

    const narrow = width > 0 && width < NARROW
    const avail = width || 960
    const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
    const bgPad = background === "none" ? 0 : narrow ? 20 : 44
    const inner = Math.max(0, avail - bgPad * 2)
    const g = narrow ? Math.min(Math.max(0, gap), 16) : Math.max(0, gap)
    const isPhone = frame === "phone"

    let eff: Layout | "stack" = layout
    if ((layout === "duo" || layout === "trio") && narrow) eff = isPhone ? "filmstrip" : "stack"
    if (layout === "compare" && n < 2) eff = "spotlight"

    const shared = {
        total: n,
        frame,
        url,
        fit,
        captionStyle,
        light,
        enlarge,
        onEnlarge: openLb,
        onNatural,
        autoplay: autoplayVideo,
        reduced,
        isStatic,
    }

    // ----- spotlight -----
    const [sel, setSel] = useState(0)
    const selI = clamp(sel, 0, Math.max(0, n - 1))

    // ----- filmstrip -----
    const stripRef = useRef<HTMLDivElement | null>(null)
    const [active, setActive] = useState(0)
    const activeI = clamp(active, 0, Math.max(0, n - 1))
    const rafPending = useRef(0)
    const drag = useRef<{ x: number; sl: number; moved: boolean; id: number } | null>(null)
    const suppressClick = useRef(false)

    const nearest = useCallback(() => {
        const el = stripRef.current
        if (!el) return 0
        const kids = Array.from(el.children) as HTMLElement[]
        const max = el.scrollWidth - el.clientWidth
        if (max > 2 && el.scrollLeft >= max - 2) return kids.length - 1
        let best = 0
        let bd = Infinity
        kids.forEach((k, i) => {
            const d = Math.abs(k.offsetLeft - el.scrollLeft)
            if (d < bd) {
                bd = d
                best = i
            }
        })
        return best
    }, [])

    const stripGo = useCallback(
        (i: number) => {
            const el = stripRef.current
            if (!el) return
            const k = clamp(i, 0, el.children.length - 1)
            const item = el.children[k] as HTMLElement
            if (!item) return
            el.scrollTo({ left: item.offsetLeft, behavior: reduced ? "auto" : "smooth" })
            setActive(k)
        },
        [reduced]
    )

    // Only show filmstrip controls when there is something to scroll to.
    const [stripScrolls, setStripScrolls] = useState(true)
    useIsoLayoutEffect(() => {
        const el = stripRef.current
        if (!el) return
        const v = el.scrollWidth > el.clientWidth + 2
        setStripScrolls((p) => (p === v ? p : v))
    })

    const onStripScroll = () => {
        if (rafPending.current || typeof window === "undefined") return
        rafPending.current = window.requestAnimationFrame(() => {
            rafPending.current = 0
            if (drag.current) return
            const k = nearest()
            setActive((p) => (p === k ? p : k))
        })
    }
    useEffect(
        () => () => {
            if (rafPending.current && typeof window !== "undefined") window.cancelAnimationFrame(rafPending.current)
        },
        []
    )

    const stripHandlers = {
        onScroll: onStripScroll,
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.pointerType !== "mouse" || e.button !== 0 || !stripRef.current) return
            drag.current = { x: e.clientX, sl: stripRef.current.scrollLeft, moved: false, id: e.pointerId }
        },
        onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
            const d = drag.current
            const el = stripRef.current
            if (!d || !el) return
            const dx = e.clientX - d.x
            if (!d.moved && Math.abs(dx) > 5) {
                d.moved = true
                el.style.scrollSnapType = "none"
                el.style.cursor = "grabbing"
                try {
                    el.setPointerCapture(d.id)
                } catch {}
            }
            if (d.moved) el.scrollLeft = d.sl - dx
        },
        onPointerUp: () => {
            const d = drag.current
            const el = stripRef.current
            drag.current = null
            if (!d || !el) return
            if (d.moved) {
                suppressClick.current = true
                el.style.cursor = ""
                const k = nearest()
                const item = el.children[k] as HTMLElement
                el.scrollTo({ left: item ? item.offsetLeft : el.scrollLeft, behavior: reduced ? "auto" : "smooth" })
                setActive(k)
                window.setTimeout(() => {
                    if (stripRef.current) stripRef.current.style.scrollSnapType = ""
                }, 450)
            }
        },
        onPointerCancel: () => {
            drag.current = null
            if (stripRef.current) {
                stripRef.current.style.scrollSnapType = ""
                stripRef.current.style.cursor = ""
            }
        },
        onClickCapture: (e: React.MouseEvent) => {
            if (suppressClick.current) {
                suppressClick.current = false
                e.stopPropagation()
                e.preventDefault()
            }
        },
    }

    // ----- deck -----
    const [front, setFront] = useState(0)
    const frontI = clamp(front, 0, Math.max(0, n - 1))
    const deckSwipe = useRef<{ x: number; y: number } | null>(null)
    const deckSwiped = useRef(false)

    // ----- compare -----
    const [pos, setPos] = useState(50)
    const cmpRef = useRef<HTMLDivElement | null>(null)
    const cmpDrag = useRef(false)
    const posFromX = (x: number) => {
        const el = cmpRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.width <= 0) return
        setPos(clamp(((x - r.left) / r.width) * 100, 0, 100))
    }

    const regionKey = (go: (d: number) => void) => (e: React.KeyboardEvent) => {
        if (e.target !== e.currentTarget) return
        if (e.key === "ArrowRight") {
            e.preventDefault()
            go(1)
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            go(-1)
        }
    }

    // ----- empty -----
    if (n === 0) {
        if (!onCanvas) return <div ref={rootRef} data-db-keep="" style={{ ...style, width: "100%", height: 0 }} aria-hidden="true" />
        return (
            <div ref={rootRef} data-db-keep="" style={{ ...style, width: "100%", fontFamily: FONT }}>
                <style>{CSS}</style>
                <Placeholder layout={layout} frame={frame} jsonBroken={jsonBroken} />
            </div>
        )
    }

    let body: React.ReactNode = null

    if (eff === "spotlight") {
        const s = screens[selI]
        const cap = maxWidth > 0 ? maxWidth : isPhone ? 340 : 0
        const w = cap ? Math.min(cap, inner) : inner
        body = (
            <div>
                <div style={{ width: cap ? `min(${cap}px, 100%)` : "100%", marginLeft: align === "left" ? 0 : "auto", marginRight: align === "right" ? 0 : "auto" }}>
                    <div key={s.key} className={n > 1 && !reduced ? "db-ss-fade" : undefined}>
                        <Shot {...shared} s={s} i={selI} aspect={aspectOf(s)} sizes={`${Math.round(w)}px`} lift captionAlign={align} eager />
                    </div>
                </div>
                {n > 1 ? (
                    <div
                        role="group"
                        aria-label="Choose a screen"
                        onKeyDown={(e) => {
                            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
                            e.preventDefault()
                            const k = (selI + (e.key === "ArrowRight" ? 1 : -1) + n) % n
                            setSel(k)
                            const btns = (e.currentTarget as HTMLElement).querySelectorAll("button")
                            if (btns[k]) (btns[k] as HTMLElement).focus()
                        }}
                        style={{ display: "flex", flexWrap: "wrap", justifyContent: justify, alignItems: "center", gap: 8, marginTop: 20, fontFamily: FONT }}
                    >
                        {screens.map((t, k) => (
                            <button
                                key={t.key}
                                type="button"
                                className="db-ss-btn db-ss-navbtn"
                                aria-pressed={k === selI}
                                aria-label={t.label ? undefined : `Screen ${k + 1}: ${t.alt}`}
                                onClick={() => setSel(k)}
                                style={{
                                    minHeight: 34,
                                    padding: "6px 14px",
                                    borderRadius: 999,
                                    border: `1px solid ${k === selI ? ACCENT : LINE}`,
                                    background: k === selI ? `color-mix(in srgb, ${ACCENT} 12%, transparent)` : "transparent",
                                    color: k === selI ? TEXT : TEXT2,
                                    fontFamily: FONT,
                                    fontSize: 12.5,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                {t.label || pad2(k + 1)}
                            </button>
                        ))}
                        {showCounter ? (
                            <span aria-hidden="true" style={{ marginLeft: 6, fontSize: 12, color: TEXT2, fontVariantNumeric: "tabular-nums", letterSpacing: "0.06em" }}>
                                {pad2(selI + 1)} / {pad2(n)}
                            </span>
                        ) : null}
                        <span aria-live="polite" style={SR_ONLY}>{`Showing screen ${selI + 1} of ${n}${s.label ? `: ${s.label}` : ""}`}</span>
                    </div>
                ) : null}
            </div>
        )
    } else if (eff === "duo" || eff === "trio" || eff === "stack") {
        const cols = eff === "duo" ? 2 : eff === "trio" ? 3 : 1
        const cap = maxWidth > 0 ? maxWidth : isPhone ? 300 : 0
        const colW = (inner - (cols - 1) * g) / cols
        const w = cap ? Math.min(cap, colW) : colW
        body = (
            <div role="list" style={{ display: "flex", flexDirection: cols === 1 ? "column" : "row", flexWrap: cols === 1 ? "nowrap" : "wrap", gap: g, justifyContent: justify, alignItems: cols === 1 ? (align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center") : "flex-start" }}>
                {screens.map((s, i) => (
                    <div
                        key={s.key}
                        role="listitem"
                        style={{
                            flex: cols === 1 ? "0 0 auto" : `0 1 calc((100% - ${(cols - 1) * g}px) / ${cols})`,
                            width: cols === 1 ? "100%" : undefined,
                            maxWidth: cap || undefined,
                            minWidth: 0,
                        }}
                    >
                        <Shot {...shared} s={s} i={i} aspect={aspectOf(s)} sizes={`${Math.round(w)}px`} lift />
                    </div>
                ))}
            </div>
        )
    } else if (eff === "filmstrip") {
        const cap = maxWidth > 0 ? maxWidth : isPhone ? 260 : 640
        const itemW = Math.round(Math.max(120, Math.min(cap, inner * (isPhone ? (narrow ? 0.66 : 0.4) : narrow ? 0.86 : 0.72))))
        const canScroll = n > 1 && stripScrolls
        body = (
            <div>
                <div
                    ref={stripRef}
                    className="db-ss-strip db-ss-focus"
                    role="region"
                    aria-roledescription="carousel"
                    aria-label={`${ariaLabel}. Use left and right arrow keys to move between screens.`}
                    tabIndex={0}
                    onKeyDown={regionKey((d) => stripGo(activeI + d))}
                    {...stripHandlers}
                    style={{
                        position: "relative",
                        display: "flex",
                        gap: g,
                        overflowX: "auto",
                        overflowY: "hidden",
                        scrollSnapType: "x mandatory",
                        overscrollBehaviorX: "contain",
                        padding: "14px 0 48px",
                        margin: "-14px 0 -48px",
                        cursor: canScroll ? "grab" : undefined,
                        touchAction: "pan-x pan-y",
                        borderRadius: 4,
                    }}
                >
                    {screens.map((s, i) => (
                        <div
                            key={s.key}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} of ${n}${s.label ? `: ${s.label}` : ""}`}
                            style={{ flex: `0 0 ${itemW}px`, width: itemW, scrollSnapAlign: "start", minWidth: 0 }}
                        >
                            <Shot {...shared} s={s} i={i} aspect={aspectOf(s)} sizes={`${itemW}px`} lift />
                        </div>
                    ))}
                </div>
                {canScroll ? <Nav n={n} i={activeI} go={stripGo} loop={false} showCounter={showCounter} justify={justify} screens={screens} /> : null}
            </div>
        )
    } else if (eff === "deck") {
        const cap = maxWidth > 0 ? maxWidth : isPhone ? 280 : 600
        const cardW = Math.round(Math.max(140, Math.min(cap, inner / 1.34)))
        const go = (k: number) => setFront(((k % n) + n) % n)
        const shift = 0.19
        const s = screens[frontI]
        const tallest = Math.max(...screens.map((t) => 1 / aspectOf(t)))
        body = (
            <div>
                <div
                    className="db-ss-focus"
                    role="region"
                    aria-roledescription="carousel"
                    aria-label={`${ariaLabel}. Stacked screens: press the right arrow key or click the front screen to bring the next one forward.`}
                    tabIndex={0}
                    onKeyDown={regionKey((d) => go(frontI + d))}
                    onPointerDown={(e) => {
                        deckSwipe.current = { x: e.clientX, y: e.clientY }
                        deckSwiped.current = false
                    }}
                    onPointerUp={(e) => {
                        const st = deckSwipe.current
                        deckSwipe.current = null
                        if (!st || n < 2) return
                        const dx = e.clientX - st.x
                        const dy = e.clientY - st.y
                        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                            deckSwiped.current = true
                            go(frontI + (dx < 0 ? 1 : -1))
                        }
                    }}
                    onPointerCancel={() => (deckSwipe.current = null)}
                    style={{
                        display: "grid",
                        justifyContent: justify,
                        padding: `8px ${align === "center" ? 0 : Math.round(cardW * 0.14)}px 18px`,
                        touchAction: "pan-y",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        borderRadius: 4,
                    }}
                >
                    <div style={{ display: "grid", width: cardW }}>
                        {screens.map((t, i) => {
                            const k = (i - frontI + n) % n
                            const vis = k <= 2
                            const sign = k === 2 ? -1 : 1
                            const sc = k === 0 ? 1 : k === 1 ? 0.9 : 0.82
                            const tx = k === 0 ? 0 : sign * shift * 100
                            const rot = k === 0 ? 0 : sign * 2.2
                            return (
                                <div
                                    key={t.key}
                                    role="group"
                                    aria-roledescription="slide"
                                    aria-label={`${i + 1} of ${n}${t.label ? `: ${t.label}` : ""}`}
                                    aria-hidden={k !== 0 || undefined}
                                    ref={(el: HTMLDivElement | null) => {
                                        // set as a DOM property: works on React 18 and 19 alike
                                        if (el) (el as any).inert = k !== 0
                                    }}
                                    className="db-ss-anim"
                                    onClick={() => {
                                        if (deckSwiped.current) {
                                            deckSwiped.current = false
                                            return
                                        }
                                        if (n < 2) return
                                        go(k === 0 ? frontI + 1 : i)
                                    }}
                                    style={{
                                        gridArea: "1 / 1",
                                        alignSelf: "center",
                                        position: "relative",
                                        zIndex: n - k,
                                        transform: `translateX(${tx}%) scale(${sc}) rotate(${rot}deg)`,
                                        transformOrigin: "50% 60%",
                                        opacity: vis ? 1 : 0,
                                        visibility: vis ? "visible" : "hidden",
                                        transition: reduced ? "none" : `transform .55s ${EASE}, opacity .35s ease, visibility .35s`,
                                        cursor: n > 1 ? "pointer" : undefined,
                                        pointerEvents: vis ? "auto" : "none",
                                    }}
                                >
                                    <Shot
                                        {...shared}
                                        s={t}
                                        i={i}
                                        aspect={aspectOf(t)}
                                        sizes={`${cardW}px`}
                                        belowCaption={false}
                                        captionStyle={captionStyle === "overlay" ? "overlay" : "none"}
                                        enlarge={enlarge && k === 0}
                                    />
                                    <div
                                        aria-hidden="true"
                                        className="db-ss-anim"
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            borderRadius: isPhone ? Math.max(20, cardW * 0.13) : frame === "soft" ? 16 : 12,
                                            background: light ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)",
                                            opacity: k === 0 ? 0 : k === 1 ? (light ? 0.28 : 0.36) : light ? 0.45 : 0.55,
                                            transition: reduced ? "none" : "opacity .45s ease",
                                            pointerEvents: "none",
                                        }}
                                    />
                                </div>
                            )
                        })}
                        {/* keeps the stack's height steady when screens have different shapes */}
                        <div aria-hidden="true" style={{ gridArea: "1 / 1", width: cardW, aspectRatio: String(1 / tallest), visibility: "hidden", pointerEvents: "none" }} />
                    </div>
                </div>
                {captionStyle === "below" ? (
                    <div style={{ display: "flex", justifyContent: justify }}>
                        <div style={{ width: `min(${Math.max(cardW, 320)}px, 100%)`, minHeight: s.caption || s.label ? 0 : undefined }}>
                            <CaptionText s={s} align={align} />
                        </div>
                    </div>
                ) : null}
                <Nav n={n} i={frontI} go={go} loop showCounter={showCounter} justify={justify} screens={screens} />
            </div>
        )
    } else if (eff === "compare") {
        const a = screens[0]
        const b = screens[1]
        const cap = maxWidth > 0 ? maxWidth : isPhone ? 340 : 0
        const w = cap ? Math.min(cap, inner) : inner
        const asp = aspectOf(a)
        const chip = (t: string, side: "left" | "right"): React.ReactNode => (
            <span
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 12,
                    [side]: 12,
                    zIndex: 2,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(12,12,14,0.62)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#FFFFFF",
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    pointerEvents: "none",
                    maxWidth: "42%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {t}
            </span>
        )
        const step = (d: number) => setPos((p) => clamp(p + d, 0, 100))
        body = (
            <div>
                <figure style={{ margin: 0, width: cap ? `min(${cap}px, 100%)` : "100%", marginLeft: align === "left" ? 0 : "auto", marginRight: align === "right" ? 0 : "auto" }}>
                    <Shell frame={frame} url={url} light={light}>
                        <div
                            ref={cmpRef}
                            className="db-ss-shot"
                            onPointerDown={(e) => {
                                if (e.button !== 0 && e.pointerType === "mouse") return
                                cmpDrag.current = true
                                try {
                                    e.currentTarget.setPointerCapture(e.pointerId)
                                } catch {}
                                posFromX(e.clientX)
                            }}
                            onPointerMove={(e) => {
                                if (cmpDrag.current) posFromX(e.clientX)
                            }}
                            onPointerUp={() => (cmpDrag.current = false)}
                            onPointerCancel={() => (cmpDrag.current = false)}
                            style={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: String(asp),
                                background: isPhone ? "#000" : SURFACE,
                                touchAction: "pan-y",
                                cursor: "ew-resize",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                overflow: "hidden",
                            }}
                        >
                            <Media s={b} fit={fit} sizes={`${Math.round(w)}px`} autoplay={autoplayVideo} reduced={reduced} isStatic={isStatic} onNatural={onNatural} />
                            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                                <Media s={a} fit={fit} sizes={`${Math.round(w)}px`} autoplay={autoplayVideo} reduced={reduced} isStatic={isStatic} onNatural={onNatural} />
                            </div>
                            {chip(a.label || "Before", "left")}
                            {chip(b.label || "After", "right")}
                            <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, marginLeft: -1, background: "#FFFFFF", boxShadow: "0 0 0 1px rgba(0,0,0,0.18), 0 0 12px rgba(0,0,0,0.25)", pointerEvents: "none", zIndex: 2 }} />
                            <div
                                role="slider"
                                tabIndex={0}
                                className="db-ss-btn"
                                aria-label={`Compare ${a.label || "before"} and ${b.label || "after"}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(pos)}
                                aria-valuetext={`${Math.round(pos)}% ${a.label || "before"} shown`}
                                onKeyDown={(e) => {
                                    const big = e.shiftKey ? 10 : 5
                                    if (e.key === "ArrowLeft" || e.key === "ArrowDown") step(-big)
                                    else if (e.key === "ArrowRight" || e.key === "ArrowUp") step(big)
                                    else if (e.key === "Home") setPos(0)
                                    else if (e.key === "End") setPos(100)
                                    else if (e.key === "PageDown") step(-25)
                                    else if (e.key === "PageUp") step(25)
                                    else return
                                    e.preventDefault()
                                }}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: `${pos}%`,
                                    width: 40,
                                    height: 40,
                                    marginLeft: -20,
                                    marginTop: -20,
                                    borderRadius: 999,
                                    background: "#FFFFFF",
                                    color: "#0A0A0A",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                    boxShadow: "0 0 0 1px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.30)",
                                    zIndex: 3,
                                    cursor: "ew-resize",
                                }}
                            >
                                <Icon d="M6 4.5 2.5 8 6 11.5M10 4.5 13.5 8 10 11.5" size={16} />
                            </div>
                            {enlarge ? <EnlargeBtn label={`Enlarge ${a.label || "before"} and ${b.label || "after"} screens`} onClick={(el) => openLb(pos >= 50 ? 0 : 1, el)} /> : null}
                        </div>
                    </Shell>
                    {captionStyle !== "none" && (a.caption || b.caption) ? (
                        <figcaption style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: narrow ? 10 : 24, marginTop: 14, fontFamily: FONT }}>
                            {[a, b].map((t, k) =>
                                t.caption ? (
                                    <div key={k} style={{ textAlign: !narrow && k === 1 ? "right" : "left" }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", color: TEXT2 }}>{t.label || (k === 0 ? "Before" : "After")}</div>
                                        <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.55, color: `color-mix(in srgb, ${TEXT} 84%, transparent)` }}>{t.caption}</div>
                                    </div>
                                ) : (
                                    <div key={k} />
                                )
                            )}
                        </figcaption>
                    ) : null}
                </figure>
            </div>
        )
    }

    const bgStyle: React.CSSProperties =
        background === "surface"
            ? { background: SURFACE, border: `1px solid ${LINE}`, borderRadius: narrow ? 18 : 24, padding: bgPad }
            : background === "accent-tint"
              ? {
                    background: `color-mix(in srgb, ${ACCENT} ${light ? 5 : 6}%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${ACCENT} ${light ? 14 : 16}%, transparent)`,
                    borderRadius: narrow ? 18 : 24,
                    padding: bgPad,
                }
              : {}

    const lbScreens = eff === "compare" ? screens.slice(0, 2) : screens

    return (
        <div
            ref={rootRef}
            data-db-keep=""
            role={eff === "filmstrip" || eff === "deck" ? undefined : "group"}
            aria-label={eff === "filmstrip" || eff === "deck" ? undefined : ariaLabel}
            style={{ position: "relative", width: "100%", minWidth: 0, boxSizing: "border-box", fontFamily: FONT, color: TEXT, ...bgStyle, ...style }}
        >
            <style>{CSS}</style>
            {onCanvas && layout === "compare" && n < 2 ? (
                <div style={{ marginBottom: 12, fontSize: 12, color: TEXT2 }}>Compare needs 2 screens (before, after). Showing the one you have.</div>
            ) : null}
            {body}
            {lb != null && typeof document !== "undefined" ? (
                <Lightbox
                    screens={lbScreens}
                    index={clamp(lb, 0, lbScreens.length - 1)}
                    setIndex={(i) => startTransition(() => setLb(i))}
                    onClose={() => startTransition(() => setLb(null))}
                    light={light}
                    reduced={reduced}
                    returnTo={trigger}
                />
            ) : null}
        </div>
    )
}

function Placeholder({ layout, frame, jsonBroken }: { layout: Layout; frame: FrameKind; jsonBroken: boolean }) {
    const names: Record<Layout, string> = { spotlight: "Spotlight", duo: "Duo", trio: "Trio", filmstrip: "Filmstrip", deck: "Deck", compare: "Compare" }
    const frames: Record<FrameKind, string> = { none: "No frame", phone: "Phone", browser: "Browser", soft: "Soft card" }
    return (
        <div
            style={{
                border: `1.5px dashed color-mix(in srgb, ${TEXT} 24%, transparent)`,
                borderRadius: 18,
                padding: "44px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 10,
                color: TEXT2,
            }}
        >
            <svg aria-hidden="true" width="44" height="34" viewBox="0 0 44 34" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="5" width="13" height="24" rx="3" opacity="0.5" />
                <rect x="15.5" y="1" width="13" height="32" rx="3" />
                <rect x="30" y="5" width="13" height="24" rx="3" opacity="0.5" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Screen showcase</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, maxWidth: 380 }}>
                {jsonBroken
                    ? "Screens JSON couldn't be read. Check the brackets and quotes, or clear it and use the Screens list."
                    : "Add screens in the right panel: Screens → + (pick an image, or paste an Image URL). Nothing shows on the live site until you do."}
            </div>
            <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.8 }}>
                {names[layout] || layout} · {frames[frame] || frame}
            </div>
        </div>
    )
}

ScreenShowcase.defaultProps = {
    layout: "spotlight",
    frame: "phone",
    url: "",
    screens: [],
    screensJson: "",
    fit: "contain",
    ratio: "auto",
    maxWidth: 0,
    gap: 32,
    align: "center",
    background: "none",
    captionStyle: "below",
    enlarge: true,
    showCounter: true,
    autoplayVideo: true,
    ariaLabel: "Product screens",
} as Partial<Props>

addPropertyControls(ScreenShowcase, {
    layout: {
        type: ControlType.Enum,
        title: "Layout",
        options: ["spotlight", "duo", "trio", "filmstrip", "deck", "compare"],
        optionTitles: ["Spotlight", "Duo", "Trio", "Filmstrip", "Deck", "Compare (before/after)"],
        defaultValue: "spotlight",
    },
    frame: {
        type: ControlType.Enum,
        title: "Frame",
        options: ["none", "phone", "browser", "soft"],
        optionTitles: ["None", "Phone", "Browser", "Soft card"],
        defaultValue: "phone",
    },
    url: {
        type: ControlType.String,
        title: "Browser URL",
        defaultValue: "",
        placeholder: "e.g. budgetcart.app/plan",
        hidden: (p: Props) => p.frame !== "browser",
    },
    screens: {
        type: ControlType.Array,
        title: "Screens",
        maxCount: 16,
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.ResponsiveImage, title: "Image" },
                src: { type: ControlType.String, title: "Image URL", defaultValue: "", description: "Used when Image is empty." },
                video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm"], description: "Optional. Wins over the image." },
                alt: { type: ControlType.String, title: "Alt text", defaultValue: "" },
                label: { type: ControlType.String, title: "Step label", defaultValue: "", placeholder: "01 · Onboarding" },
                caption: { type: ControlType.String, title: "Caption", defaultValue: "", displayTextArea: true },
            },
        },
    },
    screensJson: {
        type: ControlType.String,
        title: "Screens JSON",
        defaultValue: "",
        displayTextArea: true,
        description: "Optional. When filled it replaces the Screens list. May start with json: — e.g. json:[{\"src\":\"https://…\",\"label\":\"01 · Home\"}]",
    },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        options: ["contain", "cover"],
        optionTitles: ["Contain", "Cover"],
        displaySegmentedControl: true,
        defaultValue: "contain",
        description: "Only matters with a fixed ratio. Screens are never stretched.",
    },
    ratio: {
        type: ControlType.Enum,
        title: "Ratio",
        options: ["auto", "9:19.5", "4:3", "16:10", "16:9", "1:1"],
        optionTitles: ["Auto (from media)", "9:19.5 (phone)", "4:3", "16:10", "16:9", "1:1"],
        defaultValue: "auto",
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Screen max",
        min: 0,
        max: 1600,
        step: 10,
        unit: "px",
        defaultValue: 0,
        description: "Max width per screen. 0 = auto (phones ~300px).",
    },
    gap: { type: ControlType.Number, title: "Gap", min: 0, max: 120, step: 2, unit: "px", defaultValue: 32 },
    align: {
        type: ControlType.Enum,
        title: "Align",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        displaySegmentedControl: true,
        defaultValue: "center",
    },
    background: {
        type: ControlType.Enum,
        title: "Background",
        options: ["none", "surface", "accent-tint"],
        optionTitles: ["None", "Surface", "Accent tint"],
        defaultValue: "none",
    },
    captionStyle: {
        type: ControlType.Enum,
        title: "Captions",
        options: ["below", "overlay", "none"],
        optionTitles: ["Below", "Overlay", "None"],
        displaySegmentedControl: true,
        defaultValue: "below",
    },
    enlarge: { type: ControlType.Boolean, title: "Enlarge", defaultValue: true, enabledTitle: "Show", disabledTitle: "Hide" },
    showCounter: {
        type: ControlType.Boolean,
        title: "Counter",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
        hidden: (p: Props) => p.layout === "duo" || p.layout === "trio" || p.layout === "compare",
    },
    autoplayVideo: { type: ControlType.Boolean, title: "Autoplay video", defaultValue: true, description: "Muted, looped, only while on screen. Off when the visitor prefers reduced motion." },
    ariaLabel: { type: ControlType.String, title: "A11y label", defaultValue: "Product screens" },
})
