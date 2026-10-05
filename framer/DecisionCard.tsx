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
    // Default orange (any notation) follows the vibe/theme accent; a custom colour is kept as-is
    const norm = String(accent || "").replace(/\s+/g, "").toLowerCase()
    const isDefaultOrange =
        !norm || norm === "#f3500f" || norm === "rgb(243,80,15)" || norm === "rgba(243,80,15,1)"
    const accentColor = isDefaultOrange ? "var(--db-accent, #F3500F)" : accent

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
