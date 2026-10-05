// TheSet v3 (ExperienceFormats.tsx). Dhwani (Oct 4): "work on this experience section the set so far …
// its so boring, have some nice microinteractions". Built from the "The set so far · DJ tracklist" mockup.
//  • Same data as v2 (org, role, dates, one line, current), newest first, so her roles carry over.
//  • Left: a deck with a spinning record. The label is the vibe accent; "now playing" shows the role
//    you hover or open (defaults to the current one). Hover speeds the record up, the tonearm drops.
//  • Right: a tracklist. Rows reveal one by one on scroll, slide on hover, show live EQ bars on the
//    active row, and open on click/Enter to show the one-liner (real buttons, aria-expanded).
//  • Theme tokens (--db-*) for light/dark; reduced-motion turns all motion off.
//  • Phone: the deck shrinks to a strip above the list.
//  • Font pairing: *word* in the title is set in Pinyon Script, matching "Thank you for scrolling."
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useEffect, useRef, useState } from "react"

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
const MONO = "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"

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

const pad = (n: number) => String(n).padStart(2, "0")
const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive"

// Font pairing: wrap a word in *stars* in the title to set it in the script face, e.g. "The *set* so far"
function renderTitle(t: string) {
    const parts = String(t || "").split(/(\*[^*]+\*)/g)
    return parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
            <span key={i} className="ts-script">{p.slice(1, -1)}</span>
        ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
        )
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function TheSet(props: Props) {
    const { eyebrow = "experience", title = "The *set* so far", intro = "Newest first.", roles = DEFAULT_ROLES, visibleCount = 6 } = props
    const list = roles && roles.length ? roles : DEFAULT_ROLES
    const [expanded, setExpanded] = useState(false)
    const [open, setOpen] = useState<number | null>(null)
    const [hover, setHover] = useState<number | null>(null)
    const [seen, setSeen] = useState(false)
    const rootRef = useRef<HTMLElement | null>(null)
    const shown = expanded ? list : list.slice(0, visibleCount)
    const hidden = list.length - visibleCount
    const currentIdx = Math.max(0, list.findIndex((r) => r.current))
    const active = hover ?? open ?? currentIdx
    const playing = list[active] || list[0]
    const id = "theset-list"

    // Reveal rows once the section scrolls into view
    useEffect(() => {
        const el = rootRef.current
        if (!el || typeof IntersectionObserver === "undefined") {
            setSeen(true)
            return
        }
        const io = new IntersectionObserver(
            (e) => {
                if (e[0].isIntersecting) {
                    startTransition(() => setSeen(true))
                    io.disconnect()
                }
            },
            { threshold: 0.15 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
        .ts { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; max-width: 1104px; margin: 0 auto; }
        .ts-head { margin-bottom: 36px; }
        .ts-eyebrow { font: 500 12px ${MONO}; letter-spacing: .16em; text-transform: uppercase; color: var(--db-accent, #F3500F); margin: 0 0 12px; display: flex; align-items: center; gap: 10px; }
        .ts-eyebrow i { width: 7px; height: 7px; border-radius: 50%; background: var(--db-accent, #F3500F); box-shadow: 0 0 0 0 var(--db-accent, #F3500F); animation: tsPulse 2s ease-out infinite; }
        .ts-title { font-size: clamp(32px, 4.4vw, 48px); line-height: 1.05; letter-spacing: -.025em; font-weight: 700; margin: 0; }
        .ts-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 1.32em; letter-spacing: 0; line-height: .8; padding: 0 .06em; color: var(--db-text, #fff); }
        .ts-intro { font-size: 16px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 12px 0 0; max-width: 60ch; }

        .ts-grid { display: grid; grid-template-columns: 340px 1fr; gap: 56px; align-items: start; }

        .ts-deck { position: sticky; top: 110px; border-radius: 24px; padding: 26px; background: var(--db-surface, #111); border: 1px solid var(--db-line, rgba(255,255,255,.1)); box-shadow: var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,.9)); }
        .ts-platter { position: relative; width: 100%; aspect-ratio: 1; }
        .ts-rec { position: absolute; inset: 6%; border-radius: 50%; background: repeating-radial-gradient(circle, #121212 0 1.5px, #1c1c1c 1.5px 3px); box-shadow: 0 0 0 8px var(--db-surface-2, #1f1f1f), 0 18px 36px rgba(0,0,0,.55); display: grid; place-items: center; animation: tsSpin 7s linear infinite; }
        .ts-deck.is-hot .ts-rec { animation-duration: 2.2s; }
        .ts-rec::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 20deg, transparent 0 12%, rgba(255,255,255,.07) 16%, transparent 22% 62%, rgba(255,255,255,.05) 66%, transparent 72%); }
        .ts-label { width: 36%; aspect-ratio: 1; border-radius: 50%; background: var(--db-accent, #F3500F); display: grid; place-items: center; box-shadow: inset 0 0 0 5px rgba(0,0,0,.14); transition: background .6s ease; }
        .ts-label b { width: 9%; aspect-ratio: 1; border-radius: 50%; background: #0a0a0a; }
        .ts-arm { position: absolute; right: 2%; top: 4%; width: 6px; height: 58%; border-radius: 3px; background: linear-gradient(#cfc9bf, #8e887f); transform-origin: 50% 4px; transform: rotate(8deg); transition: transform .5s cubic-bezier(.16,1,.3,1); }
        .ts-arm::before { content: ""; position: absolute; top: -8px; left: -8px; width: 22px; height: 22px; border-radius: 50%; background: #3a3632; box-shadow: 0 0 0 5px #262320; }
        .ts-arm::after { content: ""; position: absolute; bottom: -6px; left: -4px; width: 14px; height: 18px; border-radius: 3px; background: #b8b2a8; }
        .ts-deck.is-hot .ts-arm { transform: rotate(24deg); }
        .ts-now { margin-top: 20px; min-height: 92px; }
        .ts-now-k { font: 500 11px ${MONO}; letter-spacing: .16em; color: var(--db-accent, #F3500F); display: flex; align-items: center; gap: 8px; }
        .ts-now-org { font-size: 19px; font-weight: 700; letter-spacing: -.01em; margin: 8px 0 2px; line-height: 1.25; }
        .ts-now-role { font-size: 14px; color: var(--db-text-2, rgba(255,255,255,.6)); line-height: 1.4; }
        .ts-now-fade { animation: tsFade .35s ease; }

        .ts-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .ts-item { border-bottom: 1px solid var(--db-line, rgba(255,255,255,.1)); opacity: 0; transform: translateY(14px); }
        .ts.is-seen .ts-item { animation: tsIn .55s cubic-bezier(.16,1,.3,1) forwards; }
        .ts-btn { all: unset; box-sizing: border-box; width: 100%; cursor: pointer; display: grid; grid-template-columns: 44px 1fr auto; gap: 4px 18px; align-items: center; padding: 18px 12px 18px 8px; position: relative; border-radius: 12px; transition: transform .3s cubic-bezier(.16,1,.3,1), background .25s ease; }
        .ts-btn::before { content: ""; position: absolute; left: 0; top: 18%; bottom: 18%; width: 3px; border-radius: 2px; background: var(--db-accent, #F3500F); transform: scaleY(0); transition: transform .3s cubic-bezier(.16,1,.3,1); }
        .ts-btn:hover, .ts-btn.is-active { background: var(--db-glass-line, rgba(255,255,255,.05)); transform: translateX(6px); }
        .ts-btn:hover::before, .ts-btn.is-active::before { transform: scaleY(1); }
        .ts-btn:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 2px; }
        .ts-no { font: 500 13px ${MONO}; color: var(--db-text-2, rgba(255,255,255,.5)); font-variant-numeric: tabular-nums; display: grid; place-items: center; height: 24px; }
        .ts-eq { display: none; gap: 2px; align-items: flex-end; height: 14px; }
        .ts-eq span { width: 3px; background: var(--db-accent, #F3500F); border-radius: 1px; animation: tsEq .9s ease-in-out infinite; }
        .ts-eq span:nth-child(2) { animation-delay: -.3s; } .ts-eq span:nth-child(3) { animation-delay: -.6s; }
        .ts-btn:hover .ts-eq, .ts-btn.is-active .ts-eq { display: flex; }
        .ts-btn:hover .ts-num, .ts-btn.is-active .ts-num { display: none; }
        .ts-org { font-size: 17px; line-height: 1.3; font-weight: 700; letter-spacing: -.01em; margin: 0; }
        .ts-role { font-size: 14px; line-height: 1.4; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 2px 0 0; }
        .ts-dates { font: 400 13px ${MONO}; color: var(--db-text-2, rgba(255,255,255,.6)); white-space: nowrap; display: flex; align-items: center; gap: 8px; font-variant-numeric: tabular-nums; }
        .ts-live { font: 600 10px ${MONO}; letter-spacing: .12em; padding: 3px 7px; border-radius: 999px; color: #0a0a0a; background: #1BC47D; }
        .ts-sum { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.16,1,.3,1); }
        .ts-sum > div { overflow: hidden; }
        .ts-sum p { margin: 0; padding: 0 12px 20px 70px; font-size: 15px; line-height: 1.55; color: var(--db-text-2, rgba(255,255,255,.65)); max-width: 64ch; }
        .ts-item.is-open .ts-sum { grid-template-rows: 1fr; }

        .ts-more { margin-top: 20px; min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: transparent; color: var(--db-text, #fff); font: 500 14px ${FONT}; cursor: pointer; transition: background .2s, transform .2s; }
        .ts-more:hover { background: var(--db-line, rgba(255,255,255,.1)); transform: translateY(-1px); }
        .ts-more:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }

        @keyframes tsSpin { to { transform: rotate(360deg); } }
        @keyframes tsIn { to { opacity: 1; transform: none; } }
        @keyframes tsFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes tsEq { 0%,100% { height: 4px; } 50% { height: 14px; } }
        @keyframes tsPulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--db-accent, #F3500F) 60%, transparent); } 100% { box-shadow: 0 0 0 8px transparent; } }

        @media (max-width: 860px) {
            .ts-grid { grid-template-columns: 1fr; gap: 24px; }
            .ts-deck { position: relative; top: 0; display: grid; grid-template-columns: 96px 1fr; gap: 18px; align-items: center; padding: 16px; border-radius: 18px; }
            .ts-arm { display: none; }
            .ts-now { margin-top: 0; min-height: 0; }
        }
        @media (max-width: 560px) {
            .ts-btn { grid-template-columns: 34px 1fr; }
            .ts-dates { grid-column: 2; }
            .ts-sum p { padding-left: 52px; }
        }
        @media (prefers-reduced-motion: reduce) {
            .ts *, .ts *::before, .ts *::after { animation: none !important; transition: none !important; }
            .ts-item { opacity: 1; transform: none; }
        }
    `

    return (
        <section ref={rootRef} className={"ts" + (seen ? " is-seen" : "")} aria-labelledby="theset-title" style={props.style}>
            <style>{css}</style>
            <div className="ts-head">
                <p className="ts-eyebrow"><i aria-hidden />{eyebrow}</p>
                <h2 id="theset-title" className="ts-title">{renderTitle(title)}</h2>
                {intro && <p className="ts-intro">{intro}</p>}
            </div>
            <div className="ts-grid">
                <div className={"ts-deck" + (hover !== null || open !== null ? " is-hot" : "")} aria-hidden>
                    <div className="ts-platter">
                        <div className="ts-rec"><div className="ts-label"><b /></div></div>
                        <div className="ts-arm" />
                    </div>
                    <div className="ts-now">
                        <div className="ts-now-k">● NOW PLAYING · {pad(active + 1)}</div>
                        <div key={active} className="ts-now-fade">
                            <div className="ts-now-org">{playing.org}</div>
                            <div className="ts-now-role">{playing.role} · {playing.dates}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <ol id={id} className="ts-list">
                        {shown.map((r, i) => {
                            const isOpen = open === i
                            const panel = `ts-sum-${i}`
                            return (
                                <li key={r.org + r.role + i} className={"ts-item" + (isOpen ? " is-open" : "")} style={{ animationDelay: `${Math.min(i, 10) * 70}ms` }}>
                                    <button
                                        type="button"
                                        className={"ts-btn" + (isOpen ? " is-active" : "")}
                                        aria-expanded={isOpen}
                                        aria-controls={panel}
                                        onMouseEnter={() => startTransition(() => setHover(i))}
                                        onMouseLeave={() => startTransition(() => setHover(null))}
                                        onFocus={() => startTransition(() => setHover(i))}
                                        onBlur={() => startTransition(() => setHover(null))}
                                        onClick={() => startTransition(() => setOpen((o) => (o === i ? null : i)))}
                                    >
                                        <span className="ts-no">
                                            <span className="ts-num">{pad(i + 1)}</span>
                                            <span className="ts-eq" aria-hidden><span /><span /><span /></span>
                                        </span>
                                        <span>
                                            <h3 className="ts-org">{r.org}</h3>
                                            <p className="ts-role">{r.role}</p>
                                        </span>
                                        <span className="ts-dates">
                                            {r.current && <span className="ts-live">LIVE</span>}
                                            <span>{r.dates}</span>
                                            {r.current && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>(current)</span>}
                                        </span>
                                    </button>
                                    {r.summary && (
                                        <div id={panel} className="ts-sum" role="region" aria-label={r.org}>
                                            <div><p>{r.summary}</p></div>
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ol>
                    {hidden > 0 && (
                        <button type="button" className="ts-more" aria-expanded={expanded} aria-controls={id} onClick={() => startTransition(() => setExpanded((e) => !e))}>
                            {expanded ? "Show fewer" : `Show ${hidden} earlier ${hidden === 1 ? "role" : "roles"}`}
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}

addPropertyControls(TheSet, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "experience" },
    title: { type: ControlType.String, title: "Title", defaultValue: "The *set* so far", description: "Wrap a word in *stars* to set it in script." },
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
