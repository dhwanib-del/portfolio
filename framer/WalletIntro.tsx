// WalletIntro → "What's in my bag" (Oct 3 v2). Dhwani's Home hero: a slouchy open tote, tinted by
// the visitor's vibe, with the things she always carries poking out: photo-booth strip, DJ
// headphones, the USB with tonight's set, Loop earplugs (rave-ready), a framed photo of home, a
// Tic Tac box and a few trinkets. Click/Enter pulls an item out (and back); on desktop you can
// also drag things around. A ribbon on the bag scrolls "hello" in the languages she speaks.
// Not full-screen: ~560px tall. Responsive, light/dark aware, reduced-motion safe.
import * as React from "react"
import { useEffect, useRef, useState, startTransition } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

interface Props {
    eyebrow: string
    heading: string
    greetings: string
    strip1: any; strip2: any; strip3: any
    homePhoto: any
    homeLabel: string
    setName: string
    sticker: string
    style?: React.CSSProperties
}

const SERIF = "'Instrument Serif', Georgia, serif"
const HAND = "'Caveat', 'Segoe Print', cursive"
const SANS = "'Poppins', 'Inter', sans-serif"
const MONO = "'IBM Plex Mono', ui-monospace, monospace"
const VA = "var(--vibe-a, #FF8C3C)"
const VB = "var(--vibe-b, #F3500F)"
const VC = "var(--vibe-c, #FFCB05)"

function Pic({ img, label, w, h, gray }: { img: any; label: string; w: number; h: number; gray?: boolean }) {
    return img?.src ? (
        <img src={img.src} alt={img.alt || label} draggable={false} style={{ width: w, height: h, objectFit: "cover", display: "block", filter: gray ? "grayscale(1) contrast(1.08)" : undefined }} />
    ) : (
        <span role="img" aria-label={label + " (photo coming soon)"} style={{ display: "block", width: w, height: h, background: gray ? "linear-gradient(160deg,#d6d6d6,#7d7d7d)" : "linear-gradient(160deg,#e6d6c2,#a48c74)" }} />
    )
}

type Thing = { id: string; label: string; tag: string; x: number; y: number; r: number; ox: number; oy: number; or: number; z: number; render: (s: number) => React.ReactNode }

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1080
 */
export default function WalletIntro(props: Props) {
    const {
        eyebrow = "what's in my bag", heading = "Always prepared. Mostly.",
        greetings = "hello · नमस्ते · ನಮಸ್ಕಾರ", strip1, strip2, strip3, homePhoto,
        homeLabel = "home, always on me", setName = "tonight's set", sticker = "do not touch the aux", style,
    } = props
    const reduce = useReducedMotion()
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const ref = useRef<HTMLDivElement>(null)
    const [w, setW] = useState(1000)
    const [out, setOut] = useState<Record<string, boolean>>({})
    const [hover, setHover] = useState<string | null>(null)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => startTransition(() => setW(e.contentRect.width)))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    const s = Math.max(0.36, Math.min(1, w / 1000))
    const H = 560 * s
    const cx = w / 2

    // positions are in the 1000×560 design space, measured from the bag centre (x) and top (y)
    const things: Thing[] = [
        { id: "strip", label: "Photo-booth strip", tag: "photo booth, every time", x: -150, y: 150, r: -12, ox: -400, oy: 70, or: -6, z: 3, render: (k) => (
            <span style={{ display: "grid", gap: 6 * k, padding: 7 * k, background: "#fbfbf8", boxShadow: "0 10px 20px rgba(0,0,0,.3)" }}>
                {[strip1, strip2, strip3].map((p, i) => <Pic key={i} img={p} label={`Photo-booth frame ${i + 1}`} w={84 * k} h={74 * k} gray />)}
            </span>) },
        { id: "phones", label: "DJ headphones", tag: "headphones, coiled cable, non-negotiable", x: 40, y: 110, r: 14, ox: 360, oy: 40, or: 6, z: 2, render: (k) => (
            <svg width={190 * k} height={190 * k} viewBox="0 0 190 190" aria-hidden>
                <path d="M30 110 C30 40 160 40 160 110" fill="none" stroke="#141414" strokeWidth="14" strokeLinecap="round" />
                <path d="M34 108 C34 50 156 50 156 108" fill="none" stroke="#3a3a3a" strokeWidth="4" />
                <rect x="10" y="98" width="46" height="64" rx="20" fill="#1b1b1b" /><rect x="18" y="106" width="30" height="48" rx="14" fill={VB} />
                <rect x="134" y="98" width="46" height="64" rx="20" fill="#1b1b1b" /><rect x="142" y="106" width="30" height="48" rx="14" fill={VB} />
                <path d="M33 162 q0 10 8 12 q10 2 10 12" fill="none" stroke="#141414" strokeWidth="3" />
                <path d="M51 186 c6-6 12 6 18 0 c6-6 12 6 18 0" fill="none" stroke="#141414" strokeWidth="3" />
            </svg>) },
        { id: "usb", label: "USB stick with tonight's DJ set", tag: setName + " (do not lose)", x: 150, y: 190, r: -24, ox: 250, oy: 330, or: -8, z: 4, render: (k) => (
            <svg width={120 * k} height={52 * k} viewBox="0 0 120 52" aria-hidden>
                <rect x="0" y="8" width="30" height="36" rx="3" fill="#cfd3d8" stroke="#8b9097" /><rect x="6" y="16" width="6" height="6" fill="#8b9097" /><rect x="16" y="16" width="6" height="6" fill="#8b9097" />
                <rect x="28" y="2" width="86" height="48" rx="10" fill="#111" />
                <rect x="40" y="14" width="62" height="24" rx="4" fill={VC} />
                <text x="71" y="31" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fontWeight="700" fill="#111">SET.WAV</text>
                <circle cx="108" cy="26" r="4" fill="none" stroke="#555" strokeWidth="2" />
            </svg>) },
        { id: "loop", label: "Loop earplugs", tag: "Loop earplugs, rave-ready", x: -40, y: 210, r: 0, ox: -260, oy: 360, or: 0, z: 5, render: (k) => (
            <svg width={110 * k} height={70 * k} viewBox="0 0 110 70" aria-hidden>
                <rect x="4" y="18" width="102" height="48" rx="24" fill="#f3f0ea" stroke="rgba(0,0,0,.15)" />
                {[30, 80].map((c) => (
                    <g key={c}><circle cx={c} cy="40" r="15" fill="none" stroke={VB} strokeWidth="6" /><circle cx={c} cy="40" r="6" fill="#d9d4cc" /></g>
                ))}
                <path d="M30 25 V8 M80 25 V8" stroke={VB} strokeWidth="3" strokeLinecap="round" />
            </svg>) },
        { id: "home", label: "Framed photo of home", tag: homeLabel, x: -60, y: 70, r: 6, ox: -170, oy: 20, or: -3, z: 1, render: (k) => (
            <span style={{ display: "block", padding: 10 * k, background: "linear-gradient(135deg,#c9a46b,#8f6a33)", borderRadius: 6 * k, boxShadow: "0 10px 20px rgba(0,0,0,.3)" }}>
                <span style={{ display: "block", padding: 5 * k, background: "#f6f1e7" }}><Pic img={homePhoto} label="Family photo" w={118 * k} h={92 * k} /></span>
            </span>) },
        { id: "tictac", label: "Tic Tac box", tag: "tic tacs, for everyone", x: 110, y: 120, r: 20, ox: 410, oy: 300, or: 12, z: 2, render: (k) => (
            <svg width={44 * k} height={96 * k} viewBox="0 0 44 96" aria-hidden>
                <rect x="4" y="10" width="36" height="82" rx="8" fill="rgba(255,255,255,.7)" stroke="rgba(0,0,0,.2)" />
                <rect x="2" y="2" width="40" height="14" rx="4" fill="#2fb36b" />
                {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={14 + (i % 2) * 16} cy={34 + Math.floor(i / 2) * 18} rx="7" ry="4.5" fill="#fff" stroke="rgba(0,0,0,.12)" />)}
                <rect x="9" y="50" width="26" height="14" rx="3" fill="#2fb36b" opacity=".9" />
            </svg>) },
        { id: "charm", label: "Star keychain", tag: "lucky star (it works sometimes)", x: 190, y: 250, r: 10, ox: 120, oy: 380, or: 0, z: 6, render: (k) => (
            <svg width={70 * k} height={96 * k} viewBox="0 0 70 96" aria-hidden>
                <circle cx="35" cy="12" r="9" fill="none" stroke="#b8bcc2" strokeWidth="4" />
                <path d="M35 21 V36" stroke="#b8bcc2" strokeWidth="3" />
                <path d="M35 36 l8 17 18 2 -13 12 4 18 -17 -9 -17 9 4 -18 -13 -12 18 -2z" fill={VC} stroke="#1b1b1b" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>) },
        { id: "clip", label: "Claw clip", tag: "claw clip, emergency hair", x: -190, y: 245, r: -30, ox: -420, oy: 280, or: -18, z: 6, render: (k) => (
            <svg width={90 * k} height={60 * k} viewBox="0 0 90 60" aria-hidden>
                <path d="M6 40 C6 10 40 6 45 30 C50 6 84 10 84 40 C70 30 58 50 45 44 C32 50 20 30 6 40z" fill={VA} stroke="#1b1b1b" strokeWidth="2.5" opacity=".95" />
                <rect x="38" y="24" width="14" height="22" rx="4" fill="#1b1b1b" />
            </svg>) },
    ]

    const toggle = (id: string) => setOut((o) => ({ ...o, [id]: !o[id] }))
    const marquee = (greetings + " · ").repeat(6)

    // bag geometry (design space)
    const bagW = 470, bagTop = 230, bagH = 300

    return (
        <section ref={ref} aria-labelledby="dbbag-h" style={{ width: "100%", fontFamily: SANS, ...style }}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@500;700&family=Noto+Sans+Kannada:wght@500&family=Noto+Sans+Devanagari:wght@500&display=swap" />
            <style>{`
                @keyframes dbbag-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
                .dbbag-thing:focus-visible > .dbbag-body { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 6px; border-radius: 8px; }
                @media (prefers-reduced-motion: reduce) { .dbbag-ribbon { animation: none !important; } }
            `}</style>
            <div style={{ textAlign: "center", marginBottom: 6 }}>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--db-text-2, rgba(255,255,255,.6))" }}>{eyebrow}</p>
                <h2 id="dbbag-h" style={{ margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: `clamp(34px, ${6 * s}vw, 64px)`, lineHeight: 1, color: "var(--db-text, #fff)" }}>{heading}</h2>
                <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--db-text-2, rgba(255,255,255,.6))" }}>{onCanvas ? "" : w < 640 ? "Tap things to pull them out." : "Click things to pull them out, or drag them around."}</p>
            </div>
            <div style={{ position: "relative", height: H, overflow: "visible", maxWidth: 1000, margin: "0 auto" }}>
                {/* bag back + interior */}
                <svg aria-hidden width={bagW * s} height={bagH * s} viewBox="0 0 470 300" style={{ position: "absolute", left: cx - (bagW * s) / 2, top: bagTop * s, overflow: "visible" }}>
                    <defs>
                        <linearGradient id="dbbag-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0d0d" /><stop offset="1" stopColor="#2a2a2a" /></linearGradient>
                    </defs>
                    <path d="M120 10 C 60 -150 410 -150 350 10" fill="none" stroke="#1a1a1a" strokeWidth="16" strokeLinecap="round" />
                    <path d="M120 10 C 60 -150 410 -150 350 10" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" strokeDasharray="2 8" />
                    <ellipse cx="235" cy="16" rx="222" ry="26" fill="url(#dbbag-in)" />
                </svg>
                {/* items */}
                {things.map((t) => {
                    const isOut = !!out[t.id]
                    const x = cx + (isOut ? t.ox : t.x) * s
                    const y = (isOut ? t.oy : t.y + 60) * s
                    return (
                        <motion.button
                            key={t.id}
                            type="button"
                            className="dbbag-thing"
                            aria-label={`${t.label}. ${t.tag}. ${isOut ? "Put it back" : "Pull it out"}`}
                            aria-pressed={isOut}
                            onClick={() => toggle(t.id)}
                            onHoverStart={() => setHover(t.id)} onHoverEnd={() => setHover(null)}
                            onFocus={() => setHover(t.id)} onBlur={() => setHover(null)}
                            drag={!onCanvas && w >= 640}
                            dragConstraints={ref}
                            dragElastic={0.1}
                            dragMomentum={false}
                            whileDrag={{ scale: 1.06, zIndex: 60 }}
                            initial={false}
                            animate={{ left: x, top: y, rotate: isOut ? t.or : t.r, zIndex: isOut ? 40 + t.z : t.z }}
                            whileHover={reduce ? undefined : { scale: 1.05 }}
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 20 }}
                            style={{ position: "absolute", width: 0, height: 0, overflow: "visible", background: "none", border: 0, padding: 0, cursor: "pointer", touchAction: "none", lineHeight: 0, outline: "none" }}
                        >
                            <span className="dbbag-body" style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)", display: "block" }}>
                            {t.render(s)}
                            <span aria-hidden style={{ position: "absolute", left: "50%", top: "100%", transform: "translate(-50%, 8px) rotate(-2deg)", whiteSpace: "nowrap", padding: "3px 10px", borderRadius: 6, background: "#fffdf7", color: "#1b1b1b", fontFamily: HAND, fontSize: Math.max(16, 22 * s), lineHeight: 1.1, boxShadow: "0 4px 10px rgba(0,0,0,.25)", opacity: hover === t.id || isOut ? 1 : 0, transition: "opacity .18s ease", pointerEvents: "none" }}>{t.tag}</span>
                            </span>
                        </motion.button>
                    )
                })}
                {/* bag front (covers what's still inside) */}
                <div aria-hidden style={{ position: "absolute", left: cx - (bagW * s) / 2, top: (bagTop + 14) * s, width: bagW * s, height: (bagH - 14) * s, zIndex: 30, pointerEvents: "none" }}>
                    <svg width="100%" height="100%" viewBox="0 0 470 286" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                        <defs>
                            <linearGradient id="dbbag-fab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={VA} /><stop offset=".55" stopColor={VB} /><stop offset="1" stopColor={VA} /></linearGradient>
                            <filter id="dbbag-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
                        </defs>
                        <path d="M14 4 C 120 26 350 26 456 4 L 430 270 C 420 284 50 284 38 270 Z" fill="url(#dbbag-fab)" />
                        <path d="M14 4 C 120 26 350 26 456 4 L 430 270 C 420 284 50 284 38 270 Z" fill="#000" filter="url(#dbbag-grain)" />
                        <path d="M30 18 C 130 38 340 38 440 18" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeDasharray="6 7" />
                        <path d="M44 258 C 160 270 310 270 424 258" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="2" strokeDasharray="6 7" />
                        {/* safety pin */}
                        <g transform="translate(372 64) rotate(28)"><path d="M0 0 h54 a8 8 0 0 1 0 16 h-50" fill="none" stroke="#d7dade" strokeWidth="3" /><circle cx="-2" cy="8" r="6" fill="none" stroke="#d7dade" strokeWidth="3" /></g>
                    </svg>
                    {/* languages ribbon */}
                    <div style={{ position: "absolute", left: "6%", right: "6%", top: "38%", height: 40 * s + 8, overflow: "hidden", background: "#111", transform: "rotate(-3deg)", boxShadow: "0 6px 14px rgba(0,0,0,.3)" }}>
                        <div className="dbbag-ribbon" style={{ display: "inline-flex", whiteSpace: "nowrap", height: "100%", alignItems: "center", animation: reduce ? "none" : "dbbag-marquee 18s linear infinite", fontFamily: "'Instrument Serif', 'Noto Sans Devanagari', 'Noto Sans Kannada', Georgia, serif", fontStyle: "italic", fontSize: Math.max(16, 28 * s), color: "#f5efe2" }}>
                            <span style={{ paddingRight: 24 }}>{marquee}</span><span style={{ paddingRight: 24 }}>{marquee}</span>
                        </div>
                    </div>
                    <span className="dbgreet-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>{greetings}</span>
                    {/* sticker */}
                    <span style={{ position: "absolute", left: "10%", bottom: "12%", padding: `${4 * s + 2}px ${10 * s + 4}px`, borderRadius: 999, background: "#f5efe2", color: "#111", fontFamily: MONO, fontSize: Math.max(10, 13 * s), fontWeight: 700, letterSpacing: ".04em", transform: "rotate(-8deg)", boxShadow: "0 3px 8px rgba(0,0,0,.25)" }}>{sticker}</span>
                </div>
            </div>
        </section>
    )
}

addPropertyControls(WalletIntro, {
    eyebrow: { type: ControlType.String, title: "Eyebrow", defaultValue: "what's in my bag" },
    heading: { type: ControlType.String, title: "Heading", defaultValue: "Always prepared. Mostly." },
    greetings: { type: ControlType.String, title: "Hellos (· between)", defaultValue: "hello · नमस्ते · ನಮಸ್ಕಾರ" },
    strip1: { type: ControlType.ResponsiveImage, title: "Booth 1" },
    strip2: { type: ControlType.ResponsiveImage, title: "Booth 2" },
    strip3: { type: ControlType.ResponsiveImage, title: "Booth 3" },
    homePhoto: { type: ControlType.ResponsiveImage, title: "Home photo" },
    homeLabel: { type: ControlType.String, title: "Home note", defaultValue: "home, always on me" },
    setName: { type: ControlType.String, title: "USB label", defaultValue: "tonight's set" },
    sticker: { type: ControlType.String, title: "Bag sticker", defaultValue: "do not touch the aux" },
})
