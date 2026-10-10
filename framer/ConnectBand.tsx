import { addPropertyControls, ControlType } from "framer"
import { useEffect, useState, type CSSProperties, type ReactNode } from "react"

/**
 * ConnectBand — the closing "let's talk" section at the very end of Home (before the footer).
 * Oct 5: recreates the CONNECT section from Dhwani's Next.js site.
 *  • Letter-spaced eyebrow, huge centered headline (*word* → Pinyon Script, accent), two buttons.
 *  • Background: two large blurred radial gradients in the visitor's vibe colors (--vibe-a /
 *    --vibe-b, falling back to the accent) at the top-left and bottom-right, masked to transparent
 *    on every edge so the band melts into the page with no visible seams. They breathe slowly.
 *    Light mode lowers their opacity.
 *  • A Figma-style "dhwani" cursor tag floats gently near the headline (accent coloured).
 * Reduced motion: no breathing, no floating. The decorative layers never catch clicks.
 * Oct 10: the section carries id="hiring" (Anchor ID) so the nav's "connect" (/#hiring) lands here.
 *
 * @framerIntrinsicWidth 1200
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */

type Props = {
    eyebrow: string
    headline: string
    primaryLabel: string
    primaryUrl: string
    secondaryLabel: string
    secondaryUrl: string
    showCursor: boolean
    cursorLabel: string
    glow: number
    anchorId: string
    style?: CSSProperties
}

const FONT = "'Poppins', 'Inter', sans-serif"
const SCRIPT = "'Pinyon Script', cursive"
const ACCENT = "var(--db-accent, #F3500F)"

/** "Let's *talk*." → ["Let's ", <span>talk</span>, "."] */
function withScript(text: string): ReactNode[] {
    return String(text || "")
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part, i) =>
            /^\*[^*]+\*$/.test(part) ? (
                <span
                    key={i}
                    style={{
                        fontFamily: SCRIPT,
                        fontWeight: 400,
                        fontSize: "1.18em",
                        lineHeight: 0.8,
                        letterSpacing: 0,
                        color: ACCENT,
                        padding: "0 0.06em",
                    }}
                >
                    {part.slice(1, -1)}
                </span>
            ) : (
                <span key={i}>{part}</span>
            )
        )
}

function isExternal(url: string) {
    return /^https?:\/\//i.test(url)
}

export default function ConnectBand(props: Props) {
    const {
        eyebrow = "CONNECT",
        headline = "Hiring for product, UX or experience design? Let's *talk*.",
        primaryLabel = "say hi on LinkedIn",
        primaryUrl = "https://www.linkedin.com/in/dhwanibagrecha/",
        secondaryLabel = "or email me",
        secondaryUrl = "mailto:dhwanib@umich.edu",
        showCursor = true,
        cursorLabel = "dhwani",
        glow = 1,
        anchorId = "hiring",
        style,
    } = props

    const [reduced, setReduced] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const read = () => setReduced(mq.matches)
        read()
        mq.addEventListener("change", read)
        return () => mq.removeEventListener("change", read)
    }, [])

    const g = Math.max(0, Math.min(1.5, Number.isFinite(glow) ? glow : 1))
    const blobA = `var(--vibe-a, color-mix(in srgb, ${ACCENT} 38%, transparent))`
    const blobB = `var(--vibe-b, color-mix(in srgb, ${ACCENT} 48%, transparent))`

    // Fade every edge to transparent so the glow has no seams against the page.
    const edgeMask =
        "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%), linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)"

    const css = `
        .cb-root { padding: 140px 24px; }
        @media (max-width: 640px) { .cb-root { padding: 96px 20px; } }
        .cb-bg { opacity: ${(0.95 * g).toFixed(3)}; }
        :root[data-db-theme="light"] .cb-bg { opacity: ${(0.5 * g).toFixed(3)}; }
        @keyframes cb-breathe-a { 0%,100% { transform: translate(0,0) scale(1); opacity: .8 } 50% { transform: translate(4%, 3%) scale(1.12); opacity: 1 } }
        @keyframes cb-breathe-b { 0%,100% { transform: translate(0,0) scale(1.06); opacity: 1 } 50% { transform: translate(-4%, -3%) scale(.94); opacity: .78 } }
        @keyframes cb-float { 0%,100% { transform: translate(0,0) rotate(0deg) } 33% { transform: translate(6px,-8px) rotate(-2deg) } 66% { transform: translate(-4px,-3px) rotate(1deg) } }
        .cb-btn { transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s ease, background .2s ease, border-color .2s ease, color .2s ease; }
        .cb-btn:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 3px; }
        .cb-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 34px -14px ${ACCENT}; }
        .cb-secondary:hover { background: var(--db-line, rgba(255,255,255,.1)); border-color: color-mix(in srgb, ${ACCENT} 40%, var(--db-line, rgba(255,255,255,.14))); }
        .cb-btn:hover .cb-arrow { transform: translate(2px,-2px); }
        .cb-arrow { display: inline-block; transition: transform .2s ease; }
        @media (prefers-reduced-motion: reduce) {
            .cb-btn, .cb-arrow { transition: none !important; }
            .cb-primary:hover, .cb-btn:hover .cb-arrow { transform: none; }
        }
    `

    const btnBase: CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 52,
        padding: "0 24px",
        borderRadius: 999,
        fontFamily: FONT,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: "0.005em",
        textDecoration: "none",
        whiteSpace: "nowrap",
        cursor: "pointer",
        boxSizing: "border-box",
    }

    return (
        <section
            className="cb-root"
            id={anchorId ? anchorId : undefined}
            aria-labelledby="cb-heading"
            style={{
                position: "relative",
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
                overflow: "hidden",
                fontFamily: FONT,
                color: "var(--db-text, #FAFAFA)",
                ...style,
            }}
        >
            <style>{css}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" />

            {/* Seamless vibe glow */}
            <div
                aria-hidden="true"
                className="cb-bg"
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 0,
                    WebkitMaskImage: edgeMask,
                    maskImage: edgeMask,
                    WebkitMaskComposite: "source-in",
                    maskComposite: "intersect",
                    transition: "opacity .4s ease",
                } as CSSProperties}
            >
                <div
                    style={{
                        position: "absolute",
                        left: "-12%",
                        top: "-18%",
                        width: "68%",
                        height: "92%",
                        borderRadius: "50%",
                        background: `radial-gradient(closest-side, ${blobA} 0%, transparent 100%)`,
                        filter: "blur(60px)",
                        animation: reduced ? "none" : "cb-breathe-a 12s ease-in-out infinite",
                        willChange: reduced ? "auto" : "transform, opacity",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: "-12%",
                        bottom: "-20%",
                        width: "72%",
                        height: "96%",
                        borderRadius: "50%",
                        background: `radial-gradient(closest-side, ${blobB} 0%, transparent 100%)`,
                        filter: "blur(70px)",
                        animation: reduced ? "none" : "cb-breathe-b 15s ease-in-out -5s infinite",
                        willChange: reduced ? "auto" : "transform, opacity",
                    }}
                />
            </div>

            {/* Content */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    maxWidth: 1000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                {eyebrow ? (
                    <p
                        style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            color: "var(--db-text-2, rgba(255,255,255,.6))",
                            paddingLeft: "0.32em",
                        }}
                    >
                        {eyebrow}
                    </p>
                ) : null}

                <div style={{ position: "relative", marginTop: 20, width: "100%" }}>
                    <h2
                        id="cb-heading"
                        style={{
                            margin: 0,
                            fontFamily: FONT,
                            fontSize: "clamp(36px, 6vw, 76px)",
                            fontWeight: 700,
                            lineHeight: 1.04,
                            letterSpacing: "-0.035em",
                            color: "var(--db-text, #FAFAFA)",
                            textWrap: "balance",
                        } as CSSProperties}
                    >
                        {withScript(headline)}
                    </h2>

                    {showCursor && cursorLabel ? (
                        <span
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                right: "clamp(0px, 4vw, 48px)",
                                top: "clamp(-34px, -3vw, -22px)",
                                pointerEvents: "none",
                                animation: reduced ? "none" : "cb-float 7s ease-in-out infinite",
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "flex-start" }}>
                                <svg width="18" height="18" viewBox="0 0 16 16" style={{ display: "block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.3))" }}>
                                    <path d="M1.5 1.5l5.2 12.6 1.9-5.2 5.4-1.9z" style={{ fill: ACCENT }} stroke="var(--db-bg, #000)" strokeWidth="1" strokeLinejoin="round" />
                                </svg>
                                <span
                                    style={{
                                        marginTop: 13,
                                        marginLeft: -2,
                                        padding: "3px 9px",
                                        borderRadius: "3px 9px 9px 9px",
                                        background: ACCENT,
                                        color: "var(--db-on-accent, #0A0A0A)",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        lineHeight: 1.35,
                                        whiteSpace: "nowrap",
                                        boxShadow: "0 4px 14px -4px rgba(0,0,0,.35)",
                                    }}
                                >
                                    {cursorLabel}
                                </span>
                            </span>
                        </span>
                    ) : null}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 44 }}>
                    {primaryLabel && primaryUrl ? (
                        <a
                            href={primaryUrl}
                            className="cb-btn cb-primary"
                            {...(isExternal(primaryUrl) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            style={{ ...btnBase, background: ACCENT, color: "var(--db-on-accent, #0A0A0A)", border: `1px solid ${ACCENT}` }}
                        >
                            {primaryLabel}
                            <span aria-hidden="true" className="cb-arrow">↗</span>
                            {isExternal(primaryUrl) ? <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}> (opens in a new tab)</span> : null}
                        </a>
                    ) : null}
                    {secondaryLabel && secondaryUrl ? (
                        <a
                            href={secondaryUrl}
                            className="cb-btn cb-secondary"
                            {...(isExternal(secondaryUrl) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            style={{ ...btnBase, background: "transparent", color: "var(--db-text, #FAFAFA)", border: "1px solid var(--db-line, rgba(255,255,255,.14))", fontWeight: 500 }}
                        >
                            {secondaryLabel}
                        </a>
                    ) : null}
                </div>
            </div>
        </section>
    )
}

ConnectBand.defaultProps = {
    eyebrow: "CONNECT",
    headline: "Hiring for product, UX or experience design? Let's *talk*.",
    primaryLabel: "say hi on LinkedIn",
    primaryUrl: "https://www.linkedin.com/in/dhwanibagrecha/",
    secondaryLabel: "or email me",
    secondaryUrl: "mailto:dhwanib@umich.edu",
    showCursor: true,
    cursorLabel: "dhwani",
    glow: 1,
    anchorId: "hiring",
}

addPropertyControls(ConnectBand, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "CONNECT" },
    headline: {
        type: ControlType.String,
        title: "Headline",
        displayTextArea: true,
        defaultValue: "Hiring for product, UX or experience design? Let's *talk*.",
        description: "Wrap a word in *asterisks* for the script accent.",
    },
    primaryLabel: { type: ControlType.String, title: "Primary label", defaultValue: "say hi on LinkedIn" },
    primaryUrl: { type: ControlType.String, title: "Primary link", defaultValue: "https://www.linkedin.com/in/dhwanibagrecha/" },
    secondaryLabel: { type: ControlType.String, title: "Secondary label", defaultValue: "or email me" },
    secondaryUrl: { type: ControlType.String, title: "Secondary link", defaultValue: "mailto:dhwanib@umich.edu" },
    showCursor: { type: ControlType.Boolean, title: "Cursor tag", defaultValue: true },
    cursorLabel: { type: ControlType.String, title: "Cursor label", defaultValue: "dhwani", hidden: (p: any) => !p.showCursor },
    glow: { type: ControlType.Number, title: "Glow", min: 0, max: 1.5, step: 0.05, defaultValue: 1 },
    anchorId: { type: ControlType.String, title: "Anchor ID", defaultValue: "hiring", description: "Nav links to /#hiring land here." },
})
