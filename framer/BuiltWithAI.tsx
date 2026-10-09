import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react"

/**
 * BuiltWithAI v2 — the "how this is made" card, now a tiny build log.
 * Oct 5 (Dhwani: "make it a better interaction and fun"):
 *  • Tool chips styled like Figma layer rows. Hover, focus or click one and a one-line
 *    "what it did" note appears underneath.
 *  • A "claude" multiplayer cursor drifts between the chips on its own and selects the one being
 *    described; it pauses while you're interacting. A "dhwani" cursor follows your real pointer
 *    inside the card (mouse/trackpad only).
 *  • The body types itself out once, terminal-style, when the card scrolls into view.
 *  • "regenerate" cycles through alternate one-liners (altLines) and retypes them.
 * Reduced motion: no drifting, no typing, no caret blink; everything is shown at once.
 * Colors come from the site tokens (--db-*) so it reads in light and dark mode.
 * "Use site accent" (on by default) follows the vibe; turn it off to use the color you pick.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

type Props = {
    label: string
    body: string
    linkText: string
    linkUrl: string
    accent: string
    useSiteAccent: boolean
    tools: string
    toolNotes: string
    altLines: string
    showCursors: boolean
    style?: CSSProperties
}

const FONT = "'Poppins', sans-serif"
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"
const DEFAULT_BODY =
    "Designed in Figma and Framer, prototyped in Next.js, built with Claude and ChatGPT as pair-programmers. Made with Claude, edited by Dhwani, then edited again by Dhwani because apparently this is my hobby now."
const DEFAULT_TOOLS = "Figma, Framer, Next.js, Claude, ChatGPT"
const DEFAULT_NOTES = [
    "Figma: sketched the layouts and the type pairings",
    "Framer: the actual site you're on",
    "Next.js: where the experiments get prototyped first",
    "Claude: pair-programmer for the components (and this sentence)",
    "ChatGPT: second opinion, rubber duck, copy sparring partner",
].join("\n")
const DEFAULT_ALTS = [
    "sketched in figma, built in framer, debugged at an hour i won't disclose. claude wrote code, i rewrote opinions.",
    "chatgpt was the rubber duck, claude was the pair-programmer, and i was the one saying \"no, smaller\" on repeat.",
    "every pixel here got reviewed by a human. the human was me. i have notes on my own notes.",
].join("\n")

const TYPE_MS = 22
const TOUR_MS = 2800

function splitList(s: string, sep: RegExp) {
    return String(s || "")
        .split(sep)
        .map((x) => x.trim())
        .filter(Boolean)
}

/** "Figma: sketched…" → "sketched…" when the line starts with the tool's name. */
function noteFor(tool: string, line: string | undefined) {
    if (!line) return ""
    const re = new RegExp("^" + tool.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[:\\-–—]\\s*", "i")
    return line.replace(re, "")
}

function Arrow({ fill }: { fill: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))" }}>
            <path d="M1.5 1.5l5.2 12.6 1.9-5.2 5.4-1.9z" style={{ fill }} stroke="var(--db-bg, #000)" strokeWidth="1" strokeLinejoin="round" />
        </svg>
    )
}

function CursorTag({ name, bg, fg }: { name: string; bg: string; fg: string }) {
    return (
        <span style={{ display: "flex", alignItems: "flex-start" }}>
            <Arrow fill={bg} />
            <span
                style={{
                    marginTop: 12,
                    marginLeft: -2,
                    padding: "2px 7px",
                    borderRadius: "3px 8px 8px 8px",
                    background: bg,
                    color: fg,
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,.25)",
                }}
            >
                {name}
            </span>
        </span>
    )
}

export default function BuiltWithAI(props: Props) {
    const {
        label,
        body,
        linkText,
        linkUrl,
        accent,
        useSiteAccent = true,
        tools = DEFAULT_TOOLS,
        toolNotes = DEFAULT_NOTES,
        altLines = DEFAULT_ALTS,
        showCursors = true,
        style,
    } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const tint = useSiteAccent ? "var(--db-accent, #F3500F)" : accent

    const toolList = useMemo(() => splitList(tools, /,/), [tools])
    const notes = useMemo(() => {
        const lines = String(toolNotes || "").split(/\r?\n/)
        return toolList.map((t, i) => noteFor(t, lines[i]?.trim()))
    }, [toolNotes, toolList])
    const lines = useMemo(() => [String(body || DEFAULT_BODY).trim(), ...splitList(altLines, /\r?\n/)], [body, altLines])

    const rootRef = useRef<HTMLDivElement>(null)
    const chipRefs = useRef<(HTMLButtonElement | null)[]>([])
    const meRef = useRef<HTMLDivElement>(null)

    const [reduced, setReduced] = useState(false)
    const [fine, setFine] = useState(false)
    const [seen, setSeen] = useState(false)
    const [take, setTake] = useState(0)
    const [typed, setTyped] = useState(0)
    const [active, setActive] = useState(-1)
    const [userDriving, setUserDriving] = useState(false)
    const [claudeAt, setClaudeAt] = useState<{ x: number; y: number } | null>(null)
    const [meOn, setMeOn] = useState(false)
    const [linkHover, setLinkHover] = useState(false)

    const line = lines[take % lines.length] || ""
    const done = typed >= line.length

    // Environment
    useEffect(() => {
        if (typeof window === "undefined") return
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const fp = window.matchMedia("(hover: hover) and (pointer: fine)")
        const read = () => {
            setReduced(rm.matches)
            setFine(fp.matches)
        }
        read()
        rm.addEventListener("change", read)
        fp.addEventListener("change", read)
        return () => {
            rm.removeEventListener("change", read)
            fp.removeEventListener("change", read)
        }
    }, [])

    // Type once when scrolled into view
    useEffect(() => {
        if (onCanvas) {
            setSeen(true)
            return
        }
        const el = rootRef.current
        if (!el || typeof IntersectionObserver === "undefined") {
            setSeen(true)
            return
        }
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setSeen(true)
                    io.disconnect()
                }
            },
            { threshold: 0.35 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [onCanvas])

    useEffect(() => {
        if (!seen) return
        if (reduced || onCanvas) {
            setTyped(line.length)
            return
        }
        setTyped(0)
        let i = 0
        const id = window.setInterval(() => {
            i += 1
            setTyped(i)
            if (i >= line.length) window.clearInterval(id)
        }, TYPE_MS)
        return () => window.clearInterval(id)
    }, [seen, take, line, reduced, onCanvas])

    // Claude's auto-tour across the chips
    useEffect(() => {
        if (!seen || reduced || onCanvas || userDriving || !toolList.length) return
        const id = window.setInterval(() => setActive((a) => (a + 1) % toolList.length), TOUR_MS)
        if (active < 0) setActive(0)
        return () => window.clearInterval(id)
    }, [seen, reduced, onCanvas, userDriving, toolList.length]) // eslint-disable-line react-hooks/exhaustive-deps

    // Where the claude cursor should sit (bottom-right of the active chip)
    const place = useCallback(() => {
        const root = rootRef.current
        const chip = active >= 0 ? chipRefs.current[active] : null
        if (!root || !chip) return
        const r = root.getBoundingClientRect()
        const c = chip.getBoundingClientRect()
        setClaudeAt({ x: c.left - r.left + c.width * 0.72, y: c.top - r.top + c.height * 0.62 })
    }, [active])

    useEffect(() => {
        place()
        const root = rootRef.current
        if (!root || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(place)
        ro.observe(root)
        return () => ro.disconnect()
    }, [place])

    // dhwani cursor follows the real pointer inside the card (transform only)
    const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
        if (!fine || reduced || !showCursors || e.pointerType !== "mouse") return
        const root = rootRef.current
        const me = meRef.current
        if (!root || !me) return
        const r = root.getBoundingClientRect()
        me.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`
        if (!meOn) setMeOn(true)
    }
    const onPointerLeave = () => {
        setMeOn(false)
        setUserDriving(false)
    }

    const pick = (i: number) => {
        setUserDriving(true)
        setActive(i)
    }
    const regenerate = () => setTake((t) => (t + 1) % Math.max(1, lines.length))

    const note = active >= 0 ? notes[active] : ""
    const showClaude = showCursors && !onCanvas && claudeAt && active >= 0
    const ease = "cubic-bezier(.22,1,.36,1)"

    const css = `
        .bwa-chip { transition: background .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease; }
        .bwa-chip:hover { border-color: color-mix(in srgb, ${tint} 50%, var(--db-line, #2A2A2A)); color: var(--db-text, #FAFAFA); }
        .bwa-chip:focus-visible, .bwa-btn:focus-visible, .bwa-link:focus-visible { outline: 2px solid ${tint}; outline-offset: 2px; }
        .bwa-btn { transition: background .18s ease, color .18s ease, border-color .18s ease; }
        .bwa-btn:hover { background: var(--db-line, rgba(255,255,255,.1)); color: var(--db-text, #FAFAFA); }
        .bwa-btn:hover .bwa-spin { transform: rotate(-180deg); }
        .bwa-spin { display: inline-block; transition: transform .45s ${ease}; }
        @keyframes bwa-blink { 50% { opacity: 0 } }
        @keyframes bwa-note { from { opacity: 0; transform: translateY(3px) } to { opacity: 1; transform: none } }
        .bwa-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (prefers-reduced-motion: reduce) { .bwa-chip, .bwa-btn, .bwa-spin { transition: none !important; } .bwa-btn:hover .bwa-spin { transform: none; } }
    `

    return (
        <div
            ref={rootRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
                boxSizing: "border-box",
                padding: "24px 28px",
                background: "var(--db-surface, #0E0E0E)",
                border: "1px solid var(--db-line, #2A2A2A)",
                borderLeft: `3px solid ${tint}`,
                borderRadius: 14,
                overflow: "hidden",
                fontFamily: FONT,
                ...style,
            }}
        >
            <style>{css}</style>

            {/* Header: label + regenerate */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: tint }}>{label}</span>
                {lines.length > 1 && (
                    <button
                        type="button"
                        className="bwa-btn"
                        onClick={regenerate}
                        aria-label="Regenerate: show another line about how this site was made"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            minHeight: 36,
                            padding: "0 12px",
                            borderRadius: 999,
                            border: "1px solid var(--db-line, rgba(255,255,255,.12))",
                            background: "transparent",
                            color: "var(--db-text-2, rgba(255,255,255,.6))",
                            fontFamily: FONT,
                            fontSize: 12,
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                            cursor: "pointer",
                        }}
                    >
                        <span aria-hidden="true" className="bwa-spin">↻</span>
                        regenerate
                        {take > 0 && <span aria-hidden="true" style={{ opacity: 0.6 }}>· take {take + 1}</span>}
                    </button>
                )}
            </div>

            {/* Terminal line */}
            <div
                style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    lineHeight: 1.65,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "color-mix(in srgb, var(--db-text, #FAFAFA) 4%, transparent)",
                    border: "1px solid var(--db-line, rgba(255,255,255,.1))",
                    color: "var(--db-text, #FAFAFA)",
                    minHeight: "3.3em",
                }}
            >
                <span className="bwa-sr" aria-live="polite">{line}</span>
                <span aria-hidden="true">
                    <span style={{ color: tint, fontWeight: 600 }}>dhwani@portfolio</span>
                    <span style={{ color: "var(--db-text-2, rgba(255,255,255,.6))" }}> ~ % </span>
                    {line.slice(0, typed)}
                    <span
                        style={{
                            display: "inline-block",
                            width: "0.55em",
                            height: "1.05em",
                            marginLeft: 2,
                            verticalAlign: "-0.15em",
                            background: tint,
                            opacity: 0.85,
                            animation: reduced ? "none" : `bwa-blink 1s steps(1, end) infinite${done ? "" : " paused"}`,
                        }}
                    />
                </span>
            </div>

            {/* Tool chips (Figma layer rows) */}
            {toolList.length > 0 && (
                <div>
                    <div
                        role="group"
                        aria-label="Tools used to build this site"
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        onMouseEnter={() => setUserDriving(true)}
                        onMouseLeave={() => setUserDriving(false)}
                    >
                        {toolList.map((t, i) => {
                            const on = i === active
                            return (
                                <button
                                    key={t + i}
                                    ref={(n) => {
                                        chipRefs.current[i] = n
                                    }}
                                    type="button"
                                    className="bwa-chip"
                                    aria-pressed={on}
                                    aria-describedby={on ? "bwa-note" : undefined}
                                    onMouseEnter={() => pick(i)}
                                    onFocus={() => pick(i)}
                                    onClick={() => pick(i)}
                                    onBlur={() => setUserDriving(false)}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 7,
                                        minHeight: 36,
                                        padding: "0 12px 0 9px",
                                        borderRadius: 6,
                                        border: `1px solid ${on ? tint : "var(--db-line, rgba(255,255,255,.12))"}`,
                                        background: on ? `color-mix(in srgb, ${tint} 14%, transparent)` : "transparent",
                                        boxShadow: on ? `0 0 0 1px ${tint} inset` : "none",
                                        color: on ? "var(--db-text, #FAFAFA)" : "var(--db-text-2, rgba(255,255,255,.62))",
                                        fontFamily: FONT,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, opacity: on ? 1 : 0.7 }}>
                                        <path d="M3.5 1v10M8.5 1v10M1 3.5h10M1 8.5h10" stroke={on ? tint : "currentColor"} strokeWidth="1.2" fill="none" />
                                    </svg>
                                    {t}
                                </button>
                            )
                        })}
                    </div>
                    <p
                        id="bwa-note"
                        aria-live="polite"
                        style={{
                            margin: "10px 0 0",
                            minHeight: "1.6em",
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "var(--db-text-2, rgba(255,255,255,.62))",
                        }}
                    >
                        {note ? (
                            <span key={active} style={{ display: "inline-block", animation: reduced ? "none" : "bwa-note .25s ease both" }}>
                                <span style={{ color: "var(--db-text, #FAFAFA)", fontWeight: 600 }}>{toolList[active]}</span>
                                <span aria-hidden="true" style={{ color: tint }}> → </span>
                                <span className="bwa-sr">: </span>
                                {note}
                            </span>
                        ) : (
                            <span>hover a tool to see what it did.</span>
                        )}
                    </p>
                </div>
            )}

            {linkText && linkUrl ? (
                <a
                    href={linkUrl}
                    className="bwa-link"
                    onMouseEnter={() => setLinkHover(true)}
                    onMouseLeave={() => setLinkHover(false)}
                    style={{
                        fontWeight: 500,
                        fontSize: 14,
                        letterSpacing: "0.04em",
                        color: linkHover ? "var(--db-text, #FAFAFA)" : tint,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        minHeight: 44,
                        width: "fit-content",
                        transition: "color 0.2s ease",
                    }}
                >
                    {linkText}
                    <span aria-hidden="true" style={{ transform: linkHover ? "translateX(3px)" : "none", transition: "transform 0.2s ease" }}>→</span>
                </a>
            ) : null}

            {/* Multiplayer cursors (decorative) */}
            {showClaude && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        pointerEvents: "none",
                        zIndex: 3,
                        transform: `translate3d(${claudeAt!.x}px, ${claudeAt!.y}px, 0)`,
                        transition: reduced ? "none" : `transform .9s ${ease}`,
                    }}
                >
                    <CursorTag name="claude" bg="var(--db-text, #FAFAFA)" fg="var(--db-bg, #000)" />
                </div>
            )}
            {showCursors && !onCanvas && fine && !reduced && (
                <div
                    ref={meRef}
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        pointerEvents: "none",
                        zIndex: 4,
                        opacity: meOn ? 1 : 0,
                        transition: "opacity .2s ease",
                        willChange: "transform",
                    }}
                >
                    <span style={{ display: "block", transform: "translate(10px, 10px)" }}>
                        <CursorTag name="dhwani" bg={tint} fg="var(--db-on-accent, #0A0A0A)" />
                    </span>
                </div>
            )}
        </div>
    )
}

BuiltWithAI.defaultProps = {
    label: "how this is made",
    body: DEFAULT_BODY,
    linkText: "",
    linkUrl: "",
    accent: "#00E5FF",
    useSiteAccent: true,
    tools: DEFAULT_TOOLS,
    toolNotes: DEFAULT_NOTES,
    altLines: DEFAULT_ALTS,
    showCursors: true,
}

addPropertyControls(BuiltWithAI, {
    label: { type: ControlType.String, defaultValue: "how this is made" },
    body: { type: ControlType.String, displayTextArea: true, defaultValue: DEFAULT_BODY },
    tools: { type: ControlType.String, title: "Tools", defaultValue: DEFAULT_TOOLS, description: "Comma-separated chips." },
    toolNotes: { type: ControlType.String, title: "Tool notes", displayTextArea: true, defaultValue: DEFAULT_NOTES, description: "One line per tool, same order." },
    altLines: { type: ControlType.String, title: "Regenerate lines", displayTextArea: true, defaultValue: DEFAULT_ALTS, description: "One per line. Empty hides the button." },
    showCursors: { type: ControlType.Boolean, title: "Cursors", defaultValue: true },
    linkText: { type: ControlType.String, defaultValue: "" },
    linkUrl: { type: ControlType.String, defaultValue: "" },
    useSiteAccent: { type: ControlType.Boolean, title: "Use site accent", defaultValue: true },
    accent: { type: ControlType.Color, defaultValue: "#00E5FF", hidden: (p: any) => p.useSiteAccent !== false },
})
