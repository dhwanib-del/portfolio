import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, CSSProperties } from "react"

/**
 * ProcessStep — one stage of the AI-Lab process walkthrough.
 * Colored left rail + numbered stage label + tool chip on the left column,
 * body content on the right. Fill width, fit height. Wraps to stacked on narrow.
 * Oct 4 (light-mode sweep): text and the note box follow the site theme tokens (--db-*);
 * accent used as text gets a contrast-safe ink in light mode (warm accents follow the vibe).
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

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

export default function ProcessStep(props) {
    const {
        index,
        stageLabel,
        toolLabel,
        accent,
        body,
        note,
        style,
    } = props

    const [hover, setHover] = useState(false)
    const light = useDbLight()
    const ink = accentInk(accent, light)
    // Two-font system: Poppins only. Label feel = uppercase + tracking.
    const label = "'Poppins', sans-serif"
    const sans = "'Poppins', sans-serif"

    const wrap: CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        alignItems: "stretch",
        width: "100%",
        padding: "4px 0",
        ...style,
    }

    const rail: CSSProperties = {
        width: 3,
        alignSelf: "stretch",
        minHeight: 44,
        borderRadius: 999,
        background: accent,
        boxShadow: hover ? `0 0 16px -2px ${accent}` : "none",
        transition: "box-shadow 0.25s ease",
        flexShrink: 0,
    }

    const leftCol: CSSProperties = {
        display: "flex",
        gap: 14,
        width: 200,
        minWidth: 160,
        flexGrow: 0,
    }

    const labelStack: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingTop: 2,
    }

    const stageStyle: CSSProperties = {
        fontFamily: label,
        fontWeight: 500,
        fontSize: 13,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--db-text, #FAFAFA)",
    }

    const chip: CSSProperties = {
        alignSelf: "flex-start",
        fontFamily: label,
        fontWeight: 500,
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: ink,
        border: `1px solid ${alpha(ink, 35)}`,
        background: alpha(ink, 8),
        borderRadius: 999,
        padding: "3px 10px",
        whiteSpace: "nowrap",
    }

    const bodyCol: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        flex: "1 1 280px",
        minWidth: 260,
    }

    const bodyText: CSSProperties = {
        fontFamily: sans,
        fontWeight: 400,
        fontSize: 18,
        lineHeight: 1.6,
        color: INK(80),
    }

    const noteBox: CSSProperties = {
        background: "var(--db-surface, #111111)",
        border: `1px solid ${alpha(ink, 18)}`,
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
    }

    const noteHead: CSSProperties = {
        fontFamily: label,
        fontWeight: 500,
        fontSize: 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: ink,
    }

    const noteBody: CSSProperties = {
        fontFamily: sans,
        fontWeight: 400,
        fontSize: 15,
        lineHeight: 1.7,
        color: INK(64),
    }

    return (
        <div
            data-db-keep=""
            style={wrap}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={leftCol}>
                <div style={rail} />
                <div style={labelStack}>
                    <span style={stageStyle}>
                        {String(index).padStart(2, "0")} / {stageLabel}
                    </span>
                    {toolLabel ? <span style={chip}>{toolLabel}</span> : null}
                </div>
            </div>
            <div style={bodyCol}>
                <span style={bodyText}>{body}</span>
                {note ? (
                    <div style={noteBox}>
                        <span style={noteHead}>prompting notes</span>
                        <span style={noteBody}>{note}</span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

ProcessStep.defaultProps = {
    index: 1,
    stageLabel: "moodboard",
    toolLabel: "pinterest",
    accent: "#666666",
    body: "Describe what happened at this stage.",
    note: "",
}

addPropertyControls(ProcessStep, {
    index: { type: ControlType.Number, min: 1, max: 20, step: 1, defaultValue: 1 },
    stageLabel: { type: ControlType.String, defaultValue: "moodboard" },
    toolLabel: { type: ControlType.String, defaultValue: "pinterest" },
    accent: { type: ControlType.Color, defaultValue: "#666666" },
    body: {
        type: ControlType.String,
        displayTextArea: true,
        defaultValue: "Describe what happened at this stage.",
    },
    note: {
        type: ControlType.String,
        displayTextArea: true,
        defaultValue: "",
    },
})
