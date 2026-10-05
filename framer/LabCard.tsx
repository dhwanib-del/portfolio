import { addPropertyControls, ControlType } from "framer"
import { useEffect, useState } from "react"

/**
 * LabCard — terminal-window experiment card for the AI Lab.
 * Oct 4 (light-mode sweep): surfaces, borders and text follow the site theme tokens (--db-*),
 * so the card reads in light mode; accent/status colours used as text get a contrast-safe ink
 * in light mode (warm accents follow the visitor's vibe accent).
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

const TEXT = "var(--db-text, #FAFAFA)"
const INK = (pct: number) => `color-mix(in srgb, var(--db-text, #FAFAFA) ${pct}%, transparent)`
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

// Accent used as TEXT
function accentInk(c: string, light: boolean): string {
    if (!c || isWarm(c)) return `var(--db-accent, ${c || "#F3500F"})`
    return light ? `color-mix(in srgb, ${c} 52%, #000)` : c
}

function useDbLight(): boolean {
    const [light, setLight] = useState(false)
    useEffect(() => {
        if (typeof document === "undefined") return
        const html = document.documentElement
        const read = () => setLight(html.getAttribute("data-db-theme") === "light")
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

export default function LabCard(props) {
    const {
        title,
        oneLiner,
        fileName,
        status,
        tags,
        link,
        accent,
        featured,
        style,
    } = props

    const [hover, setHover] = useState(false)
    const [focus, setFocus] = useState(false)
    const [reducedMotion, setReducedMotion] = useState(false)
    const light = useDbLight()

    useEffect(() => {
        if (typeof window === "undefined") return

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

        setReducedMotion(mediaQuery.matches)

        const handleChange = (event) => {
            setReducedMotion(event.matches)
        }

        mediaQuery.addEventListener("change", handleChange)

        return () => {
            mediaQuery.removeEventListener("change", handleChange)
        }
    }, [])

    const statusColors = {
        Concept: "#666666",
        PRD: "#7B5CFF",
        Prototype: "#00E5FF",
        "In build": "#F3500F",
    }

    const statusColor = statusColors[status] || "#666666"
    const statusInk = accentInk(statusColor, light)
    const accentText = accentInk(accent, light)
    const active = hover || focus
    const line = INK(14)

    const labelFont = "'Poppins', sans-serif"
    const sansFont = "'Poppins', sans-serif"

    const defaultGlow = featured
        ? "0 0 0 1px rgba(243,80,15,0.25), 0 8px 40px -8px rgba(243,80,15,0.35)"
        : "none"

    const hoverGlow = `0 0 0 1px ${alpha(accentText, 25)}, 0 12px 48px -12px ${alpha(accentText, 35)}`

    const slug = title
        ? title.toLowerCase().trim().replace(/\s+/g, "-")
        : "experiment"

    return (
        <a
            data-db-keep=""
            href={link || undefined}
            onClick={(event) => {
                if (!link) {
                    event.preventDefault()
                }
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            aria-label={`${title} — ${status}. ${oneLiner}`}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                textDecoration: "none",
                background: "var(--db-surface, #111111)",
                border: `1px solid ${active ? alpha(accentText, 50) : line}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: active ? hoverGlow : defaultGlow,
                transform:
                    active && !reducedMotion
                        ? "translateY(-4px)"
                        : "translateY(0px)",
                transition: reducedMotion
                    ? "border-color 0.2s ease"
                    : "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                outline: focus ? "2px solid rgba(243,80,15,0.6)" : "none",
                outlineOffset: 3,
                cursor: link ? "pointer" : "default",
                boxSizing: "border-box",
                ...style,
            }}
        >
            {/* Title bar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 16px",
                    background: "var(--db-bg, #0A0A0A)",
                    borderBottom: `1px solid ${line}`,
                    flexShrink: 0,
                    boxSizing: "border-box",
                }}
            >
                <span style={dot("#F3500F")} />
                <span style={dot("#A0A0A0")} />
                <span style={dot("#3A3A3A")} />

                <span
                    style={{
                        marginLeft: 8,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: labelFont,
                        fontWeight: 500,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: INK(58),
                    }}
                >
                    {fileName}
                </span>

                <span
                    style={{
                        marginLeft: "auto",
                        flexShrink: 0,
                        fontFamily: labelFont,
                        fontWeight: 500,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: statusInk,
                        border: `1px solid ${alpha(statusInk, 35)}`,
                        background: alpha(statusInk, 8),
                        borderRadius: 999,
                        padding: "3px 10px",
                        whiteSpace: "nowrap",
                    }}
                >
                    {status}
                </span>
            </div>

            {/* Body */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: "24px 24px 20px",
                    flexGrow: 1,
                    minHeight: 0,
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        fontFamily: sansFont,
                        fontWeight: 600,
                        fontSize: 24,
                        lineHeight: 1.2,
                        color: TEXT,
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        fontFamily: sansFont,
                        fontWeight: 400,
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: INK(64),
                    }}
                >
                    {oneLiner}
                </div>

                {tags && tags.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 4,
                        }}
                    >
                        {tags.map((tag, index) => (
                            <span
                                key={`${tag}-${index}`}
                                style={{
                                    fontFamily: labelFont,
                                    fontWeight: 500,
                                    fontSize: 11,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: INK(64),
                                    border: `1px solid ${line}`,
                                    borderRadius: 999,
                                    padding: "3px 10px",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Prompt footer */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 24px",
                    borderTop: `1px solid ${line}`,
                    flexShrink: 0,
                    fontFamily: labelFont,
                    fontWeight: 500,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    boxSizing: "border-box",
                }}
            >
                <span style={{ color: accentText }}>$</span>

                <span
                    style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: active ? TEXT : INK(64),
                    }}
                >
                    open {slug}
                </span>

                <span
                    aria-hidden="true"
                    style={{
                        flexShrink: 0,
                        color: accentText,
                        transform:
                            active && !reducedMotion
                                ? "translateX(4px)"
                                : "translateX(0px)",
                        transition: reducedMotion
                            ? "none"
                            : "transform 0.2s ease",
                    }}
                >
                    →
                </span>
            </div>
        </a>
    )
}

function dot(color) {
    return {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
    }
}

LabCard.defaultProps = {
    title: "Experiment",
    oneLiner: "One-line description of the experiment.",
    fileName: "experiment.exe",
    status: "Concept",
    tags: [],
    link: "",
    accent: "#00E5FF",
    featured: false,
}

addPropertyControls(LabCard, {
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "Experiment",
    },

    oneLiner: {
        type: ControlType.String,
        title: "Description",
        displayTextArea: true,
        defaultValue: "One-line description of the experiment.",
    },

    fileName: {
        type: ControlType.String,
        title: "File Name",
        defaultValue: "experiment.exe",
    },

    status: {
        type: ControlType.Enum,
        title: "Status",
        options: ["Concept", "PRD", "Prototype", "In build"],
        optionTitles: ["Concept", "PRD", "Prototype", "In Build"],
        defaultValue: "Concept",
    },

    tags: {
        type: ControlType.Array,
        title: "Tags",
        control: {
            type: ControlType.String,
        },
        defaultValue: [],
        maxCount: 6,
    },

    link: {
        type: ControlType.Link,
        title: "Link",
        defaultValue: "",
    },

    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#00E5FF",
    },

    featured: {
        type: ControlType.Boolean,
        title: "Featured",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
})
