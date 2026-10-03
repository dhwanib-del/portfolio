// TalkingCursor v2. Dhwani (Oct 2): "when a user enters the home page, have a separate cursor… 'Hey,
// talk to me. I worked on many things. I bring a lot of mixed skills.'" + "where they're at… what
// time zone I'm in, I'm open to work" + "if it goes over [the Prime Video card] it has to say NDA".
//  • A second cursor labelled "dhwani" trails the visitor's pointer (mouse/trackpad only, never under
//    reduced motion). On arrival it says hi once; over a project it gives a one-line hook; over
//    anything marked NDA it says so.
//  • Status pill (bottom-right): open to work · Ann Arbor live time (ET). Opens a short tour.
//  • Tour panel no longer pops open on its own; Esc closes; focus returns to the pill.
//  • Colors come from the site theme tokens (--db-*), so light/dark both work.
import * as React from "react"
import { startTransition } from "react"

const TOUR = [
    { title: "Hey, I'm Dhwani 👋", text: "Product and UX designer at UMSI, graduating May 2027. Open to product, UX and experience design roles. Want the 60-second tour?", label: "", href: "" },
    { title: "BRIEFS", text: "Getting campus dispatchers a building's details mid-call.", label: "Open BRIEFS ↗", href: "/work/briefs" },
    { title: "Intel workspace", text: "A workspace the DPSS Intelligence Group uses instead of spreadsheets.", label: "Open Intel ↗", href: "/work/intel" },
    { title: "GM Convoy", text: "HVAC and in-vehicle prototyping, tested in a 3D-printed truck cab.", label: "Open Convoy ↗", href: "/work/general-motors" },
    { title: "Open Library", text: "Research that changed how Open Library explains international books.", label: "Open Open Library ↗", href: "/work/openlibrary" },
    { title: "BudgetCart", text: "Showing shoppers what fits the budget before checkout.", label: "Open BudgetCart ↗", href: "/work/budgetcart" },
    { title: "Prime Video (NDA)", text: "Current capstone with Prime Video. Under NDA, so ask me about it.", label: "", href: "" },
]

const HINTS: Record<string, string> = {
    "/work/briefs": "dispatchers, mid-call, no time to dig →",
    "/work/intel": "in use by a real intel team →",
    "/work/general-motors": "HVAC prototyping in a 3D-printed cab →",
    "/work/openlibrary": "research → Open Library changed →",
    "/work/budgetcart": "the moment before checkout →",
    "/work/prime-video": "NDA 🔒 ask me about this one",
}
const GREETING = "hey, talk to me 👋 i've worked on a lot of things: research, design, prototyping."

function etTime() {
    try {
        return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Detroit" }).format(new Date()).toLowerCase()
    } catch {
        return ""
    }
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function TalkingCursor() {
    const [open, setOpen] = React.useState(false)
    const [step, setStep] = React.useState(0)
    const [hint, setHint] = React.useState("")
    const [greet, setGreet] = React.useState(false)
    const [point, setPoint] = React.useState({ x: -100, y: -100 })
    const [viewport, setViewport] = React.useState({ w: 0, h: 0 })
    const [tracking, setTracking] = React.useState(false)
    const [finePointer, setFinePointer] = React.useState(false)
    const [reducedMotion, setReducedMotion] = React.useState(false)
    const [time, setTime] = React.useState("")

    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const headingRef = React.useRef<HTMLHeadingElement>(null)

    React.useEffect(() => {
        const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () =>
            startTransition(() => {
                setFinePointer(pointerQuery.matches)
                setReducedMotion(motionQuery.matches)
                setViewport({ w: window.innerWidth, h: window.innerHeight })
            })
        update()
        pointerQuery.addEventListener("change", update)
        motionQuery.addEventListener("change", update)
        window.addEventListener("resize", update)
        startTransition(() => setTime(etTime()))
        const clock = window.setInterval(() => startTransition(() => setTime(etTime())), 30000)
        let seen = false
        try {
            seen = !!sessionStorage.getItem("dhwani-greet-seen")
            sessionStorage.setItem("dhwani-greet-seen", "1")
        } catch {}
        let g = 0
        if (!seen) {
            startTransition(() => setGreet(true))
            g = window.setTimeout(() => startTransition(() => setGreet(false)), 7000)
        }
        return () => {
            pointerQuery.removeEventListener("change", update)
            motionQuery.removeEventListener("change", update)
            window.removeEventListener("resize", update)
            window.clearInterval(clock)
            window.clearTimeout(g)
        }
    }, [])

    React.useEffect(() => {
        if (!finePointer || reducedMotion) {
            startTransition(() => setTracking(false))
            return
        }
        let frame = 0
        let timer = 0
        let active: Element | null = null
        const move = (event: PointerEvent) => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() =>
                startTransition(() => {
                    setPoint({ x: event.clientX, y: event.clientY })
                    setTracking(true)
                })
            )
            const target = event.target instanceof Element ? event.target : null
            const nda = target?.closest("[data-nda], [data-framer-name*='NDA' i]") ?? null
            const link = nda || target?.closest("a[href]") || null
            if (link === active) return
            active = link
            window.clearTimeout(timer)
            startTransition(() => setHint(""))
            if (!link) return
            let message = ""
            if (nda) message = HINTS["/work/prime-video"]
            else {
                try {
                    message = HINTS[new URL(link.getAttribute("href") || "", window.location.href).pathname.replace(/\/$/, "")] || ""
                } catch {}
            }
            if (message) timer = window.setTimeout(() => startTransition(() => { setGreet(false); setHint(message) }), 350)
        }
        const leave = () => {
            startTransition(() => { setTracking(false); setHint("") })
            active = null
            window.clearTimeout(timer)
        }
        document.addEventListener("pointermove", move)
        document.documentElement.addEventListener("pointerleave", leave)
        window.addEventListener("blur", leave)
        return () => {
            cancelAnimationFrame(frame)
            window.clearTimeout(timer)
            document.removeEventListener("pointermove", move)
            document.documentElement.removeEventListener("pointerleave", leave)
            window.removeEventListener("blur", leave)
        }
    }, [finePointer, reducedMotion])

    function dismiss() {
        startTransition(() => setOpen(false))
        window.setTimeout(() => triggerRef.current?.focus(), 0)
    }
    function go(n: number) {
        startTransition(() => setStep(n))
        window.setTimeout(() => headingRef.current?.focus(), 0)
    }

    const current = TOUR[step]
    const say = hint || (greet && tracking ? GREETING : "")
    const bubbleWidth = Math.min(260, Math.max(160, viewport.w - 24))
    const cx = point.x + 26
    const cy = point.y + 22
    const left = Math.max(12, Math.min(cx + 14, viewport.w - bubbleWidth - 12))
    const top = cy > viewport.h - 120 ? Math.max(12, cy - 96) : cy + 26

    return (
        <>
            <style>{`
                .dg, .dg * { box-sizing: border-box; }
                .dg { font-family: Inter, system-ui, sans-serif; color: var(--db-text, #fff); }
                .dg button, .dg a { font: inherit; }
                .dg button { cursor: pointer; }
                .dg button:focus-visible, .dg a:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }
                .dg-card { background: var(--db-glass, rgba(18,18,18,.92)); border: 1px solid var(--db-glass-line, rgba(255,255,255,.12)); box-shadow: var(--db-shadow, 0 16px 50px rgba(0,0,0,.5)); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
                .dg-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 14px; border-radius: 12px; text-decoration: none; border: 0; }
                .dg-primary { background: var(--db-accent, #F3500F); color: var(--db-on-accent, #0A0A0A); font-weight: 600; }
                .dg-secondary { background: var(--db-line, rgba(255,255,255,.1)); color: var(--db-text, #fff); }
                .dg-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
                @keyframes dgIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
                @keyframes dgPulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
            `}</style>
            <div className="dg">
                {tracking && (
                    <div aria-hidden="true" style={{ position: "fixed", left: 0, top: 0, transform: `translate(${cx}px, ${cy}px)`, transition: "transform 380ms cubic-bezier(.2,.8,.2,1)", pointerEvents: "none", zIndex: 9998, display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" style={{ color: "var(--db-accent, #F3500F)" }}>
                            <path d="M1 1l5.5 13 2-5.5L14 6.5z" fill="currentColor" stroke="var(--db-bg, #000)" strokeWidth="1" />
                        </svg>
                        <span style={{ marginTop: 12, padding: "2px 8px", borderRadius: 999, background: "var(--db-accent, #F3500F)", color: "var(--db-on-accent, #0A0A0A)", fontSize: 11, fontWeight: 600 }}>dhwani</span>
                    </div>
                )}
                {tracking && say && (
                    <div aria-hidden="true" className="dg-card" style={{ position: "fixed", left, top, width: bubbleWidth, padding: "10px 14px", borderRadius: "6px 16px 16px 16px", fontSize: 13, lineHeight: 1.5, pointerEvents: "none", zIndex: 9999, animation: "dgIn 160ms ease-out" }}>
                        {say}
                    </div>
                )}

                {!open && (
                    <button
                        ref={triggerRef}
                        className="dg-card"
                        aria-expanded={false}
                        aria-controls="dg-panel"
                        aria-label={`Open to work. Ann Arbor, ${time} Eastern. Open a quick tour of Dhwani's work`}
                        onClick={() => {
                            startTransition(() => { setStep(0); setOpen(true) })
                            window.setTimeout(() => headingRef.current?.focus(), 0)
                        }}
                        style={{ position: "fixed", right: 20, bottom: 20, minHeight: 44, padding: "10px 16px", borderRadius: 999, color: "var(--db-text, #fff)", zIndex: 10000, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}
                    >
                        <span aria-hidden style={{ width: 8, height: 8, borderRadius: 4, background: "#1BC47D", boxShadow: "0 0 0 3px rgba(27,196,125,.25)", animation: reducedMotion ? "none" : "dgPulse 2.4s ease-in-out infinite" }} />
                        <span aria-hidden>open to work · ann arbor {time} ET</span>
                    </button>
                )}

                {open && (
                    <div id="dg-panel" role="dialog" aria-modal="false" aria-labelledby="dg-heading" className="dg-card" onKeyDown={(e) => { if (e.key === "Escape") dismiss() }} style={{ position: "fixed", right: 20, bottom: 20, width: "min(340px, calc(100vw - 40px))", maxHeight: "calc(100dvh - 40px)", overflowY: "auto", padding: 20, borderRadius: 20, zIndex: 10000, animation: reducedMotion ? "none" : "dgIn 180ms ease-out" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--db-text-2)", fontSize: 12, letterSpacing: "0.06em" }}>open to work · ann arbor {time} ET</span>
                            <button aria-label="Close tour" onClick={dismiss} className="dg-btn" style={{ width: 44, padding: 0, background: "transparent", color: "var(--db-text)", fontSize: 22 }}>×</button>
                        </div>
                        <h2 id="dg-heading" ref={headingRef} tabIndex={-1} style={{ margin: "8px 0", fontSize: 21, lineHeight: 1.25 }}>{current.title}</h2>
                        <p style={{ margin: "0 0 18px", color: "var(--db-text-2)", fontSize: 15, lineHeight: 1.55 }}>{current.text}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {current.href && <a className="dg-btn dg-primary" href={current.href}>{current.label}</a>}
                            {step === 0 && <button className="dg-btn dg-primary" onClick={() => go(1)}>Show me</button>}
                            {step > 0 && step < TOUR.length - 1 && <button className="dg-btn dg-secondary" onClick={() => go(step + 1)}>Next →</button>}
                            {(step === 0 || step === TOUR.length - 1) && <button className="dg-btn dg-secondary" onClick={dismiss}>{step === 0 ? "Just browsing" : "Done"}</button>}
                        </div>
                        {step > 0 && <p style={{ margin: "14px 0 0", color: "var(--db-text-2)", fontSize: 12 }}>{step} of {TOUR.length - 1}</p>}
                    </div>
                )}
            </div>
        </>
    )
}
