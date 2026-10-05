// SelectedWork v4 — "work reel". Dhwani (Oct 2): "look at the cards and scroll on this"
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
// v4 (Oct 5: "can selected work have some bazzaz, it's really boring" + "add a setting where it can
// adjust to the size of the frame, it's getting cut off"):
//  • Media fit per card (Section default / Cover / Contain) + a section-level default. Contain shows the
//    whole video on a soft surface. Media shape per card: 16 / 10 (default) or Auto (matches the video).
//  • Hover (mouse only, motion allowed): cursor-follow 3D tilt (max 6°, springs back), accent glow that
//    follows the pointer, media zoom 1.04, "Read the study →" pill slides in. Big outlined index numeral
//    behind the title, tags stagger in when the card enters view, counter digits roll, light grain on media.
//  • Every decorative layer is pointer-events:none and aria-hidden; each card is still exactly one link.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { startTransition, useCallback, useEffect, useRef, useState } from "react"

type Fit = "cover" | "contain"

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
    mediaFit?: "section" | Fit
    mediaAspect?: string
}

interface Props {
    eyebrow: string
    heading: string
    cards: Card[]
    ndaLink: string
    casePath: string
    mediaFit?: Fit
    style?: React.CSSProperties
}

const FONT = "'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive"
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const NOISE_SVG =
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
const NOISE = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`

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

// Digit roll: each digit is a 0–9 strip that slides to the current value.
function Roll({ value }: { value: string }) {
    return (
        <span className="sw-roll">
            {value.split("").map((d, i) => (
                <span key={i} className="sw-roll-col">
                    <span className="sw-roll-strip" style={{ transform: `translateY(${-Number(d) * 10}%)` }}>
                        {DIGITS.map((n) => (
                            <span key={n}>{n}</span>
                        ))}
                    </span>
                </span>
            ))}
        </span>
    )
}

function CardMedia({ card, fit, aspect, autoPlay }: { card: Card; fit: Fit; aspect: string; autoPlay: boolean }) {
    const vref = useRef<HTMLVideoElement | null>(null)
    const [nat, setNat] = useState<string | null>(null)
    const auto = aspect === "auto"

    const readVideo = useCallback(() => {
        const v = vref.current
        if (v && v.videoWidth > 0 && v.videoHeight > 0) {
            const r = `${v.videoWidth} / ${v.videoHeight}`
            startTransition(() => setNat(r))
        }
    }, [])

    useEffect(() => {
        const v = vref.current
        if (auto && v && v.readyState >= 1) readVideo()
    }, [auto, card.video, readVideo])

    const onImg = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const im = e.currentTarget
        if (im.naturalWidth > 0 && im.naturalHeight > 0) {
            const r = `${im.naturalWidth} / ${im.naturalHeight}`
            startTransition(() => setNat(r))
        }
    }

    const ar = auto ? nat || "16 / 10" : aspect || "16 / 10"

    const media = card.nda ? (
        <div className="sw-ph">
            <Lock />
            <span>Under NDA</span>
            <span className="sw-nda-hint">walkthrough on request</span>
        </div>
    ) : card.video ? (
        <video ref={vref} src={card.video} muted loop playsInline autoPlay={autoPlay} preload="metadata" aria-hidden="true" onLoadedMetadata={auto ? readVideo : undefined} />
    ) : card.image?.src ? (
        <img src={card.image.src} alt={card.image.alt || ""} loading="lazy" onLoad={auto ? onImg : undefined} />
    ) : (
        <div className="sw-ph">{card.title.split(" · ")[0]}</div>
    )

    return (
        <div className={`sw-media${fit === "contain" ? " is-contain" : ""}`} style={{ aspectRatio: ar }}>
            {media}
            <span className="sw-grain" aria-hidden="true" />
            <span className="sw-pill" aria-hidden="true">
                {card.cta} <span className="sw-pill-arrow">→</span>
            </span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SelectedWork(props: Props) {
    const { eyebrow = "selected work", heading = "Six projects. Real outcomes, or an honest status.", cards = DEFAULT_CARDS, ndaLink = "/#contact", casePath = "/projects/", mediaFit = "cover" } = props
    const list = cards && cards.length ? cards : DEFAULT_CARDS
    const base = (casePath || "/work/").replace(/\/?$/, "/")
    const fixLink = (href: string) => href.replace(/^(\.?\/)?work\//, base)
    const outerRef = useRef<HTMLDivElement | null>(null)
    const viewRef = useRef<HTMLDivElement | null>(null)
    const trackRef = useRef<HTMLDivElement | null>(null)
    const tiltOK = useRef(false)
    const [mode, setMode] = useState<"pin" | "row" | "stack">("stack")
    const [dist, setDist] = useState(0)
    const [x, setX] = useState(0)
    const [index, setIndex] = useState(0)
    const [anim, setAnim] = useState(false)
    const [seen, setSeen] = useState<Record<number, boolean>>({})

    useEffect(() => {
        if (typeof window === "undefined") return
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const wide = window.matchMedia("(min-width: 900px)")
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
        const pick = () => {
            tiltOK.current = !rm.matches && fine.matches
            startTransition(() => {
                setMode(!wide.matches ? "stack" : rm.matches ? "row" : "pin")
                setAnim(!rm.matches && typeof IntersectionObserver !== "undefined")
            })
        }
        pick()
        rm.addEventListener("change", pick)
        wide.addEventListener("change", pick)
        fine.addEventListener("change", pick)
        return () => {
            rm.removeEventListener("change", pick)
            wide.removeEventListener("change", pick)
            fine.removeEventListener("change", pick)
        }
    }, [])

    // Tags stagger in once each card is actually on screen (clipped cards in the pinned track don't count).
    useEffect(() => {
        if (!anim || typeof IntersectionObserver === "undefined") return
        const t = trackRef.current
        if (!t) return
        const obs = new IntersectionObserver(
            (entries) => {
                const add: Record<number, boolean> = {}
                entries.forEach((en) => {
                    if (en.isIntersecting) {
                        const i = Number((en.target as HTMLElement).dataset.i)
                        add[i] = true
                        obs.unobserve(en.target)
                    }
                })
                if (Object.keys(add).length) startTransition(() => setSeen((s) => ({ ...s, ...add })))
            },
            { threshold: 0.35 }
        )
        Array.from(t.children).forEach((c) => obs.observe(c))
        return () => obs.disconnect()
    }, [anim, mode, list.length])

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

    // Tilt + glow: measured against the (untransformed) list item so the tilt doesn't feed back on itself.
    const onMove = (e: React.PointerEvent<HTMLElement>) => {
        if (!tiltOK.current || e.pointerType !== "mouse") return
        const el = e.currentTarget
        const box = (el.parentElement || el).getBoundingClientRect()
        const px = Math.min(1, Math.max(0, (e.clientX - box.left) / Math.max(1, box.width)))
        const py = Math.min(1, Math.max(0, (e.clientY - box.top) / Math.max(1, box.height)))
        el.style.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`)
        el.style.setProperty("--rx", `${((0.5 - py) * 12).toFixed(2)}deg`)
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`)
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`)
        el.classList.add("sw-tilting")
    }
    const onLeave = (e: React.PointerEvent<HTMLElement>) => {
        const el = e.currentTarget
        el.style.setProperty("--rx", "0deg")
        el.style.setProperty("--ry", "0deg")
        el.classList.remove("sw-tilting")
    }

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap');
        .sw { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; }
        .sw-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; max-width: 1104px; margin: 0 auto 32px; padding: 0 20px; }
        .sw-eyebrow { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0 0 12px; }
        .sw-h { font-size: clamp(28px, 3.6vw, 40px); line-height: 1.1; letter-spacing: -.02em; font-weight: 700; margin: 0; max-width: 20ch; }
        .sw-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 1.3em; line-height: .8; letter-spacing: 0; color: inherit; }
        .sw-ctrl { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sw-count { display: inline-flex; align-items: center; gap: .35em; font-size: 14px; font-variant-numeric: tabular-nums; color: var(--db-text-2, rgba(255,255,255,.6)); margin-right: 8px; }
        .sw-count-now { color: var(--db-text, #fff); font-weight: 600; }
        .sw-roll { display: inline-flex; }
        .sw-roll-col { display: inline-block; height: 1.2em; line-height: 1.2em; overflow: hidden; }
        .sw-roll-strip { display: block; transition: transform .55s cubic-bezier(.2,.8,.2,1); }
        .sw-roll-strip > span { display: block; height: 1.2em; }
        .sw-arrow { width: 44px; height: 44px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: transparent; color: var(--db-text, #fff); font-size: 18px; cursor: pointer; transition: background .2s ease, border-color .2s ease, transform .2s ease; }
        .sw-arrow:hover:not(:disabled) { background: var(--db-line, rgba(255,255,255,.1)); border-color: color-mix(in srgb, var(--db-accent, #F3500F) 55%, var(--db-line, rgba(255,255,255,.15))); transform: translateY(-1px); }
        .sw-arrow:disabled { opacity: .38; cursor: default; }
        .sw a:focus-visible, .sw button:focus-visible, .sw article:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }
        .sw-track { display: flex; gap: 24px; padding: 16px max(20px, calc((100% - 1104px) / 2)); list-style: none; margin: 0; }
        .sw-row .sw-view { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .sw-row .sw-view::-webkit-scrollbar { display: none; }
        .sw-row .sw-card { scroll-snap-align: start; }
        .sw-stack .sw-track { flex-direction: column; padding: 0 20px; }
        .sw-card { flex: 0 0 min(560px, 78vw); }
        .sw-stack .sw-card { flex: 1 1 auto; }
        .sw-link { position: relative; isolation: isolate; display: flex; flex-direction: column; gap: 16px; height: 100%; padding: 12px 12px 22px; border-radius: 24px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); color: inherit; text-decoration: none;
            transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--sc, 1));
            transition: background .25s ease, border-color .3s ease, box-shadow .35s ease, transform .7s cubic-bezier(.34,1.56,.64,1); }
        .sw-link.sw-tilting { transition: background .25s ease, border-color .3s ease, box-shadow .35s ease, transform .12s ease-out; }
        .sw-link::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0; opacity: 0; transition: opacity .35s ease;
            background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, var(--db-accent, #F3500F) 20%, transparent), transparent 62%); }
        .sw-link:hover, .sw-link:focus-visible { --sc: 1.025; background: color-mix(in srgb, var(--db-text, #fff) 9%, transparent); border-color: color-mix(in srgb, var(--db-accent, #F3500F) 38%, var(--db-line, rgba(255,255,255,.1))); box-shadow: var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,.9)), 0 0 0 1px color-mix(in srgb, var(--db-accent, #F3500F) 12%, transparent); }
        .sw-link:hover::after, .sw-link:focus-visible::after { opacity: 1; }
        .sw-media { position: relative; z-index: 1; aspect-ratio: 16 / 10; max-height: min(52vh, 620px); border-radius: 16px; overflow: hidden; background: var(--db-surface, #111); }
        .sw-media.is-contain { background: var(--db-surface-2, color-mix(in srgb, var(--db-text, #fff) 6%, var(--db-bg, #000))); }
        .sw-media video, .sw-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.2,.7,.2,1); }
        .sw-media.is-contain video, .sw-media.is-contain img { object-fit: contain; }
        .sw-link:hover .sw-media video, .sw-link:hover .sw-media img, .sw-link:focus-visible .sw-media video, .sw-link:focus-visible .sw-media img { transform: scale(1.04); }
        .sw-link:hover .sw-media.is-contain video, .sw-link:hover .sw-media.is-contain img, .sw-link:focus-visible .sw-media.is-contain video, .sw-link:focus-visible .sw-media.is-contain img { transform: scale(1.02); }
        .sw-grain { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: .12; mix-blend-mode: overlay; background-image: ${NOISE}; background-size: 160px 160px; }
        .sw-pill { position: absolute; left: 14px; bottom: 14px; z-index: 3; pointer-events: none; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 600; letter-spacing: -.005em;
            background: var(--db-accent, #F3500F); color: var(--db-on-accent, #fff); box-shadow: 0 10px 24px -10px rgba(0,0,0,.55);
            opacity: 0; transform: translateY(12px); transition: opacity .3s ease, transform .45s cubic-bezier(.2,.8,.2,1); }
        .sw-pill-arrow { display: inline-block; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
        .sw-link:hover .sw-pill, .sw-link:focus-visible .sw-pill { opacity: 1; transform: none; }
        .sw-link:hover .sw-pill-arrow, .sw-link:focus-visible .sw-pill-arrow { transform: translateX(3px); }
        .sw-ph { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .sw-nda .sw-ph { background: repeating-linear-gradient(135deg, transparent 0 14px, var(--db-line, rgba(255,255,255,.06)) 14px 15px); }
        .sw-nda-hint { font-size: 13px; letter-spacing: .04em; text-transform: none; color: var(--db-text, #fff); opacity: 0; transform: translateY(4px); transition: opacity .25s ease, transform .25s ease; }
        .sw-link:hover .sw-nda-hint, .sw-link:focus-visible .sw-nda-hint { opacity: 1; transform: none; }
        .sw-body { position: relative; z-index: 1; padding: 0 10px; display: flex; flex-direction: column; gap: 10px; }
        .sw-body > :not(.sw-num) { position: relative; z-index: 1; }
        .sw-num { position: absolute; top: -.12em; right: 6px; z-index: 0; pointer-events: none; user-select: none; font-size: clamp(72px, 7.5vw, 112px); line-height: 1; font-weight: 800; letter-spacing: -.04em; font-variant-numeric: tabular-nums;
            color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--db-text, #fff) 16%, transparent); transition: -webkit-text-stroke-color .35s ease, transform .6s cubic-bezier(.2,.8,.2,1); }
        .sw-link:hover .sw-num, .sw-link:focus-visible .sw-num { -webkit-text-stroke-color: color-mix(in srgb, var(--db-accent, #F3500F) 55%, transparent); transform: translateY(-4px); }
        .sw-title { font-size: 15px; font-weight: 500; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; padding-right: 2.6em; }
        .sw-result { font-size: clamp(24px, 2.4vw, 30px); line-height: 1.15; letter-spacing: -.02em; font-weight: 700; margin: 0; }
        .sw-tags { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 0; padding: 0; }
        .sw-tag { font-size: 12.5px; font-weight: 500; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: color-mix(in srgb, var(--db-text, #fff) 4%, transparent); color: var(--db-text-2, rgba(255,255,255,.6));
            transition: opacity .45s ease, transform .5s cubic-bezier(.2,.8,.2,1), border-color .25s ease, color .25s ease; transition-delay: calc(var(--i, 0) * 70ms + 80ms); }
        .sw-anim .sw-card:not(.is-in) .sw-tag { opacity: 0; transform: translateY(8px); }
        .sw-link:hover .sw-tag, .sw-link:focus-visible .sw-tag { border-color: color-mix(in srgb, var(--db-accent, #F3500F) 35%, var(--db-line, rgba(255,255,255,.15))); color: var(--db-text, #fff); transition-delay: 0ms; }
        .sw-text { font-size: 16px; line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; max-width: 52ch; }
        .sw-cta { font-size: 15px; font-weight: 500; color: var(--db-accent, #F3500F); margin-top: 4px; }
        @media (prefers-reduced-motion: reduce) {
            .sw-link, .sw-link.sw-tilting, .sw-media video, .sw-media img, .sw-nda-hint, .sw-pill, .sw-pill-arrow, .sw-num, .sw-tag, .sw-roll-strip, .sw-arrow { transition: none !important; }
            .sw-link, .sw-link:hover, .sw-link:focus-visible { transform: none !important; }
            .sw-link::after { display: none; }
            .sw-link:hover .sw-media video, .sw-link:hover .sw-media img, .sw-link:focus-visible .sw-media video, .sw-link:focus-visible .sw-media img { transform: none !important; }
            .sw-link:hover .sw-num, .sw-link:focus-visible .sw-num, .sw-link:hover .sw-pill-arrow, .sw-link:focus-visible .sw-pill-arrow, .sw-arrow:hover:not(:disabled) { transform: none; }
            .sw-nda-hint { opacity: 1; transform: none; }
            .sw-pill { transform: none; }
        }
        @media (hover: none) { .sw-nda-hint { opacity: 1; transform: none; } .sw-pill { display: none; } .sw-link::after { display: none; } }
    `

    const autoPlay = mode === "pin" || mode === "stack"

    const cardEls = list.map((c, i) => {
        const fit: Fit = c.mediaFit === "cover" || c.mediaFit === "contain" ? c.mediaFit : mediaFit === "contain" ? "contain" : "cover"
        const inner = (
            <>
                <CardMedia card={c} fit={fit} aspect={c.mediaAspect || "16 / 10"} autoPlay={autoPlay} />
                <div className="sw-body">
                    <span className="sw-num" aria-hidden="true">{pad(i + 1)}</span>
                    <p className="sw-title">{c.title}</p>
                    <h3 className="sw-result">{c.result}</h3>
                    <ul className="sw-tags" aria-label="Topics">
                        {(c.tags || "")
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t, ti) => (
                                <li key={t} className="sw-tag" style={{ ["--i" as any]: ti } as React.CSSProperties}>{t}</li>
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
            <li key={c.title + i} data-i={i} className={`sw-card${c.nda ? " sw-nda" : ""}${seen[i] ? " is-in" : ""}`}>
                {href ? (
                    <a className="sw-link" href={href} aria-label={label} onFocus={onCardFocus(i)} onPointerMove={onMove} onPointerLeave={onLeave}>
                        {inner}
                    </a>
                ) : (
                    <article className="sw-link" tabIndex={0} aria-label={label} onFocus={onCardFocus(i)} onPointerMove={onMove} onPointerLeave={onLeave}>
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
                        <span className="sw-count-now"><Roll value={pad(index + 1)} /></span>
                        <span>/</span>
                        <span>{pad(list.length)}</span>
                    </span>
                    <button type="button" className="sw-arrow" aria-label="Previous project" disabled={index === 0} onClick={() => goTo(index - 1)}>←</button>
                    <button type="button" className="sw-arrow" aria-label="Next project" disabled={index === list.length - 1} onClick={() => goTo(index + 1)}>→</button>
                </div>
            )}
        </div>
    )

    const animCls = anim ? " sw-anim" : ""

    if (mode === "pin") {
        return (
            <section className={`sw${animCls}`} aria-label={eyebrow} style={props.style}>
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
        <section className={`sw ${mode === "row" ? "sw-row" : "sw-stack"}${animCls}`} aria-label={eyebrow} style={{ ...props.style, padding: "48px 0" }}>
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
    mediaFit: {
        type: ControlType.Enum,
        title: "Media fit",
        options: ["cover", "contain"],
        optionTitles: ["Cover", "Contain"],
        displaySegmentedControl: true,
        defaultValue: "cover",
        description: "Default for every card. Contain shows the whole video; cards can override.",
    },
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
                mediaFit: {
                    type: ControlType.Enum,
                    title: "Media fit",
                    options: ["section", "cover", "contain"],
                    optionTitles: ["Section default", "Cover", "Contain"],
                    defaultValue: "section",
                },
                mediaAspect: {
                    type: ControlType.Enum,
                    title: "Media shape",
                    options: ["16 / 10", "auto", "16 / 9", "4 / 3", "1 / 1", "9 / 16"],
                    optionTitles: ["16:10", "Auto (match media)", "16:9", "4:3", "1:1", "9:16"],
                    defaultValue: "16 / 10",
                },
                nda: { type: ControlType.Boolean, title: "NDA", defaultValue: false },
            },
        },
        defaultValue: DEFAULT_CARDS,
    },
})
