import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useRef, CSSProperties } from "react"

/**
 * DecisionCard — Apple "Decision Card" scene.
 * Tension lead → big decision line → why → named rejected alternative.
 * Poppins only. Fill width, fit height. Reduced-motion aware entrance.
 * Oct 4: colours follow the site theme tokens (--db-*) for light/dark.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

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

export default function DecisionCard(props: any) {
    const { tension, decision, why, rejected, accent, style } = props
    const ref = useRef<HTMLDivElement | null>(null)
    const [shown, setShown] = useState(false)
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduced(mq.matches)
        const on = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [])

    useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined") {
            setShown(true)
            return
        }
        const obs = new IntersectionObserver(
            (e) => {
                if (e[0].isIntersecting) {
                    setShown(true)
                    obs.disconnect()
                }
            },
            { threshold: 0.3 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    const font = "'Poppins', sans-serif"
    const appear = reduced || shown
    // Oct 4 sweep: warm accents (default orange, maize/yellow like BRIEFS' rgb(255,203,5)) follow the
    // vibe/theme accent, which is contrast-safe in light mode. Other custom hues keep their colour in
    // dark mode and get a darkened ink in light mode so the tension line stays readable.
    const light = useDbLight()
    const accentColor =
        !accent || isWarm(accent)
            ? `var(--db-accent, ${accent || "#F3500F"})`
            : light
              ? `color-mix(in srgb, ${accent} 52%, #000)`
              : accent

    const wrap: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
        padding: "clamp(24px, 4vw, 40px) clamp(20px, 4vw, 44px)",
        background: "var(--db-surface, #0D0D0D)",
        border: "1px solid var(--db-line, #262626)",
        borderRadius: 20,
        boxSizing: "border-box",
        opacity: appear ? 1 : 0,
        transform: appear ? "translateY(0px)" : "translateY(24px)",
        transition: reduced
            ? "none"
            : "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
        ...style,
    }

    const tensionStyle: CSSProperties = {
        fontFamily: font,
        fontWeight: 500,
        fontSize: 12,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: accentColor,
    }

    const decisionStyle: CSSProperties = {
        fontFamily: font,
        fontWeight: 600,
        fontSize: "clamp(22px, 3.4vw, 40px)",
        lineHeight: 1.18,
        letterSpacing: "-0.01em",
        color: "var(--db-text, #FAFAFA)",
    }

    const whyStyle: CSSProperties = {
        fontFamily: font,
        fontWeight: 400,
        fontSize: 17,
        lineHeight: 1.65,
        color: "var(--db-text-2, #B4B4B4)",
        maxWidth: 640,
    }

    const rejectedRow: CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: 8,
        marginTop: 4,
        paddingTop: 20,
        borderTop: "1px solid var(--db-line, #1F1F1F)",
    }

    const rejLabel: CSSProperties = {
        fontFamily: font,
        fontWeight: 500,
        fontSize: 12,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--db-text-2, #6E6E6E)",
    }

    const rejText: CSSProperties = {
        fontFamily: font,
        fontWeight: 400,
        fontSize: 15,
        lineHeight: 1.5,
        color: "var(--db-text-2, #8A8A8A)",
        textDecoration: "line-through",
        textDecorationColor: "var(--db-line, #4A4A4A)",
    }

    return (
        <div ref={ref} style={wrap}>
            {tension ? <span style={tensionStyle}>{tension}</span> : null}
            <span style={decisionStyle}>{decision}</span>
            {why ? <span style={whyStyle}>{why}</span> : null}
            {rejected ? (
                <div style={rejectedRow}>
                    <span style={rejLabel}>rejected</span>
                    <span style={rejText}>{rejected}</span>
                </div>
            ) : null}
        </div>
    )
}

DecisionCard.defaultProps = {
    tension: "the tension",
    decision: "The decision, stated as the big line.",
    why: "Why this was the right call.",
    rejected: "The alternative that was considered and cut.",
    accent: "#F3500F",
}

addPropertyControls(DecisionCard, {
    tension: { type: ControlType.String, defaultValue: "the tension" },
    decision: {
        type: ControlType.String,
        displayTextArea: true,
        defaultValue: "The decision, stated as the big line.",
    },
    why: {
        type: ControlType.String,
        displayTextArea: true,
        defaultValue: "Why this was the right call.",
    },
    rejected: {
        type: ControlType.String,
        displayTextArea: true,
        defaultValue: "The alternative that was considered and cut.",
    },
    accent: { type: ControlType.Color, defaultValue: "#F3500F" },
})
