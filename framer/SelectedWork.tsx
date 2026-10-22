// SelectedWork v6 (Oct 21) — "the selected work is overlapping with everything when I change the
// screen size, literally fix it". The pinned scroll-jack (sticky track + JS-sized section height)
// was what overlapped on resize, so it's gone. Desktop/tablet (≥ 900px): a normal sideways
// scroller with snap + ← → buttons and a 01/06 counter. Phones: a vertical stack. Heights come
// from the content only, so the section can never overlap what's below it.
// Everything else from v5 stays: one link per card, hover tilt + glow, media play only on screen,
// NDA card, tags stagger in, theme tokens (--db-*). Type is Poppins (two-font rule).
// v6.1 (Oct 21, "on scroll it doesnt move horizontally"): the scroll-driven sideways move is back
// on screens ≥ 900px (reduced motion keeps the plain sideways scroller). The section height is
// re-measured on every resize (ResizeObserver), and .sw uses overflow-x: clip so sticky works.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    startTransition,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react"

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
    impact?: string
    impactLabel?: string
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

const FONT = "'Poppins', 'Poppins Placeholder', -apple-system, BlinkMacSystemFont, sans-serif"
const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive"
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
const NOISE_SVG =
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
const NOISE = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")`

function renderHeading(t: string) {
    const parts = String(t || "").split(/(\*[^*]+\*)/g)
    return parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
            <span key={i} className="sw-script">
                {p.slice(1, -1)}
            </span>
        ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
        )
    )
}

const DEFAULT_CARDS: Card[] = [
    {
        title: "BRIEFS · UM DPSS",
        result: "Prototype + PRD handed off",
        tags: "Public safety, Research, Information architecture",
        body: "I mapped a seven-screen dispatch workflow, then gave urgent building details a fixed place in the profile. The prototype and PRD were handed to DPSS.",
        link: "/work/briefs",
        cta: "View case study",
        impact: "A clearer path through seven dispatch screens.",
    },
    {
        title: "Intel workspace · UM DPSS",
        result: "Workflow prototype",
        tags: "Workflow, Apps Script, Product design",
        body: "A shared case workspace connects the original request, current status and next action. I explored how the view could change by role while the case context stayed together.",
        link: "/work/intel",
        cta: "View case study",
        impact: "Case history in one shared workspace.",
    },
    {
        title: "Convoy · General Motors",
        result: "Concept · 3 truck-cab usability tests",
        tags: "Research, HMI, Prototyping",
        body: "Four weeks into a biometric concept, an interview changed the brief. We turned toward group trip coordination, and I built interactions for a truck-cab mockup.",
        link: "/work/general-motors",
        cta: "View case study",
        impact: "An interview changed who we designed for.",
    },
    {
        title: "Prime Video · Capstone",
        result: "Current capstone · Under NDA",
        tags: "Streaming, Capstone",
        body: "Current capstone with Prime Video. Public details will follow when cleared. Ask me about the process.",
        link: "",
        cta: "Ask about the process",
        nda: true,
        impact: "Prime Video capstone. Under NDA.",
    },
    {
        title: "Open Library · Internet Archive",
        result: "Research + recommendations",
        tags: "Research, Multilingual, Accessibility",
        body: "Eight team interviews showed readers losing their place between books and language tools. I helped turn that into recommendations for help inside the reading flow.",
        link: "/work/openlibrary",
        cta: "View case study",
        impact: "Language help, inside the reading flow.",
    },
    {
        title: "BudgetCart · UMSI",
        result: "Prototype tasks tested",
        tags: "Grocery, SNAP/WIC, Prototyping",
        body: "We simplified the screen by hiding brands, stores and prices. Testing showed those were the cues shoppers needed. I worked on budget tracking and editable AI cart flows.",
        link: "/work/budgetcart",
        cta: "View case study",
        impact: "A simpler screen still needs decision cues.",
    },
]

function impactFor(c: Card): { label: string; text: string } {
    return { label: "", text: (c.impact || c.result || "Case study").trim() }
}

function pad(n: number) {
    return n < 10 ? "0" + n : String(n)
}

function Lock() {
    return (
        <svg
            aria-hidden
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
    )
}

function Chevron({ dir }: { dir: "left" | "right" }) {
    return (
        <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: dir === "left" ? "scaleX(-1)" : undefined }}
        >
            <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
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
            {external ? <path d="M5 11 11 5M6 5h5v5" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
        </svg>
    )
}
const ARROW_CSS = `.db-arrow{flex-shrink:0;display:inline-block;vertical-align:-.125em;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
a:hover .db-arrow[data-dir=e],a:focus-visible .db-arrow[data-dir=e]{transform:translateX(2px)}
a:hover .db-arrow[data-dir=ne],a:focus-visible .db-arrow[data-dir=ne]{transform:translate(2px,-2px)}
@media (prefers-reduced-motion:reduce){.db-arrow{transition:none !important;transform:none !important}}`

function Roll({ value }: { value: string }) {
    return (
        <span className="sw-roll">
            {value.split("").map((d, i) => (
                <span key={i} className="sw-roll-col">
                    <span
                        className="sw-roll-strip"
                        style={{ transform: `translateY(${-Number(d) * 10}%)` }}
                    >
                        {DIGITS.map((n) => (
                            <span key={n}>{n}</span>
                        ))}
                    </span>
                </span>
            ))}
        </span>
    )
}

function CardMedia({
    card,
    fit,
    aspect,
}: {
    card: Card
    fit: Fit
    aspect: string
}) {
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

    // Play only while on screen, the tab is visible and motion is allowed.
    useEffect(() => {
        const v = vref.current
        if (!v || typeof window === "undefined") return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        let near = false
        const sync = () => {
            if (near && !document.hidden) {
                const p = v.play()
                if (p && typeof p.catch === "function") p.catch(() => {})
            } else v.pause()
        }
        const io =
            typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      ([e]) => {
                          near = !!e?.isIntersecting
                          sync()
                      },
                      { rootMargin: "100px" }
                  )
                : null
        if (io) io.observe(v)
        else near = true
        sync()
        document.addEventListener("visibilitychange", sync)
        return () => {
            io?.disconnect()
            document.removeEventListener("visibilitychange", sync)
        }
    }, [card.video])

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
        <video
            ref={vref}
            src={card.video}
            muted
            loop
            playsInline
            autoPlay={false}
            preload="metadata"
            aria-hidden="true"
            onLoadedMetadata={auto ? readVideo : undefined}
        />
    ) : card.image?.src ? (
        <img
            src={card.image.src}
            alt={card.image.alt || ""}
            loading="lazy"
            onLoad={auto ? onImg : undefined}
        />
    ) : (
        <div className="sw-ph">{card.title.split(" · ")[0]}</div>
    )

    return (
        <div
            className={`sw-media${fit === "contain" ? " is-contain" : ""}`}
            style={{ aspectRatio: ar }}
        >
            {media}
            <span className="sw-grain" aria-hidden="true" />
            <span className="sw-pill" aria-hidden="true">
                {card.cta} <DbArrow />
            </span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function SelectedWork(props: Props) {
    const {
        eyebrow = "selected work",
        heading = "Complex work, made clearer.",
        cards = DEFAULT_CARDS,
        ndaLink = "/#contact",
        casePath = "/work/",
        mediaFit = "cover",
    } = props
    const list = (cards && cards.length ? cards : DEFAULT_CARDS).map((card) => {
        const story = DEFAULT_CARDS.find((item) => item.title === card.title)
        return story
            ? {
                  ...card,
                  result: story.result,
                  tags: story.tags,
                  body: story.body,
                  impact: card.impact || story.impact,
                  cta: story.cta,
                  nda: story.nda,
                  link: card.link || story.link,
              }
            : card
    })
    const base = (casePath || "/work/").replace(/\/?$/, "/")
    const fixLink = (href: string) => href.replace(/^(\.?\/)?work\//, base)
    const outerRef = useRef<HTMLDivElement | null>(null)
    const viewRef = useRef<HTMLDivElement | null>(null)
    const trackRef = useRef<HTMLOListElement | null>(null)
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
                setAnim(
                    !rm.matches && typeof IntersectionObserver !== "undefined"
                )
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
                if (Object.keys(add).length)
                    startTransition(() => setSeen((s) => ({ ...s, ...add })))
            },
            { threshold: 0.35 }
        )
        Array.from(t.children).forEach((c) => obs.observe(c))
        return () => obs.disconnect()
    }, [anim, mode, list.length])

    // Pin: section is 100vh + track overflow tall; a sticky 100vh frame holds the track,
    // and window scroll progress through the section drives translateX.
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
        if (ro && viewRef.current) ro.observe(viewRef.current)
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
            const p = Math.min(1, Math.max(0, -o.getBoundingClientRect().top / Math.max(1, dist)))
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
        window.addEventListener("resize", on)
        return () => {
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
            if (raf) window.cancelAnimationFrame(raf)
        }
    }, [mode, dist, list.length])

    const onRowScroll = useCallback(() => {
        const v = viewRef.current
        if (!v) return
        const max = Math.max(1, v.scrollWidth - v.clientWidth)
        startTransition(() =>
            setIndex(Math.round((v.scrollLeft / max) * (list.length - 1)))
        )
    }, [list.length])

    const goTo = useCallback(
        (i: number) => {
            const n = Math.max(0, Math.min(list.length - 1, i))
            if (mode === "pin") {
                const o = outerRef.current
                if (!o) return
                const top = o.getBoundingClientRect().top + window.scrollY
                window.scrollTo({ top: top + (n / Math.max(1, list.length - 1)) * dist, behavior: "smooth" })
                return
            }
            const v = viewRef.current
            const card = trackRef.current?.children[n] as HTMLElement | undefined
            if (!v || !card) return
            const reduce = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
            v.scrollTo({
                left: card.offsetLeft - (v.clientWidth - card.offsetWidth) / 2,
                behavior: reduce ? "auto" : "smooth",
            })
        },
        [mode, dist, list.length]
    )

    const onCardFocus = (i: number) => () => {
        if (mode !== "stack" && i !== index) goTo(i)
    }

    const onMove = (e: React.PointerEvent<HTMLElement>) => {
        if (!tiltOK.current || e.pointerType !== "mouse") return
        const el = e.currentTarget
        const box = (el.parentElement || el).getBoundingClientRect()
        const px = Math.min(
            1,
            Math.max(0, (e.clientX - box.left) / Math.max(1, box.width))
        )
        const py = Math.min(
            1,
            Math.max(0, (e.clientY - box.top) / Math.max(1, box.height))
        )
        el.style.setProperty("--ry", `${((px - 0.5) * 10).toFixed(2)}deg`)
        el.style.setProperty("--rx", `${((0.5 - py) * 10).toFixed(2)}deg`)
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
        .sw { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; max-width: 100%; min-width: 0; overflow-x: clip; box-sizing: border-box; }
        .sw * { box-sizing: border-box; }
        .sw-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 24px; max-width: 1104px; margin: 0 auto 24px; padding: 0 20px; }
        .sw-eyebrow { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0 0 12px; }
        .sw-eyebrow:empty { display: none; }
        .sw-h { font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15; letter-spacing: -.02em; font-weight: 600; margin: 0; max-width: 20ch; }
        .sw-script { font-family: ${SCRIPT}; font-weight: 400; font-size: 1.3em; line-height: .8; letter-spacing: 0; color: inherit; }
        .sw-ctrl { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .sw-count { display: inline-flex; align-items: center; gap: .35em; font-size: 14px; font-variant-numeric: tabular-nums; color: var(--db-text-2, rgba(255,255,255,.6)); margin-right: 8px; }
        .sw-count-now { color: var(--db-text, #fff); font-weight: 600; }
        .sw-roll { display: inline-flex; }
        .sw-roll-col { display: inline-block; height: 1.2em; line-height: 1.2em; overflow: hidden; }
        .sw-roll-strip { display: block; transition: transform .55s cubic-bezier(.2,.8,.2,1); }
        .sw-roll-strip > span { display: block; height: 1.2em; }
        .sw-arrow { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: transparent; color: var(--db-text, #fff); cursor: pointer; transition: background .2s ease, border-color .2s ease, transform .2s ease; }
        .sw-arrow:hover:not(:disabled) { background: var(--db-line, rgba(255,255,255,.1)); border-color: color-mix(in srgb, var(--db-accent, #F3500F) 55%, var(--db-line, rgba(255,255,255,.15))); transform: translateY(-1px); }
        .sw-arrow:disabled { opacity: .38; cursor: default; }
        .sw a:focus-visible, .sw button:focus-visible, .sw article:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }
        .sw-view { width: 100%; }
        .sw-track { display: flex; gap: 20px; padding: 12px max(20px, calc((100% - 1104px) / 2)) 20px; list-style: none; margin: 0; }
        .sw-row .sw-view { overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
        .sw-row .sw-view::-webkit-scrollbar { display: none; }
        .sw-row .sw-card { scroll-snap-align: center; flex: 0 0 min(520px, 72vw); }
        .sw-pin .sw-view { overflow: hidden; }
        .sw-pin .sw-card { flex: 0 0 min(520px, 72vw); }
        .sw-stack .sw-track { flex-direction: column; padding: 0 16px; gap: 16px; }
        .sw-stack .sw-card { flex: 1 1 auto; width: 100%; }
        .sw-link { position: relative; isolation: isolate; display: flex; flex-direction: column; gap: 14px; height: 100%; padding: 12px 12px 20px; border-radius: 24px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); color: inherit; text-decoration: none;
            transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--sc, 1));
            transition: background .25s ease, border-color .3s ease, box-shadow .35s ease, transform .7s cubic-bezier(.34,1.56,.64,1); }
        .sw-link.sw-tilting { transition: background .25s ease, border-color .3s ease, box-shadow .35s ease, transform .12s ease-out; }
        .sw-link::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0; opacity: 0; transition: opacity .35s ease;
            background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), color-mix(in srgb, var(--db-accent, #F3500F) 20%, transparent), transparent 62%); }
        .sw-link:hover, .sw-link:focus-visible { --sc: 1.015; background: color-mix(in srgb, var(--db-text, #fff) 9%, transparent); border-color: color-mix(in srgb, var(--db-accent, #F3500F) 38%, var(--db-line, rgba(255,255,255,.1))); box-shadow: var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,.9)); }
        .sw-link:hover::after, .sw-link:focus-visible::after { opacity: 1; }
        .sw-media { position: relative; z-index: 1; width: 100%; aspect-ratio: 16 / 10; border-radius: 16px; overflow: hidden; background: var(--db-surface, #111); }
        .sw-media.is-contain { background: var(--db-surface-2, color-mix(in srgb, var(--db-text, #fff) 6%, var(--db-bg, #000))); }
        .sw-media video, .sw-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s cubic-bezier(.2,.7,.2,1); }
        .sw-media.is-contain video, .sw-media.is-contain img { object-fit: contain; }
        .sw-link:hover .sw-media video, .sw-link:hover .sw-media img, .sw-link:focus-visible .sw-media video, .sw-link:focus-visible .sw-media img { transform: scale(1.04); }
        .sw-grain { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: .12; mix-blend-mode: overlay; background-image: ${NOISE}; background-size: 160px 160px; }
        .sw-pill { position: absolute; left: 14px; bottom: 14px; z-index: 3; pointer-events: none; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 600;
            background: var(--db-accent, #F3500F); color: var(--db-on-accent, #fff); box-shadow: 0 10px 24px -10px rgba(0,0,0,.55);
            opacity: 0; transform: translateY(12px); transition: opacity .3s ease, transform .45s cubic-bezier(.2,.8,.2,1); }
        .sw-link:hover .sw-pill, .sw-link:focus-visible .sw-pill { opacity: 1; transform: none; }
        .sw-ph { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .sw-nda .sw-ph { background: repeating-linear-gradient(135deg, transparent 0 14px, var(--db-line, rgba(255,255,255,.06)) 14px 15px); }
        .sw-nda-hint { font-size: 13px; letter-spacing: .04em; text-transform: none; color: var(--db-text, #fff); opacity: 0; transform: translateY(4px); transition: opacity .25s ease, transform .25s ease; }
        .sw-link:hover .sw-nda-hint, .sw-link:focus-visible .sw-nda-hint { opacity: 1; transform: none; }
        .sw-body { position: relative; z-index: 1; padding: 0 8px; display: flex; flex-direction: column; gap: 10px; }
        .sw-body > :not(.sw-num) { position: relative; z-index: 1; }
        .sw-num { position: absolute; top: -.12em; right: 6px; z-index: 0; pointer-events: none; user-select: none; font-size: clamp(64px, 7vw, 104px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums;
            color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--db-text, #fff) 16%, transparent); transition: -webkit-text-stroke-color .35s ease; }
        .sw-link:hover .sw-num, .sw-link:focus-visible .sw-num { -webkit-text-stroke-color: color-mix(in srgb, var(--db-accent, #F3500F) 55%, transparent); }
        .sw-impact { position: relative; z-index: 1; padding: 8px 8px 0; display: flex; flex-direction: column; gap: 6px; }
        .sw-impact-text { margin: 0; font-size: clamp(22px, 2.4vw, 32px); line-height: 1.15; letter-spacing: -.02em; font-weight: 600; color: var(--db-text, #fff); text-wrap: balance; overflow-wrap: anywhere; }
        .sw-status { margin: -4px 0 0; font-size: 14px; font-weight: 500; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .sw-tags { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; margin: 0; padding: 0; }
        .sw-tag { font-size: 12.5px; font-weight: 500; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.15)); background: color-mix(in srgb, var(--db-text, #fff) 4%, transparent); color: var(--db-text-2, rgba(255,255,255,.6));
            transition: opacity .45s ease, transform .5s cubic-bezier(.2,.8,.2,1), border-color .25s ease, color .25s ease; transition-delay: calc(var(--i, 0) * 70ms + 80ms); }
        .sw-anim .sw-card:not(.is-in) .sw-tag { opacity: 0; transform: translateY(8px); }
        .sw-text { font-size: 15px; line-height: 1.55; color: var(--db-text-2, rgba(255,255,255,.6)); margin: 0; max-width: 52ch; }
        .sw-cta { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; color: var(--db-accent, #F3500F); margin-top: 4px; }
        ${ARROW_CSS}
        @media (prefers-reduced-motion: reduce) {
            .sw-link, .sw-link.sw-tilting, .sw-media video, .sw-media img, .sw-nda-hint, .sw-pill, .sw-num, .sw-tag, .sw-roll-strip, .sw-arrow { transition: none !important; }
            .sw-link, .sw-link:hover, .sw-link:focus-visible { transform: none !important; }
            .sw-link::after { display: none; }
            .sw-link:hover .sw-media video, .sw-link:hover .sw-media img { transform: none !important; }
            .sw-nda-hint { opacity: 1; transform: none; }
        }
        @media (hover: none) { .sw-nda-hint { opacity: 1; transform: none; } .sw-pill { display: none; } .sw-link::after { display: none; } }
    `

    const cardEls = list.map((c, i) => {
        const fit: Fit =
            c.mediaFit === "cover" || c.mediaFit === "contain"
                ? c.mediaFit
                : mediaFit === "contain"
                  ? "contain"
                  : "cover"
        const imp = impactFor(c)
        const status = (c.result || "").trim()
        const showStatus =
            !!status && status.toLowerCase() !== imp.text.toLowerCase()
        const inner = (
            <>
                <div className="sw-impact">
                    <h3 className="sw-impact-text">{c.title}</h3>
                    <p className="sw-text">{imp.text}</p>
                </div>
                <CardMedia card={c} fit={fit} aspect={c.mediaAspect || "16 / 10"} />
                <div className="sw-body">
                    <span className="sw-num" aria-hidden="true">
                        {pad(i + 1)}
                    </span>
                    {showStatus && <p className="sw-status">{status}</p>}
                    <ul className="sw-tags" aria-label="Topics">
                        {(c.tags || "")
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .map((t, ti) => (
                                <li
                                    key={t}
                                    className="sw-tag"
                                    style={{ ["--i" as any]: ti } as React.CSSProperties}
                                >
                                    {t}
                                </li>
                            ))}
                    </ul>
                    <p className="sw-text">{c.body}</p>
                    <span className="sw-cta" aria-hidden="true">
                        {c.cta} <DbArrow />
                    </span>
                </div>
            </>
        )
        const label = `${c.title}. ${imp.text} ${c.cta}`
        const href = c.link ? fixLink(c.link) : c.nda ? ndaLink : ""
        return (
            <li
                key={c.title + i}
                data-i={i}
                className={`sw-card${c.nda ? " sw-nda" : ""}${seen[i] ? " is-in" : ""}`}
            >
                {href ? (
                    <a
                        className="sw-link"
                        href={href}
                        aria-label={label}
                        onFocus={onCardFocus(i)}
                        onPointerMove={onMove}
                        onPointerLeave={onLeave}
                    >
                        {inner}
                    </a>
                ) : (
                    <article
                        className="sw-link"
                        tabIndex={0}
                        aria-label={label}
                        onFocus={onCardFocus(i)}
                        onPointerMove={onMove}
                        onPointerLeave={onLeave}
                    >
                        {inner}
                    </article>
                )}
            </li>
        )
    })

    return (
        <section
            className={`sw sw-${mode}${anim ? " sw-anim" : ""}`}
            aria-label={eyebrow || "Selected work"}
            style={{ ...props.style, padding: mode === "pin" ? 0 : "40px 0" }}
        >
            <style>{css}</style>
            <div
                ref={outerRef}
                style={mode === "pin" ? { position: "relative", height: `calc(100vh + ${dist}px)` } : undefined}
            >
            <div
                style={mode === "pin" ? { position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" } : undefined}
            >
            <div className="sw-head">
                <div>
                    <p className="sw-eyebrow">{eyebrow}</p>
                    <h2 className="sw-h">{renderHeading(heading)}</h2>
                </div>
                {mode !== "stack" && (
                    <div className="sw-ctrl">
                        <span className="sw-count" aria-hidden="true">
                            <span className="sw-count-now">
                                <Roll value={pad(index + 1)} />
                            </span>
                            <span>/</span>
                            <span>{pad(list.length)}</span>
                        </span>
                        <button
                            type="button"
                            className="sw-arrow"
                            aria-label="Previous project"
                            disabled={index === 0}
                            onClick={() => goTo(index - 1)}
                        >
                            <Chevron dir="left" />
                        </button>
                        <button
                            type="button"
                            className="sw-arrow"
                            aria-label="Next project"
                            disabled={index === list.length - 1}
                            onClick={() => goTo(index + 1)}
                        >
                            <Chevron dir="right" />
                        </button>
                    </div>
                )}
            </div>
            <div
                ref={viewRef}
                className="sw-view"
                onScroll={mode === "row" ? onRowScroll : undefined}
            >
                <ol
                    ref={trackRef}
                    className="sw-track"
                    style={mode === "pin" ? { transform: `translate3d(${-x}px,0,0)`, willChange: "transform" } : undefined}
                >
                    {cardEls}
                </ol>
            </div>
            </div>
            </div>
        </section>
    )
}

addPropertyControls(SelectedWork, {
    eyebrow: {
        type: ControlType.String,
        title: "Eyebrow",
        defaultValue: "selected work",
    },
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Complex work, made clearer.",
        description: "Wrap a word in *stars* to set it in script.",
    },
    ndaLink: {
        type: ControlType.String,
        title: "NDA card link",
        defaultValue: "/#contact",
    },
    casePath: {
        type: ControlType.String,
        title: "Case pages live at",
        defaultValue: "/work/",
    },
    mediaFit: {
        type: ControlType.Enum,
        title: "Media fit",
        options: ["cover", "contain"],
        optionTitles: ["Cover", "Contain"],
        displaySegmentedControl: true,
        defaultValue: "cover",
    },
    cards: {
        type: ControlType.Array,
        title: "Cards",
        control: {
            type: ControlType.Object,
            controls: {
                title: {
                    type: ControlType.String,
                    title: "Project · Org",
                    defaultValue: "Project · Org",
                },
                impact: {
                    type: ControlType.String,
                    title: "Story headline",
                    defaultValue: "",
                },
                impactLabel: {
                    type: ControlType.String,
                    title: "Optional label",
                    defaultValue: "",
                },
                result: {
                    type: ControlType.String,
                    title: "Result",
                    defaultValue: "Result",
                },
                tags: {
                    type: ControlType.String,
                    title: "Tags (commas)",
                    defaultValue: "",
                },
                body: {
                    type: ControlType.String,
                    title: "2–3 lines",
                    displayTextArea: true,
                    defaultValue: "",
                },
                link: { type: ControlType.Link, title: "Link" },
                cta: {
                    type: ControlType.String,
                    title: "Button text",
                    defaultValue: "Read the study",
                },
                video: {
                    type: ControlType.File,
                    title: "Video",
                    allowedFileTypes: ["mp4", "webm", "mov"],
                },
                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Image (if no video)",
                },
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
                nda: {
                    type: ControlType.Boolean,
                    title: "NDA",
                    defaultValue: false,
                },
            },
        },
        defaultValue: DEFAULT_CARDS,
    },
})
