// CaseStudy v4 (Oct 21) — one whole case study in about a minute, screens first.
// Order: name → one line → role/team/when/status → section chips → the big screen → a few real
// numbers → the short version (problem, shift, where it landed) → screens → one decision →
// what's still open → next case.
//  • Words come from src/content/caseStudies.ts (the honest version), trimmed. No new claims.
//  • Screens & photos: add images or videos in the right panel (upload or paste a URL).
//    The first one is the hero. Videos play muted when on screen; everything opens larger.
//  • Section nav (like the Open Library page): chips under the header, and on wide screens a
//    quiet rail on the left with words that highlights where you are.
//  • Micro-interactions: reading bar, title reveal, numbers count up, blocks rise in, screens
//    lift with a soft light, the rejected option gets struck through. Off under reduced motion.
//  • v4: titles in Poppins (not script), wider side margins, no repeated "what happened" box.
//  • v4.1: per-clip "Rotate" for clips recorded sideways (the GM cab screen).
//  • "Show" can split it: Intro + screens, then anything you like, then Decision → end.
//  • Theme: site tokens (--db-*), so light/dark both work.
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type Short = {
    name: string
    org: string
    line: string
    meta: [string, string][]
    problem: string
    shift: string
    landed: string
    decision: { title: string; chose: string; over: string; because: string }
    outcome: { limits: string; next: string }
    link?: { label: string; href: string }
    stats?: { value: number; suffix?: string; label: string }[]
}

const CASES: Record<string, Short> = {
    briefs: {
        name: "BRIEFS",
        org: "U-M Division of Public Safety & Security",
        line: "A tool that helps U-M dispatchers find a building's contacts, access, hazards and floor plans during a call.",
        meta: [
            ["My part", "Contextual inquiry, information architecture, prototype, PRD"],
            ["Team", "With Aaron Tucker, DPSS"],
            ["When", "Summer 2026"],
            ["Status", "Prototype and PRD handed off. Not launched."],
        ],
        problem: "I sat with dispatchers on shift. One workstation had seven screens, and one building question meant PDFs, Dropbox and more than ten tools.",
        shift: "Answering one question meant jumping across tools. Keeping records current mattered as much as finding them fast.",
        landed: "An interactive prototype and a PRD, handed to DPSS.",
        decision: {
            title: "Pin the urgent details.",
            chose: "A strip with the contacts, access and hazards a dispatcher needs mid-call, visible from every section",
            over: "Giving every piece of building information equal weight",
            because: "Mid-call, those details matter no matter where you are in the profile. The strip costs screen space. I decided that was worth it.",
        },
        outcome: {
            limits: "Not launched and not tested with dispatchers yet. Who owns each record is still open.",
            next: "On a real shift, can a dispatcher find a detail, check it's current, and trust it?",
        },
        stats: [
            { value: 7, label: "screens at one dispatcher workstation" },
            { value: 10, suffix: "+", label: "tools behind one building lookup" },
            { value: 4, label: "fixed tabs in the new building profile" },
        ],
    },
    "general-motors": {
        name: "Convoy",
        org: "General Motors · sponsored UMSI project",
        line: "A phone and in-car experience that helps a group plan and drive a road trip together.",
        meta: [
            ["My part", "Interface layouts, Figma interactions, reusable components"],
            ["Team", "Three designers: me, Sara and Julia"],
            ["When", "Jan – May 2026"],
            ["Status", "Concept, tested in a physical cab mockup"],
        ],
        problem: "Most car concepts start with one driver. Ours did too: biometrics that tune the truck to one person.",
        shift: "One interview with a truck driver was all about planning a trip and keeping a group of cars together. So we changed direction.",
        landed: "A concept for group road trips, tested three times in a physical truck cab mockup.",
        decision: {
            title: "Plan on the phone. Keep driving updates simple.",
            chose: "Trip planning on the phone. The truck screen shows where everyone is and how the group is doing.",
            over: "Putting planning on the in-car display",
            because: "Groups already plan on their phones before they leave. Once everyone's driving, the screen only needs to answer one question: where is everybody?",
        },
        outcome: {
            limits: "We never tested it on a real road, and some details are under NDA.",
            next: "How much control should the trip organizer have?",
        },
        stats: [
            { value: 4, label: "weeks of work set aside after one interview" },
            { value: 3, label: "usability tests in a truck cab mockup" },
            { value: 1, label: "interview that changed the brief" },
        ],
    },
    intel: {
        name: "Intelligence Hub",
        org: "Intelligence Group workspace · U-M DPSS",
        line: "One shared workspace for a DPSS analyst team's requests, investigations, reviews and next steps.",
        meta: [
            ["My part", "Co-lead: stakeholder interviews, workflow design, Apps Script prototype, PRD"],
            ["Team", "Co-led with Aaron Tucker, DPSS"],
            ["When", "2026"],
            ["Status", "Piloted with the team"],
        ],
        problem: "Requests and investigation work lived in different places. Whoever picked up a case had to rebuild its history first.",
        shift: "The case should carry its own history, and each role should see what it needs and nothing more.",
        landed: "A Google Apps Script workspace the team piloted. I co-led the pilot.",
        decision: {
            title: "Keep the history attached to the case.",
            chose: "Request, status, owner and history travel with the case as the view changes",
            over: "Separate intake and spreadsheet tracking",
            because: "The next analyst should see what happened before the case reached them.",
        },
        outcome: {
            limits: "No speed or quality numbers yet. The real screens stay private until DPSS clears them, so the ones here use invented records.",
            next: "Can each role spot the next action on a case without asking someone?",
        },
    },
    budgetcart: {
        name: "BudgetCart",
        org: "UMSI course project",
        line: "A grocery app for shopping within a budget, SNAP/WIC eligibility and dietary needs, with an assistant that drafts a starting cart.",
        meta: [
            ["My part", "Interviews, paper prototypes, the AI cart builder and Budget Calendar, Figma components"],
            ["Team", "Three designers: me, Anne and Tunisia"],
            ["When", "Aug – Dec 2025"],
            ["Status", "Prototype tested with tasks. Not a live service."],
        ],
        problem: "A weekly budget, SNAP/WIC eligibility and dietary needs, all at once. The cheapest item isn't always the cheapest trip.",
        shift: "We hid brands, stores and prices to look simple. Testers found items harder to find and trusted their choices less.",
        landed: "A tested prototype with an AI cart builder and a Budget Calendar. We revised the browse and store screens after testing.",
        decision: {
            title: "Show the cues people choose with.",
            chose: "Item-first browsing with price, brand and store visible",
            over: "Hiding brands, stores and prices so the screen looks simpler",
            because: "When we hid them, people struggled to find items and trusted their picks less.",
        },
        outcome: {
            limits: "Not a live service. No change in spending measured, and the revised screens weren't retested.",
            next: "In a retest, do shoppers find items faster and put fewer back at checkout?",
        },
        link: {
            label: "Open the Figma prototype",
            href: "https://www.figma.com/proto/UUNYyLmIxrEFfMTnM3u2e6/BudgetCart-HighFi-Prototype?node-id=1-5643&starting-point-node-id=1%3A5643",
        },
    },
    openlibrary: {
        name: "Open Library",
        org: "Internet Archive · SI 500 client project",
        line: "Research into how multilingual readers use language support while reading, with recommendations for the Open Library team.",
        meta: [
            ["My part", "Client calls, interviews, my first affinity map, synthesis, report"],
            ["Team", "Five-person SI 500 team"],
            ["When", "Aug – Dec 2025"],
            ["Status", "Report and recommendations delivered"],
        ],
        problem: "How do people reading in a second language get help without losing the book? All five of us were international students, so we double-checked our own assumptions.",
        shift: "Readers already had tools. Jumping between the book, a dictionary and a translator is what cost them their place.",
        landed: "A report and recommendations. Open Library later improved its feedback process and invested more in the project.",
        decision: {
            title: "Surface what already exists.",
            chose: "Make existing translation and reading support easier to find inside the reading flow",
            over: "Adding another separate translation tool",
            because: "One more tool would just be one more place to switch to.",
        },
        outcome: {
            limits: "Open Library's follow-up is a partner response, not a measured reader outcome. Nothing was built or tested.",
            next: "Can readers find language help without losing their place, and do they trust it?",
        },
        stats: [
            { value: 8, label: "reader interviews" },
            { value: 330, label: "data points mapped as a team" },
            { value: 3, label: "recommendations" },
        ],
        link: {
            label: "Read the research report",
            href: "https://docs.google.com/document/d/1A3DYPNe7f7799FZ6WSzoFFgkkHUHTBwmLgYzPkPPsjs/edit",
        },
    },
}

const ORDER = ["briefs", "general-motors", "intel", "budgetcart", "openlibrary"]

type Item = {
    image?: any
    imageUrl?: string
    video?: string
    videoUrl?: string
    caption?: string
    size?: "wide" | "half"
    alt?: string
    rotate?: string | number
}

// Some recordings were captured sideways (the GM cab screen). "Rotate" turns the clip upright and
// sizes the frame to the turned picture, so there are no black bars.
function turn(item: Item): number {
    const r = Number(item.rotate) || 0
    return r === 90 || r === -90 || r === 270 || r === 180 ? (r === 270 ? -90 : r) : 0
}

function Shot({
    item,
    vref,
    eager,
    lightbox,
}: {
    item: Item
    vref?: React.RefObject<HTMLVideoElement>
    eager?: boolean
    lightbox?: boolean
}) {
    const deg = turn(item)
    const side = deg === 90 || deg === -90
    const [ar, setAr] = useState(16 / 10)
    const src = imgSrc(item.image)
    const label = item.caption || item.alt || "Screen"
    const size = (w: number, h: number) => {
        if (w && h) setAr(side ? h / w : w / h)
    }
    const media = item.video ? (
        <video
            ref={vref}
            src={item.video}
            poster={src || undefined}
            muted={!lightbox}
            loop={!lightbox}
            controls={lightbox && !side}
            autoPlay={lightbox}
            playsInline
            preload={eager || lightbox ? "auto" : "metadata"}
            aria-label={label}
            onLoadedMetadata={(e) => size(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        />
    ) : (
        <img
            src={src}
            alt={item.alt || item.caption || ""}
            loading={eager || lightbox ? "eager" : "lazy"}
            onLoad={(e) => size(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
        />
    )
    if (!deg) return media
    return (
        <div
            className="cs2-turn"
            data-side={side}
            style={{ "--ar": ar, "--deg": `${deg}deg` } as React.CSSProperties}
        >
            {media}
        </div>
    )
}

// Shared link arrow (one look across Dhwani's components, Oct 22): 14px, 1.5px stroke, round
// caps, currentColor. "ne" (↗) for links that leave the site, "e" (→) for links inside it.
// Hover/focus nudges it 2px (ARROW_CSS); reduced motion keeps it still.
function DbArrow({ external = false }: { external?: boolean }) {
    return (
        <svg
            className="db-arrow"
            data-dir={external ? "ne" : "e"}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {external ? <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
        </svg>
    )
}
const ARROW_CSS = `.db-arrow{flex-shrink:0;display:inline-block;vertical-align:-.125em;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
a:hover .db-arrow[data-dir=e],a:focus-visible .db-arrow[data-dir=e]{transform:translateX(2px)}
a:hover .db-arrow[data-dir=ne],a:focus-visible .db-arrow[data-dir=ne]{transform:translate(2px,-2px)}
@media (prefers-reduced-motion:reduce){.db-arrow{transition:none !important;transform:none !important}}`

function norm(m: Item): Item {
    return { ...m, image: m.image || m.imageUrl || "", video: m.video || m.videoUrl || "" }
}

function imgSrc(image: any): string {
    if (!image) return ""
    if (typeof image === "string") return image
    return image.src || image.url || ""
}

function useReduced() {
    const [r, setR] = useState(false)
    useEffect(() => {
        const m = window.matchMedia("(prefers-reduced-motion: reduce)")
        const s = () => setR(m.matches)
        s()
        m.addEventListener("change", s)
        return () => m.removeEventListener("change", s)
    }, [])
    return r
}

const glare = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--gx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
    e.currentTarget.style.setProperty("--gy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
}

function Media({
    item,
    onOpen,
    reduced,
    eager,
}: {
    item: Item
    onOpen: (i: Item) => void
    reduced: boolean
    eager?: boolean
}) {
    const ref = useRef<HTMLVideoElement>(null)
    const [playing, setPlaying] = useState(false)
    useEffect(() => {
        const v = ref.current
        if (!v || reduced) return
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => {})
                else {
                    v.pause()
                    setPlaying(false)
                }
            },
            { threshold: 0.35 }
        )
        io.observe(v)
        return () => io.disconnect()
    }, [reduced, item.video])
    const label = item.caption || item.alt || "Screen"
    return (
        <figure className="cs2-fig" data-size={item.size || "wide"}>
            <div className="cs2-frame" onPointerMove={glare}>
                <Shot item={item} vref={ref} eager={eager} />
                <div className="cs2-tools">
                    {item.video && (
                        <button
                            type="button"
                            className="cs2-tool"
                            aria-label={playing ? "Pause video" : "Play video"}
                            onClick={() => {
                                const v = ref.current
                                if (!v) return
                                if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {})
                                else {
                                    v.pause()
                                    setPlaying(false)
                                }
                            }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                {playing ? <path d="M8 5v14M16 5v14" /> : <path d="M8 5.5v13l10-6.5z" />}
                            </svg>
                        </button>
                    )}
                    <button
                        type="button"
                        className="cs2-tool"
                        aria-label={`View larger: ${label}`}
                        onClick={() => onOpen(item)}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
                        </svg>
                    </button>
                </div>
            </div>
            {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
    )
}

function Lightbox({ item, onClose }: { item: Item | null; onClose: () => void }) {
    const dlg = useRef<HTMLDialogElement>(null)
    useEffect(() => {
        const d = dlg.current
        if (!d) return
        if (item && !d.open) d.showModal()
        if (!item && d.open) d.close()
    }, [item])
    return (
        <dialog
            ref={dlg}
            className="cs2-dialog"
            aria-label={item?.caption || "Screen"}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === dlg.current) onClose()
            }}
        >
            {item && (
                <>
                    <div className="cs2-dialog-bar">
                        <span>{item.caption || ""}</span>
                        <button type="button" onClick={onClose}>
                            Close
                        </button>
                    </div>
                    <Shot item={item} lightbox />
                </>
            )}
        </dialog>
    )
}

function Count({ value, suffix = "", reduced }: { value: number; suffix?: string; reduced: boolean }) {
    const ref = useRef<HTMLSpanElement>(null)
    const [n, setN] = useState(reduced ? value : 0)
    useEffect(() => {
        if (reduced) {
            setN(value)
            return
        }
        const el = ref.current
        if (!el) return
        let raf = 0
        const io = new IntersectionObserver(
            ([e]) => {
                if (!e.isIntersecting) return
                io.disconnect()
                const t0 = performance.now()
                const dur = Math.min(1400, 500 + value * 4)
                const tick = (t: number) => {
                    const k = Math.min(1, (t - t0) / dur)
                    setN(Math.round(value * (1 - Math.pow(1 - k, 3))))
                    if (k < 1) raf = requestAnimationFrame(tick)
                }
                raf = requestAnimationFrame(tick)
            },
            { threshold: 0.6 }
        )
        io.observe(el)
        return () => {
            io.disconnect()
            cancelAnimationFrame(raf)
        }
    }, [value, reduced])
    return (
        <span ref={ref} aria-hidden="true">
            {n}
            {suffix}
        </span>
    )
}

// Adds .in to [data-rv] blocks as they scroll in, and drives the reading bar.
function useMotion(root: React.RefObject<HTMLElement>, reduced: boolean) {
    useEffect(() => {
        const el = root.current
        if (!el) return
        if (reduced) {
            el.querySelectorAll("[data-rv]").forEach((n) => n.classList.add("in"))
            return
        }
        el.classList.add("cs2-js")
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("in")
                        io.unobserve(e.target)
                    }
                }),
            { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
        )
        el.querySelectorAll("[data-rv]").forEach((n) => io.observe(n))
        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const doc = document.documentElement
                const max = Math.max(1, doc.scrollHeight - window.innerHeight)
                const p = Math.min(1, Math.max(0, window.scrollY / max))
                el.style.setProperty("--cs2-p", p.toFixed(4))
            })
        }
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            io.disconnect()
            cancelAnimationFrame(raf)
            window.removeEventListener("scroll", onScroll)
        }
    }, [reduced])
}

type Stop = { id: string; label: string }

// Section nav: chips under the header + a rail with words on wide screens.
function SectionNav({ stops, reduced }: { stops: Stop[]; reduced: boolean }) {
    const [active, setActive] = useState(stops[0]?.id || "")
    const [showRail, setShowRail] = useState(false)
    const key = stops.map((s) => s.id).join("|")
    useEffect(() => {
        let io: IntersectionObserver | null = null
        const t = setTimeout(() => {
            const els = stops.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
            if (!els.length) return
            io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) setActive(e.target.id)
                    })
                },
                { rootMargin: "-35% 0px -55% 0px" }
            )
            els.forEach((n) => io!.observe(n))
        }, 300)
        const onScroll = () => setShowRail(window.scrollY > 420)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            clearTimeout(t)
            if (io) io.disconnect()
            window.removeEventListener("scroll", onScroll)
        }
    }, [key])
    const go = (e: React.MouseEvent, id: string) => {
        const el = document.getElementById(id)
        if (!el) return
        e.preventDefault()
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: reduced ? "auto" : "smooth" })
        try {
            history.replaceState(null, "", `#${id}`)
        } catch {}
        setActive(id)
    }
    const items = (cls: string, focusable: boolean) =>
        stops.map((s, i) => (
            <li key={s.id}>
                <a
                    href={`#${s.id}`}
                    className={cls}
                    tabIndex={focusable ? undefined : -1}
                    aria-current={active === s.id ? "location" : undefined}
                    onClick={(e) => go(e, s.id)}
                >
                    <span className="cs2-n">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                </a>
            </li>
        ))
    return (
        <>
            <nav className="cs2-chips" aria-label="Sections">
                <ol>{items("cs2-chip", true)}</ol>
            </nav>
            <nav className="cs2-rail" data-show={showRail} aria-hidden="true">
                <ol>{items("cs2-railitem", false)}</ol>
            </nav>
        </>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function CaseStudy(props: any) {
    const {
        project = "openlibrary",
        clips = [],
        showNext = true,
        casePath = "/work/",
        backLink = "/#work",
        part = "all",
        style,
    } = props
    const top = part !== "rest"
    const bottom = part !== "intro"
    const c = CASES[project] || CASES.openlibrary
    const items: Item[] = (clips || []).filter(Boolean).map(norm).filter((m: Item) => m.video || imgSrc(m.image))
    const [hero, ...rest] = items
    const reduced = useReduced()
    const [open, setOpen] = useState<Item | null>(null)
    const rootRef = useRef<HTMLElement>(null)
    useMotion(rootRef, reduced)
    const idx = ORDER.indexOf(project)
    const next = ORDER[(idx + 1) % ORDER.length]
    const nextCase = CASES[next]
    const base = casePath.endsWith("/") ? casePath : casePath + "/"
    const stops: Stop[] = [
        { id: "overview", label: "Overview" },
        { id: "short", label: "The short version" },
        ...(rest.length ? [{ id: "screens", label: "Screens" }] : []),
        { id: "decision", label: "The decision" },
        { id: "outcome", label: "What's still open" },
    ]

    return (
        <article ref={rootRef} className="cs2" data-part={part} style={style} data-db-keep="">
            <style>{CSS + ARROW_CSS}</style>
            {top && <div className="cs2-bar" aria-hidden="true" />}
            {top && (
                <>
                    <a className="cs2-back" href={backLink}>
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M13 8H3M7 4 3 8l4 4" />
                        </svg>
                        All work
                    </a>

                    <header id="overview" className="cs2-head" data-rv="">
                        <p className="cs2-eyebrow">{c.org}</p>
                        <h1 className="cs2-name">
                            {c.name}
                            <span aria-hidden="true">.</span>
                        </h1>
                        <p className="cs2-line">{c.line}</p>
                        <dl className="cs2-meta">
                            {c.meta.map(([k, v]) => (
                                <div key={k}>
                                    <dt>{k}</dt>
                                    <dd>{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </header>

                    <SectionNav stops={stops} reduced={reduced} />

                    {hero && (
                        <div className="cs2-hero" data-rv="">
                            <Media item={{ ...hero, size: "wide" }} onOpen={setOpen} reduced={reduced} eager />
                        </div>
                    )}

                    {c.stats && c.stats.length > 0 && (
                        <dl className="cs2-stats" data-rv="">
                            {c.stats.map((st) => (
                                <div key={st.label}>
                                    <dt>
                                        <span className="cs2-sr">
                                            {st.value}
                                            {st.suffix || ""}
                                        </span>
                                        <Count value={st.value} suffix={st.suffix} reduced={reduced} />
                                    </dt>
                                    <dd>{st.label}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    <section id="short" className="cs2-short" aria-label="The short version" data-rv="">
                        <p className="cs2-eyebrow">The short version</p>
                        <ol>
                            <li>
                                <span>01 · The problem</span>
                                <p>{c.problem}</p>
                            </li>
                            <li>
                                <span>02 · The shift</span>
                                <p>{c.shift}</p>
                            </li>
                            <li>
                                <span>03 · Where it landed</span>
                                <p>{c.landed}</p>
                            </li>
                        </ol>
                    </section>

                    {rest.length > 0 && (
                        <section id="screens" className="cs2-screens" aria-label="Screens" data-rv="">
                            {rest.map((m, i) => (
                                <Media key={(m.video || imgSrc(m.image)) + i} item={m} onOpen={setOpen} reduced={reduced} />
                            ))}
                        </section>
                    )}
                </>
            )}

            {bottom && (
                <>
                    <section id="decision" className="cs2-decision" aria-label="The decision" data-rv="" onPointerMove={glare}>
                        <p className="cs2-eyebrow">The decision</p>
                        <h2>{c.decision.title}</h2>
                        <div className="cs2-dgrid">
                            <div>
                                <span>We chose</span>
                                <p>{c.decision.chose}</p>
                            </div>
                            <div>
                                <span>Over</span>
                                <p className="cs2-over">{c.decision.over}</p>
                            </div>
                            <div className="cs2-why">
                                <span>Why</span>
                                <p>{c.decision.because}</p>
                            </div>
                        </div>
                    </section>

                    <section id="outcome" className="cs2-out" aria-label="What's still open" data-rv="">
                        <p className="cs2-eyebrow">What's still open</p>
                        <div className="cs2-limits">
                            <span>Limits</span>
                            <p>{c.outcome.limits}</p>
                        </div>
                        <div className="cs2-nextq" onPointerMove={glare}>
                            <span>Next question</span>
                            <p>{c.outcome.next}</p>
                        </div>
                        {c.link && (
                            <a className="cs2-pill" href={c.link.href} target="_blank" rel="noopener noreferrer">
                                {c.link.label}
                                <DbArrow external={/^https?:\/\//i.test(c.link.href)} />
                            </a>
                        )}
                    </section>

                    {showNext && nextCase && (
                        <a className="cs2-next" href={`${base}${next}`} data-rv="">
                            <span className="cs2-eyebrow">Next case study</span>
                            <span className="cs2-next-t">
                                {nextCase.name}
                                <DbArrow />
                            </span>
                            <span className="cs2-next-l">{nextCase.line}</span>
                        </a>
                    )}
                </>
            )}

            <Lightbox item={open} onClose={() => setOpen(null)} />
        </article>
    )
}

const CSS = `
.cs2{--acc:var(--db-accent,#F3500F);--tx:var(--db-text,#fff);--tx2:var(--db-text-2,rgba(255,255,255,.64));--line:var(--db-line,rgba(255,255,255,.1));--surf:var(--db-surface,rgba(255,255,255,.04));--gut:clamp(24px,7vw,96px);width:100%;max-width:calc(920px + 2 * var(--gut));margin:0 auto;padding:clamp(96px,12vw,136px) var(--gut) clamp(56px,8vw,104px);color:var(--tx);font-family:'Poppins',sans-serif;box-sizing:border-box}
.cs2 *{box-sizing:border-box}
.cs2[data-part=intro]{padding-bottom:clamp(24px,4vw,48px)}
.cs2[data-part=rest]{padding-top:clamp(24px,4vw,48px)}
.cs2[data-part=rest] .cs2-decision{margin-top:0}
.cs2 a{color:inherit}
.cs2 :is(a,button):focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:8px}
.cs2-back{display:inline-flex;align-items:center;gap:8px;min-height:44px;font-size:14px;font-weight:500;text-decoration:none;color:var(--tx2)}
.cs2-back:hover{color:var(--tx)}
.cs2-back svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.cs2-back:hover svg{transform:translateX(-2px)}
.cs2-eyebrow{margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--tx2)}
.cs2-head{padding-top:clamp(20px,4vw,40px);scroll-margin-top:96px}
.cs2-name{position:relative;margin:0;font:600 clamp(48px,8vw,96px)/1.02 'Poppins',sans-serif;letter-spacing:-.035em}
.cs2-name span{display:inline-block;color:var(--acc)}
.cs2-line{margin:clamp(16px,2.4vw,24px) 0 0;max-width:32ch;font-size:clamp(20px,2.4vw,28px);line-height:1.35;font-weight:400;letter-spacing:-.01em}
.cs2-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:20px 28px;margin:clamp(32px,5vw,48px) 0 0;padding-top:24px;border-top:1px solid var(--line)}
.cs2-meta div{margin:0}
.cs2-meta dt{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--tx2)}
.cs2-meta dd{margin:6px 0 0;font-size:15px;line-height:1.5}
.cs2-chips{margin-top:clamp(24px,4vw,36px);padding:14px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.cs2-chips ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.cs2-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border-radius:999px;box-shadow:0 0 0 1px var(--line);font-size:13px;font-weight:500;text-decoration:none;white-space:nowrap;transition:box-shadow .25s,background .25s,transform .25s}
.cs2-chip:hover{box-shadow:0 0 0 1px var(--acc);transform:translateY(-1px)}
.cs2-chip[aria-current]{background:color-mix(in srgb,var(--acc) 12%,transparent);box-shadow:0 0 0 1px color-mix(in srgb,var(--acc) 55%,transparent)}
.cs2-n{font-size:11px;font-weight:600;color:var(--acc);font-variant-numeric:tabular-nums}
.cs2-rail{display:none}
@media (min-width:1280px){
.cs2-rail{display:block;position:fixed;z-index:40;top:50%;left:max(16px,calc((100vw - 920px) / 2 - 236px));width:190px;transform:translate(-8px,-50%);opacity:0;pointer-events:none;transition:opacity .35s,transform .45s cubic-bezier(.16,1,.3,1)}
.cs2-rail[data-show=true]{opacity:1;transform:translate(0,-50%);pointer-events:auto}
.cs2-rail ol{list-style:none;margin:0;padding:0;display:grid;gap:2px;border-left:1px solid var(--line)}
.cs2-railitem{position:relative;display:flex;align-items:center;gap:10px;min-height:36px;padding:0 0 0 16px;font-size:13px;font-weight:500;text-decoration:none;color:var(--tx2);transition:color .2s}
.cs2-railitem::before{content:"";position:absolute;left:-1px;top:8px;bottom:8px;width:2px;border-radius:2px;background:var(--acc);transform:scaleY(0);transition:transform .3s cubic-bezier(.16,1,.3,1)}
.cs2-railitem:hover,.cs2-railitem[aria-current]{color:var(--tx)}
.cs2-railitem[aria-current]::before{transform:scaleY(1)}
}
.cs2-hero{margin-top:clamp(32px,5vw,56px)}
.cs2-fig{margin:0;min-width:0}
.cs2-frame{position:relative;overflow:hidden;border-radius:clamp(14px,2vw,22px);background:var(--surf);box-shadow:0 30px 60px -36px rgba(0,0,0,.55),0 0 0 1px var(--line);transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s}
.cs2-frame img,.cs2-frame video{display:block;width:100%;height:auto;max-height:82vh;object-fit:contain;background:#0b0b0d;transition:transform .8s cubic-bezier(.16,1,.3,1)}
.cs2-turn{position:relative;width:100%;aspect-ratio:var(--ar);overflow:hidden;background:#0b0b0d}
.cs2-turn>img,.cs2-turn>video{position:absolute !important;top:50%;left:50%;width:100% !important;height:100% !important;max-height:none !important;object-fit:contain;transform:translate(-50%,-50%) rotate(var(--deg)) !important}
.cs2-turn[data-side=true]>img,.cs2-turn[data-side=true]>video{width:calc(100% / var(--ar)) !important;height:auto !important}
.cs2-dialog .cs2-turn{width:min(100%,calc((92vh - 56px) * var(--ar)));margin:0 auto}
.cs2-frame::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(600px circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.12),transparent 45%)}
.cs2-frame:hover{transform:translateY(-4px);box-shadow:0 40px 70px -36px rgba(0,0,0,.6),0 0 0 1px color-mix(in srgb,var(--acc) 35%,var(--line))}
.cs2-frame:hover::after{opacity:1}
.cs2-frame:hover img,.cs2-frame:hover video{transform:scale(1.012)}
.cs2-tools{position:absolute;z-index:2;right:12px;bottom:12px;display:flex;gap:8px;opacity:0;transform:translateY(4px);transition:opacity .25s,transform .25s}
.cs2-fig:hover .cs2-tools,.cs2-fig:focus-within .cs2-tools{opacity:1;transform:none}
@media (hover:none){.cs2-tools{opacity:1;transform:none}}
.cs2-tool{width:44px;height:44px;display:grid;place-items:center;border:.5px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(18,18,22,.55);-webkit-backdrop-filter:blur(16px) saturate(180%);backdrop-filter:blur(16px) saturate(180%);color:#fff;cursor:pointer;transition:transform .2s}
.cs2-tool:hover{transform:scale(1.08)}
.cs2-tool svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cs2-tool svg path[d^="M8 5.5"]{fill:currentColor;stroke:none}
.cs2-fig figcaption{margin:12px 2px 0;font-size:14px;line-height:1.5;color:var(--tx2)}
.cs2-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,32px);margin:clamp(40px,6vw,64px) 0 0}
.cs2-stats div{margin:0}
.cs2-stats dt{font-size:clamp(40px,5.5vw,64px);font-weight:600;line-height:1;letter-spacing:-.03em;color:var(--acc);font-variant-numeric:tabular-nums}
.cs2-stats dd{margin:10px 0 0;font-size:14px;line-height:1.45;color:var(--tx2);max-width:22ch}
.cs2-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.cs2-short{margin-top:clamp(48px,8vw,88px);scroll-margin-top:96px}
.cs2-short ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,32px)}
.cs2-short li{position:relative;padding-top:16px;border-top:1px solid var(--line)}
.cs2-short li::before{content:"";position:absolute;left:0;top:-1px;height:2px;width:0;background:var(--acc);transition:width .5s cubic-bezier(.16,1,.3,1)}
.cs2-short.in li::before,.cs2:not(.cs2-js) .cs2-short li::before{width:28px}
.cs2-short li:hover::before{width:100%}
.cs2-short li span,.cs2-dgrid span,.cs2-limits span,.cs2-nextq span{display:block;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}
.cs2-short li p{margin:10px 0 0;font-size:clamp(16px,1.6vw,19px);line-height:1.5;font-weight:500;letter-spacing:-.005em}
.cs2-screens{margin-top:clamp(48px,8vw,88px);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(16px,3vw,32px);scroll-margin-top:96px}
.cs2-screens .cs2-fig[data-size=wide]{grid-column:1/-1}
.cs2-decision{position:relative;overflow:hidden;margin-top:clamp(48px,8vw,96px);padding:clamp(22px,4vw,40px);border-radius:clamp(18px,2.4vw,28px);background:var(--surf);box-shadow:0 0 0 1px var(--line);scroll-margin-top:96px}
.cs2-decision h2{margin:0;font-size:clamp(26px,3.2vw,38px);line-height:1.15;font-weight:600;letter-spacing:-.02em}
.cs2-dgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 32px;margin-top:clamp(20px,3vw,32px)}
.cs2-dgrid p,.cs2-limits p{margin:8px 0 0;font-size:16px;line-height:1.55}
.cs2-dgrid span,.cs2-limits span{color:var(--tx2)}
.cs2-over{color:var(--tx2);background:linear-gradient(color-mix(in srgb,var(--acc) 80%,transparent),color-mix(in srgb,var(--acc) 80%,transparent)) no-repeat 0 55%/0% 1.5px;transition:background-size .8s cubic-bezier(.65,0,.35,1) .35s}
.cs2-decision.in .cs2-over,.cs2:not(.cs2-js) .cs2-over{background-size:100% 1.5px}
.cs2-why{grid-column:1/-1}
.cs2-why p{font-size:clamp(17px,1.8vw,20px)}
.cs2-out{margin-top:clamp(48px,8vw,96px);scroll-margin-top:96px}
.cs2-limits,.cs2-nextq{position:relative;overflow:hidden;padding:20px 22px;border-radius:18px;background:var(--surf);box-shadow:0 0 0 1px var(--line)}
.cs2-nextq{margin-top:16px;box-shadow:0 0 0 1px color-mix(in srgb,var(--acc) 45%,transparent);background:color-mix(in srgb,var(--acc) 7%,transparent)}
.cs2-nextq p{margin:8px 0 0;font-size:clamp(19px,2.2vw,26px);line-height:1.35;font-weight:500}
.cs2-decision::before,.cs2-nextq::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(420px circle at var(--gx,50%) var(--gy,50%),color-mix(in srgb,var(--acc) 14%,transparent),transparent 60%)}
.cs2-decision:hover::before,.cs2-nextq:hover::before{opacity:1}
.cs2-pill{display:inline-flex;align-items:center;gap:8px;min-height:44px;margin-top:20px;padding:0 18px;border-radius:999px;box-shadow:0 0 0 1px var(--line);font-size:14px;font-weight:600;text-decoration:none;transition:box-shadow .3s,transform .3s}
.cs2-pill:hover{transform:translateY(-2px);box-shadow:0 0 0 1px var(--acc)}
.cs2-next .cs2-eyebrow{display:block}
.cs2-next{display:block;margin-top:clamp(56px,9vw,104px);padding-top:28px;border-top:1px solid var(--line);text-decoration:none}
.cs2-next-t{display:inline-flex;align-items:center;gap:12px;padding-bottom:4px;font-size:clamp(32px,5vw,52px);font-weight:600;letter-spacing:-.025em;line-height:1.1;background:linear-gradient(var(--acc),var(--acc)) no-repeat 0 100%/0% 2px;transition:background-size .5s cubic-bezier(.16,1,.3,1)}
.cs2-next-t .db-arrow{width:.62em;height:.62em}
.cs2-next:hover .cs2-next-t{background-size:100% 2px}
.cs2-next-l{display:block;margin-top:10px;max-width:56ch;font-size:15px;line-height:1.5;color:var(--tx2)}
.cs2-bar{position:fixed;left:0;top:0;height:3px;width:100%;z-index:60;transform-origin:0 50%;transform:scaleX(var(--cs2-p,0));background:linear-gradient(90deg,var(--acc),color-mix(in srgb,var(--acc) 55%,#fff));pointer-events:none}
.cs2-js .cs2-head .cs2-name{clip-path:inset(0 100% 0 0);transition:clip-path .9s cubic-bezier(.65,0,.35,1) .1s}
.cs2-js .cs2-head.in .cs2-name{clip-path:inset(-10% -10% -20% 0)}
.cs2-js .cs2-head.in .cs2-name span{animation:cs2-pop .6s cubic-bezier(.3,1.6,.5,1) .85s both}
@keyframes cs2-pop{0%{transform:scale(0)}100%{transform:scale(1)}}
.cs2-js [data-rv]:not(.cs2-head){opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .8s cubic-bezier(.16,1,.3,1)}
.cs2-js [data-rv].in{opacity:1;transform:none}
.cs2-js .cs2-short li,.cs2-js .cs2-screens .cs2-fig,.cs2-js .cs2-stats>div{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .7s cubic-bezier(.16,1,.3,1)}
.cs2-js .cs2-short.in li,.cs2-js .cs2-screens.in .cs2-fig,.cs2-js .cs2-stats.in>div{opacity:1;transform:none}
.cs2-js .in li:nth-child(2),.cs2-js .in>.cs2-fig:nth-child(2),.cs2-js .cs2-stats.in>div:nth-child(2){transition-delay:.12s}
.cs2-js .in li:nth-child(3),.cs2-js .in>.cs2-fig:nth-child(3),.cs2-js .cs2-stats.in>div:nth-child(3){transition-delay:.24s}
.cs2-js .in>.cs2-fig:nth-child(4){transition-delay:.36s}
.cs2-dialog{width:min(1200px,94vw);max-height:92vh;padding:0;border:0;border-radius:18px;background:#0b0b0d;color:#fff;overflow:hidden}
.cs2-dialog::backdrop{background:rgba(0,0,0,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.cs2-dialog-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 8px 8px 16px;font:500 13px 'Poppins',sans-serif}
.cs2-dialog-bar button{min-height:40px;padding:0 16px;border:0;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font:600 13px 'Poppins',sans-serif;cursor:pointer}
.cs2-dialog img,.cs2-dialog video{display:block;width:100%;max-height:calc(92vh - 56px);object-fit:contain}
@media (max-width:760px){
.cs2-stats{gap:12px}
.cs2-stats dt{font-size:clamp(30px,9vw,40px)}
.cs2-stats dd{font-size:12px}
.cs2-short ol,.cs2-screens,.cs2-dgrid{grid-template-columns:1fr}
.cs2-screens .cs2-fig{grid-column:auto}
.cs2-chips ol{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 calc(-1 * var(--gut));padding:0 var(--gut)}
.cs2-chips ol::-webkit-scrollbar{display:none}
}
@media (prefers-reduced-motion:reduce){.cs2 *{transition:none !important;animation:none !important}.cs2-bar{display:none}.cs2-frame:hover,.cs2-frame:hover img,.cs2-frame:hover video{transform:none}}
`

addPropertyControls(CaseStudy, {
    project: {
        type: ControlType.Enum,
        title: "Project",
        options: ORDER,
        optionTitles: ORDER.map((s) => CASES[s].name),
        defaultValue: "openlibrary",
    },
    clips: {
        type: ControlType.Array,
        title: "Screens & photos",
        description: "The first one is the big hero. Add an image, a video, or both (image = poster).",
        control: {
            type: ControlType.Object,
            controls: {
                image: { type: ControlType.Image, title: "Image" },
                video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm", "mov"] },
                imageUrl: { type: ControlType.String, title: "Image URL", defaultValue: "", description: "Optional: a link instead of an upload." },
                rotate: {
                    type: ControlType.Enum,
                    title: "Rotate",
                    options: ["0", "90", "-90", "180"],
                    optionTitles: ["None", "90° right", "90° left", "180°"],
                    defaultValue: "0",
                    description: "For clips recorded sideways.",
                },
                videoUrl: { type: ControlType.String, title: "Video URL", defaultValue: "" },
                caption: { type: ControlType.String, title: "Caption", defaultValue: "" },
                alt: { type: ControlType.String, title: "Alt text", defaultValue: "" },
                size: {
                    type: ControlType.Enum,
                    title: "Size",
                    options: ["wide", "half"],
                    optionTitles: ["Wide", "Half"],
                    defaultValue: "wide",
                    displaySegmentedControl: true,
                },
            },
        },
        defaultValue: [],
    },
    showNext: { type: ControlType.Boolean, title: "Next case link", defaultValue: true },
    casePath: { type: ControlType.String, title: "Case pages live at", defaultValue: "/work/" },
    backLink: { type: ControlType.String, title: "Back link", defaultValue: "/#work" },
    part: {
        type: ControlType.Enum,
        title: "Show",
        options: ["all", "intro", "rest"],
        optionTitles: ["All", "Intro + screens", "Decision → end"],
        defaultValue: "all",
        description: "Split it in two to put something (a prototype, a reel) in the middle.",
    },
})
