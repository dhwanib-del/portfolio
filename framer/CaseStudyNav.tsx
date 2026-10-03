// Section navigation for Dhwani's case studies and About page.
// v3 (Dhwani: "it's BLOCKING the content and it's TOO much… place it on the side, make it
// collapsible… it HAS TO be accessible and it HAS TO be responsive across screens"):
//  • Wide screens: a slim spine on the left edge (dots + a scroll-progress line), collapsed by
//    default so it never covers content. Hover a dot to see its name; click to jump. The ☰
//    button opens the full list; Esc, clicking outside, or choosing a section closes it.
//  • Narrow screens: one small pill centred at the bottom ("03 · Research ▾") that opens the
//    list as a sheet. Bottom-left is left free for the vibe chip, bottom-right for the chat.
//  • Real links (<a href="#id">), keyboard + screen-reader friendly, focus returns to the
//    button on close, reduced-motion respected, 44px touch targets on phones.
// Sections: "Label|anchor; Label|anchor". If a section has no id, the nav finds it by its
// numbered eyebrow ("05 · …") and gives it the id, so /page#bot links work.
// Fluid type (Responsive placement): big text scales down smoothly on smaller screens.
// v4 (Dhwani: "the time left to finish reading… add 3 min read"): reading time is worked out
// from the words and images actually on the page (≈225 wpm + ~5s per image), shown as
// "4 min read" in the list header and as minutes left on the spine / phone pill. Placement
// "Read time" renders just an inline "4 min read" tag for the hero.
// v5: "Read from" (e.g. /work/general-motors) lets the tag sit on a work card and count the
// words on THAT page instead of the one it's on.
// Oct 2: colors follow the site theme tokens (--db-*) for light/dark.
import * as React from "react"
import { useState, useEffect, useCallback, useRef, useMemo, startTransition, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"

interface NavSection {
    label: string
    anchor: string
}

interface CaseStudyNavProps {
    sections: NavSection[]
    sectionsText: string
    placement: "fixed" | "inline" | "responsive" | "readtime"
    readMinutes: number
    readFrom: string
    sideMinWidth: number
    fluidType: boolean
    startOpen: boolean
    projectTitle: string
    showProjectTitle: boolean
    pinSide: "left" | "right"
    offsetX: number
    backgroundColor: string
    textColor: string
    activeColor: string
    showCopyLink: boolean
    style?: CSSProperties
}

const POPPINS = "'Poppins', 'Poppins Placeholder', sans-serif"
const ACCENT_VAR = (fallback: string) => `var(--db-accent, var(--vibe-accent, ${fallback}))`
// Theme ink at a given strength (for dots/tracks that aren't text)
const INK = (pct: number) => `color-mix(in srgb, var(--db-text, #FFFFFF) ${pct}%, transparent)`
const TEXT = "var(--db-text, #FFFFFF)"
const TEXT_2 = "var(--db-text-2, rgba(255,255,255,0.6))"
const LINE = "var(--db-line, rgba(255,255,255,0.10))"

function findSectionEl(anchor: string, label: string): HTMLElement | null {
    if (typeof document === "undefined" || !anchor) return null
    const byId = document.getElementById(anchor)
    if (byId) return byId
    const num = (label.match(/^\s*(\d{1,2})/) || [])[1]
    if (!num) return null
    const candidates = document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, p")
    for (const n of Array.from(candidates)) {
        if (n.closest("[data-csnav]")) continue
        const t = (n.textContent || "").trim()
        if (t.startsWith(num + " ·") || t.startsWith(num + " ·") || t.startsWith(num + " -")) {
            const host = (n.parentElement as HTMLElement) || n
            if (!host.id) host.id = anchor
            host.style.scrollMarginTop = "96px"
            return host
        }
    }
    return null
}

const isBadgeEarly = (p: string) => p === "readtime"

function measureReadMinutes(): number {
    if (typeof document === "undefined") return 0
    const body = document.body
    if (!body) return 0
    let text = body.innerText || ""
    document.querySelectorAll<HTMLElement>("[data-csnav], [data-pnav]").forEach((n) => {
        const t = n.innerText || ""
        if (t) text = text.replace(t, " ")
    })
    const words = (text.match(/[A-Za-z0-9À-ɏऀ-ॿ'’-]+/g) || []).length
    const media = Array.from(document.querySelectorAll<HTMLElement>("img, video")).filter((m) => {
        const r = m.getBoundingClientRect()
        return r.width > 120 && r.height > 80 && !m.closest("[data-csnav]")
    }).length
    const mins = words / 225 + Math.min(media, 40) * (5 / 60)
    return Math.max(1, Math.round(mins))
}

async function measureRemote(path: string): Promise<number> {
    const key = "csnav_rt:" + path
    try {
        const hit = sessionStorage.getItem(key)
        if (hit) return Number(hit) || 0
    } catch {}
    const res = await fetch(path, { credentials: "same-origin" })
    if (!res.ok) return 0
    const doc = new DOMParser().parseFromString(await res.text(), "text/html")
    // Framer ships every breakpoint's copy in the HTML; count each unique block once
    const seen = new Set<string>()
    let words = 0
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li").forEach((n) => {
        const t = (n.textContent || "").replace(/\s+/g, " ").trim()
        if (!t || seen.has(t)) return
        seen.add(t)
        words += (t.match(/[A-Za-z0-9À-ɏऀ-ॿ'’-]+/g) || []).length
    })
    const imgs = new Set<string>()
    doc.querySelectorAll("img").forEach((i) => imgs.add(i.getAttribute("src") || ""))
    const mins = Math.max(1, Math.round(words / 225 + Math.min(imgs.size, 40) * (5 / 60)))
    try {
        sessionStorage.setItem(key, String(mins))
    } catch {}
    return mins
}

function useReadMinutes(override: number, enabled: boolean, readFrom = "") {
    const [mins, setMins] = useState(override > 0 ? override : 0)
    useEffect(() => {
        if (override > 0) {
            startTransition(() => setMins(override))
            return
        }
        if (readFrom && typeof window !== "undefined") {
            let alive = true
            measureRemote(readFrom)
                .then((m) => alive && m && startTransition(() => setMins(m)))
                .catch(() => {})
            return () => {
                alive = false
            }
        }
        if (!enabled || typeof window === "undefined") return
        let t: ReturnType<typeof setTimeout>
        const run = () => {
            clearTimeout(t)
            t = setTimeout(() => startTransition(() => setMins(measureReadMinutes())), 400)
        }
        run()
        const late = setTimeout(run, 2500)
        window.addEventListener("resize", run)
        return () => {
            clearTimeout(t)
            clearTimeout(late)
            window.removeEventListener("resize", run)
        }
    }, [override, enabled, readFrom])
    return mins
}

function applyFluidType() {
    if (typeof document === "undefined") return
    const els = document.querySelectorAll<HTMLElement>("h1.framer-text, h2.framer-text, h3.framer-text, h4.framer-text, h5.framer-text, h6.framer-text, p.framer-text")
    els.forEach((el) => {
        if (el.closest("[data-csnav]")) return
        let base = parseFloat(el.dataset.fluidBase || "")
        if (!base) {
            base = parseFloat(window.getComputedStyle(el).fontSize)
            if (!base) return
            el.dataset.fluidBase = String(base)
        }
        if (base < 26) return
        const min = Math.max(22, Math.round(base * 0.58))
        const vw = (base / 12.8).toFixed(3)
        el.style.fontSize = `clamp(${min}px, ${vw}vw, ${base}px)`
        el.style.setProperty("--framer-font-size", `clamp(${min}px, ${vw}vw, ${base}px)`)
    })
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function CaseStudyNav(props: CaseStudyNavProps) {
    const {
        sections: sectionsList = [],
        sectionsText = "",
        placement = "responsive",
        sideMinWidth = 1200,
        fluidType = true,
        startOpen = false,
        projectTitle = "Sections",
        showProjectTitle = true,
        pinSide = "left",
        offsetX = 16,
        backgroundColor = "rgba(14, 14, 16, 0.78)",
        textColor = "rgba(255, 255, 255, 0.62)",
        activeColor = "#F3500F",
        showCopyLink = true,
        readMinutes = 0,
        readFrom = "",
    } = props
    const accent = ACCENT_VAR(activeColor)
    const glassBg = `var(--db-glass, ${backgroundColor})`
    const softText = `var(--db-text-2, ${textColor})`

    const sections = useMemo<NavSection[]>(() => {
        const text = (sectionsText || "").trim()
        if (!text) return sectionsList
        return text
            .split(";")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => {
                const [label, anchor] = part.split("|").map((s) => (s || "").trim())
                return { label: label || anchor, anchor: anchor || label }
            })
    }, [sectionsText, sectionsList])

    const [mounted, setMounted] = useState(false)
    const [wide, setWide] = useState(true)
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState("")
    const [hover, setHover] = useState("")
    const [copied, setCopied] = useState("")
    const [progress, setProgress] = useState(0)
    const [reduced, setReduced] = useState(false)
    const hostRef = useRef<HTMLDivElement>(null)
    const toggleRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLElement>(null)
    const idBase = useRef("csnav-" + Math.random().toString(36).slice(2, 7)).current

    const isResponsive = placement === "responsive"
    const isBadge = placement === "readtime"
    const readMins = useReadMinutes(Number(readMinutes) || 0, true, isBadgeEarly(placement) ? String(readFrom || "").trim() : "")

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(`(min-width: ${sideMinWidth}px)`)
        const on = () => startTransition(() => setWide(mq.matches))
        on()
        let saved: string | null = null
        try {
            saved = localStorage.getItem("csnav_open")
        } catch {}
        startTransition(() => {
            setMounted(true)
            setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            setOpen(saved ? saved === "1" && mq.matches : startOpen && mq.matches)
        })
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [sideMinWidth, startOpen])

    // Framer's wrapper shouldn't catch clicks when the nav renders in a portal
    useEffect(() => {
        if (!isResponsive || typeof window === "undefined") return
        let el: HTMLElement | null = hostRef.current
        for (let i = 0; el && i < 4; i++) {
            el.style.pointerEvents = "none"
            const parent = el.parentElement
            if (!parent || parent.childElementCount !== 1) break
            el = parent
        }
    }, [isResponsive, mounted])

    // Fluid type
    useEffect(() => {
        if (!fluidType || !isResponsive || typeof window === "undefined") return
        let t: ReturnType<typeof setTimeout>
        const run = () => {
            clearTimeout(t)
            t = setTimeout(applyFluidType, 60)
        }
        run()
        const mo = new MutationObserver(run)
        mo.observe(document.body, { childList: true, subtree: true })
        return () => {
            clearTimeout(t)
            mo.disconnect()
        }
    }, [fluidType, isResponsive])

    // Resolve sections, watch which one is on screen, honor #hash on load
    useEffect(() => {
        if (typeof window === "undefined" || isBadge) return
        let observer: IntersectionObserver | null = null
        let tries = 0
        let timer: ReturnType<typeof setTimeout>
        const setup = () => {
            const found: HTMLElement[] = []
            sections.forEach((s) => {
                const el = findSectionEl(s.anchor, s.label)
                if (el) found.push(el)
            })
            if (found.length < sections.length && tries < 10) {
                tries++
                timer = setTimeout(setup, 250)
            }
            if (observer) observer.disconnect()
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) startTransition(() => setActive(entry.target.id))
                    })
                },
                { root: null, rootMargin: "-20% 0px -70% 0px", threshold: 0 }
            )
            found.forEach((el) => observer!.observe(el))
            if ((found.length === sections.length || tries >= 10) && !(window as any).__csNavHashDone) {
                const hash = decodeURIComponent((window.location.hash || "").slice(1))
                const target = hash ? document.getElementById(hash) : null
                if (target) {
                    ;(window as any).__csNavHashDone = true
                    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" })
                }
            }
        }
        timer = setTimeout(setup, 150)
        return () => {
            clearTimeout(timer)
            if (observer) observer.disconnect()
        }
    }, [sections, isBadge])

    // Scroll progress for the spine
    useEffect(() => {
        if (typeof window === "undefined") return
        let raf = 0
        const on = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const d = document.documentElement
                const max = Math.max(1, d.scrollHeight - window.innerHeight)
                startTransition(() => setProgress(Math.min(1, Math.max(0, window.scrollY / max))))
            })
        }
        on()
        window.addEventListener("scroll", on, { passive: true })
        return () => window.removeEventListener("scroll", on)
    }, [])

    const setOpenPersist = useCallback(
        (v: boolean, refocus = false) => {
            startTransition(() => setOpen(v))
            if (wide) {
                try {
                    localStorage.setItem("csnav_open", v ? "1" : "0")
                } catch {}
            }
            if (!v && refocus) setTimeout(() => toggleRef.current?.focus(), 0)
        },
        [wide]
    )

    // Esc + click outside close the list; focus the first item when it opens
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenPersist(false, true)
        }
        const onDown = (e: MouseEvent | TouchEvent) => {
            const t = e.target as Node
            if (panelRef.current?.contains(t) || toggleRef.current?.contains(t)) return
            setOpenPersist(false)
        }
        window.addEventListener("keydown", onKey)
        document.addEventListener("mousedown", onDown)
        document.addEventListener("touchstart", onDown, { passive: true })
        const first = panelRef.current?.querySelector<HTMLElement>("a")
        if (first && !wide) setTimeout(() => first.focus(), 30)
        return () => {
            window.removeEventListener("keydown", onKey)
            document.removeEventListener("mousedown", onDown)
            document.removeEventListener("touchstart", onDown)
        }
    }, [open, wide, setOpenPersist])

    const go = useCallback(
        (e: React.MouseEvent | null, anchor: string, label: string) => {
            if (typeof window === "undefined") return
            const el = findSectionEl(anchor, label)
            if (!el) return
            e?.preventDefault()
            window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: reduced ? "auto" : "smooth" })
            try {
                window.history.replaceState(null, "", `#${anchor}`)
            } catch {}
            startTransition(() => setActive(anchor))
            if (!wide) setOpenPersist(false)
            el.setAttribute("tabindex", "-1")
            setTimeout(() => el.focus({ preventScroll: true }), reduced ? 0 : 450)
        },
        [reduced, wide, setOpenPersist]
    )

    const copyLink = useCallback((anchor: string) => {
        if (typeof window === "undefined") return
        const url = `${window.location.origin}${window.location.pathname}#${anchor}`
        const done = () => {
            startTransition(() => setCopied(anchor))
            setTimeout(() => startTransition(() => setCopied("")), 1400)
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done)
        else done()
    }, [])

    const glass: CSSProperties = {
        fontFamily: POPPINS,
        background: glassBg,
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        border: "1px solid var(--db-glass-line, rgba(255,255,255,0.10))",
        boxShadow: "var(--db-shadow, 0 20px 50px -20px rgba(0,0,0,0.85))",
        boxSizing: "border-box",
    }
    const ease = reduced ? "none" : "all .22s cubic-bezier(.16,1,.3,1)"
    const activeIdx = Math.max(0, sections.findIndex((s) => s.anchor === active))
    const activeLabel = sections[activeIdx]?.label || projectTitle
    const done = progress > 0.97
    const leftMins = readMins ? Math.max(1, Math.ceil(readMins * (1 - progress))) : 0
    const leftText = !readMins ? "" : done ? "done" : progress < 0.02 ? `${readMins} min read` : `${leftMins} min left`
    const header = showProjectTitle ? (
        <div style={{ padding: "4px 12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: TEXT_2 }}>
                {projectTitle}
                {readMins ? ` · ${readMins} min read` : ""}
            </span>
            {readMins ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT_2 }}>
                    <span aria-hidden style={{ flex: 1, height: 3, borderRadius: 2, background: LINE, overflow: "hidden" }}>
                        <span style={{ display: "block", height: "100%", width: `${Math.round(progress * 100)}%`, background: accent }} />
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>{done ? "you made it ✓" : `${leftMins} min left`}</span>
                </span>
            ) : null}
        </div>
    ) : null

    const list = (touch: boolean) => (
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {sections.map((s) => {
                const on = active === s.anchor
                return (
                    <li key={s.anchor} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <a
                            href={`#${s.anchor}`}
                            onClick={(e) => go(e, s.anchor, s.label)}
                            aria-current={on ? "location" : undefined}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                minHeight: touch ? 44 : 38,
                                padding: "0 12px",
                                borderRadius: 999,
                                textDecoration: "none",
                                color: on ? TEXT : softText,
                                background: on ? LINE : "transparent",
                                fontSize: 13,
                                fontWeight: on ? 500 : 400,
                                lineHeight: 1.3,
                                transition: ease,
                            }}
                        >
                            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 3, flexShrink: 0, background: on ? accent : INK(25), boxShadow: on ? `0 0 8px ${accent}` : "none" }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
                        </a>
                        {showCopyLink && (
                            <button
                                type="button"
                                onClick={() => copyLink(s.anchor)}
                                aria-label={`Copy link to ${s.label}`}
                                title="Copy link"
                                style={{ flexShrink: 0, width: touch ? 44 : 32, height: touch ? 44 : 32, border: "none", borderRadius: 999, background: "transparent", color: copied === s.anchor ? accent : TEXT_2, fontFamily: POPPINS, fontSize: 12, cursor: "pointer" }}
                            >
                                {copied === s.anchor ? "✓" : "#"}
                            </button>
                        )}
                    </li>
                )
            })}
        </ol>
    )

    const css = (
        <style>{`
            [data-csnav] a:focus-visible, [data-csnav] button:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
            [data-csnav] .csnav-dot:hover .csnav-tip, [data-csnav] .csnav-dot:focus-visible .csnav-tip { opacity: 1; transform: translate(0, -50%); }
            @media (prefers-reduced-motion: reduce) { [data-csnav] * { transition: none !important; } }
        `}</style>
    )

    // ── Read-time tag (for the hero) ──
    if (isBadge) {
        return (
            <p data-csnav="" style={{ margin: 0, fontFamily: POPPINS, fontSize: 13, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: softText, display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 3, background: accent }} />
                {readMins ? `${readMins} min read` : " "}
            </p>
        )
    }

    // ── Responsive ──
    if (isResponsive) {
        if (!mounted || typeof document === "undefined" || sections.length === 0) return <div ref={hostRef} style={{ width: 1, height: 1 }} />
        const side = pinSide
        const portal = wide ? (
            <div data-csnav="" style={{ position: "fixed", top: "50%", [side]: offsetX, transform: "translateY(-50%)", zIndex: 100, display: "flex", alignItems: "center", gap: 10, flexDirection: side === "left" ? "row" : "row-reverse", fontFamily: POPPINS }}>
                {css}
                {/* spine: always small */}
                <div style={{ ...glass, borderRadius: 999, padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <button
                        ref={toggleRef}
                        type="button"
                        aria-expanded={open}
                        aria-controls={idBase}
                        aria-label={(open ? "Hide sections" : "Show sections") + (leftText ? `, ${done ? "finished reading" : leftText}` : "")}
                        onClick={() => setOpenPersist(!open)}
                        style={{ width: 32, height: 32, borderRadius: 999, border: "none", background: open ? LINE : "transparent", color: TEXT, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                    >
                        {open ? "×" : "☰"}
                    </button>
                    <div aria-hidden style={{ width: 2, height: 28, borderRadius: 1, background: LINE, overflow: "hidden" }}>
                        <div style={{ width: "100%", height: `${Math.round(progress * 100)}%`, background: accent }} />
                    </div>
                    {readMins ? (
                        <span aria-hidden title={leftText} style={{ fontSize: 10, fontWeight: 600, lineHeight: 1, color: done ? accent : TEXT_2, fontVariantNumeric: "tabular-nums" }}>
                            {done ? "✓" : `${progress < 0.02 ? readMins : leftMins}m`}
                        </span>
                    ) : null}
                    <div role="list" aria-label="Jump to section" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {sections.map((s, i) => {
                            const on = active === s.anchor
                            return (
                                <a
                                    key={s.anchor}
                                    role="listitem"
                                    className="csnav-dot"
                                    href={`#${s.anchor}`}
                                    onClick={(e) => go(e, s.anchor, s.label)}
                                    aria-label={s.label}
                                    aria-current={on ? "location" : undefined}
                                    onMouseEnter={() => startTransition(() => setHover(s.anchor))}
                                    onMouseLeave={() => startTransition(() => setHover(""))}
                                    style={{ position: "relative", width: 28, height: 22, display: "grid", placeItems: "center" }}
                                >
                                    <span aria-hidden style={{ width: on ? 8 : 5, height: on ? 8 : 5, borderRadius: 999, background: on ? accent : hover === s.anchor ? TEXT : INK(35), boxShadow: on ? `0 0 10px ${accent}` : "none", transition: ease }} />
                                    {!open && (
                                        <span
                                            className="csnav-tip"
                                            aria-hidden
                                            style={{ position: "absolute", top: "50%", [side === "left" ? "left" : "right"]: 34, transform: `translate(${side === "left" ? "-4px" : "4px"}, -50%)`, opacity: 0, pointerEvents: "none", whiteSpace: "nowrap", padding: "6px 10px", borderRadius: 8, background: "var(--db-surface, rgba(14,14,16,0.92))", border: "1px solid var(--db-glass-line, rgba(255,255,255,0.10))", color: TEXT, fontSize: 12, transition: ease }}
                                        >
                                            {s.label}
                                        </span>
                                    )}
                                </a>
                            )
                        })}
                    </div>
                </div>
                {/* full list, only when asked for */}
                {open && (
                    <nav ref={panelRef} id={idBase} aria-label={`${projectTitle} sections`} style={{ ...glass, borderRadius: 18, width: 250, maxHeight: "calc(100vh - 160px)", overflowY: "auto", padding: "10px 6px", animation: reduced ? "none" : "csnav-in .2s ease both" }}>
                        <style>{`@keyframes csnav-in { from { opacity: 0; transform: translateX(${side === "left" ? "-6px" : "6px"}) } to { opacity: 1; transform: none } }`}</style>
                        {header}
                        {list(false)}
                    </nav>
                )}
            </div>
        ) : (
            <div data-csnav="" style={{ position: "fixed", left: "50%", bottom: 16, transform: "translateX(-50%)", zIndex: 100, width: "max-content", maxWidth: "calc(100vw - 32px)", fontFamily: POPPINS }}>
                {css}
                {open && <div aria-hidden onClick={() => setOpenPersist(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: -1 }} />}
                {open && (
                    <nav ref={panelRef} id={idBase} aria-label={`${projectTitle} sections`} style={{ ...glass, background: "var(--db-glass, rgba(12,12,14,0.95))", position: "absolute", left: "50%", bottom: "calc(100% + 10px)", transform: "translateX(-50%)", width: "min(340px, calc(100vw - 32px))", maxHeight: "60vh", overflowY: "auto", borderRadius: 18, padding: "10px 6px" }}>
                        {header}
                        {list(true)}
                    </nav>
                )}
                <button
                    ref={toggleRef}
                    type="button"
                    aria-expanded={open}
                    aria-controls={idBase}
                    aria-label={`Sections. Current: ${activeLabel}${leftText ? `. ${done ? "Finished reading" : leftText}` : ""}`}
                    onClick={() => setOpenPersist(!open)}
                    style={{ ...glass, background: "var(--db-glass, rgba(12,12,14,0.85))", display: "flex", alignItems: "center", gap: 8, minHeight: 44, maxWidth: "100%", padding: "0 16px 0 12px", borderRadius: 999, color: TEXT, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                    <span aria-hidden style={{ width: 6, height: 6, borderRadius: 3, background: accent, flexShrink: 0 }} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, maxWidth: "46vw" }}>{activeLabel}</span>
                    {leftText ? <span style={{ whiteSpace: "nowrap", color: TEXT_2, fontSize: 12 }}>· {done ? "done" : progress < 0.02 ? `${readMins} min` : `${leftMins} min left`}</span> : null}
                    <span aria-hidden style={{ color: accent, transform: open ? "rotate(180deg)" : "none", transition: ease }}>▾</span>
                </button>
            </div>
        )
        return (
            <div ref={hostRef} style={{ width: 1, height: 1 }}>
                {createPortal(portal, document.body)}
            </div>
        )
    }

    // ── Pinned / Inline ──
    const positionStyle: CSSProperties =
        placement === "inline" ? { position: "relative", width: "100%" } : { position: "fixed", top: "50%", [pinSide]: offsetX, transform: "translateY(-50%)", width: 250, zIndex: 100 }
    return (
        <nav data-csnav="" aria-label={`${projectTitle} sections`} style={{ ...glass, ...positionStyle, borderRadius: 18, maxHeight: "calc(100vh - 80px)", overflowY: "auto", padding: "10px 6px" }}>
            {css}
            {header}
            {list(false)}
        </nav>
    )
}

addPropertyControls(CaseStudyNav, {
    placement: {
        type: ControlType.Enum,
        title: "Placement",
        options: ["responsive", "fixed", "inline", "readtime"],
        optionTitles: ["Responsive", "Pinned", "Inline", "Read time"],
        defaultValue: "responsive",
    },
    sideMinWidth: { type: ControlType.Number, title: "Side spine from", min: 700, max: 1800, step: 10, defaultValue: 1200, unit: "px", hidden: (p: any) => p.placement !== "responsive" },
    startOpen: { type: ControlType.Boolean, title: "Start open", defaultValue: false, hidden: (p: any) => p.placement !== "responsive" },
    fluidType: { type: ControlType.Boolean, title: "Fluid type", defaultValue: true, hidden: (p: any) => p.placement !== "responsive" },
    readFrom: { type: ControlType.String, title: "Read from", defaultValue: "", placeholder: "/work/general-motors", description: "Read time tag only: count another page (for work cards).", hidden: (p: any) => p.placement !== "readtime" },
    readMinutes: { type: ControlType.Number, title: "Min read", defaultValue: 0, min: 0, max: 60, step: 1, description: "0 = work it out from the page." },
    sectionsText: { type: ControlType.String, title: "Sections (text)", displayTextArea: true, defaultValue: "", description: "Label|anchor; Label|anchor — overrides the list below when filled." },
    sections: {
        type: ControlType.Array,
        title: "Sections",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label", defaultValue: "Section" },
                anchor: { type: ControlType.String, title: "Anchor ID", defaultValue: "section" },
            },
        },
        defaultValue: [
            { label: "01 · Overview", anchor: "overview" },
            { label: "02 · Problem", anchor: "problem" },
        ],
    },
    showCopyLink: { type: ControlType.Boolean, title: "Copy link", defaultValue: true },
    showProjectTitle: { type: ControlType.Boolean, title: "Show title", defaultValue: true },
    projectTitle: { type: ControlType.String, title: "Title", defaultValue: "Sections", hidden: (p: any) => !p.showProjectTitle },
    pinSide: { type: ControlType.Enum, title: "Side", options: ["left", "right"], optionTitles: ["Left", "Right"], defaultValue: "left", displaySegmentedControl: true },
    offsetX: { type: ControlType.Number, title: "Side offset", defaultValue: 16, min: 0, max: 120, step: 1, unit: "px" },
    backgroundColor: { type: ControlType.Color, title: "Background", defaultValue: "rgba(14, 14, 16, 0.78)" },
    textColor: { type: ControlType.Color, title: "Text", defaultValue: "rgba(255, 255, 255, 0.62)" },
    activeColor: { type: ControlType.Color, title: "Accent (if no vibe)", defaultValue: "#F3500F" },
})
