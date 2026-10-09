// ExperienceFormats.tsx
// TheSet v8
//
// Structure:
// 1. Clean recruiter-readable experience list
// 2. Expand a role for its story + optional "mix this role" actions
// 3. CTA to selected work
// 4. Layered "mix my / experience" editorial title
// 5. Friendly career mixer with full-card selectors
// 6. Vinyl / DJ moment at the bottom
// v8.1: CDJ-style decks (jog wheel outside, deck label + LVL + selector inside, waveform strip),
//       readable selectors (org up to 2 lines + role + chevron), crossfading mix chips,
//       a "drop" pulse on shared chips when the fader crosses centre, and a shuffle button.
//
// Theme-aware with --db-* tokens.
// Responsive, keyboard accessible, reduced-motion friendly.

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
    ctaText: string
    ctaHref: string
    style?: React.CSSProperties
}

const FONT = "'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const MONO = "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"

const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive"

/* ======================================================
   DEFAULT EXPERIENCE DATA
====================================================== */

const DEFAULT_ROLES: Role[] = [
    {
        org: "U-M School of Information",
        role: "Graduate Student Instructor",
        dates: "Aug 2026 – now",
        summary:
            "Teaching, mentoring and helping students turn complicated ideas into work they can actually use.",
        current: true,
        skills: "teaching, facilitation, mentoring, communication, attention to detail",
    },
    {
        org: "Amazon × UMSI Capstone",
        role: "UX Research & Design",
        dates: "Aug 2026 – now",
        summary:
            "Working with Amazon through my graduate capstone across research, synthesis and product design.",
        current: true,
        skills: "UX research, product design, synthesis, product strategy, stakeholder communication",
    },
    {
        org: "Partiful",
        role: "Student Ambassador · University of Michigan",
        dates: "Aug 2026 – now",
        summary:
            "Building campus energy around a product I already loved using through events, community and culture.",
        current: true,
        skills: "community building, campus outreach, events, storytelling, partnerships",
    },
    {
        org: "Adobe",
        role: "Student Ambassador",
        dates: "Jul 2026 – now",
        summary:
            "Creative programming, workshops, content and campus events for students.",
        current: true,
        skills: "workshops, facilitation, community building, content, communication",
    },
    {
        org: "U-M Division of Public Safety & Security",
        role: "UX Design Intern",
        dates: "May – Aug 2026",
        summary:
            "Designed and shipped product experiences across public-safety teams, including tools for dispatch and intelligence workflows.",
        skills: "contextual inquiry, workflow mapping, prototyping, PRDs, stakeholder interviews",
    },
    {
        org: "General Motors",
        role: "UX Researcher & Designer",
        dates: "Jan – May 2026",
        summary:
            "Designed and tested in-cab HVAC interactions on real screens inside a 3D-printed truck cab.",
        skills: "in-vehicle UX, usability testing, prototyping, research synthesis",
    },
    {
        org: "Iska Press for African Perspectives",
        role: "UX Researcher & Project Manager",
        dates: "Jan – May 2026",
        summary:
            "Led research and project management for a client consulting engagement.",
        skills: "research, project management, client consulting, communication",
    },
    {
        org: "SOCHI, University of Michigan",
        role: "Project Manager & UX Researcher",
        dates: "Sep 2025 – May 2026",
        summary:
            "Worked across product strategy, research, synthesis and project management.",
        skills: "product strategy, research, project management, synthesis",
    },
    {
        org: "U-M Global Scholars Program",
        role: "Project Manager & Social Media Coordinator",
        dates: "Aug 2025 – May 2026",
        summary:
            "Led project teams and supported programming for a global student community.",
        skills: "team leadership, programming, social media, community building",
    },
    {
        org: "Open Library",
        role: "UX Researcher",
        dates: "Aug – Dec 2025",
        summary:
            "Researched multilingual access and international-user needs; Open Library incorporated our team's recommendations.",
        skills: "interviews, survey design, synthesis, recommendations, accessibility research",
    },
    {
        org: "MSU College of Social Science",
        role: "Research Assistant",
        dates: "May 2024 – May 2025",
        summary:
            "Organized and analyzed eye-tracking data for behavioral research.",
        skills: "eye-tracking data, behavioral research, analysis, attention to detail",
    },
    {
        org: "Miller Johnson",
        role: "Human Resources Systems Intern",
        dates: "Jun – Aug 2024",
        summary:
            "Worked on internal systems, operational processes and employee workflows at a law firm.",
        skills: "HR systems, operations, process improvement",
    },
    {
        org: "DDB Mudra Group",
        role: "User Experience DEI Intern",
        dates: "Jun – Aug 2023",
        summary:
            "Researched accessible social media and representation in advertising.",
        skills: "accessibility research, DEI, advertising, research",
    },
]

/* ======================================================
   HELPERS
====================================================== */

const pad = (n: number) => String(n).padStart(2, "0")

const pad3 = (n: number) => String(Math.round(n)).padStart(3, "0")

// Stable 0..1 pseudo-random from a string, so each role gets its own waveform shape
function seeded(text: string, i: number) {
    let h = 2166136261
    for (let k = 0; k < text.length; k++) h = Math.imul(h ^ text.charCodeAt(k), 16777619)
    const x = Math.sin((h % 9973) + i * 12.9898) * 43758.5453
    return x - Math.floor(x)
}

function renderTitle(text: string) {
    const pieces = String(text || "").split(/(\*[^*]+\*)/g)

    return pieces.map((piece, index) =>
        piece.startsWith("*") && piece.endsWith("*") && piece.length > 2 ? (
            <span key={index} className="ts-script">
                {piece.slice(1, -1)}
            </span>
        ) : (
            <React.Fragment key={index}>{piece}</React.Fragment>
        )
    )
}

function imgSrc(image: any): string {
    if (!image) return ""
    if (typeof image === "string") return image
    return typeof image.src === "string" ? image.src : ""
}

function imgAlt(image: any): string {
    return image && typeof image.alt === "string" ? image.alt : ""
}

function parseSkills(value: string) {
    const result: string[] = []
    const seen = new Set<string>()

    String(value || "")
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => {
            const key = item.toLowerCase()

            if (!seen.has(key)) {
                seen.add(key)
                result.push(item)
            }
        })

    return result
}

function skillsFor(role: Role | undefined): string[] {
    if (!role) return []

    if (role.skills && role.skills.trim()) {
        return parseSkills(role.skills)
    }

    const normalized = role.org.trim().toLowerCase()

    const fallback = DEFAULT_ROLES.find(
        (item) => item.org.trim().toLowerCase() === normalized
    )

    return fallback ? parseSkills(fallback.skills || "") : []
}

function shortOrg(role: Role | undefined) {
    if (!role) return ""

    const text = role.org

    if (text.includes("Public Safety")) return "DPSS"
    if (text.includes("School of Information")) return "UMSI"
    if (text.includes("General Motors")) return "GM"
    if (text.includes("Amazon")) return "Amazon"
    if (text.includes("Global Scholars")) return "GSP"
    if (text.includes("College of Social Science")) return "MSU"

    const first = text.split(",")[0]

    return first.length > 20 ? first.slice(0, 19) + "…" : first
}

function describeMix(
    roleA: Role | undefined,
    roleB: Role | undefined,
    value: number
) {
    if (!roleA || !roleB) return ""

    const a = shortOrg(roleA)
    const b = shortOrg(roleB)

    if (value <= 5) return `${a} is doing all the talking`
    if (value < 28) return `mostly ${a}, with a little ${b}`
    if (value < 43) return `${a} is leading this mix`
    if (value <= 57) return `${a} + ${b}, right down the middle`
    if (value <= 72) return `${b} is leading this mix`
    if (value < 95) return `mostly ${b}, with a little ${a}`

    return `${b} is doing all the talking`
}

/* ======================================================
   RECORD SPIN
====================================================== */

function useSpin(ref: React.RefObject<HTMLDivElement>, rate: number) {
    const animation = useRef<Animation | null>(null)

    useEffect(() => {
        const element = ref.current

        if (!element || typeof element.animate !== "function") {
            return
        }

        if (
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ) {
            return
        }

        animation.current = element.animate(
            [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
            {
                duration: 3800,
                iterations: Infinity,
            }
        )

        return () => {
            animation.current?.cancel()
            animation.current = null
        }
    }, [])

    useEffect(() => {
        const item = animation.current
        if (!item) return

        const next = Math.max(0.08, rate)

        if (typeof item.updatePlaybackRate === "function") {
            item.updatePlaybackRate(next)
        } else {
            item.playbackRate = next
        }
    }, [rate])
}

/* ======================================================
   JOG WHEEL (mini vinyl)
====================================================== */

function MiniVinyl({ image, weight }: { image: any; weight: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const src = imgSrc(image)

    useSpin(ref, 0.2 + weight * 1.4)

    return (
        <div className="ts-vinyl-wrap" aria-hidden>
            <div ref={ref} className="ts-vinyl">
                <div className="ts-vinyl-label">
                    {src && <img src={src} alt="" />}
                    <span className="ts-vinyl-hole" />
                </div>
            </div>
        </div>
    )
}

/* ======================================================
   WAVEFORM STRIP (follows the deck's level)
====================================================== */

const WAVE_BARS = 32

function Waveform({ seed, weight }: { seed: string; weight: number }) {
    return (
        <div
            className="ts-wf"
            aria-hidden
            style={{ ["--wdur" as any]: `${(1.5 - weight * 0.9).toFixed(2)}s` }}
        >
            {Array.from({ length: WAVE_BARS }).map((_, i) => {
                const base = 0.25 + seeded(seed, i) * 0.75
                const h = 3 + base * 21 * (0.25 + weight * 0.75)

                return (
                    <i
                        key={i}
                        style={{
                            height: `${h.toFixed(1)}px`,
                            animationDelay: `${(-seeded(seed, i + 99) * 1.2).toFixed(2)}s`,
                        }}
                    />
                )
            })}
        </div>
    )
}

/* ======================================================
   CDJ DECK SELECTOR
   Jog wheel on the outer side, deck label + LVL + selector inside.
   The native <select> covers the whole card, so it stays keyboard and
   screen-reader friendly while the visible "button" shows the full name.
====================================================== */

function RoleSelectorCard({
    side,
    list,
    value,
    weight,
    flash,
    onChange,
}: {
    side: "A" | "B"
    list: Role[]
    value: number
    weight: number
    flash: number
    onChange: (index: number) => void
}) {
    const [focused, setFocused] = useState(false)

    const role = list[value] || list[0]
    const deckNo = side === "A" ? "01" : "02"

    return (
        <div
            className={
                "ts-pick-card" +
                (side === "B" ? " is-b" : "") +
                (focused ? " is-focus" : "")
            }
            style={{
                ["--pick-weight" as any]: weight,
            }}
        >
            <span
                key={flash}
                className={flash ? "ts-pick-flash" : ""}
                aria-hidden
            />

            <div className="ts-cdj">
                <MiniVinyl image={role.image} weight={weight} />

                <div className="ts-cdj-side">
                    <div className="ts-cdj-top" aria-hidden>
                        <span className="ts-cdj-deck">deck {deckNo}</span>

                        <span className="ts-cdj-lvl">
                            lvl <b>{pad3(weight * 100)}</b>
                        </span>
                    </div>

                    <div className="ts-cdj-sel" aria-hidden>
                        <span className="ts-cdj-text">
                            <span className="ts-pick-org">{role.org}</span>

                            <span className="ts-pick-role">{role.role}</span>

                            <span className="ts-pick-date">{role.dates}</span>
                        </span>

                        <span className="ts-cdj-chev">
                            <i />
                        </span>
                    </div>
                </div>
            </div>

            <Waveform seed={role.org + role.role} weight={weight} />

            <select
                className="ts-card-select"
                value={value}
                aria-label={`Deck ${deckNo}: choose a role`}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(event) => onChange(Number(event.target.value))}
            >
                {list.map((item, index) => (
                    <option key={item.org + item.role + index} value={index}>
                        {item.org} · {item.role}
                    </option>
                ))}
            </select>
        </div>
    )
}

/* ======================================================
   MAIN
====================================================== */

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */

export default function TheSet(props: Props) {
    const {
        eyebrow = "experience",
        title = "The *set* so far",
        intro = "Research, design, teaching, community — a few genre changes along the way.",

        roles = DEFAULT_ROLES,
        visibleCount = 6,

        ctaText = "see the work behind these roles",
        ctaHref = "#work",
    } = props

    const list = roles && roles.length ? roles : DEFAULT_ROLES

    const rootRef = useRef<HTMLElement | null>(null)

    const [expanded, setExpanded] = useState(false)
    const [open, setOpen] = useState<number | null>(null)
    const [hover, setHover] = useState<number | null>(null)
    const [seen, setSeen] = useState(false)

    const [helpPinned, setHelpPinned] = useState(true)
    const [helpHovered, setHelpHovered] = useState(false)
    const [hasMixed, setHasMixed] = useState(false)

    const currentIndex = Math.max(
        0,
        list.findIndex((item) => item.current)
    )

    const defaultSecond = list.length > 1 ? (currentIndex === 1 ? 0 : 1) : 0

    const [deckA, setDeckA] = useState(currentIndex)
    const [deckB, setDeckB] = useState(defaultSecond)
    const [fader, setFader] = useState(50)

    const [flash, setFlash] = useState({
        A: 0,
        B: 0,
    })

    // "drop": bumps each time the fader crosses the centre line
    const [drop, setDrop] = useState(0)
    const lastSide = useRef(0)

    function moveFader(next: number) {
        const sideNow = next < 50 ? -1 : next > 50 ? 1 : 0

        if (sideNow !== 0) {
            if (lastSide.current !== 0 && sideNow !== lastSide.current) {
                setDrop((value) => value + 1)
            }

            lastSide.current = sideNow
        }

        setFader(next)
    }

    const safeA = Math.max(0, Math.min(deckA, list.length - 1))

    const safeB = Math.max(0, Math.min(deckB, list.length - 1))

    const roleA = list[safeA]
    const roleB = list[safeB]

    const weightB = fader / 100
    const weightA = 1 - weightB

    const shown = expanded ? list : list.slice(0, visibleCount)

    const hiddenCount = Math.max(0, list.length - visibleCount)

    const activeListIndex = hover ?? open ?? currentIndex

    const playing = list[activeListIndex] || list[0]

    const helpOpen = helpPinned || helpHovered

    const mixDescription = describeMix(roleA, roleB, fader)

    /* ==================================================
       BLEND CALCULATION
    ================================================== */

    const blend = useMemo(() => {
        const a = skillsFor(roleA)
        const b = skillsFor(roleB)

        const setA = new Set(a.map((skill) => skill.toLowerCase()))

        const setB = new Set(b.map((skill) => skill.toLowerCase()))

        const shared = a.filter((skill) => setB.has(skill.toLowerCase()))

        const uniqueA = a
            .filter((skill) => !setB.has(skill.toLowerCase()))
            .map((skill, index) => ({
                skill,
                side: "A" as const,
                weight: weightA,
                score: weightA * (1 - index * 0.035),
            }))

        const uniqueB = b
            .filter((skill) => !setA.has(skill.toLowerCase()))
            .map((skill, index) => ({
                skill,
                side: "B" as const,
                weight: weightB,
                score: weightB * (1 - index * 0.035),
            }))

        const unique = [...uniqueA, ...uniqueB].sort(
            (x, y) => y.score - x.score
        )

        const headline = [
            ...shared,
            ...unique
                .filter((item) => item.weight > 0.1)
                .map((item) => item.skill),
        ].slice(0, 3)

        return {
            shared,
            unique,
            headline,
            empty: !a.length && !b.length,
        }
    }, [roleA, roleB, weightA, weightB])

    /* ==================================================
       QUICK PAIRS
    ================================================== */

    const quickPairs = useMemo(() => {
        if (list.length < 2) return []

        const result: {
            a: number
            b: number
            label: string
        }[] = []

        result.push({
            a: 0,
            b: Math.min(1, list.length - 1),
            label: "right now",
        })

        const adobe = list.findIndex((item) =>
            item.org.toLowerCase().includes("adobe")
        )

        const dpss = list.findIndex((item) =>
            item.org.toLowerCase().includes("public safety")
        )

        if (adobe >= 0 && dpss >= 0) {
            result.push({
                a: adobe,
                b: dpss,
                label: "community × product",
            })
        }

        const gm = list.findIndex((item) =>
            item.org.toLowerCase().includes("general motors")
        )

        const openLibrary = list.findIndex((item) =>
            item.org.toLowerCase().includes("open library")
        )

        if (gm >= 0 && openLibrary >= 0) {
            result.push({
                a: gm,
                b: openLibrary,
                label: "design × research",
            })
        }

        result.push({
            a: 0,
            b: list.length - 1,
            label: "then × now",
        })

        const seen = new Set<string>()

        return result.filter((item) => {
            if (item.a === item.b) return false

            const key = `${item.a}:${item.b}`

            if (seen.has(key)) return false

            seen.add(key)

            return true
        })
    }, [list])

    function markMixed() {
        setHasMixed(true)
        setHelpPinned(false)
    }

    function useRole(side: "A" | "B", index: number) {
        markMixed()

        startTransition(() => {
            if (side === "A") {
                setDeckA(index)
            } else {
                setDeckB(index)
            }

            setFlash((previous) => ({
                ...previous,
                [side]: previous[side] + 1,
            }))
        })
    }

    function shuffle() {
        if (list.length < 2) return

        let a = safeA
        let b = safeB

        for (let tries = 0; tries < 6 && a === safeA && b === safeB; tries++) {
            a = Math.floor(Math.random() * list.length)
            b = Math.floor(Math.random() * (list.length - 1))
            if (b >= a) b += 1
        }

        tryPair(a, b)
    }

    function tryPair(a: number, b: number) {
        markMixed()
        lastSide.current = 0

        startTransition(() => {
            setDeckA(a)
            setDeckB(b)
            setFader(50)

            setFlash((previous) => ({
                A: previous.A + 1,
                B: previous.B + 1,
            }))
        })
    }

    /* ==================================================
       SCROLL REVEAL
    ================================================== */

    useEffect(() => {
        const element = rootRef.current

        if (!element || typeof IntersectionObserver === "undefined") {
            setSeen(true)
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    startTransition(() => setSeen(true))
                    observer.disconnect()
                }
            },
            {
                threshold: 0.12,
            }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    /* ==================================================
       CSS
    ================================================== */

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');

        .ts {
            --ts-accent: var(--db-accent, #E83F72);
            --ts-text: var(--db-text, #15171A);
            --ts-muted: var(--db-text-2, rgba(21,23,26,.58));
            --ts-surface: var(--db-surface, rgba(255,255,255,.74));
            --ts-surface-2: var(--db-surface-2, rgba(255,255,255,.56));
            --ts-line: var(--db-line, rgba(25,38,50,.11));
            --ts-on-accent: var(--db-on-accent, #fff);
            width: 100%;
            max-width: 1104px;
            margin: 0 auto;
            position: relative;
            color: var(--ts-text);
            font-family: ${FONT};
        }

        .ts *, .ts *::before, .ts *::after {
            box-sizing: border-box;
        }

        .ts-sr {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
        }

        /* ================================================== HEADER ================================================== */
        .ts-head {
            margin-bottom: 34px;
        }

        .ts-eyebrow {
            margin: 0 0 10px;
            display: flex;
            align-items: center;
            gap: 9px;
            color: var(--ts-accent);
            font: 600 11px ${MONO};
            letter-spacing: .17em;
            text-transform: uppercase;
        }

        .ts-dot {
            position: relative;
            width: 7px;
            height: 7px;
            flex: none;
            border-radius: 999px;
            background: var(--ts-accent);
        }

        .ts-dot::after {
            content: "";
            position: absolute;
            inset: -4px;
            border: 1px solid var(--ts-accent);
            border-radius: inherit;
            opacity: .25;
            animation: tsPulse 2.3s ease-in-out infinite;
        }

        .ts-title {
            margin: 0;
            font-size: clamp( 35px, 4.7vw, 52px );
            line-height: 1.02;
            letter-spacing: -.035em;
            font-weight: 700;
        }

        .ts-script {
            display: inline-block;
            margin: 0 .04em;
            color: var(--ts-text);
            font-family: ${SCRIPT};
            font-size: 1.32em;
            font-weight: 400;
            letter-spacing: 0;
            line-height: .8;
            transform: rotate(-1deg);
        }

        .ts-intro {
            max-width: 58ch;
            margin: 13px 0 0;
            color: var(--ts-muted);
            font-size: 16px;
            line-height: 1.55;
        }

        /* ================================================== EXPERIENCE LIST ================================================== */
        .ts-list-wrap {
            position: relative;
        }

        .ts-list {
            list-style: none;
            margin: 0;
            padding: 0;
            border-top: 1px solid var(--ts-line);
        }

        .ts-item {
            display: grid;
            grid-template-columns: 1fr;
            border-bottom: 1px solid var(--ts-line);
            opacity: 0;
            transform: translateY(12px);
        }

        .ts.is-seen .ts-item {
            animation: tsRowIn .52s cubic-bezier(.16,1,.3,1) forwards;
        }

        .ts-row {
            all: unset;
            position: relative;
            width: 100%;
            display: grid;
            grid-template-columns: 43px minmax(0,1fr) minmax(165px,max-content) 28px;
            gap: 4px 14px;
            align-items: center;
            padding: 19px 10px 19px 8px;
            border-radius: 16px;
            cursor: pointer;
            transition: transform .27s cubic-bezier(.16,1,.3,1), background .2s ease;
        }

        .ts-row::before {
            content: "";
            position: absolute;
            left: 0;
            top: 19%;
            bottom: 19%;
            width: 3px;
            border-radius: 999px;
            background: var(--ts-accent);
            transform: scaleY(0);
            transition: transform .25s cubic-bezier(.16,1,.3,1);
        }

        .ts-row:hover, .ts-row.is-active {
            transform: translateX(7px);
            background: color-mix( in srgb, var(--ts-accent) 4%, transparent );
        }

        .ts-row:hover::before, .ts-row.is-active::before {
            transform: scaleY(1);
        }

        .ts-row:focus-visible {
            outline: 2px solid var(--ts-accent);
            outline-offset: 2px;
        }

        .ts-index {
            display: grid;
            place-items: center;
            height: 25px;
            color: color-mix( in srgb, var(--ts-muted) 80%, transparent );
            font: 500 12px ${MONO};
        }

        .ts-eq {
            display: none;
            height: 14px;
            align-items: flex-end;
            gap: 2px;
        }

        .ts-eq i {
            width: 3px;
            border-radius: 999px;
            background: var(--ts-accent);
            animation: tsEQ .9s ease-in-out infinite;
        }

        .ts-eq i:nth-child(1) {
            height: 8px;
        }

        .ts-eq i:nth-child(2) {
            height: 14px;
            animation-delay: -.3s;
        }

        .ts-eq i:nth-child(3) {
            height: 6px;
            animation-delay: -.6s;
        }

        .ts-row:hover .ts-index-number, .ts-row.is-active .ts-index-number {
            display: none;
        }

        .ts-row:hover .ts-eq, .ts-row.is-active .ts-eq {
            display: flex;
        }

        .ts-who {
            min-width: 0;
            display: flex;
            align-items: center;
        }

        .ts-thumb {
            width: 0;
            height: 40px;
            flex: none;
            margin-right: 0;
            border-radius: 11px;
            object-fit: cover;
            opacity: 0;
            transform: rotate(0deg);
            transition: width .27s cubic-bezier(.16,1,.3,1), margin .27s cubic-bezier(.16,1,.3,1), opacity .2s ease, transform .25s ease;
        }

        .ts-row:hover .ts-thumb, .ts-row.is-active .ts-thumb {
            width: 40px;
            margin-right: 11px;
            opacity: 1;
            transform: rotate(-2deg);
        }

        .ts-org {
            margin: 0;
            color: var(--ts-text);
            font-size: 17px;
            font-weight: 700;
            line-height: 1.3;
            letter-spacing: -.015em;
        }

        .ts-role-name {
            margin: 3px 0 0;
            color: var(--ts-muted);
            font-size: 13px;
            line-height: 1.4;
        }

        .ts-dates {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            min-width: 165px;
            color: var(--ts-muted);
            font: 500 11px ${MONO};
            white-space: nowrap;
            text-align: right;
        }

        .ts-live {
            padding: 4px 7px;
            border-radius: 999px;
            background: color-mix( in srgb, var(--ts-accent) 12%, transparent );
            color: var(--ts-accent);
            font: 700 8px ${MONO};
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        /* ================================================== EXPAND ICON ================================================== */
        .ts-expand-icon {
            width: 28px;
            height: 28px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            color: var(--ts-muted);
            transition: background .2s ease, transform .25s cubic-bezier(.16,1,.3,1), color .2s ease;
        }

        .ts-expand-icon i {
            width: 7px;
            height: 7px;
            border-right: 1.5px solid currentColor;
            border-bottom: 1.5px solid currentColor;
            transform: translateY(-2px) rotate(45deg);
            transition: transform .25s cubic-bezier(.16,1,.3,1);
        }

        .ts-row:hover .ts-expand-icon {
            background: color-mix( in srgb, var(--ts-accent) 9%, transparent );
            color: var(--ts-accent);
        }

        .ts-row.is-active .ts-expand-icon {
            color: var(--ts-accent);
        }

        .ts-row.is-active .ts-expand-icon i {
            transform: translateY(2px) rotate(225deg);
        }

        /* ================================================== EXPANDED SUMMARY ================================================== */
        .ts-summary {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows .34s cubic-bezier(.16,1,.3,1);
        }

        .ts-summary-inner {
            overflow: hidden;
        }

        .ts-item.is-open .ts-summary {
            grid-template-rows: 1fr;
        }

        .ts-summary-content {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 28px;
            padding: 0 18px 22px 68px;
        }

        .ts-summary-copy {
            flex: 1;
            max-width: 58ch;
            margin: 0;
            padding: 0;
            color: var(--ts-muted);
            font-size: 14px;
            line-height: 1.6;
        }

        .ts-summary-mix {
            flex: none;
            min-width: 220px;
            padding: 12px;
            border: 1px solid var(--ts-line);
            border-radius: 17px;
            background: color-mix( in srgb, var(--ts-accent) 4%, var(--ts-surface) );
        }

        .ts-summary-mix-label {
            display: block;
            margin-bottom: 8px;
            color: color-mix( in srgb, var(--ts-muted) 80%, transparent );
            font: 600 9px ${MONO};
            letter-spacing: .06em;
            text-transform: lowercase;
        }

        .ts-summary-mix-buttons {
            display: flex;
            gap: 6px;
        }

        .ts-summary-mix-btn {
            all: unset;
            box-sizing: border-box;
            flex: 1;
            min-height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 0 9px;
            border: 1px solid var(--ts-line);
            border-radius: 999px;
            background: var(--ts-surface);
            color: var(--ts-text);
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: transform .22s cubic-bezier(.16,1,.3,1), border-color .2s ease, background .2s ease;
        }

        .ts-summary-number {
            color: var(--ts-accent);
            font: 700 9px ${MONO};
        }

        .ts-summary-mix-btn:hover {
            transform: translateY(-2px);
            border-color: color-mix( in srgb, var(--ts-accent) 42%, var(--ts-line) );
            background: color-mix( in srgb, var(--ts-accent) 6%, var(--ts-surface) );
        }

        .ts-summary-mix-btn:focus-visible {
            outline: 2px solid var(--ts-accent);
            outline-offset: 2px;
        }

        .ts-more {
            margin-top: 18px;
            min-height: 42px;
            padding: 0 16px;
            border: 1px solid var(--ts-line);
            border-radius: 999px;
            background: transparent;
            color: var(--ts-text);
            font: 600 12px ${FONT};
            cursor: pointer;
            transition: transform .2s ease, border-color .2s ease, background .2s ease;
        }

        .ts-more:hover {
            transform: translateY(-2px);
            border-color: color-mix( in srgb, var(--ts-accent) 40%, var(--ts-line) );
            background: color-mix( in srgb, var(--ts-accent) 4%, transparent );
        }

        /* ================================================== CTA BETWEEN SECTIONS ================================================== */
        .ts-between {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 50px 0 68px;
            text-align: center;
        }

        .ts-between::before {
            content: "";
            width: 1px;
            height: 34px;
            margin-bottom: 13px;
            background: linear-gradient( transparent, var(--ts-line) );
        }

        .ts-between-star {
            margin-bottom: 13px;
            color: var(--ts-accent);
            font-size: 16px;
            animation: tsTwinkle 2.6s ease-in-out infinite;
        }

        .ts-work-cta {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-height: 45px;
            padding: 0 17px;
            border: 1px solid color-mix( in srgb, var(--ts-accent) 26%, var(--ts-line) );
            border-radius: 999px;
            background: color-mix( in srgb, var(--ts-accent) 5%, var(--ts-surface) );
            color: var(--ts-text);
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            transition: transform .24s cubic-bezier(.16,1,.3,1), border-color .2s ease;
        }

        .ts-work-cta:hover {
            transform: translateY(-3px) rotate(-.3deg);
            border-color: color-mix( in srgb, var(--ts-accent) 48%, var(--ts-line) );
        }

        .ts-work-cta:focus-visible {
            outline: 2px solid var(--ts-accent);
            outline-offset: 3px;
        }

        .ts-work-arrow {
            color: var(--ts-accent);
            font-size: 15px;
            transition: transform .22s cubic-bezier(.16,1,.3,1);
        }

        .ts-work-cta:hover .ts-work-arrow {
            transform: translate(2px,-2px);
        }

        /* ================================================== FUN INTRO ================================================== */
        .ts-fun {
            position: relative;
        }

        .ts-fun-head {
            margin-bottom: 32px;
            text-align: center;
        }

        .ts-fun-kicker {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin: 0;
            color: var(--ts-accent);
            font: 600 10px ${MONO};
            letter-spacing: .12em;
            text-transform: uppercase;
        }

        /* ================================================== LAYERED MIX MY / EXPERIENCE TITLE ================================================== */
        .ts-fun-title {
            margin: 12px 0 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            color: var(--ts-text);
            line-height: .92;
            letter-spacing: -.035em;
        }

        .ts-fun-line {
            position: relative;
            z-index: 3;
            display: block;
            font-size: clamp( 29px, 3.6vw, 42px );
            font-weight: 700;
        }

        .ts-experience-lockup {
            position: relative;
            display: inline-grid;
            place-items: center;
            min-width: clamp( 220px, 34vw, 390px );
            min-height: clamp( 73px, 9vw, 105px );
            margin-top: -3px;
            isolation: isolate;
        }

        .ts-experience-wash {
            position: absolute;
            z-index: 0;
            left: 50%;
            top: 54%;
            width: 105%;
            height: 45%;
            transform: translate(-50%,-50%) rotate(-2deg);
            border-radius: 44% 56% 48% 52% / 58% 42% 58% 42%;
            background: color-mix( in srgb, var(--ts-accent) 13%, transparent );
        }

        .ts-experience-ghost {
            position: absolute;
            z-index: 1;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-43%) rotate(-1deg);
            color: transparent;
            -webkit-text-stroke: 1px color-mix( in srgb, var(--ts-accent) 32%, transparent );
            font-family: ${FONT};
            font-size: clamp( 34px, 5.1vw, 63px );
            font-weight: 800;
            letter-spacing: .045em;
            opacity: .6;
            white-space: nowrap;
        }

        .ts-experience-script {
            position: relative;
            z-index: 3;
            display: inline-block;
            color: var(--ts-text);
            font-family: ${SCRIPT};
            font-size: clamp( 55px, 7.3vw, 90px );
            font-weight: 400;
            line-height: .9;
            letter-spacing: 0;
            transform: rotate(-2deg);
        }

        .ts-experience-spark {
            position: absolute;
            z-index: 4;
            color: var(--ts-accent);
            pointer-events: none;
            animation: tsTwinkle 2.7s ease-in-out infinite;
        }

        .ts-experience-spark.is-one {
            top: 15%;
            right: 5%;
            font-size: 13px;
        }

        .ts-experience-spark.is-two {
            bottom: 16%;
            left: 4%;
            font-size: 8px;
            animation-delay: -.8s;
        }

        .ts-fun-copy {
            max-width: 54ch;
            margin: 7px auto 0;
            color: var(--ts-muted);
            font-size: 14px;
            line-height: 1.55;
        }

        /* ================================================== MIXER CONTAINER ================================================== */
        .ts-mixer {
            position: relative;
            padding: 24px;
            border: 1px solid var(--ts-line);
            border-radius: 30px;
            background: radial-gradient( circle at 8% 0%, color-mix( in srgb, var(--ts-accent) 10%, transparent ), transparent 30% ), radial-gradient( circle at 92% 8%, color-mix( in srgb, var(--ts-accent) 6%, transparent ), transparent 24% ), var(--ts-surface);
            box-shadow: 0 26px 65px -38px rgba(16,29,44,.34), inset 0 1px 0 rgba(255,255,255,.35);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            overflow: visible;
        }

        .ts-mix-top {
            position: relative;
            z-index: 50;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 17px;
        }

        .ts-mix-k {
            margin: 0;
            color: var(--ts-accent);
            font: 600 10px ${MONO};
            letter-spacing: .14em;
            text-transform: uppercase;
        }

        .ts-mix-help {
            max-width: 48ch;
            margin: 7px 0 0;
            color: var(--ts-muted);
            font-size: 14px;
            line-height: 1.5;
        }

        /* ================================================== HELP ================================================== */
        .ts-help-wrap {
            position: relative;
            flex: none;
            z-index: 100;
        }

        .ts-help-btn {
            all: unset;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 39px;
            padding: 0 13px;
            border: 1px solid color-mix( in srgb, var(--ts-accent) 36%, var(--ts-line) );
            border-radius: 999px;
            background: var(--ts-surface);
            color: var(--ts-text);
            font: 600 10px ${MONO};
            cursor: pointer;
            transition: transform .23s cubic-bezier(.16,1,.3,1), border-color .2s ease;
        }

        .ts-help-btn:hover {
            transform: translateY(-2px);
            border-color: color-mix( in srgb, var(--ts-accent) 65%, var(--ts-line) );
        }

        .ts-help-btn:focus-visible {
            outline: 2px solid var(--ts-accent);
            outline-offset: 2px;
        }

        .ts-help-icon {
            width: 20px;
            height: 20px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: var(--ts-accent);
            color: var(--ts-on-accent);
            font-family: ${FONT};
            font-size: 11px;
            font-weight: 800;
        }

        .ts-help-bubble {
            position: absolute;
            top: calc(100% + 12px);
            right: 0;
            width: 310px;
            padding: 18px;
            border: 1px solid color-mix( in srgb, var(--ts-accent) 24%, var(--ts-line) );
            border-radius: 22px;
            background: var(--ts-surface);
            box-shadow: 0 25px 55px -24px rgba(15,26,40,.38);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transform: translateY(-7px) scale(.975);
            transform-origin: top right;
            transition: opacity .18s ease, visibility .18s ease, transform .28s cubic-bezier(.16,1,.3,1);
        }

        .ts-help-bubble.is-visible {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: none;
        }

        .ts-help-bubble strong {
            display: block;
            margin-bottom: 10px;
            color: var(--ts-text);
            font-size: 15px;
            line-height: 1.35;
        }

        .ts-help-step {
            display: grid;
            grid-template-columns: 24px minmax(0,1fr);
            gap: 9px;
            align-items: center;
            margin-top: 8px;
            color: var(--ts-muted);
            font-size: 13px;
        }

        .ts-help-step b {
            width: 22px;
            height: 22px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: color-mix( in srgb, var(--ts-accent) 12%, transparent );
            color: var(--ts-accent);
            font: 700 9px ${MONO};
        }

        .ts-help-note {
            display: block;
            margin-top: 11px;
            padding-top: 11px;
            border-top: 1px solid var(--ts-line);
            color: color-mix( in srgb, var(--ts-muted) 78%, transparent );
            font-size: 11px;
            line-height: 1.5;
        }

        .ts-help-gotit {
            all: unset;
            margin-top: 11px;
            display: inline-flex;
            color: var(--ts-accent);
            font: 600 10px ${MONO};
            cursor: pointer;
        }

        /* ================================================== QUICK PAIRS ================================================== */
        .ts-quick {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 7px;
            margin: 0 0 17px;
        }

        .ts-quick-label {
            color: color-mix( in srgb, var(--ts-muted) 78%, transparent );
            font: 600 9px ${MONO};
            letter-spacing: .09em;
            text-transform: uppercase;
        }

        .ts-quick-btn {
            all: unset;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            min-height: 44px;
            padding: 0 14px;
            border: 1px solid var(--ts-line);
            border-radius: 999px;
            background: var(--ts-surface-2);
            color: var(--ts-muted);
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: transform .2s cubic-bezier(.16,1,.3,1), color .2s ease, border-color .2s ease;
        }

        .ts-quick-btn::before {
            content: "✦";
            color: var(--ts-accent);
            font-size: 8px;
        }

        .ts-quick-btn:hover {
            transform: translateY(-2px) rotate(-.3deg);
            color: var(--ts-text);
            border-color: color-mix( in srgb, var(--ts-accent) 38%, var(--ts-line) );
        }

        .ts-quick-btn:focus-visible {
            outline: 2px solid var(--ts-accent);
            outline-offset: 2px;
        }

        /* ================================================== MIXER GRID ================================================== */
        .ts-mix-row {
            display: grid;
            grid-template-columns: minmax(0,1fr) minmax(210px,.75fr) minmax(0,1fr);
            gap: 16px;
            align-items: stretch;
        }

        /* ================================================== BIG ROLE SELECTOR CARDS ================================================== */
        .ts-pick-card {
            --pick-weight: .5;
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 14px;
            padding: 16px;
            border: 1px solid color-mix(in srgb, var(--ts-accent) calc(12% + var(--pick-weight) * 22%), var(--ts-line));
            border-radius: 24px;
            background: radial-gradient(circle at 12% 30%, color-mix(in srgb, var(--ts-accent) calc(var(--pick-weight) * 14%), transparent), transparent 46%), var(--ts-surface-2);
            box-shadow: 0 18px 34px -28px rgba(19,32,48,.34), 0 0 34px -14px color-mix(in srgb, var(--ts-accent) calc(var(--pick-weight) * 60%), transparent), inset 0 1px 0 rgba(255,255,255,.3);
            overflow: hidden;
            isolation: isolate;
            cursor: pointer;
            transition: transform .28s cubic-bezier(.16,1,.3,1), border-color .25s ease, box-shadow .25s ease;
        }

        .ts-pick-card.is-b {
            background: radial-gradient(circle at 88% 30%, color-mix(in srgb, var(--ts-accent) calc(var(--pick-weight) * 14%), transparent), transparent 46%), var(--ts-surface-2);
        }

        .ts-pick-card:hover {
            transform: translateY(-3px);
            border-color: color-mix(in srgb, var(--ts-accent) 42%, var(--ts-line));
        }

        .ts-pick-card.is-focus {
            outline: 2px solid var(--ts-accent);
            outline-offset: 3px;
        }

        .ts-pick-flash {
            position: absolute;
            inset: 0;
            z-index: 5;
            border: 2px solid var(--ts-accent);
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
            animation: tsFlash .65s ease-out;
        }

        .ts-cdj {
            position: relative;
            z-index: 2;
            flex: 1;
            display: grid;
            grid-template-columns: 92px minmax(0,1fr);
            gap: 14px;
            align-items: center;
        }

        .ts-pick-card.is-b .ts-cdj {
            grid-template-columns: minmax(0,1fr) 92px;
        }

        .ts-pick-card.is-b .ts-vinyl-wrap {
            order: 2;
        }

        .ts-pick-card.is-b .ts-cdj-side {
            text-align: right;
        }

        .ts-pick-card.is-b .ts-cdj-top, .ts-pick-card.is-b .ts-cdj-sel {
            flex-direction: row-reverse;
        }

        .ts-pick-card.is-b .ts-wf {
            flex-direction: row-reverse;
        }

        .ts-cdj-side {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .ts-cdj-top {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            color: var(--ts-muted);
            font: 600 10px ${MONO};
            letter-spacing: .14em;
            text-transform: uppercase;
        }

        .ts-cdj-deck {
            color: var(--ts-text);
        }

        .ts-cdj-lvl b {
            color: var(--ts-accent);
            font-weight: 700;
            font-variant-numeric: tabular-nums;
        }

        .ts-cdj-sel {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 72px;
            padding: 10px 12px;
            border: 1px solid var(--ts-line);
            border-radius: 16px;
            background: var(--ts-surface);
            transition: border-color .2s ease, background .2s ease;
        }

        .ts-pick-card:hover .ts-cdj-sel, .ts-pick-card.is-focus .ts-cdj-sel {
            border-color: color-mix(in srgb, var(--ts-accent) 45%, var(--ts-line));
        }

        .ts-cdj-text {
            min-width: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .ts-pick-org {
            color: var(--ts-text);
            font: 700 16px/1.22 ${FONT};
            letter-spacing: -.015em;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            overflow-wrap: break-word;
        }

        .ts-pick-role {
            color: var(--ts-muted);
            font-size: 13px;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .ts-pick-date {
            color: color-mix(in srgb, var(--ts-muted) 80%, transparent);
            font: 500 10px ${MONO};
            font-variant-numeric: tabular-nums;
        }

        .ts-cdj-chev {
            flex: none;
            width: 28px;
            height: 28px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: color-mix(in srgb, var(--ts-accent) 13%, transparent);
            color: var(--ts-accent);
            transition: transform .25s cubic-bezier(.16,1,.3,1);
        }

        .ts-cdj-chev i {
            width: 7px;
            height: 7px;
            border-right: 1.75px solid currentColor;
            border-bottom: 1.75px solid currentColor;
            transform: translateY(-2px) rotate(45deg);
        }

        .ts-pick-card:hover .ts-cdj-chev {
            transform: translateY(2px);
        }

        .ts-card-select {
            position: absolute;
            inset: 0;
            z-index: 10;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            font-size: 16px;
        }

        /* jog wheel */
        .ts-vinyl-wrap {
            position: relative;
            width: 92px;
            height: 92px;
            flex: none;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: color-mix(in srgb, var(--ts-text) 6%, transparent);
            box-shadow: inset 0 0 0 1px var(--ts-line), 0 0 calc(6px + var(--pick-weight) * 18px) color-mix(in srgb, var(--ts-accent) calc(var(--pick-weight) * 55%), transparent);
            transition: box-shadow .3s ease;
        }

        .ts-vinyl {
            width: 78px;
            height: 78px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: repeating-radial-gradient(circle, #111316 0 1.5px, #1E2126 1.5px 3px);
            box-shadow: 0 8px 18px rgba(13,19,27,.22);
        }

        .ts-vinyl-label {
            position: relative;
            width: 44%;
            aspect-ratio: 1;
            display: grid;
            place-items: center;
            overflow: hidden;
            border-radius: 999px;
            background: var(--ts-accent);
        }

        .ts-vinyl-label img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .ts-vinyl-hole {
            position: relative;
            z-index: 2;
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: #101214;
            box-shadow: 0 0 0 2px rgba(255,255,255,.32);
        }

        /* waveform strip */
        .ts-wf {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 2px;
            height: 28px;
            padding: 0 2px;
            border-top: 1px solid var(--ts-line);
            padding-top: 10px;
            box-sizing: content-box;
        }

        .ts-wf i {
            flex: 1;
            min-width: 2px;
            border-radius: 2px;
            background: var(--ts-accent);
            opacity: calc(.22 + var(--pick-weight) * .78);
            transform-origin: center;
            animation: tsWf var(--wdur, 1s) ease-in-out infinite alternate;
            transition: height .3s cubic-bezier(.16,1,.3,1), opacity .3s ease;
        }

        /* mix chips crossfade */
        .ts-chip.is-side-a, .ts-chip.is-side-b {
            transition: transform .35s cubic-bezier(.16,1,.3,1), opacity .3s ease, border-color .2s ease;
        }

        .ts-chip.is-side-a {
            animation: tsFromL .45s cubic-bezier(.16,1,.3,1) backwards;
        }

        .ts-chip.is-side-b {
            animation: tsFromR .45s cubic-bezier(.16,1,.3,1) backwards;
        }

        .ts-chip.is-drop {
            animation: tsDrop .7s cubic-bezier(.16,1,.3,1);
        }

        .ts-quick-btn.is-shuffle::before {
            content: "⤮";
            font-size: 12px;
        }

        /* ================================================== FADER ================================================== */
        .ts-fader-area {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 16px 2px;
        }

        .ts-wave {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 22px;
            gap: 3px;
            margin-bottom: 10px;
            color: var(--ts-accent);
        }

        .ts-wave i {
            width: 3px;
            border-radius: 999px;
            background: currentColor;
            opacity: .7;
            animation: tsWave 1.2s ease-in-out infinite;
        }

        .ts-wave i:nth-child(1) {
            height: 7px;
        }

        .ts-wave i:nth-child(2) {
            height: 14px;
            animation-delay: -.3s;
        }

        .ts-wave i:nth-child(3) {
            height: 18px;
            animation-delay: -.6s;
        }

        .ts-wave i:nth-child(5) {
            height: 18px;
            animation-delay: -.4s;
        }

        .ts-wave i:nth-child(6) {
            height: 14px;
            animation-delay: -.1s;
        }

        .ts-wave i:nth-child(7) {
            height: 7px;
            animation-delay: -.7s;
        }

        .ts-wave span {
            margin: 0 6px;
            color: var(--ts-muted);
            font: 600 8px ${MONO};
            letter-spacing: .13em;
            text-transform: uppercase;
        }

        .ts-fader-labels {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            color: var(--ts-muted);
            font: 500 9px ${MONO};
        }

        .ts-fader-shell {
            position: relative;
            height: 50px;
            display: flex;
            align-items: center;
        }

        .ts-track {
            position: absolute;
            left: 10px;
            right: 10px;
            top: 50%;
            height: 6px;
            transform: translateY(-50%);
            border-radius: 999px;
            background: color-mix( in srgb, var(--ts-text) 8%, transparent );
            box-shadow: inset 0 1px 2px rgba(0,0,0,.08);
            pointer-events: none;
        }

        .ts-track-mid {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 1px;
            height: 16px;
            transform: translate(-50%,-50%);
            background: color-mix( in srgb, var(--ts-text) 22%, transparent );
            pointer-events: none;
        }

        .ts-range {
            -webkit-appearance: none;
            appearance: none;
            position: relative;
            width: 100%;
            height: 50px;
            margin: 0;
            background: transparent;
            cursor: ew-resize;
            outline: none;
        }

        .ts-range::-webkit-slider-runnable-track {
            height: 6px;
            background: transparent;
        }

        .ts-range::-moz-range-track {
            height: 6px;
            background: transparent;
        }

        .ts-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 27px;
            height: 39px;
            margin-top: -16.5px;
            border: 0;
            border-radius: 9px;
            background: linear-gradient( 180deg, #fffdf8, #e8e0d2 );
            box-shadow: 0 9px 20px rgba(20,29,40,.2), inset 0 0 0 1px rgba(22,28,34,.08);
            transition: transform .2s ease, box-shadow .2s ease;
        }

        .ts-range::-moz-range-thumb {
            width: 27px;
            height: 39px;
            border: 0;
            border-radius: 9px;
            background: linear-gradient( 180deg, #fffdf8, #e8e0d2 );
            box-shadow: 0 9px 20px rgba(20,29,40,.2);
        }

        .ts-range:hover::-webkit-slider-thumb {
            transform: scale(1.07);
            box-shadow: 0 11px 24px rgba(20,29,40,.22), 0 0 0 4px color-mix( in srgb, var(--ts-accent) 9%, transparent );
        }

        .ts-range:focus-visible::-webkit-slider-thumb {
            box-shadow: 0 0 0 2px var(--ts-surface), 0 0 0 4px var(--ts-accent);
        }

        .ts-drag-me {
            position: absolute;
            left: 50%;
            top: -5px;
            transform: translate(-50%,-100%);
            padding: 4px 8px;
            border: 1px solid color-mix( in srgb, var(--ts-accent) 28%, var(--ts-line) );
            border-radius: 999px;
            background: var(--ts-surface);
            color: var(--ts-accent);
            font: 600 9px ${MONO};
            white-space: nowrap;
            pointer-events: none;
            animation: tsDrag 1.8s ease-in-out infinite;
        }

        .ts-mix-caption {
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 0 6px;
            text-align: center;
            color: var(--ts-text);
            font-size: 12px;
            font-weight: 600;
            line-height: 1.4;
        }

        .ts-caption-dot {
            width: 6px;
            height: 6px;
            flex: none;
            border-radius: 999px;
            background: var(--ts-accent);
            box-shadow: 0 0 10px color-mix( in srgb, var(--ts-accent) 58%, transparent );
        }

        /* ================================================== BLEND RESULT ================================================== */
        .ts-blend {
            position: relative;
            margin-top: 18px;
            padding: 22px;
            border: 1px solid var(--ts-line);
            border-radius: 25px;
            background: linear-gradient( 145deg, color-mix( in srgb, var(--ts-accent) 5%, var(--ts-surface-2) ), var(--ts-surface-2) );
            overflow: hidden;
        }

        .ts-blend::after {
            content: "♡";
            position: absolute;
            right: 18px;
            top: 14px;
            color: var(--ts-accent);
            font-size: 17px;
            opacity: .22;
            transform: rotate(8deg);
        }

        .ts-blend-head {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            gap: 5px 14px;
        }

        .ts-blend-title {
            margin: 0;
            color: var(--ts-text);
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -.025em;
        }

        .ts-blend-title .ts-script {
            font-size: 1.45em;
        }

        .ts-blend-route {
            margin: 0;
            color: var(--ts-muted);
            font: 500 14px ${FONT};
            line-height: 1.5;
        }

        .ts-blend-route b {
            color: var(--ts-text);
            font-weight: 600;
        }

        .ts-blend-route em {
            color: var(--ts-accent);
            font-style: normal;
            font-weight: 600;
        }

        .ts-blend-story {
            max-width: 62ch;
            margin: 12px 0 0;
            color: var(--ts-muted);
            font-size: 14px;
            line-height: 1.55;
        }

        .ts-blend-story strong {
            color: var(--ts-text);
            font-weight: 600;
        }

        .ts-label {
            margin: 17px 0 8px;
            color: color-mix( in srgb, var(--ts-muted) 78%, transparent );
            font: 600 10px ${MONO};
            letter-spacing: .13em;
            text-transform: uppercase;
        }

        .ts-chips {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 0;
            padding: 0;
        }

        .ts-chip {
            min-height: 34px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 0 12px;
            border: 1px solid var(--ts-line);
            border-radius: 999px;
            background: var(--ts-surface);
            color: var(--ts-text);
            font-size: 12px;
            font-weight: 500;
            transform-origin: center;
            transition: transform .23s cubic-bezier(.16,1,.3,1), border-color .2s ease, opacity .2s ease;
        }

        .ts-chip:hover {
            transform: translateY(-2px) rotate(-.3deg);
            border-color: color-mix( in srgb, var(--ts-accent) 38%, var(--ts-line) );
        }

        .ts-chip small {
            color: var(--ts-muted);
            font: 600 9px ${MONO};
        }

        .ts-chip.is-shared {
            border-color: transparent;
            background: var(--ts-accent);
            color: var(--ts-on-accent);
        }

        .ts-chip.is-shared small {
            color: inherit;
            opacity: .75;
        }

        .ts-chip.is-leading {
            border-color: color-mix( in srgb, var(--ts-accent) 44%, var(--ts-line) );
        }

        .ts-none {
            margin: 0;
            color: var(--ts-muted);
            font-size: 13px;
            line-height: 1.5;
        }

        /* ================================================== LOWER DJ DECK ================================================== */
        .ts-deck {
            position: relative;
            margin-top: 18px;
            display: grid;
            grid-template-columns: 170px minmax(0,1fr);
            gap: 24px;
            align-items: center;
            padding: 20px;
            border: 1px solid var(--ts-line);
            border-radius: 25px;
            background: color-mix( in srgb, var(--ts-surface-2) 92%, transparent );
        }

        .ts-deck-left {
            position: relative;
            width: 150px;
            height: 150px;
            display: grid;
            place-items: center;
            margin: 0 auto;
        }

        .ts-big-record {
            width: 128px;
            height: 128px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            background: repeating-radial-gradient( circle, #101215 0 1.5px, #1c1f23 1.5px 3px );
            box-shadow: 0 0 0 7px color-mix( in srgb, var(--ts-surface) 86%, #111 14% ), 0 20px 38px rgba(8,12,16,.2);
            animation: tsSpin 7s linear infinite;
        }

        .ts-big-label {
            position: relative;
            width: 38%;
            aspect-ratio: 1;
            display: grid;
            place-items: center;
            border-radius: 999px;
            overflow: hidden;
            background: var(--ts-accent);
        }

        .ts-big-label img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .ts-big-hole {
            position: relative;
            z-index: 2;
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #101214;
        }

        .ts-deck-arm {
            position: absolute;
            right: 8px;
            top: 7px;
            width: 5px;
            height: 92px;
            border-radius: 999px;
            background: linear-gradient( #cbc6bc, #837d74 );
            transform-origin: top center;
            transform: rotate(10deg);
            transition: transform .4s cubic-bezier(.16,1,.3,1);
        }

        .ts-deck:hover .ts-deck-arm {
            transform: rotate(23deg);
        }

        .ts-deck:hover .ts-big-record {
            animation-duration: 2.8s;
        }

        .ts-deck-copy {
            min-width: 0;
        }

        .ts-deck-kicker {
            display: flex;
            align-items: center;
            gap: 7px;
            color: var(--ts-accent);
            font: 600 9px ${MONO};
            letter-spacing: .12em;
            text-transform: uppercase;
        }

        .ts-deck-kicker::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: var(--ts-accent);
            box-shadow: 0 0 9px color-mix( in srgb, var(--ts-accent) 55%, transparent );
        }

        .ts-deck-title {
            margin: 10px 0 4px;
            color: var(--ts-text);
            font-size: 23px;
            font-weight: 700;
            letter-spacing: -.025em;
        }

        .ts-deck-role {
            color: var(--ts-muted);
            font-size: 14px;
            line-height: 1.45;
        }

        .ts-deck-note {
            max-width: 50ch;
            margin: 13px 0 0;
            color: color-mix( in srgb, var(--ts-muted) 82%, transparent );
            font-size: 12px;
            line-height: 1.55;
        }

        /* ================================================== ANIMATIONS ================================================== */
        @keyframes tsPulse {
            0%, 100% {
                transform: scale(.8);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
                opacity: .45;
            }
        }

        @keyframes tsRowIn {
            to {
                opacity: 1;
                transform: none;
            }
        }

        @keyframes tsEQ {
            0%, 100% {
                transform: scaleY(.45);
            }
            50% {
                transform: scaleY(1);
            }
        }

        @keyframes tsTwinkle {
            0%, 100% {
                opacity: .28;
                transform: scale(.8) rotate(0deg);
            }
            50% {
                opacity: .95;
                transform: scale(1.13) rotate(12deg);
            }
        }

        @keyframes tsFlash {
            0% {
                opacity: .9;
            }
            100% {
                opacity: 0;
            }
        }

        @keyframes tsWave {
            0%, 100% {
                transform: scaleY(.5);
                opacity: .45;
            }
            50% {
                transform: scaleY(1);
                opacity: .9;
            }
        }

        @keyframes tsDrag {
            0%, 100% {
                transform: translate(-50%,-100%);
            }
            50% {
                transform: translate( -50%, calc(-100% - 3px) );
            }
        }

        @keyframes tsSpin {
            to {
                transform: rotate(360deg);
            }
        }

        /* ================================================== TABLET ================================================== */
        @media (max-width: 900px) {
            .ts-mix-row {
                grid-template-columns: 1fr 1fr;
            }
            .ts-fader-area {
                grid-column: 1 / -1;
                grid-row: 2;
                padding: 20px 8%;
            }
        }

        @media (max-width: 820px) {
            .ts-row {
                grid-template-columns: 38px minmax(0,1fr) auto 28px;
                gap: 4px 11px;
            }
            .ts-dates {
                min-width: 0;
                font-size: 10px;
            }
            .ts-summary-content {
                flex-direction: column;
                gap: 16px;
                padding-left: 57px;
            }
            .ts-summary-mix {
                width: min(100%,360px);
                min-width: 0;
            }
        }

        /* ================================================== MOBILE ================================================== */
        @media (max-width: 680px) {
            .ts-mix-top {
                flex-direction: column;
                gap: 13px;
            }
            .ts-help-wrap {
                width: 100%;
            }
            .ts-help-btn {
                width: 100%;
                justify-content: center;
            }
            .ts-help-bubble {
                left: 0;
                right: auto;
                width: min( 310px, calc(100vw - 64px) );
                transform-origin: top left;
            }
            .ts-mixer {
                padding: 16px;
                border-radius: 24px;
            }
            .ts-mix-row {
                grid-template-columns: 1fr;
            }
            .ts-fader-area {
                grid-column: auto;
                grid-row: auto;
                padding: 20px 4px;
            }
            .ts-deck {
                grid-template-columns: 110px minmax(0,1fr);
                gap: 17px;
                padding: 16px;
            }
            .ts-deck-left {
                width: 100px;
                height: 100px;
            }
            .ts-big-record {
                width: 88px;
                height: 88px;
            }
            .ts-deck-arm {
                display: none;
            }
            .ts-deck-title {
                font-size: 19px;
            }
        }

        @media (max-width: 560px) {
            .ts-row {
                grid-template-columns: 34px minmax(0,1fr) 28px;
                gap: 5px 10px;
                padding: 17px 5px;
            }
            .ts-index {
                grid-column: 1;
                grid-row: 1 / span 2;
            }
            .ts-who {
                grid-column: 2;
                grid-row: 1;
            }
            .ts-expand-icon {
                grid-column: 3;
                grid-row: 1;
            }
            .ts-dates {
                grid-column: 2 / -1;
                grid-row: 2;
                justify-content: flex-start;
                min-width: 0;
                margin-top: 3px;
                text-align: left;
            }
            .ts-summary-content {
                padding: 0 8px 20px 44px;
            }
            .ts-summary-mix {
                width: 100%;
            }
            .ts-summary-mix-buttons {
                flex-direction: column;
            }
            .ts-summary-mix-btn {
                width: 100%;
            }
            .ts-between {
                margin: 40px 0 54px;
            }
            .ts-quick-label {
                width: 100%;
            }
            .ts-deck {
                grid-template-columns: 1fr;
                text-align: center;
            }
            .ts-deck-kicker {
                justify-content: center;
            }
            .ts-deck-note {
                margin-left: auto;
                margin-right: auto;
            }
            .ts-experience-lockup {
                min-width: min( 88vw, 330px );
            }
            .ts-experience-ghost {
                font-size: clamp( 31px, 10vw, 44px );
            }
            .ts-experience-script {
                font-size: clamp( 52px, 17vw, 72px );
            }
        }

        @keyframes tsWf {
            from {
                transform: scaleY(1);
            }
            to {
                transform: scaleY(.42);
            }
        }

        @keyframes tsFromL {
            from {
                opacity: 0;
                translate: -18px 0;
            }
        }

        @keyframes tsFromR {
            from {
                opacity: 0;
                translate: 18px 0;
            }
        }

        @keyframes tsDrop {
            0% {
                scale: 1;
                box-shadow: 0 0 0 0 color-mix(in srgb, var(--ts-accent) 45%, transparent);
            }
            35% {
                scale: 1.1;
                box-shadow: 0 0 0 7px color-mix(in srgb, var(--ts-accent) 18%, transparent);
            }
            100% {
                scale: 1;
                box-shadow: 0 0 0 0 transparent;
            }
        }

        @media (max-width: 1100px) {
            .ts-cdj {
                grid-template-columns: 80px minmax(0,1fr);
            }
            .ts-pick-card.is-b .ts-cdj {
                grid-template-columns: minmax(0,1fr) 80px;
            }
            .ts-vinyl-wrap {
                width: 80px;
                height: 80px;
            }
            .ts-vinyl {
                width: 68px;
                height: 68px;
            }
        }

        @media (max-width: 680px) {
            .ts-cdj, .ts-pick-card.is-b .ts-cdj {
                grid-template-columns: 80px minmax(0,1fr);
                gap: 12px;
            }
            .ts-pick-card.is-b .ts-vinyl-wrap {
                order: 0;
            }
            .ts-pick-card.is-b .ts-cdj-side {
                text-align: left;
            }
            .ts-pick-card.is-b .ts-cdj-top, .ts-pick-card.is-b .ts-cdj-sel, .ts-pick-card.is-b .ts-wf {
                flex-direction: row;
            }
            .ts-vinyl-wrap {
                width: 80px;
                height: 80px;
            }
            .ts-vinyl {
                width: 68px;
                height: 68px;
            }
            .ts-pick-card {
                padding: 14px;
            }
            .ts-cdj-sel {
                min-height: 64px;
                padding: 9px 10px;
            }
        }

        /* ================================================== REDUCED MOTION ================================================== */
        @media (prefers-reduced-motion: reduce) {
            .ts *, .ts *::before, .ts *::after {
                animation: none !important;
                transition: none !important;
            }
            .ts-item {
                opacity: 1;
                transform: none;
            }
            .ts-drag-me {
                display: none;
            }
        }
    `

    const headline = blend.headline.join(", ")

    const playingImage = imgSrc(playing?.image)

    /* ==================================================
       JSX
    ================================================== */

    return (
        <section
            ref={rootRef}
            className={"ts" + (seen ? " is-seen" : "")}
            style={props.style}
            aria-labelledby="theset-title"
        >
            <style>{css}</style>

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="ts-head">
                <p className="ts-eyebrow">
                    <span className="ts-dot" aria-hidden />

                    {eyebrow}
                </p>

                <h2 id="theset-title" className="ts-title">
                    {renderTitle(title)}
                </h2>

                {intro && <p className="ts-intro">{intro}</p>}
            </header>

            {/* ==================================================
                EXPERIENCE LIST
            ================================================== */}

            <div className="ts-list-wrap">
                <ol id="theset-list" className="ts-list">
                    {shown.map((role, index) => {
                        const isOpen = open === index

                        const panelId = `ts-summary-${index}`

                        const thumb = imgSrc(role.image)

                        return (
                            <li
                                key={role.org + role.role + index}
                                className={
                                    "ts-item" + (isOpen ? " is-open" : "")
                                }
                                style={{
                                    animationDelay: `${
                                        Math.min(index, 10) * 65
                                    }ms`,
                                }}
                            >
                                <button
                                    type="button"
                                    className={
                                        "ts-row" + (isOpen ? " is-active" : "")
                                    }
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    onMouseEnter={() =>
                                        startTransition(() => setHover(index))
                                    }
                                    onMouseLeave={() =>
                                        startTransition(() => setHover(null))
                                    }
                                    onFocus={() =>
                                        startTransition(() => setHover(index))
                                    }
                                    onBlur={() =>
                                        startTransition(() => setHover(null))
                                    }
                                    onClick={() =>
                                        startTransition(() =>
                                            setOpen((previous) =>
                                                previous === index
                                                    ? null
                                                    : index
                                            )
                                        )
                                    }
                                >
                                    <span className="ts-index">
                                        <span className="ts-index-number">
                                            {pad(index + 1)}
                                        </span>

                                        <span className="ts-eq" aria-hidden>
                                            <i />
                                            <i />
                                            <i />
                                        </span>
                                    </span>

                                    <span className="ts-who">
                                        {thumb && (
                                            <img
                                                className="ts-thumb"
                                                src={thumb}
                                                alt={imgAlt(role.image)}
                                            />
                                        )}

                                        <span>
                                            <h3 className="ts-org">
                                                {role.org}
                                            </h3>

                                            <p className="ts-role-name">
                                                {role.role}
                                            </p>
                                        </span>
                                    </span>

                                    <span className="ts-dates">
                                        {role.current && (
                                            <span className="ts-live">now</span>
                                        )}

                                        <span>{role.dates}</span>
                                    </span>

                                    <span
                                        className="ts-expand-icon"
                                        aria-hidden
                                    >
                                        <i />
                                    </span>
                                </button>

                                {role.summary && (
                                    <div
                                        id={panelId}
                                        className="ts-summary"
                                        role="region"
                                        aria-label={`${role.org} details`}
                                    >
                                        <div className="ts-summary-inner">
                                            <div className="ts-summary-content">
                                                <p className="ts-summary-copy">
                                                    {role.summary}
                                                </p>

                                                <div
                                                    className="ts-summary-mix"
                                                    aria-label="Add this role to the experience mixer"
                                                >
                                                    <span className="ts-summary-mix-label">
                                                        want to play with this
                                                        one?
                                                    </span>

                                                    <div className="ts-summary-mix-buttons">
                                                        <button
                                                            type="button"
                                                            className="ts-summary-mix-btn"
                                                            onClick={() =>
                                                                useRole(
                                                                    "A",
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <span className="ts-summary-number">
                                                                01
                                                            </span>
                                                            first role
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="ts-summary-mix-btn"
                                                            onClick={() =>
                                                                useRole(
                                                                    "B",
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <span className="ts-summary-number">
                                                                02
                                                            </span>
                                                            second role
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ol>

                {hiddenCount > 0 && (
                    <button
                        type="button"
                        className="ts-more"
                        aria-expanded={expanded}
                        aria-controls="theset-list"
                        onClick={() =>
                            startTransition(() =>
                                setExpanded((value) => !value)
                            )
                        }
                    >
                        {expanded
                            ? "show fewer ↑"
                            : `show ${hiddenCount} earlier ${
                                  hiddenCount === 1 ? "role" : "roles"
                              } ↓`}
                    </button>
                )}
            </div>

            {/* ==================================================
                CTA TO WORK
            ================================================== */}

            <div className="ts-between">
                <span className="ts-between-star" aria-hidden>
                    ✦
                </span>

                <a className="ts-work-cta" href={ctaHref || "#work"}>
                    <span>{ctaText}</span>

                    <span className="ts-work-arrow" aria-hidden>
                        ↗
                    </span>
                </a>
            </div>

            {/* ==================================================
                FUN SECTION
            ================================================== */}

            <div className="ts-fun">
                <div className="ts-fun-head">
                    <p className="ts-fun-kicker">
                        <span aria-hidden>✦</span>
                        okay, now play with it
                    </p>

                    <h3 className="ts-fun-title" aria-label="Mix my experience">
                        <span className="ts-fun-line">mix my</span>

                        <span className="ts-experience-lockup">
                            <span className="ts-experience-ghost" aria-hidden>
                                EXPERIENCE
                            </span>

                            <span className="ts-experience-wash" aria-hidden />

                            <span className="ts-experience-script">
                                experience
                            </span>

                            <span
                                className="ts-experience-spark is-one"
                                aria-hidden
                            >
                                ✦
                            </span>

                            <span
                                className="ts-experience-spark is-two"
                                aria-hidden
                            >
                                ✦
                            </span>
                        </span>
                    </h3>

                    <p className="ts-fun-copy">
                        Pick two chapters of my career. I’ll show you what
                        carried from one into the other.
                    </p>
                </div>

                {/* ==================================================
                    MIXER
                ================================================== */}

                <div className="ts-mixer">
                    <div className="ts-mix-top">
                        <div>
                            <p className="ts-mix-k">mix & match</p>

                            <p className="ts-mix-help">
                                Choose any two roles. The whole cards below are
                                clickable.
                            </p>
                        </div>

                        <div
                            className="ts-help-wrap"
                            onMouseEnter={() => setHelpHovered(true)}
                            onMouseLeave={() => setHelpHovered(false)}
                            onFocus={() => setHelpHovered(true)}
                            onBlur={(event) => {
                                if (
                                    !event.currentTarget.contains(
                                        event.relatedTarget as Node
                                    )
                                ) {
                                    setHelpHovered(false)
                                }
                            }}
                        >
                            <button
                                type="button"
                                className="ts-help-btn"
                                aria-expanded={helpOpen}
                                onClick={() => setHelpPinned((value) => !value)}
                            >
                                <span className="ts-help-icon">?</span>

                                <span>help me ✦</span>
                            </button>

                            <div
                                className={
                                    "ts-help-bubble" +
                                    (helpOpen ? " is-visible" : "")
                                }
                                role="note"
                            >
                                <strong>
                                    No DJ knowledge needed, promise.
                                </strong>

                                <div className="ts-help-step">
                                    <b>1</b>

                                    <span>
                                        click each big card to choose a role
                                    </span>
                                </div>

                                <div className="ts-help-step">
                                    <b>2</b>

                                    <span>
                                        drag the slider toward whichever role
                                        you want more of
                                    </span>
                                </div>

                                <div className="ts-help-step">
                                    <b>3</b>

                                    <span>watch the skill blend change</span>
                                </div>

                                <span className="ts-help-note">
                                    basically: two jobs go in, one slightly
                                    chaotic Dhwani comes out.
                                </span>

                                {helpPinned && (
                                    <button
                                        type="button"
                                        className="ts-help-gotit"
                                        onClick={() => setHelpPinned(false)}
                                    >
                                        cute, got it →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        QUICK PAIRS
                    ================================================== */}

                    {list.length > 1 && (
                        <div className="ts-quick">
                            <span className="ts-quick-label">try one</span>

                            {quickPairs.map((pair, index) => (
                                <button
                                    key={`${pair.a}-${pair.b}-${index}`}
                                    type="button"
                                    className="ts-quick-btn"
                                    onClick={() => tryPair(pair.a, pair.b)}
                                >
                                    {pair.label}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="ts-quick-btn is-shuffle"
                                aria-label="Shuffle: load two random roles"
                                onClick={shuffle}
                            >
                                shuffle
                            </button>
                        </div>
                    )}

                    {/* ==================================================
                        PICKER CARDS + FADER
                    ================================================== */}

                    <div className="ts-mix-row">
                        <RoleSelectorCard
                            side="A"
                            list={list}
                            value={safeA}
                            weight={weightA}
                            flash={flash.A}
                            onChange={(index) => {
                                markMixed()

                                startTransition(() => setDeckA(index))
                            }}
                        />

                        <div className="ts-fader-area">
                            <div className="ts-wave" aria-hidden>
                                <i />
                                <i />
                                <i />

                                <span>blend</span>

                                <i />
                                <i />
                                <i />
                            </div>

                            <div className="ts-fader-labels" aria-hidden>
                                <span>← more 01</span>

                                <span>more 02 →</span>
                            </div>

                            <div className="ts-fader-shell">
                                {!hasMixed && (
                                    <span className="ts-drag-me">
                                        drag me ↔
                                    </span>
                                )}

                                <span className="ts-track" aria-hidden />

                                <span className="ts-track-mid" aria-hidden />

                                <input
                                    type="range"
                                    className="ts-range"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={fader}
                                    aria-label="Change how much each role shapes the mix"
                                    aria-valuetext={mixDescription}
                                    onChange={(event) => {
                                        markMixed()

                                        moveFader(Number(event.target.value))
                                    }}
                                />
                            </div>

                            <div className="ts-mix-caption" aria-live="polite">
                                <span className="ts-caption-dot" aria-hidden />

                                {mixDescription}
                            </div>
                        </div>

                        <RoleSelectorCard
                            side="B"
                            list={list}
                            value={safeB}
                            weight={weightB}
                            flash={flash.B}
                            onChange={(index) => {
                                markMixed()

                                startTransition(() => setDeckB(index))
                            }}
                        />
                    </div>

                    {/* ==================================================
                        BLEND
                    ================================================== */}

                    <div className="ts-blend">
                        <div className="ts-blend-head">
                            <h4 className="ts-blend-title">
                                the <span className="ts-script">blend</span>
                            </h4>

                            {!blend.empty && headline && (
                                <p className="ts-blend-route">
                                    <b>{shortOrg(roleA)}</b> ×{" "}
                                    <b>{shortOrg(roleB)}</b> →{" "}
                                    <em>{headline}</em>
                                </p>
                            )}
                        </div>

                        {!blend.empty && blend.headline.length > 0 && (
                            <p className="ts-blend-story">
                                Together, these experiences sharpened{" "}
                                <strong>{blend.headline.join(", ")}</strong>.
                            </p>
                        )}

                        {!blend.empty && (
                            <>
                                <p className="ts-label">shared strengths</p>

                                {blend.shared.length > 0 ? (
                                    <ul className="ts-chips">
                                        {blend.shared.map((skill) => (
                                            <li
                                                key={`${skill}-${drop}`}
                                                className={
                                                    "ts-chip is-shared" +
                                                    (drop ? " is-drop" : "")
                                                }
                                            >
                                                {skill}

                                                <small>both</small>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="ts-none">
                                        These roles bring different things to
                                        the table — which is kind of the fun
                                        part.
                                    </p>
                                )}

                                {blend.unique.length > 0 && (
                                    <>
                                        <p className="ts-label">
                                            what each role added
                                        </p>

                                        <ul className="ts-chips">
                                            {blend.unique.map((item) => (
                                                <li
                                                    key={`${item.side}-${item.skill}`}
                                                    className={
                                                        "ts-chip is-side-" +
                                                        item.side.toLowerCase() +
                                                        (item.weight > 0.6
                                                            ? " is-leading"
                                                            : "")
                                                    }
                                                    style={{
                                                        opacity:
                                                            0.2 +
                                                            item.weight * 0.8,

                                                        transform: `translateX(${(
                                                            (item.side === "A"
                                                                ? -1
                                                                : 1) *
                                                            (1 - item.weight) *
                                                            12
                                                        ).toFixed(1)}px) scale(${(
                                                            0.88 +
                                                            item.weight * 0.12
                                                        ).toFixed(3)})`,
                                                    }}
                                                >
                                                    {item.skill}

                                                    <small>
                                                        {item.side === "A"
                                                            ? "01"
                                                            : "02"}
                                                    </small>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* ==================================================
                        DJ DECK AT BOTTOM
                    ================================================== */}

                    <div className="ts-deck">
                        <div className="ts-deck-left" aria-hidden>
                            <div className="ts-big-record">
                                <div className="ts-big-label">
                                    {playingImage && (
                                        <img
                                            key={playingImage}
                                            src={playingImage}
                                            alt=""
                                        />
                                    )}

                                    <span className="ts-big-hole" />
                                </div>
                            </div>

                            <span className="ts-deck-arm" />
                        </div>

                        <div className="ts-deck-copy">
                            <div className="ts-deck-kicker">
                                now playing · {pad(activeListIndex + 1)}
                            </div>

                            <div className="ts-deck-title">{playing.org}</div>

                            <div className="ts-deck-role">
                                {playing.role} · {playing.dates}
                            </div>

                            <p className="ts-deck-note">
                                Hover or open a role above and this little
                                record follows along. Purely for the drama.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ======================================================
   FRAMER CONTROLS
====================================================== */

addPropertyControls(TheSet, {
    eyebrow: {
        type: ControlType.String,
        title: "Eyebrow",
        defaultValue: "experience",
    },

    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "The *set* so far",
        description: "Wrap a word in *stars* to use the script font.",
    },

    intro: {
        type: ControlType.String,
        title: "Intro",
        defaultValue:
            "Research, design, teaching, community — a few genre changes along the way.",
        displayTextArea: true,
    },

    ctaText: {
        type: ControlType.String,
        title: "CTA",
        defaultValue: "see the work behind these roles",
    },

    ctaHref: {
        type: ControlType.String,
        title: "CTA Link",
        defaultValue: "#work",
    },

    visibleCount: {
        type: ControlType.Number,
        title: "Show first",
        min: 3,
        max: 13,
        step: 1,
        defaultValue: 6,
    },

    roles: {
        type: ControlType.Array,
        title: "Roles (newest first)",

        control: {
            type: ControlType.Object,

            controls: {
                org: {
                    type: ControlType.String,
                    title: "Organization",
                    defaultValue: "Organization",
                },

                role: {
                    type: ControlType.String,
                    title: "Role",
                    defaultValue: "Role",
                },

                dates: {
                    type: ControlType.String,
                    title: "Dates",
                    defaultValue: "2026",
                },

                summary: {
                    type: ControlType.String,
                    title: "One line",
                    defaultValue: "",
                    displayTextArea: true,
                },

                current: {
                    type: ControlType.Boolean,
                    title: "Current",
                    defaultValue: false,
                },

                skills: {
                    type: ControlType.String,
                    title: "Skills",
                    defaultValue: "",
                    placeholder: "research, prototyping, storytelling",
                    description: "Comma separated. These power the mixer.",
                },

                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Image",
                },
            },
        },

        defaultValue: DEFAULT_ROLES,
    },
})
