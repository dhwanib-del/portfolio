import { addPropertyControls, ControlType } from "framer"
import { useState, CSSProperties } from "react"

/**
 * BuiltWithAI — a small honesty note crediting the directed-AI build practice.
 * Poppins only. Fill width, fit height. Optional link (hidden when the link is empty).
 * Oct 2: colors come from the site tokens (--db-*) so it reads in light and dark mode.
 * "Use site accent" (on by default) follows the vibe; turn it off to use the color you pick.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function BuiltWithAI(props) {
    const { label, body, linkText, linkUrl, accent, useSiteAccent = true, style } = props
    const [hover, setHover] = useState(false)
    const font = "'Poppins', sans-serif"
    const tint = useSiteAccent ? "var(--db-accent, #F3500F)" : accent

    const wrap: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        padding: "24px 28px",
        background: "var(--db-surface, #0E0E0E)",
        border: "1px solid var(--db-line, #2A2A2A)",
        borderLeft: `3px solid ${tint}`,
        borderRadius: 14,
        ...style,
    }

    const labelStyle: CSSProperties = {
        fontFamily: font,
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: tint,
    }

    const bodyStyle: CSSProperties = {
        fontFamily: font,
        fontWeight: 400,
        fontSize: 16,
        lineHeight: 1.65,
        color: "var(--db-text, #FAFAFA)",
        opacity: 0.86,
    }

    const linkStyle: CSSProperties = {
        fontFamily: font,
        fontWeight: 500,
        fontSize: 14,
        letterSpacing: "0.04em",
        color: hover ? "var(--db-text, #FAFAFA)" : tint,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 44,
        width: "fit-content",
        transition: "color 0.2s ease",
    }

    return (
        <div style={wrap}>
            <span style={labelStyle}>{label}</span>
            <span style={bodyStyle}>{body}</span>
            {linkText && linkUrl ? (
                <a href={linkUrl} style={linkStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    {linkText}
                    <span aria-hidden="true" style={{ transform: hover ? "translateX(3px)" : "none", transition: "transform 0.2s ease" }}>→</span>
                </a>
            ) : null}
        </div>
    )
}

BuiltWithAI.defaultProps = {
    label: "built in the workshop",
    body: "The interactive pieces across this site — these process rails, the count-up stats, the world-guessing game (MapGame) on my About page — are themselves built through directed AI sessions: specified in plain language, corrected when they drifted, and rejected until each one earned its place.",
    linkText: "see the workshop",
    linkUrl: "/components",
    accent: "#00E5FF",
    useSiteAccent: true,
}

addPropertyControls(BuiltWithAI, {
    label: { type: ControlType.String, defaultValue: "built in the workshop" },
    body: {
        type: ControlType.String,
        displayTextArea: true,
        defaultValue:
            "The interactive pieces across this site — these process rails, the count-up stats, the world-guessing game (MapGame) on my About page — are themselves built through directed AI sessions: specified in plain language, corrected when they drifted, and rejected until each one earned its place.",
    },
    linkText: { type: ControlType.String, defaultValue: "see the workshop" },
    linkUrl: { type: ControlType.String, defaultValue: "/components" },
    useSiteAccent: { type: ControlType.Boolean, title: "Use site accent", defaultValue: true },
    accent: { type: ControlType.Color, defaultValue: "#00E5FF", hidden: (p: any) => p.useSiteAccent !== false },
})
