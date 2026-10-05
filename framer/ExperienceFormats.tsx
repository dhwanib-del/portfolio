// TheSet v4 (ExperienceFormats.tsx). Dhwani (Oct 4): "work on this experience section the set so far …
// its so boring, have some nice microinteractions". Built from the "The set so far · DJ tracklist" mockup.
//  • Same data as v2/v3 (org, role, dates, one line, current), newest first, so her roles carry over.
//  • Left: a deck with a spinning record. The label is the vibe accent (or the role's image when one is
//    set); "now playing" shows the role you hover or open (defaults to the current one). Hover speeds
//    the record up, the tonearm drops.
//  • Right: a tracklist. Rows reveal one by one on scroll, slide on hover, show live EQ bars on the
//    active row, and open on click/Enter to show the one-liner (real buttons, aria-expanded).
//  • v4: a two-deck mixer under the header. Pick a role on Deck A and Deck B, slide the crossfader,
//    and "the blend" shows skills in both plus each side's skills weighted by the fader. Rows get a
//    "→ A / → B" pair on hover/focus to load that role into a deck. Optional image per role.
//  • Theme tokens (--db-*) for light/dark; reduced-motion turns all motion off.
//  • Phone: the deck shrinks to a strip above the list; mixer decks stack, fader goes full width.
//  • Font pairing: *word* in the title is set in Pinyon Script, matching "Thank you for scrolling."
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useEffect, useMemo, useRef, useState } from "react"

type Role = {
    org: string
    role: string
    dates: string
    summary?: string
    current?: boolean
    skills?: string
    image?: any
}

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

// Newest first.
// SKILLS: these are placeholders derived only from each role's title and one-liner.
// Dhwani, edit them per role in the Roles control ("Skills", comma separated) so the blend is accurate.
// If a role on the canvas has no Skills set, the mixer falls back to the matching org below.
const DEFAULT_ROLES: Role[] = [
    { org: "Adobe", role: "Student Ambassador", dates: "Jul 2026 – now", summary: "Workshops, content and campus events for creative students.", current: true, skills: "workshops, community building, content" },
    { org: "U-M Division of Public Safety & Security", role: "UX Design Intern", dates: "May – Aug 2026", summary: "Designed tools for campus dispatch and the Intelligence Group. The Intel workspace is in use.", skills: "contextual inquiry, workflow mapping, prototyping, PRDs, stakeholder interviews" },
    { org: "General Motors", role: "UX Researcher & Designer", dates: "Jan – May 2026", summary: "In-cab HVAC prototyping on real screens, tested in a 3D-printed truck cab.", skills: "in-vehicle UX, usability testing, prototyping, research synthesis" },
    { org: "Iska Press for African Perspectives", role: "UX Researcher & Project Manager", dates: "Jan – May 2026", summary: "Led a research and project-management consulting engagement.", skills: "research, project management, client consulting" },
    { org: "SOCHI, University of Michigan", role: "Project Manager & UX Researcher", dates: "Sep 2025 – May 2026", summary: "Product strategy, research and project management.", skills: "product strategy, research, project management" },
    { org: "U-M Global Scholars Program", role: "Project Manager & Social Media Coordinator", dates: "Aug 2025 – May 2026", summary: "Led project teams and global community programming.", skills: "team leadership, programming, social media" },
    { org: "Open Library", role: "UX Researcher", dates: "Aug – Dec 2025", summary: "Multilingual-access research. Open Library changed how it explains international books.", skills: "interviews, survey design, synthesis, recommendations" },
    { org: "MSU College of Social Science", role: "Research Assistant", dates: "May 2024 – May 2025", summary: "Organized and analyzed eye-tracking data for behavioral research.", skills: "eye-tracking data, behavioral research, analysis" },
    { org: "Miller Johnson", role: "Human Resources Systems Intern", dates: "Jun – Aug 2024", summary: "Internal systems and operations at a law firm.", skills: "HR systems, operations" },
    { org: "DDB Mudra Group", role: "User Experience DEI Intern", dates: "Jun – Aug 2023", summary: "Research on accessible social media and representation in advertising.", skills: "accessibility research, DEI, advertising" },
]

const pad = (n: number) => String(n).padStart(2, "0")
const pad3 = (n: number) => String(Math.round(n)).padStart(3, "0")
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

// ResponsiveImage → src (or "" when empty, so nothing renders)
function imgSrc(img: any): string {
    if (!img) return ""
    if (typeof img === "string") return img
    return typeof img.src === "string" ? img.src : ""
}
function imgAlt(img: any): string {
    return img && typeof img.alt === "string" ? img.alt : ""
}

function parseSkills(s: string): string[] {
    const out: string[] = []
    const seen = new Set<string>()
    String(s || "")
        .split(/[,;\n]/)
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((x) => {
            const k = x.toLowerCase()
            if (!seen.has(k)) {
                seen.add(k)
                out.push(x)
            }
        })
    return out
}

function skillsFor(r: Role | undefined): string[] {
    if (!r) return []
    if (r.skills && r.skills.trim()) return parseSkills(r.skills)
    const org = (r.org || "").trim().toLowerCase()
    const match = DEFAULT_ROLES.find((d) => d.org.toLowerCase() === org)
    return match ? parseSkills(match.skills || "") : []
}

// Spins a record with the Web Animations API so speed changes ease in without a jump.
function useSpin(ref: React.RefObject<HTMLDivElement>, rate: number) {
    const anim = useRef<Animation | null>(null)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof el.animate !== "function") return
        if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        anim.current = el.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 3600, iterations: Infinity })
        return () => {
            anim.current?.cancel()
            anim.current = null
        }
    }, [])
    useEffect(() => {
        const a = anim.current
        if (!a) return
        const r = Math.max(0.05, rate)
        if (typeof a.updatePlaybackRate === "function") a.updatePlaybackRate(r)
        else a.playbackRate = r
    }, [rate])
}

function MiniRecord({ image, rate }: { image: any; rate: number }) {
    const ref = useRef<HTMLDivElement>(null)
    useSpin(ref, rate)
    const src = imgSrc(image)
    return (
        <div className="ts-mini" ref={ref} aria-hidden>
            <div className="ts-mini-l">
                {src && <img src={src} alt="" />}
                <b />
            </div>
        </div>
    )
}

function MixDeck(props: {
    side: "A" | "B"
    list: Role[]
    value: number
    weight: number
    flash: number
    onChange: (i: number) => void
}) {
    const { side, list, value, weight, flash, onChange } = props
    const r = list[value] || list[0]
    const sid = `ts-deck-${side.toLowerCase()}`
    return (
        <div className={"ts-dk" + (side === "B" ? " is-b" : "")} style={{ ["--w" as any]: weight.toFixed(2) }}>
            <span key={flash} className={flash ? "ts-dk-flash" : ""} aria-hidden />
            <MiniRecord image={r.image} rate={0.15 + weight * 1.6} />
            <div className="ts-dk-body">
                <div className="ts-dk-k">
                    <label htmlFor={sid}>DECK {side}</label>
                    <span className="ts-dk-lvl" aria-hidden>LVL {pad3(weight * 100)}</span>
                </div>
                <select id={sid} className="ts-sel" value={value} onChange={(e) => onChange(Number(e.target.value))}>
                    {list.map((x, i) => (
                        <option key={x.org + x.role + i} value={i}>
                            {x.org} · {x.role}
                        </option>
                    ))}
                </select>
                <div className="ts-dk-role">{r.role}</div>
            </div>
        </div>
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
    const playingSrc = imgSrc(playing.image)
    const id = "theset-list"

    // Mixer state: A = current role, B = the second role (or the first, if A is the second)
    const defaultB = list.length > 1 ? (currentIdx === 1 ? 0 : 1) : 0
    const [deckA, setDeckA] = useState(currentIdx)
    const [deckB, setDeckB] = useState(defaultB)
    const [fader, setFader] = useState(50)
    const [flash, setFlash] = useState({ A: 0, B: 0 })
    const a = Math.min(deckA, list.length - 1)
    const b = Math.min(deckB, list.length - 1)
    const wB = fader / 100
    const wA = 1 - wB
    const roleA = list[a]
    const roleB = list[b]

    const blend = useMemo(() => {
        const sa = skillsFor(roleA)
        const sb = skillsFor(roleB)
        const lb = new Set(sb.map((s) => s.toLowerCase()))
        const la = new Set(sa.map((s) => s.toLowerCase()))
        const both = sa.filter((s) => lb.has(s.toLowerCase()))
        const rest = [
            ...sa.filter((s) => !lb.has(s.toLowerCase())).map((s, i) => ({ s, side: "A" as const, w: wA, score: wA * (1 - i * 0.04) })),
            ...sb.filter((s) => !la.has(s.toLowerCase())).map((s, i) => ({ s, side: "B" as const, w: wB, score: wB * (1 - i * 0.04) })),
        ].sort((x, y) => y.score - x.score)
        const top = [...both, ...rest.filter((x) => x.w > 0.08).map((x) => x.s)].slice(0, 3)
        return { both, rest, top, empty: !sa.length && !sb.length }
    }, [roleA, roleB, wA, wB])

    const loadInto = (side: "A" | "B", i: number) =>
        startTransition(() => {
            if (side === "A") setDeckA(i)
            else setDeckB(i)
            setFlash((f) => ({ ...f, [side]: f[side] + 1 }))
        })

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

    const VU_BARS = 7
    const litA = Math.round(wA * VU_BARS)
    const litB = Math.round(wB * VU_BARS)

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
        .ts { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; max-width: 1104px; margin: 0 auto; }
        .ts-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
        .ts-head { margin-bottom: 36px; }
        .ts-eyebrow { font: 500 12px ${MONO}; letter-spacing: .16em; text-transform: uppercase; color: var(--db-accent, #F3500F); margin: 0 0 12px; display: flex; align-items: center; gap: 10px; }
        .ts-eyebrow i { width: 7px; height: 7px; border-radius: 50%; background: var(--db-accent, #F3500F); box-shadow: 0 0 0 0 var(--db-accent, #F3500F); animation: tsPulse 2s ease-out infinite; }
        .ts-title { font-size: clamp(32px, 4.4vw, 48px); line-height: 1.05; letter-spacing: -.025em; font-weight: 700; margin: 0; }
        .ts-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 1.32em; letter-spacing: 0; line-height: .8; padding: 0 .06em; color: var(--db-text, #fff); }
        .ts-intro { font-size: 16px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 12px 0 0; max-width: 60ch; }

        /* ---------- mixer ---------- */
        .ts-mixer { margin: 0 0 48px; border-radius: 24px; padding: 22px; background: var(--db-surface, #111); border: 1px solid var(--db-line, rgba(255,255,255,.1)); box-shadow: var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,.9)); }
        .ts-mix-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; margin-bottom: 18px; }
        .ts-mix-k { font: 500 11px ${MONO}; letter-spacing: .16em; text-transform: uppercase; color: var(--db-accent, #F3500F); margin: 0; }
        .ts-mix-help { font-size: 14px; line-height: 1.45; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; }
        .ts-mix-row { display: grid; grid-template-columns: 1fr minmax(220px, 300px) 1fr; gap: 18px; align-items: center; }

        .ts-dk { position: relative; display: grid; grid-template-columns: 64px minmax(0,1fr); gap: 14px; align-items: center; padding: 14px; border-radius: 18px; background: var(--db-surface-2, #1a1a1a); border: 1px solid var(--db-line, rgba(255,255,255,.1)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--db-accent, #F3500F) calc(var(--w, .5) * 45%), transparent), 0 0 32px -10px color-mix(in srgb, var(--db-accent, #F3500F) calc(var(--w, .5) * 70%), transparent); transition: box-shadow .3s ease; }
        .ts-dk.is-b { grid-template-columns: minmax(0,1fr) 64px; }
        .ts-dk.is-b .ts-mini { order: 2; }
        .ts-dk.is-b .ts-dk-body { text-align: right; }
        .ts-dk.is-b .ts-dk-k { flex-direction: row-reverse; }
        .ts-dk-flash { position: absolute; inset: -1px; border-radius: inherit; pointer-events: none; border: 2px solid var(--db-accent, #F3500F); opacity: 0; animation: tsFlash .7s ease-out; }
        .ts-mini { width: 64px; aspect-ratio: 1; border-radius: 50%; background: repeating-radial-gradient(circle, #121212 0 1.5px, #1c1c1c 1.5px 3px); display: grid; place-items: center; box-shadow: 0 0 0 3px var(--db-surface, #111), 0 6px 14px rgba(0,0,0,.4); }
        .ts-mini-l { position: relative; width: 44%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; background: var(--db-accent, #F3500F); display: grid; place-items: center; }
        .ts-mini-l img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .ts-mini-l b { position: relative; z-index: 1; width: 18%; aspect-ratio: 1; border-radius: 50%; background: #0a0a0a; }
        .ts-dk-body { min-width: 0; }
        .ts-dk-k { display: flex; justify-content: space-between; align-items: center; gap: 8px; font: 500 11px ${MONO}; letter-spacing: .14em; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .ts-dk-lvl { color: var(--db-accent, #F3500F); font-variant-numeric: tabular-nums; }
        .ts-sel { -webkit-appearance: none; appearance: none; box-sizing: border-box; width: 100%; min-height: 44px; margin-top: 6px; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--db-line, rgba(255,255,255,.12)); background-color: var(--db-surface, #111); color: var(--db-text, #fff); font: 600 14px ${FONT}; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; cursor: pointer;
            background-image: linear-gradient(45deg, transparent 50%, var(--db-text-2, rgba(255,255,255,.6)) 50%), linear-gradient(135deg, var(--db-text-2, rgba(255,255,255,.6)) 50%, transparent 50%);
            background-position: calc(100% - 19px) 52%, calc(100% - 14px) 52%; background-size: 5px 5px; background-repeat: no-repeat; transition: border-color .2s; }
        .ts-sel:hover { border-color: color-mix(in srgb, var(--db-accent, #F3500F) 55%, transparent); }
        .ts-sel:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 2px; }
        .ts-dk-role { font-size: 12px; line-height: 1.4; color: var(--db-text-2, rgba(255,255,255,.6)); margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .ts-fx { display: grid; gap: 8px; }
        .ts-vu { display: flex; justify-content: center; align-items: flex-end; gap: 14px; height: 22px; }
        .ts-vu-side { display: flex; align-items: flex-end; gap: 3px; }
        .ts-vu-side.is-a { flex-direction: row-reverse; }
        .ts-vu-side span { width: 4px; border-radius: 1px; background: var(--db-line, rgba(255,255,255,.12)); transition: background .2s ease, box-shadow .2s ease; transform-origin: bottom; }
        .ts-vu-side span.on { background: var(--db-accent, #F3500F); box-shadow: 0 0 8px -1px color-mix(in srgb, var(--db-accent, #F3500F) 70%, transparent); animation: tsVu 1.1s ease-in-out infinite; }
        .ts-vu-side span.on:nth-child(2n) { animation-delay: -.35s; } .ts-vu-side span.on:nth-child(3n) { animation-delay: -.7s; }
        .ts-vu-mid { font: 500 10px ${MONO}; letter-spacing: .14em; color: var(--db-text-2, rgba(255,255,255,.5)); align-self: center; }
        .ts-fader { position: relative; height: 44px; display: flex; align-items: center; }
        .ts-ticks { position: absolute; left: 11px; right: 11px; top: calc(50% + 9px); height: 6px; pointer-events: none; background: repeating-linear-gradient(90deg, var(--db-line, rgba(255,255,255,.18)) 0 1px, transparent 1px 10%); }
        .ts-ticks::after { content: ""; position: absolute; left: 50%; top: -3px; width: 1px; height: 9px; background: var(--db-text-2, rgba(255,255,255,.5)); }
        .ts-range { -webkit-appearance: none; appearance: none; position: relative; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; outline: none; }
        .ts-range::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: var(--db-surface-2, #1a1a1a); box-shadow: inset 0 0 0 1px var(--db-line, rgba(255,255,255,.12)), inset 0 1px 2px rgba(0,0,0,.4); }
        .ts-range::-moz-range-track { height: 6px; border-radius: 3px; background: var(--db-surface-2, #1a1a1a); box-shadow: inset 0 0 0 1px var(--db-line, rgba(255,255,255,.12)); }
        .ts-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 38px; margin-top: -16px; border-radius: 5px; border: none; background: linear-gradient(90deg, transparent 10px, var(--db-accent, #F3500F) 10px 12px, transparent 12px), linear-gradient(#f1ece4, #a7a197); box-shadow: 0 3px 8px rgba(0,0,0,.45), inset 0 -2px 0 rgba(0,0,0,.18); transition: box-shadow .2s; }
        .ts-range::-moz-range-thumb { width: 22px; height: 38px; border-radius: 5px; border: none; background: linear-gradient(90deg, transparent 10px, var(--db-accent, #F3500F) 10px 12px, transparent 12px), linear-gradient(#f1ece4, #a7a197); box-shadow: 0 3px 8px rgba(0,0,0,.45); }
        .ts-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--db-surface, #111), 0 0 0 4px var(--db-accent, #F3500F); }
        .ts-range:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 2px var(--db-surface, #111), 0 0 0 4px var(--db-accent, #F3500F); }
        .ts-fx-scale { display: flex; justify-content: space-between; font: 500 11px ${MONO}; letter-spacing: .12em; color: var(--db-text-2, rgba(255,255,255,.6)); font-variant-numeric: tabular-nums; }
        .ts-fx-scale b { font-weight: 600; color: var(--db-text, #fff); }

        .ts-blend { margin-top: 18px; padding: 18px 18px 20px; border-radius: 18px; background: var(--db-surface-2, #1a1a1a); border: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .ts-blend-h { display: flex; align-items: baseline; gap: 6px 16px; flex-wrap: wrap; }
        .ts-blend-t { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -.01em; }
        .ts-blend-t .ts-script { font-size: 1.5em; }
        .ts-blend-s { margin: 0; font: 400 13px ${MONO}; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.7)); }
        .ts-blend-s b { color: var(--db-text, #fff); font-weight: 600; }
        .ts-blend-s em { font-style: normal; color: var(--db-accent, #F3500F); }
        .ts-gl { font: 500 11px ${MONO}; letter-spacing: .14em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.55)); margin: 16px 0 8px; }
        .ts-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
        .ts-chip { display: inline-flex; align-items: center; gap: 7px; min-height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.14)); font-size: 13px; font-weight: 500; color: var(--db-text, #fff); transition: opacity .25s ease, transform .25s cubic-bezier(.16,1,.3,1); }
        .ts-chip small { font: 600 10px ${MONO}; letter-spacing: .1em; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .ts-chip.is-both { background: var(--db-accent, #F3500F); color: var(--db-on-accent, #fff); border-color: transparent; font-weight: 600; }
        .ts-chip.is-both small { color: inherit; opacity: .8; }
        .ts-chip.is-lead { border-color: color-mix(in srgb, var(--db-accent, #F3500F) 60%, transparent); }
        .ts-none { font-size: 14px; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; }

        /* ---------- deck + tracklist ---------- */
        .ts-grid { display: grid; grid-template-columns: 340px 1fr; gap: 56px; align-items: start; }

        .ts-deck { position: sticky; top: 110px; border-radius: 24px; padding: 26px; background: var(--db-surface, #111); border: 1px solid var(--db-line, rgba(255,255,255,.1)); box-shadow: var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,.9)); }
        .ts-platter { position: relative; width: 100%; aspect-ratio: 1; }
        .ts-rec { position: absolute; inset: 6%; border-radius: 50%; background: repeating-radial-gradient(circle, #121212 0 1.5px, #1c1c1c 1.5px 3px); box-shadow: 0 0 0 8px var(--db-surface-2, #1f1f1f), 0 18px 36px rgba(0,0,0,.55); display: grid; place-items: center; animation: tsSpin 7s linear infinite; }
        .ts-deck.is-hot .ts-rec { animation-duration: 2.2s; }
        .ts-rec::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 20deg, transparent 0 12%, rgba(255,255,255,.07) 16%, transparent 22% 62%, rgba(255,255,255,.05) 66%, transparent 72%); pointer-events: none; }
        .ts-label { position: relative; width: 36%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; background: var(--db-accent, #F3500F); display: grid; place-items: center; box-shadow: inset 0 0 0 5px rgba(0,0,0,.14); transition: background .6s ease; }
        .ts-label img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: tsFade .4s ease; }
        .ts-label::after { content: ""; position: absolute; inset: 0; border-radius: 50%; box-shadow: inset 0 0 0 5px rgba(0,0,0,.18); pointer-events: none; }
        .ts-label b { position: relative; z-index: 1; width: 9%; aspect-ratio: 1; border-radius: 50%; background: #0a0a0a; }
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
        .ts-item { display: grid; grid-template-columns: minmax(0,1fr) auto; border-bottom: 1px solid var(--db-line, rgba(255,255,255,.1)); opacity: 0; transform: translateY(14px); }
        .ts.is-seen .ts-item { animation: tsIn .55s cubic-bezier(.16,1,.3,1) forwards; }
        .ts-btn { all: unset; grid-column: 1; grid-row: 1; box-sizing: border-box; width: 100%; cursor: pointer; display: grid; grid-template-columns: 44px 1fr auto; gap: 4px 18px; align-items: center; padding: 18px 12px 18px 8px; position: relative; border-radius: 12px; transition: transform .3s cubic-bezier(.16,1,.3,1), background .25s ease; }
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
        .ts-who { display: flex; align-items: center; min-width: 0; }
        .ts-thumb { flex: none; width: 0; height: 40px; margin-right: 0; border-radius: 10px; object-fit: cover; opacity: 0; transition: width .3s cubic-bezier(.16,1,.3,1), margin .3s cubic-bezier(.16,1,.3,1), opacity .25s ease; }
        .ts-btn:hover .ts-thumb, .ts-btn.is-active .ts-thumb { width: 40px; margin-right: 12px; opacity: 1; }
        .ts-org { font-size: 17px; line-height: 1.3; font-weight: 700; letter-spacing: -.01em; margin: 0; }
        .ts-role { font-size: 14px; line-height: 1.4; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 2px 0 0; }
        .ts-dates { font: 400 13px ${MONO}; color: var(--db-text-2, rgba(255,255,255,.6)); white-space: nowrap; display: flex; align-items: center; gap: 8px; font-variant-numeric: tabular-nums; }
        .ts-live { font: 600 10px ${MONO}; letter-spacing: .12em; padding: 3px 7px; border-radius: 999px; color: #0a0a0a; background: #1BC47D; }
        .ts-mixbtns { grid-column: 2; grid-row: 1; align-self: center; display: flex; gap: 2px; padding-left: 4px; opacity: 0; transition: opacity .2s ease; }
        .ts-item:hover .ts-mixbtns, .ts-item:focus-within .ts-mixbtns, .ts-item.is-open .ts-mixbtns { opacity: 1; }
        .ts-mb { all: unset; box-sizing: border-box; min-width: 44px; min-height: 44px; display: grid; place-items: center; cursor: pointer; border-radius: 10px; }
        .ts-mb span { font: 600 11px ${MONO}; letter-spacing: .06em; padding: 4px 8px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.14)); color: var(--db-text-2, rgba(255,255,255,.7)); transition: border-color .2s, color .2s, background .2s; white-space: nowrap; }
        .ts-mb:hover span { border-color: var(--db-accent, #F3500F); color: var(--db-accent, #F3500F); }
        .ts-mb:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: -2px; }
        .ts-sum { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.16,1,.3,1); }
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
        @keyframes tsVu { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.72); } }
        @keyframes tsFlash { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes tsPulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--db-accent, #F3500F) 60%, transparent); } 100% { box-shadow: 0 0 0 8px transparent; } }

        @media (hover: none) { .ts-mixbtns { opacity: 1; } }
        @media (max-width: 860px) {
            .ts-grid { grid-template-columns: 1fr; gap: 24px; }
            .ts-deck { position: relative; top: 0; display: grid; grid-template-columns: 96px 1fr; gap: 18px; align-items: center; padding: 16px; border-radius: 18px; }
            .ts-arm { display: none; }
            .ts-now { margin-top: 0; min-height: 0; }
            .ts-mix-row { grid-template-columns: 1fr 1fr; }
            .ts-fx { grid-column: 1 / -1; grid-row: 2; }
        }
        @media (max-width: 640px) {
            .ts-mixer { padding: 16px; border-radius: 18px; }
            .ts-mix-row { grid-template-columns: 1fr; gap: 12px; }
            .ts-fx { grid-row: auto; }
            .ts-dk.is-b { grid-template-columns: 64px minmax(0,1fr); }
            .ts-dk.is-b .ts-mini { order: 0; }
            .ts-dk.is-b .ts-dk-body { text-align: left; }
            .ts-dk.is-b .ts-dk-k { flex-direction: row; }
        }
        @media (max-width: 560px) {
            .ts-btn { grid-template-columns: 34px 1fr; }
            .ts-dates { grid-column: 2; }
            .ts-sum p { padding-left: 52px; }
            .ts-mixbtns { grid-column: 1 / -1; grid-row: 3; padding: 0 0 12px 44px; display: none; opacity: 1; }
            .ts-item.is-open .ts-mixbtns { display: flex; }
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

            <div className="ts-mixer" role="group" aria-labelledby="ts-mix-k">
                <div className="ts-mix-top">
                    <p id="ts-mix-k" className="ts-mix-k">mixer · two decks</p>
                    <p className="ts-mix-help">Mix two roles together to see a blend of skills.</p>
                </div>
                <div className="ts-mix-row">
                    <MixDeck side="A" list={list} value={a} weight={wA} flash={flash.A} onChange={(i) => startTransition(() => setDeckA(i))} />
                    <div className="ts-fx">
                        <div className="ts-vu" aria-hidden>
                            <div className="ts-vu-side is-a">
                                {Array.from({ length: VU_BARS }).map((_, i) => (
                                    <span key={i} className={i < litA ? "on" : ""} style={{ height: 6 + i * 2.4 }} />
                                ))}
                            </div>
                            <span className="ts-vu-mid">VU</span>
                            <div className="ts-vu-side">
                                {Array.from({ length: VU_BARS }).map((_, i) => (
                                    <span key={i} className={i < litB ? "on" : ""} style={{ height: 6 + i * 2.4 }} />
                                ))}
                            </div>
                        </div>
                        <div className="ts-fader">
                            <div className="ts-ticks" aria-hidden />
                            <input
                                type="range"
                                className="ts-range"
                                min={0}
                                max={100}
                                step={1}
                                value={fader}
                                aria-label="crossfade between deck A and deck B"
                                aria-valuetext={`${pad3(wA * 100)} percent deck A, ${pad3(wB * 100)} percent deck B`}
                                onChange={(e) => setFader(Number(e.target.value))}
                            />
                        </div>
                        <div className="ts-fx-scale" aria-hidden>
                            <span>A <b>{pad3(wA * 100)}</b></span>
                            <span><b>{pad3(wB * 100)}</b> B</span>
                        </div>
                    </div>
                    <MixDeck side="B" list={list} value={b} weight={wB} flash={flash.B} onChange={(i) => startTransition(() => setDeckB(i))} />
                </div>

                <div className="ts-blend">
                    <div className="ts-blend-h">
                        <h3 className="ts-blend-t">the <span className="ts-script">blend</span></h3>
                        <p className="ts-blend-s" aria-live="polite">
                            {blend.empty || !blend.top.length ? (
                                "Add skills to each role to hear the blend."
                            ) : (
                                <>
                                    <b>{roleA.org}</b> × <b>{roleB.org}</b> → <em>{blend.top.join(", ")}</em>
                                </>
                            )}
                        </p>
                    </div>
                    {!blend.empty && (
                        <>
                            <p className="ts-gl">in both</p>
                            {blend.both.length ? (
                                <ul className="ts-chips">
                                    {blend.both.map((s) => (
                                        <li key={s} className="ts-chip is-both">{s}<small>BOTH</small></li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="ts-none">No overlap. The fader decides who leads.</p>
                            )}
                            {blend.rest.length > 0 && (
                                <>
                                    <p className="ts-gl">the mix</p>
                                    <ul className="ts-chips">
                                        {blend.rest.map((x) => (
                                            <li
                                                key={x.side + x.s}
                                                className={"ts-chip" + (x.w > 0.6 ? " is-lead" : "")}
                                                style={{ opacity: 0.28 + 0.72 * x.w, transform: `scale(${(0.9 + 0.1 * x.w).toFixed(3)})` }}
                                            >
                                                {x.s}
                                                <small>{x.side}<span className="ts-sr"> only</span></small>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="ts-grid">
                <div className={"ts-deck" + (hover !== null || open !== null ? " is-hot" : "")} aria-hidden>
                    <div className="ts-platter">
                        <div className="ts-rec">
                            <div className="ts-label">
                                {playingSrc && <img key={playingSrc} src={playingSrc} alt="" />}
                                <b />
                            </div>
                        </div>
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
                            const thumb = imgSrc(r.image)
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
                                        <span className="ts-who">
                                            {thumb && <img className="ts-thumb" src={thumb} alt={imgAlt(r.image)} />}
                                            <span>
                                                <h3 className="ts-org">{r.org}</h3>
                                                <p className="ts-role">{r.role}</p>
                                            </span>
                                        </span>
                                        <span className="ts-dates">
                                            {r.current && <span className="ts-live">LIVE</span>}
                                            <span>{r.dates}</span>
                                            {r.current && <span className="ts-sr">(current)</span>}
                                        </span>
                                    </button>
                                    <div className="ts-mixbtns">
                                        <button type="button" className="ts-mb" aria-label={`Mix: load ${r.org} into deck A`} onClick={() => loadInto("A", i)}>
                                            <span>→ A</span>
                                        </button>
                                        <button type="button" className="ts-mb" aria-label={`Mix: load ${r.org} into deck B`} onClick={() => loadInto("B", i)}>
                                            <span>→ B</span>
                                        </button>
                                    </div>
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
                skills: { type: ControlType.String, title: "Skills", defaultValue: "", placeholder: "research, prototyping, …", description: "Comma separated. Feeds the mixer blend." },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
            },
        },
        defaultValue: DEFAULT_ROLES,
    },
})
