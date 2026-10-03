// TheSet v2 (ExperienceFormats.tsx). Dhwani (Oct 2): "fix up … the one with my experiences. You must
// put my most recent experiences first… Fix up the look of it. It looks disgusting right now. Try to
// follow the theme of the rest of the portfolio" + light mode + "super accessible" + "cut it down".
//  • Newest first, always. Current role marked "now".
//  • One clean list: dates · org + role · one line. Shows the 6 most recent; "Show earlier roles"
//    reveals the rest (real button, aria-expanded).
//  • Colors from the site tokens (--db-*), so it matches the cards/nav and flips with light mode.
//  • Real headings (h2/h3), list semantics, 44px button, visible focus, no motion needed.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useState } from "react"

type Role = { org: string; role: string; dates: string; summary?: string; current?: boolean }

interface Props {
    eyebrow: string
    title: string
    intro: string
    roles: Role[]
    visibleCount: number
    style?: React.CSSProperties
}

const FONT = "'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

// Newest first
const DEFAULT_ROLES: Role[] = [
    { org: "Adobe", role: "Student Ambassador", dates: "Jul 2026 – now", summary: "Workshops, content and campus events for creative students.", current: true },
    { org: "U-M Division of Public Safety & Security", role: "UX Design Intern", dates: "May – Aug 2026", summary: "Designed tools for campus dispatch and the Intelligence Group. The Intel workspace is in use." },
    { org: "General Motors", role: "UX Researcher & Designer", dates: "Jan – May 2026", summary: "In-cab HVAC prototyping on real screens, tested in a 3D-printed truck cab." },
    { org: "Iska Press for African Perspectives", role: "UX Researcher & Project Manager", dates: "Jan – May 2026", summary: "Led a research and project-management consulting engagement." },
    { org: "SOCHI, University of Michigan", role: "Project Manager & UX Researcher", dates: "Sep 2025 – May 2026", summary: "Product strategy, research and project management." },
    { org: "U-M Global Scholars Program", role: "Project Manager & Social Media Coordinator", dates: "Aug 2025 – May 2026", summary: "Led project teams and global community programming." },
    { org: "Open Library", role: "UX Researcher", dates: "Aug – Dec 2025", summary: "Multilingual-access research. Open Library changed how it explains international books." },
    { org: "MSU College of Social Science", role: "Research Assistant", dates: "May 2024 – May 2025", summary: "Organized and analyzed eye-tracking data for behavioral research." },
    { org: "Miller Johnson", role: "Human Resources Systems Intern", dates: "Jun – Aug 2024", summary: "Internal systems and operations at a law firm." },
    { org: "DDB Mudra Group", role: "User Experience DEI Intern", dates: "Jun – Aug 2023", summary: "Research on accessible social media and representation in advertising." },
]

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function TheSet(props: Props) {
    const { eyebrow = "experience", title = "The set so far", intro = "Newest first.", roles = DEFAULT_ROLES, visibleCount = 6 } = props
    const list = roles && roles.length ? roles : DEFAULT_ROLES
    const [expanded, setExpanded] = useState(false)
    const shown = expanded ? list : list.slice(0, visibleCount)
    const hidden = list.length - visibleCount
    const id = "theset-list"

    const css = `
        .ts { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; max-width: 1104px; margin: 0 auto; }
        .ts-eyebrow { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0 0 12px; }
        .ts-title { font-size: clamp(30px, 4vw, 40px); line-height: 1.1; letter-spacing: -.02em; font-weight: 700; margin: 0; }
        .ts-intro { font-size: 16px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 12px 0 0; max-width: 60ch; }
        .ts-list { list-style: none; margin: 32px 0 0; padding: 0; border-top: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .ts-row { display: grid; grid-template-columns: 180px 1fr; gap: 8px 32px; padding: 20px 0; border-bottom: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .ts-dates { font-size: 14px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); font-variant-numeric: tabular-nums; padding-top: 2px; display: flex; align-items: center; gap: 8px; }
        .ts-now { display: inline-block; width: 8px; height: 8px; border-radius: 4px; background: #1BC47D; }
        .ts-org { font-size: 18px; line-height: 1.35; font-weight: 700; margin: 0; letter-spacing: -.01em; }
        .ts-role { font-size: 15px; line-height: 1.45; color: var(--db-text, #fff); margin: 2px 0 0; font-weight: 500; }
        .ts-sum { font-size: 15px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 6px 0 0; max-width: 64ch; }
        .ts-more { margin-top: 20px; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: transparent; color: var(--db-text, #fff); font: 500 14px ${FONT}; cursor: pointer; }
        .ts-more:hover { background: var(--db-line, rgba(255,255,255,.1)); }
        .ts-more:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }
        @media (max-width: 640px) { .ts-row { grid-template-columns: 1fr; gap: 4px; } }
    `

    return (
        <section className="ts" aria-labelledby="theset-title" style={props.style}>
            <style>{css}</style>
            <p className="ts-eyebrow">{eyebrow}</p>
            <h2 id="theset-title" className="ts-title">{title}</h2>
            {intro && <p className="ts-intro">{intro}</p>}
            <ol id={id} className="ts-list">
                {shown.map((r, i) => (
                    <li key={r.org + r.role + i} className="ts-row">
                        <div className="ts-dates">
                            {r.current && <span className="ts-now" aria-hidden />}
                            <span>{r.dates}</span>
                            {r.current && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>(current)</span>}
                        </div>
                        <div>
                            <h3 className="ts-org">{r.org}</h3>
                            <p className="ts-role">{r.role}</p>
                            {r.summary && <p className="ts-sum">{r.summary}</p>}
                        </div>
                    </li>
                ))}
            </ol>
            {hidden > 0 && (
                <button type="button" className="ts-more" aria-expanded={expanded} aria-controls={id} onClick={() => startTransition(() => setExpanded((e) => !e))}>
                    {expanded ? "Show fewer" : `Show ${hidden} earlier roles`}
                </button>
            )}
        </section>
    )
}

addPropertyControls(TheSet, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "experience" },
    title: { type: ControlType.String, title: "Title", defaultValue: "The set so far" },
    intro: { type: ControlType.String, title: "Intro", defaultValue: "Newest first.", displayTextArea: true },
    visibleCount: { type: ControlType.Number, title: "Show first", min: 3, max: 12, step: 1, defaultValue: 6 },
    roles: {
        type: ControlType.Array,
        title: "Roles (newest first)",
        control: {
            type: ControlType.Object,
            controls: {
                org: { type: ControlType.String, title: "Org", defaultValue: "Org" },
                role: { type: ControlType.String, title: "Role", defaultValue: "Role" },
                dates: { type: ControlType.String, title: "Dates", defaultValue: "2026" },
                summary: { type: ControlType.String, title: "One line", defaultValue: "", displayTextArea: true },
                current: { type: ControlType.Boolean, title: "Current", defaultValue: false },
            },
        },
        defaultValue: DEFAULT_ROLES,
    },
})
