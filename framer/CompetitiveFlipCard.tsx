import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 254
 * @framerIntrinsicHeight 286
 */

// Two styles:
// • "3D flip" (original, used on GM Convoy): Safari-safe, hover/click/tap/keyboard.
// • "Guess + reveal" (Dhwani, BRIEFS: "the flip cards suck"): question first, the
//   answer slides up on click/tap/Enter. No 3D. The card grows to fit its content,
//   so text never clips on a phone. Set height to Fit.
// Oct 4 (light-mode sweep): in light mode the card surfaces follow the theme (--db-surface,
// tinted with the accent) and text uses --db-text, so nothing is dark-on-dark. Accent used as
// text/highlight follows the visitor's vibe (--db-accent, contrast-safe in light). Dark mode
// keeps the gradients set on each instance. Root is marked data-db-keep so the nav's DOM
// flip pass doesn't fight these colours.

interface FlipCardProps {
    number: string
    title: string
    image: string

    backTitle: string
    statOneLabel: string
    statOneValue: string
    statTwoLabel: string
    statTwoValue: string
    takeawayLabel: string
    takeawayValue: string

    frontGradientStart: string
    frontGradientEnd: string
    backColor: string
    frontTextColor: string
    backTextColor: string
    accentColor: string

    radius: number
    duration: number
    imageScale: number
    imageOffsetX: number
    imageOffsetY: number
    showImagePlaceholder: boolean
    mode?: "flip" | "reveal"
    minHeight?: number
    hint?: string

    style?: React.CSSProperties
}

const BASE_WIDTH = 254
const BASE_HEIGHT = 286
const FONT = "Poppins, Inter, system-ui, sans-serif"
const TEXT = "var(--db-text, #0A0A0A)"
const TEXT_2 = "var(--db-text-2, rgba(0,0,0,0.62))"
const SURFACE = "var(--db-surface, #EEEEEE)"

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(Math.max(value, minimum), maximum)
}

const alpha = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

// Is this a yellow / maize / orange accent? (those follow the vibe accent)
function isWarm(c: string): boolean {
    const s = String(c || "").trim().toLowerCase()
    let r = 0
    let g = 0
    let b = 0
    const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
    if (m) {
        r = +m[1]
        g = +m[2]
        b = +m[3]
    } else {
        const h = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/)
        if (!h) return false
        const x = h[1].length === 3 ? h[1].split("").map((ch) => ch + ch).join("") : h[1]
        const n = parseInt(x, 16)
        r = (n >> 16) & 255
        g = (n >> 8) & 255
        b = n & 255
    }
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    if (max < 120 || d < 90) return false
    let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    hue *= 60
    if (hue < 0) hue += 360
    return hue >= 8 && hue <= 62
}

// Accent used as TEXT or a highlight
function accentInk(c: string, light: boolean): string {
    if (!c || isWarm(c)) return `var(--db-accent, ${c || "#F3500F"})`
    return light ? `color-mix(in srgb, ${c} 52%, #000)` : c
}

function useDbLight(): boolean {
    const [light, setLight] = React.useState(false)
    React.useEffect(() => {
        if (typeof document === "undefined") return
        const html = document.documentElement
        const read = () => React.startTransition(() => setLight(html.getAttribute("data-db-theme") === "light"))
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

export default function CompetitiveFlipCard(props: FlipCardProps) {
    if (props.mode === "reveal") {
        return <RevealCard {...props} minHeight={props.minHeight ?? 240} hint={props.hint || "reveal"} />
    }
    return <FlipCardInner {...props} />
}

// ── Guess + reveal ─────────────────────────────────────────────────────────
function RevealCard(props: FlipCardProps & { minHeight: number; hint: string }) {
    const {
        number,
        title,
        backTitle,
        statOneLabel,
        statOneValue,
        statTwoLabel,
        statTwoValue,
        takeawayLabel,
        takeawayValue,
        frontGradientStart,
        frontGradientEnd,
        backColor,
        frontTextColor,
        backTextColor,
        accentColor,
        radius,
        duration,
        minHeight,
        hint,
        style,
    } = props
    const [open, setOpen] = React.useState(false)
    const [hover, setHover] = React.useState(false)
    const [reduced, setReduced] = React.useState(false)
    const light = useDbLight()
    React.useEffect(() => {
        if (typeof window === "undefined") return
        React.startTransition(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches))
    }, [])
    const toggle = () => React.startTransition(() => setOpen((o) => !o))
    const ease = "cubic-bezier(0.16, 1, 0.3, 1)"
    const d = `${Math.max(0.35, duration)}s`

    // Theme-aware colours: light mode uses the site tokens, dark keeps the instance colours.
    const ink = accentInk(accentColor, light)
    const fg = light ? TEXT : frontTextColor
    const fg2 = light ? TEXT_2 : alpha(frontTextColor, 60)
    const bt = light ? TEXT : backTextColor
    const bt2 = light ? TEXT_2 : alpha(backTextColor, 60)
    const cardBg = light
        ? `linear-gradient(145deg, color-mix(in srgb, ${ink} 12%, ${SURFACE}) 0%, color-mix(in srgb, ${frontGradientEnd} 8%, ${SURFACE}) 100%)`
        : `linear-gradient(145deg, ${frontGradientStart} 0%, ${frontGradientEnd} 100%)`
    const answerBg = light ? `color-mix(in srgb, ${ink} 6%, var(--db-bg, #FFFFFF))` : backColor
    const restLine = light ? "var(--db-line, rgba(0,0,0,0.12))" : "rgba(255,255,255,0.10)"
    const restShadow = light
        ? "var(--db-shadow, 0 18px 40px -22px rgba(0,0,0,0.35))"
        : "0 14px 40px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)"

    const layer: React.CSSProperties = {
        gridArea: "1 / 1",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "clamp(20px, 4vw, 28px)",
        boxSizing: "border-box",
        minWidth: 0,
    }
    const stat = (label: string, value: string) =>
        label || value ? (
            <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: FONT,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: bt2,
                        marginBottom: 4,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontFamily: FONT,
                        fontSize: "clamp(15px, 1.6vw, 17px)",
                        fontWeight: 500,
                        lineHeight: 1.35,
                        color: bt,
                    }}
                >
                    {value}
                </div>
            </div>
        ) : null

    return (
        <div
            data-db-keep=""
            role="button"
            tabIndex={0}
            aria-expanded={open}
            aria-label={open ? `Hide answer: ${title}` : `Reveal answer: ${title}`}
            onClick={toggle}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggle()
                }
            }}
            onPointerEnter={(e) => {
                if (e.pointerType === "mouse") React.startTransition(() => setHover(true))
            }}
            onPointerLeave={() => React.startTransition(() => setHover(false))}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight,
                display: "grid",
                borderRadius: radius,
                overflow: "hidden",
                cursor: "pointer",
                userSelect: "none",
                WebkitTapHighlightColor: "transparent",
                background: cardBg,
                border: `1px solid ${hover || open ? alpha(ink, 40) : restLine}`,
                boxShadow: hover
                    ? `0 18px 50px -18px ${alpha(ink, 33)}, inset 0 1px 0 rgba(255,255,255,0.12)`
                    : restShadow,
                transform: hover && !reduced ? "translateY(-3px)" : "none",
                transition: `transform .35s ${ease}, box-shadow .35s ${ease}, border-color .35s ${ease}`,
                boxSizing: "border-box",
            }}
        >
            {/* FRONT: the question */}
            <div
                aria-hidden={open}
                style={{
                    ...layer,
                    justifyContent: "space-between",
                    color: fg,
                    opacity: open ? 0 : 1,
                    transition: `opacity ${d} ${ease}`,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                        style={{
                            minWidth: 28,
                            height: 28,
                            padding: "0 8px",
                            borderRadius: 999,
                            background: accentColor,
                            color: "#0A0A0A",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT,
                            fontSize: 13,
                            fontWeight: 700,
                            boxSizing: "border-box",
                        }}
                    >
                        {number}
                    </span>
                    <span
                        style={{
                            fontFamily: FONT,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: fg2,
                        }}
                    >
                        guess first
                    </span>
                </div>
                <div
                    style={{
                        fontFamily: FONT,
                        fontSize: "clamp(20px, 2.4vw, 26px)",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        textWrap: "balance" as any,
                    }}
                >
                    {title}
                </div>
                <div>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 14px",
                            borderRadius: 999,
                            background: hover ? ink : light ? alpha(TEXT, 8) : "rgba(255,255,255,0.10)",
                            color: hover ? "var(--db-on-accent, #0A0A0A)" : fg,
                            fontFamily: FONT,
                            fontSize: 13,
                            fontWeight: 600,
                            transition: `background .3s ${ease}, color .3s ${ease}`,
                        }}
                    >
                        {hint}
                        <span
                            aria-hidden="true"
                            style={{
                                display: "inline-block",
                                transform: hover && !reduced ? "translateY(2px)" : "none",
                                transition: `transform .3s ${ease}`,
                            }}
                        >
                            ↓
                        </span>
                    </span>
                </div>
            </div>

            {/* ANSWER: slides up over the question */}
            <div
                aria-hidden={!open}
                style={{
                    ...layer,
                    background: answerBg,
                    color: bt,
                    transform: reduced ? "none" : open ? "translateY(0%)" : "translateY(101%)",
                    opacity: reduced ? (open ? 1 : 0) : 1,
                    visibility: open ? "visible" : "hidden",
                    transition: `transform ${d} ${ease}, opacity ${d} ${ease}, visibility 0s linear ${open ? "0s" : d}`,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span
                        style={{
                            fontFamily: FONT,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: ink,
                        }}
                    >
                        the answer
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: bt2 }}>
                        tap to hide ↺
                    </span>
                </div>
                <div
                    style={{
                        fontFamily: FONT,
                        fontSize: "clamp(20px, 2.4vw, 26px)",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                        textWrap: "balance" as any,
                    }}
                >
                    {backTitle || title}
                </div>
                {(statOneValue || statTwoValue) && (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px 20px",
                            paddingTop: 12,
                            borderTop: `1px solid ${alpha(bt, 12)}`,
                        }}
                    >
                        {stat(statOneLabel, statOneValue)}
                        {stat(statTwoLabel, statTwoValue)}
                    </div>
                )}
                {takeawayValue && (
                    <div
                        style={{
                            marginTop: "auto",
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: alpha(bt, 5),
                            borderLeft: `3px solid ${ink}`,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: FONT,
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: bt2,
                                marginBottom: 4,
                            }}
                        >
                            {takeawayLabel}
                        </div>
                        <div
                            style={{
                                fontFamily: FONT,
                                fontSize: "clamp(14px, 1.5vw, 16px)",
                                fontWeight: 500,
                                lineHeight: 1.45,
                            }}
                        >
                            {takeawayValue}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── 3D flip (original) ─────────────────────────────────────────────────────
function FlipCardInner(props: FlipCardProps) {
    const {
        number,
        title,
        image,

        backTitle,
        statOneLabel,
        statOneValue,
        statTwoLabel,
        statTwoValue,
        takeawayLabel,
        takeawayValue,

        frontGradientStart,
        frontGradientEnd,
        backColor,
        frontTextColor,
        backTextColor,
        accentColor,

        radius,
        duration,
        imageScale,
        imageOffsetX,
        imageOffsetY,
        showImagePlaceholder,

        style,
    } = props

    const [hovered, setHovered] = React.useState(false)
    const [pinned, setPinned] = React.useState(false)
    const flipped = hovered !== pinned
    const light = useDbLight()
    // Back face: theme surface + theme text in light mode; instance colours in dark.
    const bt = light ? TEXT : backTextColor
    const backBg = light ? `color-mix(in srgb, ${backColor} 6%, ${SURFACE})` : backColor

    const [frameSize, setFrameSize] = React.useState({
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
    })

    const rootRef = React.useRef<HTMLDivElement>(null)

    React.useLayoutEffect(() => {
        const element = rootRef.current
        if (!element) return

        const updateSize = () => {
            const rect = element.getBoundingClientRect()

            if (rect.width > 0 && rect.height > 0) {
                setFrameSize((current) => {
                    if (Math.abs(current.width - rect.width) < 0.5 && Math.abs(current.height - rect.height) < 0.5) {
                        return current
                    }
                    return { width: rect.width, height: rect.height }
                })
            }
        }

        updateSize()

        if (typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver(updateSize)
        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    const widthRatio = frameSize.width / BASE_WIDTH
    const heightRatio = frameSize.height / BASE_HEIGHT
    const responsiveScale = clamp(Math.min(widthRatio, heightRatio), 0.32, 2.4)
    const horizontalScale = clamp(widthRatio, 0.4, 2.4)
    const verticalScale = clamp(heightRatio, 0.4, 2.4)

    const unit = (value: number) => value * responsiveScale
    const horizontalUnit = (value: number) => value * horizontalScale
    const verticalUnit = (value: number) => value * verticalScale

    const compact = frameSize.width < 215 || frameSize.height < 245
    const veryCompact = frameSize.width < 175 || frameSize.height < 205

    const responsiveRadius = clamp(
        radius * responsiveScale,
        Math.min(radius, 4),
        Math.min(radius * 2.4, Math.min(frameSize.width, frameSize.height) / 2)
    )

    function handlePointerEnter(event: React.PointerEvent) {
        if (event.pointerType === "mouse") {
            React.startTransition(() => setHovered(true))
        }
    }

    function handlePointerLeave(event: React.PointerEvent) {
        if (event.pointerType === "mouse") {
            React.startTransition(() => {
                setHovered(false)
                setPinned(false)
            })
        }
    }

    function toggle() {
        React.startTransition(() => setPinned((p) => !p))
    }

    const faceStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        borderRadius: responsiveRadius,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
    }

    const spin = flipped ? "rotateY(180deg)" : "rotateY(0deg)"

    return (
        <div
            ref={rootRef}
            data-db-keep=""
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                perspective: Math.max(700, 1100 * responsiveScale),
                cursor: "pointer",
                userSelect: "none",
                WebkitTapHighlightColor: "transparent",
            }}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={toggle}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={`Flip card: ${title}`}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    toggle()
                }
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    transformStyle: "preserve-3d",
                    WebkitTransformStyle: "preserve-3d",
                    transform: spin,
                    WebkitTransform: spin,
                    transition: `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
                    willChange: "transform",
                }}
            >
                {/* Front */}
                <div
                    style={{
                        ...faceStyle,
                        background: `linear-gradient(135deg, ${frontGradientStart} 0%, ${frontGradientEnd} 100%)`,
                        transform: "rotateY(0deg) translateZ(1px)",
                        WebkitTransform: "rotateY(0deg) translateZ(1px)",
                        boxShadow: "0 14px 32px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: verticalUnit(18),
                            left: horizontalUnit(18),
                            width: unit(29),
                            height: unit(29),
                            minWidth: unit(29),
                            minHeight: unit(29),
                            borderRadius: "50%",
                            background: accentColor,
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT,
                            fontSize: unit(15),
                            fontWeight: 700,
                            lineHeight: 1,
                            zIndex: 3,
                        }}
                    >
                        {number}
                    </div>

                    <div
                        style={{
                            position: "absolute",
                            top: verticalUnit(61),
                            left: horizontalUnit(18),
                            right: horizontalUnit(16),
                            minWidth: 0,
                            color: frontTextColor,
                            fontFamily: FONT,
                            fontSize: unit(25),
                            fontWeight: 500,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.08,
                            overflowWrap: "anywhere",
                            zIndex: 3,
                        }}
                    >
                        {title}
                    </div>

                    {image ? (
                        <img
                            src={image}
                            alt=""
                            draggable={false}
                            style={{
                                position: "absolute",
                                left: "50%",
                                bottom: verticalUnit(-5),
                                width: `${imageScale}%`,
                                height: "auto",
                                maxWidth: "none",
                                maxHeight: compact ? "66%" : "74%",
                                objectFit: "contain",
                                transform: `translateX(calc(-50% + ${horizontalUnit(imageOffsetX)}px)) translateY(${verticalUnit(
                                    imageOffsetY
                                )}px)`,
                                transformOrigin: "center bottom",
                                pointerEvents: "none",
                                zIndex: 2,
                            }}
                        />
                    ) : showImagePlaceholder === false ? null : (
                        <div
                            style={{
                                position: "absolute",
                                left: horizontalUnit(18),
                                right: horizontalUnit(18),
                                bottom: verticalUnit(22),
                                height: Math.min(verticalUnit(100), frameSize.height * 0.38),
                                border: `1px dashed ${alpha(frontTextColor, 40)}`,
                                borderRadius: unit(12),
                                color: frontTextColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: unit(8),
                                boxSizing: "border-box",
                                textAlign: "center",
                                fontFamily: FONT,
                                fontSize: unit(13),
                                lineHeight: 1.25,
                                opacity: 0.65,
                            }}
                        >
                            Add vehicle image
                        </div>
                    )}

                    <div
                        style={{
                            position: "absolute",
                            right: horizontalUnit(16),
                            bottom: verticalUnit(14),
                            width: unit(27),
                            height: unit(27),
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.82)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#111111",
                            fontFamily: "Arial, sans-serif",
                            fontSize: unit(15),
                            zIndex: 4,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                        }}
                    >
                        ↻
                    </div>
                </div>

                {/* Back */}
                <div
                    style={{
                        ...faceStyle,
                        background: backBg,
                        color: bt,
                        transform: "rotateY(180deg) translateZ(1px)",
                        WebkitTransform: "rotateY(180deg) translateZ(1px)",
                        padding: compact ? unit(17) : unit(22),
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: light
                            ? "0 14px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(0,0,0,0.06)"
                            : "0 14px 32px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: unit(12), minWidth: 0 }}>
                        <div
                            style={{
                                minWidth: 0,
                                flex: "1 1 auto",
                                fontFamily: FONT,
                                fontSize: unit(23),
                                fontWeight: 600,
                                lineHeight: 1.05,
                                letterSpacing: "-0.035em",
                                overflowWrap: "anywhere",
                            }}
                        >
                            {backTitle || title}
                        </div>

                        <div
                            style={{
                                flex: "0 0 auto",
                                width: unit(27),
                                height: unit(27),
                                borderRadius: "50%",
                                background: accentColor,
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontFamily: FONT,
                                fontSize: unit(14),
                                fontWeight: 700,
                                lineHeight: 1,
                            }}
                        >
                            {number}
                        </div>
                    </div>

                    <div
                        style={{
                            flex: "0 0 auto",
                            width: unit(34),
                            height: Math.max(1, unit(3)),
                            marginTop: unit(compact ? 11 : 15),
                            marginBottom: unit(compact ? 13 : 18),
                            borderRadius: 999,
                            background: accentColor,
                        }}
                    />

                    <Stat label={statOneLabel} value={statOneValue} color={bt} scale={responsiveScale} />

                    <div style={{ flex: "0 0 auto", height: 1, background: alpha(bt, 13), margin: `${unit(compact ? 9 : 13)}px 0` }} />

                    <Stat label={statTwoLabel} value={statTwoValue} color={bt} scale={responsiveScale} />

                    <div
                        style={{
                            minHeight: 0,
                            marginTop: "auto",
                            padding: compact ? `${unit(10)}px ${unit(11)}px` : `${unit(13)}px ${unit(14)}px`,
                            borderRadius: unit(13),
                            background: alpha(bt, 6),
                            border: `1px solid ${alpha(bt, 9)}`,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                marginBottom: unit(5),
                                color: alpha(bt, 65),
                                fontFamily: FONT,
                                fontSize: unit(11),
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                lineHeight: 1.2,
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {takeawayLabel}
                        </div>

                        <div
                            style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: veryCompact ? 3 : compact ? 4 : 6,
                                overflow: "hidden",
                                overflowWrap: "anywhere",
                                fontFamily: FONT,
                                fontSize: unit(14),
                                fontWeight: 500,
                                lineHeight: compact ? 1.25 : 1.35,
                            }}
                        >
                            {takeawayValue}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Stat({ label, value, color, scale }: { label: string; value: string; color: string; scale: number }) {
    return (
        <div style={{ minWidth: 0, flex: "0 0 auto" }}>
            <div
                style={{
                    marginBottom: 4 * scale,
                    color: alpha(color, 60),
                    fontFamily: FONT,
                    fontSize: 11 * scale,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    lineHeight: 1.2,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {label}
            </div>

            <div
                style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                    overflowWrap: "anywhere",
                    color,
                    fontFamily: FONT,
                    fontSize: 18 * scale,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: "-0.025em",
                }}
            >
                {value}
            </div>
        </div>
    )
}

CompetitiveFlipCard.defaultProps = {
    number: "1",
    title: "Rivian R1T",
    image: "",

    backTitle: "Rivian R1T",
    statOneLabel: "Range",
    statOneValue: "Up to 420 miles",
    statTwoLabel: "Starting price",
    statTwoValue: "$69,900",
    takeawayLabel: "Competitive takeaway",
    takeawayValue: "Strong adventure positioning with a premium, technology-forward experience.",

    frontGradientStart: "#E6EEF5",
    frontGradientEnd: "#1477C9",
    backColor: "#111820",
    frontTextColor: "#5B6874",
    backTextColor: "#FFFFFF",
    accentColor: "#050505",

    radius: 15,
    duration: 0.55,
    imageScale: 118,
    imageOffsetX: 15,
    imageOffsetY: 0,
    showImagePlaceholder: true,
    mode: "flip",
    minHeight: 240,
    hint: "reveal",
}

addPropertyControls(CompetitiveFlipCard, {
    mode: {
        type: ControlType.Enum,
        title: "Style",
        options: ["flip", "reveal"],
        optionTitles: ["3D flip", "Guess + reveal"],
        defaultValue: "flip",
        displaySegmentedControl: true,
    },
    minHeight: {
        type: ControlType.Number,
        title: "Min height",
        min: 120,
        max: 600,
        step: 10,
        defaultValue: 240,
        hidden: (p: any) => p.mode !== "reveal",
    },
    hint: {
        type: ControlType.String,
        title: "Reveal label",
        defaultValue: "reveal",
        hidden: (p: any) => p.mode !== "reveal",
    },
    number: { type: ControlType.String, title: "Number", defaultValue: "1" },
    title: { type: ControlType.String, title: "Front Title", defaultValue: "Rivian R1T" },
    image: { type: ControlType.Image, title: "Vehicle", hidden: (p: any) => p.mode === "reveal" },

    backTitle: { type: ControlType.String, title: "Back Title", defaultValue: "Rivian R1T" },
    statOneLabel: { type: ControlType.String, title: "Stat 1 Label", defaultValue: "Range" },
    statOneValue: { type: ControlType.String, title: "Stat 1 Value", defaultValue: "Up to 420 miles" },
    statTwoLabel: { type: ControlType.String, title: "Stat 2 Label", defaultValue: "Starting price" },
    statTwoValue: { type: ControlType.String, title: "Stat 2 Value", defaultValue: "$69,900" },
    takeawayLabel: { type: ControlType.String, title: "Callout Label", defaultValue: "Competitive takeaway" },
    takeawayValue: {
        type: ControlType.String,
        title: "Callout",
        displayTextArea: true,
        defaultValue: "Strong adventure positioning with a premium, technology-forward experience.",
    },

    frontGradientStart: { type: ControlType.Color, title: "Gradient 1", defaultValue: "#E6EEF5" },
    frontGradientEnd: { type: ControlType.Color, title: "Gradient 2", defaultValue: "#1477C9" },
    backColor: { type: ControlType.Color, title: "Back", defaultValue: "#111820" },
    frontTextColor: { type: ControlType.Color, title: "Front Text", defaultValue: "#5B6874" },
    backTextColor: { type: ControlType.Color, title: "Back Text", defaultValue: "#FFFFFF" },
    accentColor: { type: ControlType.Color, title: "Accent", defaultValue: "#050505" },

    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 50, step: 1, defaultValue: 15 },
    duration: { type: ControlType.Number, title: "Speed", min: 0.15, max: 1.5, step: 0.05, defaultValue: 0.55, unit: "s" },
    imageScale: {
        type: ControlType.Number,
        title: "Image Size",
        min: 50,
        max: 200,
        step: 1,
        defaultValue: 118,
        unit: "%",
        hidden: (p: any) => p.mode === "reveal",
    },
    imageOffsetX: {
        type: ControlType.Number,
        title: "Image X",
        min: -150,
        max: 150,
        step: 1,
        defaultValue: 15,
        hidden: (p: any) => p.mode === "reveal",
    },
    showImagePlaceholder: {
        type: ControlType.Boolean,
        title: "Empty Image",
        defaultValue: true,
        enabledTitle: "Placeholder",
        disabledTitle: "Hide",
        hidden: (p: any) => p.mode === "reveal",
    },
    imageOffsetY: {
        type: ControlType.Number,
        title: "Image Y",
        min: -150,
        max: 150,
        step: 1,
        defaultValue: 0,
        hidden: (p: any) => p.mode === "reveal",
    },
})
