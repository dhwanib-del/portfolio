// SelectedWork v3 — "work reel". Dhwani (Oct 2): "look at the cards and scroll on this"
// (brandonux.design): a pinned section where scrolling down moves the project cards sideways,
// with a 01/06 counter and ← → arrows. Each card: media, title, one result line, tags, 2–3 blunt
// lines, "Read the study". Plus: Prime Video is NDA, no fake numbers, super accessible, light mode.
//  • Desktop (≥ 900px, motion allowed): section pins; vertical scroll drives the horizontal track.
//  • Reduced motion or < 900px: no scroll-jacking. Phones get a vertical stack; reduced-motion
//    desktop gets a normal sideways scroller with arrows.
//  • Every card is one real link (article > a). Arrows are buttons with labels. Tabbing into an
//    off-screen card scrolls it into view. Counter is text, not color.
//  • Media: set a video (or image) per card in the right panel. Videos are muted, loop, and pause
//    under reduced motion. No media → a calm tile with the project name, never an empty box.
//  • Colors from the site tokens (--db-*), so it matches the nav and flips with light mode.
// v3 (Oct 2: "when i hover over can it enlarge?"): cards grow slightly on hover/focus and the
// media zooms inside its frame (off under reduced motion). NDA card shows a lock, reveals
// "walkthrough on request" on hover, and links to the contact section instead of a dead tile.
// "Case pages live at": links written as /work/<slug> are sent there (the new CaseStudy pages
// are at /projects/<slug>); set it back to /work/ if the pages move.
// Oct 3: restored after the 2-up card grid from the Next.js site was rejected.
// Oct 4: font pairing — wrap a word in *stars* in the heading to set it in Pinyon Script.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useCallback, useEffect, useRef, useState } from "react"

type Card = {
    title: string
    result: string
    tags: string
    body: string
    link: string
    cta: string
    video?: string
    image?: { src: string; alt?: string }
    nda?: boolean
}

interface Props {
    eyebrow: string
    heading: string
    cards: Card[]
    ndaLink: string
    casePath: string
    style?: React.CSSProperties
}

const FONT = "'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive"

// Font pairing: "Six *projects*." → "projects" in the script face. No stars → plain text.
function renderHeading(t: string) {
    const parts = String(t || "").split(/(\*[^*]+\*)/g)
    return parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
            <span key={i} className="sw-script">{p.slice(1, -1)}</span>
        ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
        )
    )
}

const DEFAULT_CARDS: Card[] = [
    { title: "BRIEFS · UM DPSS", result: "Prototype + PRD, not shipped", tags: "Public safety, Research, AI", body: "The information was there. The hard part was finding it during a call. I gave every building profile the same sections, and an assistant that cites its source.", link: "/work/briefs", cta: "Read the study" },
    { title: "Intel workspace · UM DPSS", result: "In use by the team", tags: "Workflow, Apps Script, Chatbot", body: "The Intelligence Group ran on spreadsheets. I built the workspace in Google Apps Script so we could test it safely. Public tips now come in through a chatbot.", link: "/work/intel", cta: "Read the study" },
    { title: "Convoy · General Motors", result: "3 usability tests in a truck cab", tags: "HMI, Prototyping, Figma", body: "In-cab HVAC controls, prototyped in Figma and run on real screens. We tested in a 3D-printed truck cab.", link: "/work/general-motors", cta: "Read the study" },
    { title: "Prime Video · Capstone", result: "Under NDA", tags: "Streaming, Capstone", body: "Current capstone with Prime Video. Nothing goes here until it's cleared. Ask me about the process.", link: "", cta: "Ask me about it", nda: true },
    { title: "Open Library · Internet Archive", result: "Open Library changed the product", tags: "Research, Multilingual, Accessibility", body: "Readers couldn't tell what a non-English scan offered. I ran the research and pushed three recommendations. Open Library added clearer feedback and context for international books.", link: "/work/openlibrary", cta: "Read the study" },
    { title: "BudgetCart · UMSI", result: "Concept", tags: "Grocery, AI, Budgeting", body: "Shoppers find out they're over budget at the register. BudgetCart shows what fits before checkout, with an AI-built cart.", link: "/work/budgetcart", cta: "Read the study" },
]

function pad(n: number) {
    return n < 10 ? "0" + n : String(n)
}

function Lock() {
    return (
        <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SelectedWork(props: Props) {
    const { eyebrow = "selected work", heading = "Six projects. Real outcomes, or an honest status.", cards = DEFAULT_CARDS, ndaLink = "/#contact", casePath = "/projects/" } = props
    const list = cards && cards.length ? cards : DEFAULT_CARDS
    const base = (casePath || "/work/").replace(/\/?$/, "/")
    const fixLink = (href: string) => href.replace(/^(\.?\/)?work\//, base)
    const outerRef = useRef<HTMLDivElement | null>(null)
    const viewRef = useRef<HTMLDivElement | null>(null)
    const trackRef = useRef<HTMLDivElement | null>(null)
    const [mode, setMode] = useState<"pin" | "row" | "stack">("stack")
    const [dist, setDist] = useState(0)
    const [x, setX] = useState(0)
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (typeof window === "undefined") return
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const wide = window.matchMedia("(min-width: 900px)")
        const pick = () => startTransition(() => setMode(!wide.matches ? "stack" : rm.matches ? "row" : "pin"))
        pick()
        rm.addEventListener("change", pick)
        wide.addEventListener("change", pick)
        return () => {
            rm.removeEventListener("change", pick)
            wide.removeEventListener("change", pick)
        }
    }, [])

    useEffect(() => {
        if (typeof window === "undefined" || mode !== "pin") return
        const measure = () => {
            const t = trackRef.current
            const v = viewRef.current
            if (!t || !v) return
            startTransition(() => setDist(Math.max(0, t.scrollWidth - v.clientWidth)))
        }
        measure()
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null
        if (ro && trackRef.current) ro.observe(trackRef.current)
        window.addEventListener("resize", measure)
        return () => {
            ro?.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [mode, list.length])

    useEffect(() => {
        if (typeof window === "undefined" || mode !== "pin") return
        let raf = 0
        const run = () => {
            raf = 0
            const o = outerRef.current
            if (!o) return
            const r = o.getBoundingClientRect()
            const p = Math.min(1, Math.max(0, -r.top / Math.max(1, dist)))
            startTransition(() => {
                setX(p * dist)
                setIndex(Math.min(list.length - 1, Math.round(p * (list.length - 1))))
            })
        }
        const on = () => {
            if (!raf) raf = window.requestAnimationFrame(run)
        }
        run()
        window.addEventListener("scroll", on, { passive: true })
        return () => {
            window.removeEventListener("scroll", on)
            if (raf) window.cancelAnimationFrame(raf)
        }
    }, [mode, dist, list.length])

    const onRowScroll = useCallback(() => {
        const v = viewRef.current
        if (!v) return
        const max = Math.max(1, v.scrollWidth - v.clientWidth)
        startTransition(() => setIndex(Math.round((v.scrollLeft / max) * (list.length - 1))))
    }, [list.length])

    const goTo = useCallback(
        (i: number) => {
            const n = Math.max(0, Math.min(list.length - 1, i))
            if (mode === "pin") {
                const o = outerRef.current
                if (!o) return
                const top = o.getBoundingClientRect().top + window.scrollY
                window.scrollTo({ top: top + (n / Math.max(1, list.length - 1)) * dist, behavior: "smooth" })
            } else if (mode === "row") {
                const card = trackRef.current?.children[n] as HTMLElement | undefined
                card?.scrollIntoView({ block: "nearest", inline: "start" })
            }
        },
        [mode, dist, list.length]
    )

    const onCardFocus = (i: number) => () => {
        if (mode !== "stack" && i !== index) goTo(i)
    }

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
        .sw { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; }
        .sw-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; max-width: 1104px; margin: 0 auto 32px; padding: 0 20px; }
        .sw-eyebrow { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0 0 12px; }
        .sw-h { font-size: clamp(28px, 3.6vw, 40px); line-height: 1.1; letter-spacing: -.02em; font-weight: 700; margin: 0; max-width: 20ch; }
        .sw-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 1.3em; line-height: .8; letter-spacing: 0; color: inherit; }
        .sw-ctrl { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sw-count { font-size: 14px; font-variant-numeric: tabular-nums; color: var(--db-text-2, rgba(255,255,255,.6)); margin-right: 8px; }
        .sw-arrow { width: 44px; height: 44px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: transparent; color: var(--db-text, #fff); font-size: 18px; cursor: pointer; }
        .sw-arrow:hover:not(:disabled) { background: var(--db-line, rgba(255,255,255,.1)); }
        .sw-arrow:disabled { opacity: .38; cursor: default; }
        .sw a:focus-visible, .sw button:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }
        .sw-track { display: flex; gap: 24px; padding: 16px max(20px, calc((100% - 1104px) / 2)); list-style: none; margin: 0; }
        .sw-row .sw-view { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .sw-row .sw-view::-webkit-scrollbar { display: none; }
        .sw-row .sw-card { scroll-snap-align: start; }
        .sw-stack .sw-track { flex-direction: column; padding: 0 20px; }
        .sw-card { flex: 0 0 min(560px, 78vw); }
        .sw-stack .sw-card { flex: 1 1 auto; }
        .sw-link { display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 12px 12px 22px; border-radius: 24px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); color: inherit; text-decoration: none; transition: background .25s ease, transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; }
        .sw-link:hover, .sw-link:focus-visible { background: color-mix(in srgb, var(--db-text, #fff) 9%, transparent); transform: scale(1.025); box-shadow: var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,.9)); }
        .sw-media { position: relative; aspect-ratio: 16 / 10; border-radius: 16px; overflow: hidden; background: var(--db-surface, #111); }
        .sw-media video, .sw-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s cubic-bezier(.2,.7,.2,1); }
        .sw-link:hover .sw-media video, .sw-link:hover .sw-media img, .sw-link:focus-visible .sw-media video, .sw-link:focus-visible .sw-media img { transform: scale(1.06); }
        .sw-ph { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .sw-nda .sw-ph { background: repeating-linear-gradient(135deg, transparent 0 14px, var(--db-line, rgba(255,255,255,.06)) 14px 15px); }
        .sw-nda-hint { font-size: 13px; letter-spacing: .04em; text-transform: none; color: var(--db-text, #fff); opacity: 0; transform: translateY(4px); transition: opacity .25s ease, transform .25s ease; }
        .sw-link:hover .sw-nda-hint, .sw-link:focus-visible .sw-nda-hint { opacity: 1; transform: none; }
        .sw-body { padding: 0 10px; display: flex; flex-direction: column; gap: 10px; }
        .sw-title { font-size: 15px; font-weight: 500; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; }
        .sw-result { font-size: clamp(24px, 2.4vw, 30px); line-height: 1.15; letter-spacing: -.02em; font-weight: 700; margin: 0; }
        .sw-tags { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 0; padding: 0; }
        .sw-tag { font-size: 13px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); color: var(--db-text-2, rgba(255,255,255,.6)); }
        .sw-text { font-size: 16px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; max-width: 52ch; }
        .sw-cta { font-size: 15px; font-weight: 500; color: var(--db-accent, #F3500F); margin-top: 4px; }
        @media (prefers-reduced-motion: reduce) {
            .sw-link, .sw-media video, .sw-media img, .sw-nda-hint { transition: none; }
            .sw-link:hover, .sw-link:focus-visible { transform: none; }
            .sw-link:hover .sw-media video, .sw-link:hover .sw-media img, .sw-link:focus-visible .sw-media video, .sw-link:focus-visible .sw-media img { transform: none; }
            .sw-nda-hint { opacity: 1; transform: none; }
        }
        @media (hover: none) { .sw-nda-hint { opacity: 1; transform: none; } }
    `

    const cardEls = list.map((c, i) => {
        const media = c.nda ? (
            <div className="sw-ph">
                <Lock />
                <span>Under NDA</span>
                <span className="sw-nda-hint">walkthrough on request</span>
            </div>
        ) : c.video ? (
            <video src={c.video} muted loop playsInline autoPlay={mode === "pin" || mode === "stack"} preload="metadata" aria-hidden="true" />
        ) : c.image?.src ? (
            <img src={c.image.src} alt={c.image.alt || ""} loading="lazy" />
        ) : (
            <div className="sw-ph">{c.title.split(" · ")[0]}</div>
        )
        const inner = (
            <>
                <div className="sw-media">{media}</div>
                <div className="sw-body">
                    <p className="sw-title">{c.title}</p>
                    <h3 className="sw-result">{c.result}</h3>
                    <ul className="sw-tags" aria-label="Topics">
                        {(c.tags || "")
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t) => (
                                <li key={t} className="sw-tag">{t}</li>
                            ))}
                    </ul>
                    <p className="sw-text">{c.body}</p>
                    <span className="sw-cta" aria-hidden="true">{c.cta} →</span>
                </div>
            </>
        )
        const label = `${c.title}. ${c.result}. ${c.cta}`
        const href = c.link ? fixLink(c.link) : c.nda ? ndaLink : ""
        return (
            <li key={c.title + i} className={`sw-card${c.nda ? " sw-nda" : ""}`}>
                {href ? (
                    <a className="sw-link" href={href} aria-label={label} onFocus={onCardFocus(i)}>
                        {inner}
                    </a>
                ) : (
                    <article className="sw-link" tabIndex={0} aria-label={label} onFocus={onCardFocus(i)}>
                        {inner}
                    </article>
                )}
            </li>
        )
    })

    const header = (
        <div className="sw-head">
            <div>
                <p className="sw-eyebrow">{eyebrow}</p>
                <h2 className="sw-h">{renderHeading(heading)}</h2>
            </div>
            {mode !== "stack" && (
                <div className="sw-ctrl">
                    <span className="sw-count" aria-hidden="true">
                        {pad(index + 1)} / {pad(list.length)}
                    </span>
                    <button type="button" className="sw-arrow" aria-label="Previous project" disabled={index === 0} onClick={() => goTo(index - 1)}>←</button>
                    <button type="button" className="sw-arrow" aria-label="Next project" disabled={index === list.length - 1} onClick={() => goTo(index + 1)}>→</button>
                </div>
            )}
        </div>
    )

    if (mode === "pin") {
        return (
            <section className="sw" aria-label={eyebrow} style={props.style}>
                <style>{css}</style>
                <div ref={outerRef} style={{ position: "relative", height: `calc(100vh + ${dist}px)` }}>
                    <div style={{ position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
                        {header}
                        <div ref={viewRef} className="sw-view" style={{ overflow: "hidden" }}>
                            <ol ref={trackRef as any} className="sw-track" style={{ transform: `translate3d(${-x}px,0,0)`, willChange: "transform" }}>
                                {cardEls}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={`sw ${mode === "row" ? "sw-row" : "sw-stack"}`} aria-label={eyebrow} style={{ ...props.style, padding: "48px 0" }}>
            <style>{css}</style>
            {header}
            <div ref={viewRef} className="sw-view" onScroll={mode === "row" ? onRowScroll : undefined}>
                <ol ref={trackRef as any} className="sw-track">
                    {cardEls}
                </ol>
            </div>
        </section>
    )
}

addPropertyControls(SelectedWork, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "selected work" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Six projects. Real outcomes, or an honest status.", description: "Wrap a word in *stars* to set it in script." },
    ndaLink: { type: ControlType.String, title: "NDA card link", defaultValue: "/#contact" },
    casePath: { type: ControlType.String, title: "Case pages live at", defaultValue: "/projects/" },
    cards: {
        type: ControlType.Array,
        title: "Cards",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Project · Org", defaultValue: "Project · Org" },
                result: { type: ControlType.String, title: "Result", defaultValue: "Result" },
                tags: { type: ControlType.String, title: "Tags (commas)", defaultValue: "" },
                body: { type: ControlType.String, title: "2–3 lines", displayTextArea: true, defaultValue: "" },
                link: { type: ControlType.Link, title: "Link" },
                cta: { type: ControlType.String, title: "Button text", defaultValue: "Read the study" },
                video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm", "mov"] },
                image: { type: ControlType.ResponsiveImage, title: "Image (if no video)" },
                nda: { type: ControlType.Boolean, title: "NDA", defaultValue: false },
            },
        },
        defaultValue: DEFAULT_CARDS,
    },
})
