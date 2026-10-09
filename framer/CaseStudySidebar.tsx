// CaseStudySidebar v2 (Oct 9): case-study chapter rail + story progress.
// Sections are native Framer frames. Auto mode finds layers named "§ Something" (label = the name
// without "§ ", id = the layer's existing id or a slug assigned once, e.g. "§ Cart comparison" →
// #cart-comparison). Manual mode (and auto mode when a page has no § layers — keeps older instances
// working) uses the Sections list ({ label, anchorId }; the old { label, id } still works).
// Article = a layer named "§article", else the nearest common ancestor of the sections. Story
// progress runs 0% when the article top meets the header to 100% when its bottom reaches the
// viewport bottom. Layers inside <details> or named "§deep…" count as the deeper read.
// Desktop (≥ breakpoint): sticky rail in the page's gutter column. Below: one compact sticky
// "On this page" button + sheet. Colours come from the site theme tokens (--db-*).
import * as React from "react"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Mode = "auto" | "manual"
type Placement = "none" | "rail"
type SectionInput = { label?: string; anchorId?: string; id?: string }
type Chapter = { label: string; id: string }
type Reading = { main: number; deep: number }

interface Props {
    mode?: Mode
    sections?: SectionInput[]
    headerOffset?: number
    mobileTop?: number
    width?: number
    breakpoint?: number
    showProgress?: boolean
    showReadingTime?: boolean
    readingTimePlacement?: Placement
    zIndex?: number
    style?: CSSProperties
}

const DEFAULT_SECTIONS: SectionInput[] = [
    { label: "Overview", anchorId: "overview" },
    { label: "Persona", anchorId: "persona" },
    { label: "Problem", anchorId: "problem" },
    { label: "Process", anchorId: "process" },
    { label: "Story", anchorId: "story" },
    { label: "Design", anchorId: "design" },
    { label: "Prototype", anchorId: "prototype" },
    { label: "Outcomes", anchorId: "outcomes" },
]
const SAMPLE: Chapter[] = [
    { label: "Overview", id: "sample-overview" },
    { label: "Problem", id: "sample-problem" },
    { label: "Process", id: "sample-process" },
    { label: "Outcomes", id: "sample-outcomes" },
]

const WPM = 220
const PROSE = "p, li, h1, h2, h3, h4"
const TOGGLE = 'button[aria-expanded="false"], [role="button"][aria-expanded="false"]'
const FONT = "'Poppins', 'Inter', sans-serif"
const ACCENT = "var(--db-accent, #F3500F)"
const TEXT = "var(--db-text, #FFFFFF)"
const TEXT2 = "var(--db-text-2, rgba(255,255,255,0.6))"
const LINE = "var(--db-line, rgba(255,255,255,0.1))"
const GLASS = "var(--db-glass, rgba(18,18,18,0.82))"
const GLASS_LINE = "var(--db-glass-line, rgba(255,255,255,0.10))"
const SHADOW = "var(--db-shadow, 0 18px 40px -18px rgba(0,0,0,0.9))"

const STYLES = `
.csr-rail{position:sticky;display:flex;flex-direction:column;gap:14px;box-sizing:border-box;padding:16px 10px 10px;border-radius:20px;background:${GLASS};border:1px solid ${GLASS_LINE};box-shadow:${SHADOW};backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);color:${TEXT};font-family:${FONT};pointer-events:auto;overflow:hidden}
.csr-time{margin:0;padding:0 8px;font-size:12px;line-height:1.45;color:${TEXT2}}
.csr-meter{padding:0 8px}
.csr-meter-row{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:11px;line-height:1.3;letter-spacing:.02em;color:${TEXT2}}
.csr-track{position:relative;height:2px;border-radius:2px;background:${LINE};overflow:hidden}
.csr-fill{position:absolute;inset:0;transform-origin:left center;background:${ACCENT};transition:transform .15s linear;pointer-events:none}
.csr-end{margin-top:6px;font-size:11px;line-height:1.3;font-weight:500;color:${TEXT}}
.csr-list{list-style:none;margin:0;padding:0;min-height:0;flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.csr-link{position:relative;display:flex;align-items:center;min-height:32px;padding:6px 10px 6px 16px;border-radius:10px;color:${TEXT2};text-decoration:none;font-size:13px;line-height:1.3;font-weight:400;transition:background .2s,color .2s}
.csr-link::before{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;border-radius:2px;background:transparent;transition:background .2s;pointer-events:none}
.csr-link:hover{color:${TEXT};background:color-mix(in srgb, ${TEXT} 6%, transparent)}
.csr-link[aria-current="location"]{color:${TEXT};font-weight:600}
.csr-link[aria-current="location"]::before{background:${ACCENT}}
.csr-link:focus-visible,.csr-btn:focus-visible{outline:2px solid ${ACCENT};outline-offset:2px}
.csr-hint{margin:0;padding:0 8px;font-size:11px;line-height:1.4;color:${TEXT2}}
.csr-m{font-family:${FONT};pointer-events:auto}
.csr-btn{position:relative;display:inline-flex;align-items:center;gap:8px;max-width:100%;min-height:44px;min-width:44px;box-sizing:border-box;padding:0 16px;border-radius:999px;border:1px solid ${GLASS_LINE};background:${GLASS};backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:${SHADOW};color:${TEXT};font-family:${FONT};font-size:14px;font-weight:500;cursor:pointer;overflow:hidden;touch-action:manipulation}
.csr-btn-cur{min-width:0;max-width:40vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:400;color:${TEXT2}}
.csr-btn-bar{position:absolute;left:14px;right:14px;bottom:5px;height:2px;border-radius:2px;background:${LINE};overflow:hidden;pointer-events:none}
.csr-sheet{margin-top:8px;width:min(360px, calc(100vw - 32px));box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:14px 8px 8px;border-radius:20px;background:${GLASS};border:1px solid ${GLASS_LINE};box-shadow:${SHADOW};backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);color:${TEXT};overflow-y:auto;overscroll-behavior:contain}
.csr-sheet .csr-link{min-height:44px;font-size:15px}
@media (prefers-reduced-motion: reduce){.csr-fill,.csr-link,.csr-link::before{transition:none}}
`

// ---- DOM helpers ----
const canUseDOM = () => typeof window !== "undefined" && typeof document !== "undefined"
const visible = (el: Element | null): boolean => !!el && el.getClientRects().length > 0
function esc(s: string): string {
    if (typeof CSS !== "undefined" && typeof (CSS as any).escape === "function") return (CSS as any).escape(s)
    return s.replace(/["\\]/g, "\\$&")
}
function slugify(label: string): string {
    const s = label
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    return s || "section"
}
// Use the layer's own id if it has one; otherwise assign a unique slug once.
function claimId(el: HTMLElement, label: string): string {
    if (el.id) return el.id
    const base = slugify(label)
    let id = base
    let n = 2
    for (;;) {
        const hit = document.getElementById(id)
        if (!hit || hit === el) break
        id = `${base}-${n++}`
    }
    el.id = id
    return id
}
// Visible, or tucked inside a closed <details> that is itself on screen (we open it on click).
function available(el: HTMLElement): boolean {
    if (visible(el)) return true
    const d = el.parentElement ? el.parentElement.closest("details:not([open])") : null
    return !!d && visible(d)
}
function findById(id: string): HTMLElement | null {
    if (!id) return null
    const all = document.querySelectorAll<HTMLElement>(`[id="${esc(id)}"]`)
    for (let i = 0; i < all.length; i++) if (available(all[i])) return all[i]
    return null
}
function sectionLabel(name: string): string {
    // "§ Cart comparison" → "Cart comparison". "§article" / "§deep…" are structural, not chapters.
    if (!name.startsWith("§") || /^§(article|deep)/i.test(name)) return ""
    return name.slice(1).trim()
}
function findArticle(els: HTMLElement[]): HTMLElement | null {
    const named = Array.from(document.querySelectorAll<HTMLElement>('[data-framer-name="§article" i]')).find(visible)
    if (named) return named
    if (!els.length) return null
    if (els.length === 1) return els[0].parentElement || els[0]
    let anc: HTMLElement | null = els[0].parentElement
    while (anc && !els.every((e) => anc!.contains(e))) anc = anc.parentElement
    return anc
}
type ScanResult = { chapters: Chapter[]; els: HTMLElement[]; article: HTMLElement | null }
function scan(mode: Mode, manual: SectionInput[], self: HTMLElement | null): ScanResult {
    const chapters: Chapter[] = []
    const els: HTMLElement[] = []
    const seen = new Set<string>()
    const mine = (el: Element) => !!self && self.contains(el)
    const add = (el: HTMLElement, id: string, label: string) => {
        if (!id || !label || seen.has(id)) return
        seen.add(id)
        chapters.push({ id, label })
        els.push(el)
    }
    if (mode !== "manual") {
        document.querySelectorAll<HTMLElement>('[data-framer-name^="§"]').forEach((el) => {
            if (mine(el) || !available(el)) return
            const label = sectionLabel(el.getAttribute("data-framer-name") || "")
            if (label) add(el, claimId(el, label), label)
        })
    }
    // Manual mode — or auto mode on a page without § layers, so existing instances keep their list.
    if (!chapters.length) {
        ;(manual || []).forEach((s) => {
            const id = String((s && (s.anchorId || s.id)) || "").replace(/^#/, "").trim()
            const el = findById(id)
            if (el && !mine(el)) add(el, id, String((s && s.label) || "").trim() || id)
        })
    }
    return { chapters, els, article: findArticle(els) }
}
function articleProgress(article: HTMLElement, hdr: number): number {
    const r = article.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight || 0
    const span = r.height - (vh - hdr)
    if (span <= 0) return r.bottom <= vh + 1 ? 100 : 0 // short article: done once fully visible
    return Math.min(100, Math.max(0, ((hdr - r.top) / span) * 100))
}
function countWords(article: HTMLElement, self: HTMLElement | null): Reading {
    let main = 0
    let deep = 0
    article.querySelectorAll<HTMLElement>(PROSE).forEach((el) => {
        if (self && self.contains(el)) return
        if (el.closest("nav, button, [role='button'], [aria-hidden='true'], [data-cs-rail], [data-dbnav]")) return
        if (el.parentElement && el.parentElement.closest(PROSE)) return // counted by its outer block
        const host = el.closest<HTMLElement>("details, [data-framer-name^='§deep' i]")
        const isDeep = !!host && article.contains(host)
        if (isDeep ? !visible(host) : !visible(el)) return
        const words = (el.textContent || "").trim().split(/\s+/).filter(Boolean).length
        if (isDeep) deep += words
        else main += words
    })
    return { main, deep }
}
// Open closed <details> / aria-expanded accordions that hide the target. Returns true if anything opened.
function reveal(target: HTMLElement): boolean {
    let changed = false
    for (let n: HTMLElement | null = target.parentElement; n && n !== document.body; n = n.parentElement) {
        if (n.tagName === "DETAILS") {
            const d = n as HTMLDetailsElement
            if (!d.open) {
                d.open = true
                changed = true
            }
            continue
        }
        if (n.id) {
            const ctl = document.querySelector<HTMLElement>(`[aria-controls~="${esc(n.id)}"][aria-expanded="false"]`)
            if (ctl) {
                ctl.click()
                changed = true
                continue
            }
        }
        const prev = n.previousElementSibling
        if (prev instanceof HTMLElement && !visible(n)) {
            const b = prev.matches(TOGGLE) ? prev : prev.querySelector<HTMLElement>(TOGGLE)
            if (b) {
                b.click()
                changed = true
            }
        }
    }
    return changed
}
function readHash(): string {
    try {
        return decodeURIComponent(window.location.hash.slice(1))
    } catch {
        return window.location.hash.slice(1)
    }
}

let OWNER: symbol | null = null

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 200
 * @framerIntrinsicHeight 420
 */
export default function CaseStudySidebar(props: Props) {
    const {
        mode = "auto",
        sections = DEFAULT_SECTIONS,
        headerOffset = 96,
        mobileTop = 72,
        width = 200,
        breakpoint = 1100,
        showProgress = true,
        showReadingTime = true,
        readingTimePlacement = "rail",
        zIndex = 2147478000,
        style,
    } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const hdr = Math.max(0, Number(headerOffset) || 0)
    const sectionsKey = JSON.stringify(sections || [])
    const me = useRef(Symbol("cs-rail")).current
    const uid = useRef("csr-" + Math.random().toString(36).slice(2, 8)).current

    const hostRef = useRef<HTMLDivElement | null>(null)
    const btnRef = useRef<HTMLButtonElement | null>(null)
    const sheetRef = useRef<HTMLDivElement | null>(null)
    const elsRef = useRef<HTMLElement[]>([])
    const articleRef = useRef<HTMLElement | null>(null)
    const activeRef = useRef("")
    const progressRef = useRef(-1)
    const hdrRef = useRef(hdr)
    const reducedRef = useRef(false)
    const aliveRef = useRef(true)
    const didHashRef = useRef(false)
    hdrRef.current = hdr

    const [chapters, setChapters] = useState<Chapter[]>([])
    const [articleKey, setArticleKey] = useState(0)
    const [active, setActive] = useState("")
    const [progress, setProgress] = useState(0)
    const [reading, setReading] = useState<Reading>({ main: 0, deep: 0 })
    const [wide, setWide] = useState(true)
    const [owner, setOwner] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)

    const setAct = (id: string) => {
        if (activeRef.current === id) return
        activeRef.current = id
        setActive(id)
    }

    const goTo = (id: string, smooth: boolean, push: boolean, focus: boolean): boolean => {
        const el = elsRef.current.find((x) => x.id === id) || findById(id)
        if (!el) return false
        const opened = reveal(el)
        el.style.scrollMarginTop = `${hdrRef.current}px`
        const run = () => {
            el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" })
            if (focus) {
                if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1")
                try {
                    el.focus({ preventScroll: true })
                } catch {}
            }
        }
        if (opened) window.requestAnimationFrame(() => window.requestAnimationFrame(run))
        else run()
        if (push) {
            try {
                if (window.location.hash !== "#" + id) window.history.pushState(window.history.state, "", "#" + id)
            } catch {}
        }
        return true
    }
    const goToRef = useRef(goTo)
    goToRef.current = goTo

    // Breakpoint, reduced motion, mount.
    useEffect(() => {
        if (!canUseDOM()) return
        aliveRef.current = true
        const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const on = () => {
            setWide(mq.matches)
            reducedRef.current = rm.matches
        }
        on()
        setMounted(true)
        mq.addEventListener("change", on)
        rm.addEventListener("change", on)
        return () => {
            mq.removeEventListener("change", on)
            rm.removeEventListener("change", on)
        }
    }, [breakpoint])
    useEffect(
        () => () => {
            aliveRef.current = false
        },
        []
    )

    // Framer mounts every breakpoint: only the visible instance draws the phone button.
    useEffect(() => {
        if (onCanvas || !canUseDOM()) return
        const check = () => {
            if (visible(hostRef.current) && (!OWNER || OWNER === me)) {
                OWNER = me
                setOwner(true)
            } else {
                if (OWNER === me) OWNER = null
                setOwner(false)
            }
        }
        let t = 0
        const onResize = () => {
            check()
            window.clearTimeout(t)
            t = window.setTimeout(check, 80)
        }
        onResize()
        window.addEventListener("resize", onResize)
        return () => {
            window.clearTimeout(t)
            window.removeEventListener("resize", onResize)
            if (OWNER === me) OWNER = null
        }
    }, [onCanvas, me])

    // The Framer wrapper must not block clicks outside the rail itself.
    useEffect(() => {
        if (onCanvas || !canUseDOM()) return
        const touched: Array<[HTMLElement, string]> = []
        let el: HTMLElement | null = hostRef.current ? hostRef.current.parentElement : null
        for (let i = 0; el && i < 3; i++) {
            if (el === document.body || el.id === "main" || el.childElementCount !== 1) break
            touched.push([el, el.style.pointerEvents])
            el.style.pointerEvents = "none"
            el = el.parentElement
        }
        return () => touched.forEach(([e, v]) => (e.style.pointerEvents = v))
    }, [onCanvas])

    // Find sections + article (again once layout, fonts and late layers settle).
    useEffect(() => {
        if (onCanvas || !canUseDOM()) return
        let sig = ""
        let raf = 0
        let alive = true
        const run = () => {
            raf = 0
            const res = scan(mode, sections || [], hostRef.current)
            elsRef.current = res.els
            res.els.forEach((el) => {
                el.style.scrollMarginTop = `${hdr}px`
            })
            const next = res.chapters.map((c) => c.id + "\u0001" + c.label).join("\u0002")
            const articleChanged = res.article !== articleRef.current
            articleRef.current = res.article
            if (next !== sig || articleChanged) {
                sig = next
                setChapters(res.chapters)
                setArticleKey((k) => k + 1)
            }
        }
        const schedule = () => {
            if (!raf) raf = window.requestAnimationFrame(run)
        }
        run()
        const timers = [300, 1200, 3000].map((ms) => window.setTimeout(schedule, ms))
        window.addEventListener("resize", schedule)
        window.addEventListener("load", schedule)
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) fonts.ready.then(() => alive && schedule(), () => {})
        return () => {
            alive = false
            timers.forEach((t) => window.clearTimeout(t))
            if (raf) window.cancelAnimationFrame(raf)
            window.removeEventListener("resize", schedule)
            window.removeEventListener("load", schedule)
            elsRef.current.forEach((el) => {
                el.style.scrollMarginTop = ""
            })
        }
    }, [onCanvas, mode, sectionsKey, hdr]) // eslint-disable-line

    // Story progress + reading time, scoped to the article.
    useEffect(() => {
        if (onCanvas || !canUseDOM()) return
        const article = articleRef.current
        if (!article) {
            progressRef.current = 0
            setProgress(0)
            setReading({ main: 0, deep: 0 })
            return
        }
        let raf = 0
        let recount = true
        let alive = true
        const measure = () => {
            raf = 0
            if (recount) {
                recount = false
                setReading(countWords(article, hostRef.current))
            }
            const p = Math.round(articleProgress(article, hdr) * 10) / 10
            if (p !== progressRef.current) {
                progressRef.current = p
                setProgress(p)
            }
            const els = elsRef.current
            if (!els.length) return
            const vh = window.innerHeight
            if (p <= 0 && els[0].getBoundingClientRect().top > vh * 0.6) setAct("")
            else if (p >= 100) {
                let last = ""
                els.forEach((el) => {
                    if (el.getBoundingClientRect().top < vh - 40) last = el.id
                })
                if (last) setAct(last)
            }
        }
        const schedule = () => {
            if (!raf) raf = window.requestAnimationFrame(measure)
        }
        const again = () => {
            recount = true
            schedule()
        }
        schedule()
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", again)
        article.addEventListener("load", again, true) // images/video inside the article
        article.addEventListener("loadedmetadata", again, true)
        article.addEventListener("toggle", again, true) // <details>
        let ro: ResizeObserver | null = null
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(again)
            ro.observe(article)
        }
        let mo: MutationObserver | null = null
        if (typeof MutationObserver !== "undefined") {
            mo = new MutationObserver(again) // accordions
            mo.observe(article, { subtree: true, attributes: true, attributeFilter: ["open", "aria-expanded"] })
        }
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) fonts.ready.then(() => alive && again(), () => {})
        return () => {
            alive = false
            if (raf) window.cancelAnimationFrame(raf)
            window.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", again)
            article.removeEventListener("load", again, true)
            article.removeEventListener("loadedmetadata", again, true)
            article.removeEventListener("toggle", again, true)
            if (ro) ro.disconnect()
            if (mo) mo.disconnect()
        }
    }, [articleKey, hdr, onCanvas]) // eslint-disable-line

    // Active chapter: IntersectionObserver band just below the header.
    useEffect(() => {
        if (onCanvas || !canUseDOM() || typeof IntersectionObserver === "undefined") return
        const els = elsRef.current
        if (!els.length) return
        const hits = new Set<Element>()
        let io: IntersectionObserver | null = null
        const pick = () => {
            let id = ""
            els.forEach((el) => {
                if (hits.has(el)) id = el.id
            })
            if (id) setAct(id)
        }
        const build = () => {
            if (io) io.disconnect()
            hits.clear()
            const vh = window.innerHeight
            const bottom = Math.round(Math.max(0, Math.min(vh * 0.55, vh - hdr - 48)))
            io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => (e.isIntersecting ? hits.add(e.target) : hits.delete(e.target)))
                    pick()
                },
                { rootMargin: `-${hdr}px 0px -${bottom}px 0px`, threshold: 0 }
            )
            els.forEach((el) => io!.observe(el))
        }
        build()
        let t = 0
        const onResize = () => {
            window.clearTimeout(t)
            t = window.setTimeout(build, 150)
        }
        window.addEventListener("resize", onResize)
        return () => {
            window.clearTimeout(t)
            window.removeEventListener("resize", onResize)
            if (io) io.disconnect()
        }
    }, [articleKey, hdr, onCanvas]) // eslint-disable-line

    // Initial hash, once the sections exist and layout has settled.
    useEffect(() => {
        if (onCanvas || !canUseDOM() || didHashRef.current || !chapters.length) return
        const id = readHash()
        if (!id) {
            didHashRef.current = true
            return
        }
        if (!chapters.some((c) => c.id === id)) return
        didHashRef.current = true
        const go = () =>
            window.setTimeout(() => {
                if (!aliveRef.current) return
                if (goToRef.current(id, false, false, false)) setAct(id)
            }, 350)
        const fonts = (document as any).fonts
        if (fonts && fonts.ready) fonts.ready.then(go, go)
        else go()
    }, [chapters, onCanvas]) // eslint-disable-line

    // Back/forward and hash edits.
    useEffect(() => {
        if (onCanvas || !canUseDOM()) return
        let raf = 0
        const run = () => {
            raf = 0
            const id = readHash()
            if (!id || !elsRef.current.some((el) => el.id === id)) return
            if (goToRef.current(id, !reducedRef.current, false, false)) setAct(id)
        }
        const on = () => {
            if (!raf) raf = window.requestAnimationFrame(run)
        }
        window.addEventListener("hashchange", on)
        window.addEventListener("popstate", on)
        return () => {
            if (raf) window.cancelAnimationFrame(raf)
            window.removeEventListener("hashchange", on)
            window.removeEventListener("popstate", on)
        }
    }, [onCanvas]) // eslint-disable-line

    // Phone sheet: focus in, Esc / outside tap closes.
    const closeSheet = (refocus: boolean) => {
        setOpen(false)
        if (refocus) window.setTimeout(() => btnRef.current && btnRef.current.focus(), 0)
    }
    useEffect(() => {
        if (wide && open) setOpen(false)
    }, [wide, open])
    useEffect(() => {
        if (!open || !canUseDOM()) return
        const t = window.setTimeout(() => {
            const sheet = sheetRef.current
            const first = sheet && (sheet.querySelector<HTMLElement>('a[aria-current="location"]') || sheet.querySelector<HTMLElement>("a"))
            if (first) first.focus()
        }, 20)
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            e.preventDefault()
            closeSheet(true)
        }
        const onDown = (e: PointerEvent) => {
            const n = e.target as Node
            if ((sheetRef.current && sheetRef.current.contains(n)) || (btnRef.current && btnRef.current.contains(n))) return
            closeSheet(false)
        }
        document.addEventListener("keydown", onKey)
        document.addEventListener("pointerdown", onDown)
        return () => {
            window.clearTimeout(t)
            document.removeEventListener("keydown", onKey)
            document.removeEventListener("pointerdown", onDown)
        }
    }, [open]) // eslint-disable-line

    const onLink = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onCanvas) {
            e.preventDefault()
            return
        }
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        // Framer's router can swallow native hash jumps, so scroll explicitly (with header offset).
        e.preventDefault()
        if (goTo(id, !reducedRef.current, true, true)) setAct(id)
        if (open) closeSheet(false)
    }

    // ---- render ----
    const list = onCanvas ? (mode === "manual" ? manualPreview(sections) : SAMPLE) : chapters
    const act = onCanvas ? (list[1] || list[0] || { id: "" }).id : active
    const pct = onCanvas ? 35 : Math.round(progress)
    const done = !onCanvas && progress >= 99.5
    const words = reading.main + reading.deep
    const mainMin = Math.max(1, Math.ceil(reading.main / WPM))
    const allMin = Math.max(1, Math.ceil(words / WPM))
    const readingLabel = onCanvas
        ? "~6 min read"
        : words === 0
          ? ""
          : reading.deep > 0
            ? `~${mainMin} min main story · ~${allMin} min deeper read`
            : `~${allMin} min read`
    const showRT = showReadingTime && readingTimePlacement !== "none" && !!readingLabel

    const meter = showProgress && (
        <div className="csr-meter">
            <div className="csr-meter-row" aria-hidden="true">
                <span>Story progress</span>
                {!done && <span>{pct}%</span>}
            </div>
            <div
                className="csr-track"
                role="progressbar"
                aria-label="Story progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-valuetext={done ? "End of case study" : `${pct}%`}
            >
                <span className="csr-fill" style={{ transform: `scaleX(${pct / 100})` }} />
            </div>
            {done && <div className="csr-end">End of case study</div>}
        </div>
    )
    const chapterList = (
        <ol className="csr-list" role="list">
            {list.map((c) => (
                <li key={c.id}>
                    <a className="csr-link" href={`#${c.id}`} aria-current={c.id === act ? "location" : undefined} onClick={onLink(c.id)}>
                        {c.label}
                    </a>
                </li>
            ))}
        </ol>
    )
    const host = (children: React.ReactNode) => (
        <div ref={hostRef} data-cs-rail="" style={{ ...style, position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
            <style>{STYLES}</style>
            {children}
        </div>
    )
    const rail = (
        <nav
            aria-label="On this page"
            className="csr-rail"
            data-db-keep=""
            style={{ top: hdr, width, maxWidth: "100%", maxHeight: `calc(100vh - ${hdr}px - 32px)` }}
        >
            {showRT && <p className="csr-time">{readingLabel}</p>}
            {meter}
            {chapterList}
            {onCanvas && mode !== "manual" && <p className="csr-hint">§ layers will appear here</p>}
        </nav>
    )

    if (onCanvas) return host(rail)
    if (!mounted || !chapters.length) return host(null)
    if (wide) return host(rail)

    const current = chapters.find((c) => c.id === active)
    const sheetId = `${uid}-sheet`
    const phone = (
        <nav
            aria-label="On this page"
            className="csr-m"
            data-db-keep=""
            style={{ position: "fixed", top: mobileTop, left: 16, maxWidth: "calc(100vw - 32px)", zIndex }}
            onBlur={(e) => {
                const next = e.relatedTarget as Node | null
                if (open && next && !e.currentTarget.contains(next)) closeSheet(false)
            }}
        >
            <style>{STYLES}</style>
            <button
                ref={btnRef}
                type="button"
                className="csr-btn"
                aria-expanded={open}
                aria-controls={sheetId}
                onClick={() => (open ? closeSheet(true) : setOpen(true))}
            >
                <span>On this page</span>
                {current && <span className="csr-btn-cur" aria-hidden="true">· {current.label}</span>}
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", pointerEvents: "none" }}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
                {showProgress && (
                    <span className="csr-btn-bar" aria-hidden="true">
                        <span className="csr-fill" style={{ transform: `scaleX(${pct / 100})` }} />
                    </span>
                )}
            </button>
            {open && (
                <div id={sheetId} ref={sheetRef} className="csr-sheet" style={{ maxHeight: `calc(100vh - ${mobileTop}px - 72px)` }}>
                    {showRT && <p className="csr-time">{readingLabel}</p>}
                    {meter}
                    {chapterList}
                </div>
            )}
        </nav>
    )
    return host(owner && typeof document !== "undefined" ? createPortal(phone, document.body) : null)
}

function manualPreview(sections: SectionInput[] | undefined): Chapter[] {
    const out: Chapter[] = []
    ;(sections || []).forEach((s, i) => {
        const id = String((s && (s.anchorId || s.id)) || `section-${i}`)
        out.push({ id: `${id}-${i}`, label: String((s && s.label) || id) })
    })
    return out.length ? out : SAMPLE
}

addPropertyControls(CaseStudySidebar, {
    mode: {
        type: ControlType.Enum,
        title: "Find sections",
        options: ["auto", "manual"],
        optionTitles: ["Auto (§ layers)", "Manual list"],
        defaultValue: "auto",
        displaySegmentedControl: true,
    },
    sections: {
        type: ControlType.Array,
        title: "Manual list",
        description: "Used in Manual mode, and in Auto mode when the page has no layers named “§ …”.",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                anchorId: { type: ControlType.String, title: "Anchor ID" },
                id: { type: ControlType.String, title: "Old ID" },
            },
        },
        defaultValue: DEFAULT_SECTIONS,
    },
    headerOffset: { type: ControlType.Number, title: "Header offset", min: 0, max: 240, step: 1, defaultValue: 96, unit: "px" },
    mobileTop: { type: ControlType.Number, title: "Phone top", min: 0, max: 200, step: 1, defaultValue: 72, unit: "px" },
    width: { type: ControlType.Number, title: "Rail width", min: 140, max: 320, step: 4, defaultValue: 200, unit: "px" },
    breakpoint: { type: ControlType.Number, title: "Rail from", min: 600, max: 1600, step: 10, defaultValue: 1100, unit: "px" },
    showProgress: { type: ControlType.Boolean, title: "Story progress", defaultValue: true },
    showReadingTime: { type: ControlType.Boolean, title: "Reading time", defaultValue: true },
    readingTimePlacement: {
        type: ControlType.Enum,
        title: "Time placement",
        options: ["rail", "none"],
        optionTitles: ["Rail", "None"],
        defaultValue: "rail",
        displaySegmentedControl: true,
        hidden: (p: Props) => p.showReadingTime === false,
    },
    zIndex: { type: ControlType.Number, title: "Phone z-index", min: 1, max: 2147479999, step: 1, defaultValue: 2147478000 },
})
