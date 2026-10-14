// BeforeAfter — one real iteration: two versions, what changed, why, and how well it's supported.
//
// The "Evidence" control is required on purpose: "Revision not yet tested" and "Reviewed, not
// retested" are shown as plainly as "Retested with users", so an untested revision can't read as
// a proven improvement. A missing side shows a labeled slot instead of a stand-in image.
// - Layout: side by side (stacks under 640px) or stacked.
// - Each side can carry an owner label ("My work" / "Team work" / "Shared").
// - Theme: --db-* tokens with fallbacks; "Theme" control can force dark/light. Poppins only.
// Evidence labels mirror EVIDENCE_LABEL in src/lib/case-ui (Next.js repo) — keep in sync.
//
// @framerSupportedLayoutWidth any
// @framerSupportedLayoutHeight auto

import { addPropertyControls, ControlType } from "framer"
import * as React from "react"
import { useLayoutEffect, useRef, useState } from "react"

/* ---------- case-ui (mirror of src/lib/case-ui) ---------- */
type IterationEvidence = "retested" | "reviewed" | "untested"
const EVIDENCE_LABEL: Record<IterationEvidence, string> = {
    retested: "Retested with users",
    reviewed: "Reviewed, not retested",
    untested: "Revision not yet tested",
}
/* ---------- /case-ui ---------- */

type Owner = "none" | "mine" | "team" | "shared"
type Img = { src: string; srcSet?: string; alt?: string } | undefined
type Props = {
    beforeImage: Img
    beforeCaption: string
    beforeAlt: string
    beforeMissing: string
    afterImage: Img
    afterCaption: string
    afterAlt: string
    afterMissing: string
    owner: Owner
    ownerNote: string
    changed: string
    why: string
    evidence: IterationEvidence
    layout: "side" | "stack"
    screenMax: number
    radius: number
    theme: "auto" | "dark" | "light"
    accent: string
    style?: React.CSSProperties
}

const FONT = "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
const OWNER_LABEL: Record<Owner, string> = { none: "", mine: "My work", team: "Team work", shared: "Shared" }
const THEMES = {
    dark: { "--db-bg": "#000000", "--db-surface": "#111111", "--db-text": "#FFFFFF", "--db-text-2": "rgba(255,255,255,0.6)", "--db-line": "rgba(255,255,255,0.1)", "--db-ok": "#1BC47D" },
    light: { "--db-bg": "#FFFFFF", "--db-surface": "#EEEEEE", "--db-text": "#0A0A0A", "--db-text-2": "rgba(0,0,0,0.62)", "--db-line": "rgba(0,0,0,0.12)", "--db-ok": "#0E7A43" },
} as const

export default function BeforeAfter(props: Props) {
    const {
        beforeImage, beforeCaption = "", beforeAlt = "", beforeMissing = "Earlier version",
        afterImage, afterCaption = "", afterAlt = "", afterMissing = "Revised version",
        owner = "none", ownerNote = "", changed = "", why = "", evidence = "untested",
        layout = "side", screenMax = 360, radius = 14, theme = "auto", accent = "", style,
    } = props
    const root = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(1024)
    useLayoutEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    const stacked = layout === "stack" || width < 640

    const themeVars = theme === "auto" ? {} : THEMES[theme]
    const accentVar = accent ? { "--db-accent": accent } : {}
    const text = "var(--db-text, #FFFFFF)"
    const text2 = "var(--db-text-2, rgba(255,255,255,0.6))"
    const line = "var(--db-line, rgba(255,255,255,0.1))"
    const acc = "var(--db-accent, #F3500F)"
    const ok = "var(--db-ok, #1BC47D)"
    const kicker: React.CSSProperties = { fontSize: 11, fontWeight: 500, letterSpacing: "0.085em", textTransform: "uppercase", color: text2 }

    const side = (label: string, img: Img, caption: string, alt: string, missing: string) => (
        <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: screenMax || undefined, justifySelf: "center" }}>
            <span style={kicker}>{label}</span>
            {img?.src ? (
                <figure style={{ margin: 0, display: "grid", gap: 10 }}>
                    <img src={img.src} srcSet={img.srcSet} alt={alt || img.alt || caption} loading="lazy" style={{ display: "block", width: "100%", height: "auto", borderRadius: radius, boxShadow: `0 0 0 1px ${line}` }} />
                    {(caption || owner !== "none") && (
                        <figcaption style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 14, color: text2 }}>
                            <span>{caption}</span>
                            {owner !== "none" && (
                                <span style={{ display: "inline-flex", alignItems: "center", minHeight: 22, padding: "0 9px", borderRadius: 999, fontSize: 11, fontWeight: 500, border: `1px solid ${owner === "mine" ? acc : line}`, color: owner === "mine" ? acc : text2 }}>
                                    {OWNER_LABEL[owner]}{ownerNote ? ` · ${ownerNote}` : ""}
                                </span>
                            )}
                        </figcaption>
                    )}
                </figure>
            ) : (
                <div style={{ minHeight: 220, display: "grid", placeContent: "center", gap: 8, padding: 20, textAlign: "center", border: `1px dashed ${line}`, borderRadius: radius, background: "var(--db-surface, #111111)" }}>
                    <span style={{ justifySelf: "center", padding: "5px 12px", borderRadius: 999, border: `1px solid ${line}`, fontSize: 12, color: text2 }}>Original designs coming soon</span>
                    <strong style={{ fontSize: 18, fontWeight: 600 }}>{missing}</strong>
                </div>
            )}
        </div>
    )

    const evColor = evidence === "retested" ? ok : text2
    return (
        <div ref={root} data-db-keep style={{ ...style, ...themeVars, ...accentVar, width: "100%", fontFamily: FONT, color: text, display: "grid", gap: 28 } as React.CSSProperties}>
            <div style={{ display: "grid", gridTemplateColumns: stacked ? "1fr" : "minmax(0,1fr) auto minmax(0,1fr)", gap: stacked ? 20 : 28, alignItems: "start" }}>
                {side("Before", beforeImage, beforeCaption, beforeAlt, beforeMissing)}
                <span aria-hidden style={{ alignSelf: "center", justifySelf: "center", color: acc, fontSize: 24, transform: stacked ? "rotate(90deg)" : undefined }}>→</span>
                {side("After", afterImage, afterCaption, afterAlt, afterMissing)}
            </div>
            <dl style={{ display: "grid", gridTemplateColumns: stacked ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 20, margin: 0, paddingTop: 20, borderTop: `1px solid ${line}` }}>
                <div><dt style={{ ...kicker, marginBottom: 6 }}>What changed</dt><dd style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{changed || "—"}</dd></div>
                <div><dt style={{ ...kicker, marginBottom: 6 }}>Why</dt><dd style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{why || "—"}</dd></div>
                <div>
                    <dt style={{ ...kicker, marginBottom: 6 }}>Evidence</dt>
                    <dd style={{ margin: 0 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", minHeight: 26, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 500, border: `1px solid ${evidence === "retested" ? ok : line}`, color: evColor }}>
                            {EVIDENCE_LABEL[evidence]}
                        </span>
                    </dd>
                </div>
            </dl>
        </div>
    )
}

addPropertyControls(BeforeAfter, {
    beforeImage: { type: ControlType.ResponsiveImage, title: "Before" },
    beforeCaption: { type: ControlType.String, title: "Before caption" },
    beforeAlt: { type: ControlType.String, title: "Before alt", displayTextArea: true },
    beforeMissing: { type: ControlType.String, title: "Before (if missing)", defaultValue: "Earlier version", description: "Label for the empty slot while the export is missing." },
    afterImage: { type: ControlType.ResponsiveImage, title: "After" },
    afterCaption: { type: ControlType.String, title: "After caption" },
    afterAlt: { type: ControlType.String, title: "After alt", displayTextArea: true },
    afterMissing: { type: ControlType.String, title: "After (if missing)", defaultValue: "Revised version" },
    owner: { type: ControlType.Enum, title: "Owner", options: ["none", "mine", "team", "shared"], optionTitles: ["Hide", "My work", "Team work", "Shared"], defaultValue: "none" },
    ownerNote: { type: ControlType.String, title: "Owner note", placeholder: "Anne's flow", hidden: (p: Props) => p.owner === "none" },
    changed: { type: ControlType.String, title: "What changed", displayTextArea: true },
    why: { type: ControlType.String, title: "Why", displayTextArea: true },
    evidence: {
        type: ControlType.Enum,
        title: "Evidence",
        options: ["untested", "reviewed", "retested"],
        optionTitles: ["Not yet tested", "Reviewed only", "Retested"],
        defaultValue: "untested",
        description: "Pick Retested only if users tried the revised version.",
    },
    layout: { type: ControlType.Enum, title: "Layout", options: ["side", "stack"], optionTitles: ["Side by side", "Stacked"], defaultValue: "side", displaySegmentedControl: true },
    screenMax: { type: ControlType.Number, title: "Screen max W", defaultValue: 360, min: 0, max: 1200, step: 10, unit: "px", description: "0 = fill the column." },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 14, min: 0, max: 48, unit: "px" },
    theme: { type: ControlType.Enum, title: "Theme", options: ["auto", "dark", "light"], optionTitles: ["Site", "Dark", "Light"], defaultValue: "auto", displaySegmentedControl: true },
    accent: { type: ControlType.Color, title: "Accent", description: "Empty = site vibe accent." },
})
