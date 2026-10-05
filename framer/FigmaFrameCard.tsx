import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * FigmaFrameCard
 * An experience entry styled like a selected frame on a Figma canvas —
 * a name label + dimension annotation floating above a bordered frame,
 * corner selection handles, and a hover-triggered inspector strip that
 * mimics Figma's right-hand properties panel collapsing into the frame.
 * Oct 4 (light-mode sweep): text, borders and chips use the site theme ink (--db-text at the
 * same strengths) instead of hard-coded white, so the card reads in light mode; the accent used
 * as text/border follows the vibe (warm) or gets a darker ink in light mode.
 */

const INK = (pct: number) => `color-mix(in srgb, var(--db-text, #FFFFFF) ${pct}%, transparent)`
const alpha = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

// Is this a yellow / maize / orange accent?
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

// Accent used as TEXT or a border
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

export default function FigmaFrameCard(props) {
    const {
        orgName,
        role,
        dates,
        linkLabel,
        linkHref,
        openInNewTab,
        frameLabel,
        dimensionLabel,
        accentColor,
        background,
        autoLayoutTag,
        fillTag,
    } = props

    const [hovered, setHovered] = React.useState(false)
    const light = useDbLight()
    const ink = accentInk(accentColor, light)

    const handleStyle: React.CSSProperties = {
        position: "absolute",
        width: 7,
        height: 7,
        background: "var(--db-bg, rgb(10,10,10))",
        border: `1.5px solid ${ink}`,
        borderRadius: 1,
        opacity: hovered ? 1 : 0.45,
        transform: hovered ? "scale(1)" : "scale(0.85)",
        transition: "opacity 0.25s cubic-bezier(.2,.8,.2,1), transform 0.25s cubic-bezier(.2,.8,.2,1)",
        zIndex: 2,
    }

    const chip = (label: string) => (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 500,
                color: INK(65),
                background: INK(5),
                border: `1px solid ${INK(9)}`,
                borderRadius: 5,
                padding: "4px 8px",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </span>
    )

    return (
        <a
            data-db-keep=""
            href={linkHref || undefined}
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "block",
                width: "100%",
                textDecoration: "none",
                fontFamily:
                    "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            {/* Selection label row — mimics Figma's frame-name + dimension chip */}
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginBottom: 6,
                    paddingLeft: 2,
                }}
            >
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                        color: hovered ? ink : INK(60),
                        transition: "color 0.2s ease",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {frameLabel}
                </span>
                <span
                    style={{
                        fontSize: 11,
                        color: INK(45),
                        whiteSpace: "nowrap",
                        opacity: hovered ? 1 : 0.7,
                        transition: "opacity 0.2s ease",
                    }}
                >
                    {dimensionLabel}
                </span>
            </div>

            {/* The frame itself */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    background: background,
                    border: `1px solid ${
                        hovered ? ink : INK(14)
                    }`,
                    borderRadius: 10,
                    padding: "26px 28px",
                    transition:
                        "border-color 0.25s cubic-bezier(.2,.8,.2,1), transform 0.25s cubic-bezier(.2,.8,.2,1), box-shadow 0.25s ease",
                    transform: hovered
                        ? "translateY(-3px) scale(1.004)"
                        : "translateY(0px) scale(1)",
                    boxShadow: hovered
                        ? `0 12px 32px -12px ${alpha(ink, 33)}`
                        : "0 0px 0px rgba(0,0,0,0)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 24,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span
                            style={{
                                fontSize: 17,
                                fontWeight: 500,
                                color: "var(--db-text, rgb(245,245,247))",
                            }}
                        >
                            {orgName}
                        </span>
                        <span
                            style={{
                                fontSize: 14,
                                color: INK(60),
                            }}
                        >
                            {role}
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 18,
                            flexShrink: 0,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13,
                                color: INK(58),
                                whiteSpace: "nowrap",
                            }}
                        >
                            {dates}
                        </span>
                        {linkLabel ? (
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: hovered ? ink : INK(70),
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    whiteSpace: "nowrap",
                                    transition: "color 0.2s ease, gap 0.2s ease",
                                }}
                            >
                                {linkLabel}
                                <span
                                    style={{
                                        transform: hovered
                                            ? "translateX(2px)"
                                            : "translateX(0px)",
                                        transition: "transform 0.2s ease",
                                    }}
                                >
                                    →
                                </span>
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Inspector strip — collapses open on hover, like Figma's right panel folding into the layer */}
                <div
                    style={{
                        maxHeight: hovered ? 40 : 0,
                        opacity: hovered ? 1 : 0,
                        overflow: "hidden",
                        transition:
                            "max-height 0.28s cubic-bezier(.2,.8,.2,1), opacity 0.2s ease",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            paddingTop: 14,
                            marginTop: 4,
                            borderTop: `1px solid ${INK(8)}`,
                            flexWrap: "wrap",
                        }}
                    >
                        {chip(autoLayoutTag)}
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 11,
                                fontWeight: 500,
                                color: INK(65),
                                background: INK(5),
                                border: `1px solid ${INK(9)}`,
                                borderRadius: 5,
                                padding: "4px 8px",
                            }}
                        >
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: accentColor,
                                    display: "inline-block",
                                }}
                            />
                            {fillTag}
                        </span>
                        {chip("Corner radius 10")}
                    </div>
                </div>

                {/* Corner selection handles */}
                <div style={{ ...handleStyle, top: -4, left: -4 }} />
                <div style={{ ...handleStyle, top: -4, right: -4 }} />
                <div style={{ ...handleStyle, bottom: -4, left: -4 }} />
                <div style={{ ...handleStyle, bottom: -4, right: -4 }} />
            </div>
        </a>
    )
}

addPropertyControls(FigmaFrameCard, {
    orgName: {
        type: ControlType.String,
        defaultValue: "Organization",
        title: "Org",
    },
    role: {
        type: ControlType.String,
        defaultValue: "Role",
        title: "Role",
    },
    dates: {
        type: ControlType.String,
        defaultValue: "Month 2025 – Present",
        title: "Dates",
    },
    linkLabel: {
        type: ControlType.String,
        defaultValue: "View",
        title: "Link label",
    },
    linkHref: {
        type: ControlType.String,
        defaultValue: "",
        title: "Link URL",
    },
    openInNewTab: {
        type: ControlType.Boolean,
        defaultValue: false,
        title: "New tab",
    },
    frameLabel: {
        type: ControlType.String,
        defaultValue: "Frame 01",
        title: "Frame label",
    },
    dimensionLabel: {
        type: ControlType.String,
        defaultValue: "1440 × 220",
        title: "Dimension label",
    },
    accentColor: {
        type: ControlType.Color,
        defaultValue: "rgb(243, 80, 15)",
        title: "Accent",
    },
    background: {
        type: ControlType.Color,
        defaultValue: "rgba(255,255,255,0.03)",
        title: "Background",
    },
    autoLayoutTag: {
        type: ControlType.String,
        defaultValue: "Auto layout",
        title: "Layout tag",
    },
    fillTag: {
        type: ControlType.String,
        defaultValue: "Fill · Primary Orange",
        title: "Fill tag",
    },
})
