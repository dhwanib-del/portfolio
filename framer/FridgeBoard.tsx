// FridgeBoard — Dhwani's About-page "fridge door" (Oct 3). A brushed-metal board covered in
// magnets, photo-booth strips, polaroids, a ticket, a receipt and notes. Desktop: drag things
// around ("Tidy up" puts them back). Phone: a tidy stacked layout. Light/dark aware.
// The Tamagotchi opens DhwaniGPT. Every photo slot has alt text; empty slots show a soft tint.
import * as React from "react"
import { useEffect, useRef, useState, startTransition } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Img = any

interface Props {
    title: string
    subtitle: string
    strip1: Img; strip2: Img; strip3: Img
    polaroid1: Img; polaroid1Caption: string
    polaroid2: Img; polaroid2Caption: string
    photo1: Img
    ticketTitle: string; ticketLine: string; ticketDate: string
    receiptNote: string
    stickyNote: string
    postcard: string
    quote2: string
    matchaNote: string
    showTamagotchi: boolean
    boardHeight: number
    style?: React.CSSProperties
}

const SERIF = "'Instrument Serif', Georgia, serif"
const HAND = "'Caveat', 'Segoe Print', cursive"
const SANS = "'Poppins', 'Inter', sans-serif"
const MONO = "'IBM Plex Mono', ui-monospace, monospace"

function Photo({ img, h, filter, label }: { img: Img; h: number | string; filter?: string; label: string }) {
    if (img?.src) return <img src={img.src} alt={img.alt || label} draggable={false} style={{ display: "block", width: "100%", height: h, objectFit: "cover", filter }} />
    return (
        <div role="img" aria-label={label + " (photo coming soon)"} style={{ width: "100%", height: h, background: "linear-gradient(160deg, #cfcfcf, #8d8d8d)", filter, display: "grid", placeItems: "center", color: "rgba(0,0,0,.45)", fontFamily: SANS, fontSize: 11, letterSpacing: ".08em" }}>
            PHOTO
        </div>
    )
}

function Magnet({ x = "50%", tone = "#d9dde2" }: { x?: string; tone?: string }) {
    return <span aria-hidden style={{ position: "absolute", top: -9, left: x, marginLeft: -11, width: 22, height: 22, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #fff, ${tone} 45%, #8a9097)`, boxShadow: "0 3px 6px rgba(0,0,0,.35)", zIndex: 2 }} />
}

type Item = { id: string; x: number; y: number; r: number; w: number; node: React.ReactNode; label: string }

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1080
 */
export default function FridgeBoard(props: Props) {
    const {
        title = "the fridge door", subtitle = "Things I'd stick on my fridge. Drag them around.",
        strip1, strip2, strip3, polaroid1, polaroid1Caption = "where's the next adventure?", polaroid2, polaroid2Caption = "first DJ set, very nervous", photo1,
        ticketTitle = "ADMIT ONE", ticketLine = "DJ SET · ANN ARBOR", ticketDate = "BRING EARPLUGS",
        receiptNote = "i'm not super hungry, i just want like a little snack, ya know",
        stickyNote = "get close to the real behavior. then build enough to test it.",
        postcard = "from now on, let's feel light for the rest of the year.",
        quote2 = "messy problems are the fun ones.", matchaNote = "matcha > coffee. not up for debate.",
        showTamagotchi = true, boardHeight = 760, style,
    } = props
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const reduce = useReducedMotion()
    const boardRef = useRef<HTMLDivElement>(null)
    const [narrow, setNarrow] = useState(false)
    const [resetKey, setResetKey] = useState(0)

    useEffect(() => {
        const el = boardRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => startTransition(() => setNarrow(e.contentRect.width < 720)))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const paper = "#f4efe4"
    const items: Item[] = [
        { id: "strip", x: 26, y: 8, r: -2, w: 150, label: "Photo-booth strip", node: (
            <div style={{ background: "#fafafa", padding: 8, display: "grid", gap: 8, boxShadow: "0 10px 24px rgba(0,0,0,.35)" }}>
                <Magnet />
                {[strip1, strip2, strip3].map((s, i) => <Photo key={i} img={s} h={118} filter="grayscale(1) contrast(1.05)" label={`Photo-booth frame ${i + 1}`} />)}
            </div>) },
        { id: "receipt", x: 6, y: 6, r: -4, w: 190, label: "Guest check note", node: (
            <div style={{ background: "#f6d9dc", padding: "12px 14px 18px", boxShadow: "0 10px 22px rgba(0,0,0,.3)", fontFamily: HAND, color: "#2b2b2b" }}>
                <Magnet x="30%" />
                <div style={{ fontFamily: SERIF, fontSize: 26, color: "#2f3e8f", lineHeight: 1 }}>Guest Check</div>
                <div style={{ height: 1, background: "rgba(47,62,143,.35)", margin: "8px 0" }} />
                <p style={{ margin: 0, fontSize: 22, lineHeight: 1.15, backgroundImage: "repeating-linear-gradient(transparent 0 24px, rgba(47,62,143,.18) 24px 25px)" }}>{receiptNote}</p>
            </div>) },
        { id: "photo", x: 44, y: 4, r: 1.5, w: 200, label: "Portrait photo", node: (
            <div style={{ boxShadow: "0 12px 26px rgba(0,0,0,.35)" }}><Magnet x="80%" /><Photo img={photo1} h={250} label="Portrait" /></div>) },
        { id: "ticket", x: 40, y: 44, r: -3, w: 210, label: "Ticket", node: (
            <div style={{ background: "#efe6cf", padding: "12px 16px", border: "1px dashed rgba(0,0,0,.25)", boxShadow: "0 8px 18px rgba(0,0,0,.28)", fontFamily: MONO, color: "#3a3a2a" }}>
                <Magnet x="85%" tone="#c9e3c0" />
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: ".04em" }}>{ticketTitle}</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>{ticketLine}</div>
                <div style={{ fontSize: 12, marginTop: 2, opacity: .75 }}>{ticketDate}</div>
            </div>) },
        { id: "pol1", x: 70, y: 6, r: 3, w: 200, label: "Polaroid", node: (
            <div style={{ background: "#fff", padding: "10px 10px 34px", boxShadow: "0 12px 26px rgba(0,0,0,.35)" }}>
                <Magnet />
                <Photo img={polaroid1} h={190} label="Polaroid" />
                <p style={{ margin: "8px 2px 0", fontFamily: HAND, fontSize: 22, lineHeight: 1, color: "#222" }}>{polaroid1Caption}</p>
            </div>) },
        { id: "sticky", x: 8, y: 56, r: 2.5, w: 200, label: "Sticky note", node: (
            <div style={{ background: "#ffe98a", padding: "18px 16px", boxShadow: "0 10px 20px rgba(0,0,0,.25)", fontFamily: HAND, fontSize: 24, lineHeight: 1.1, color: "#2b2b2b" }}>
                <Magnet tone="#f2b8a0" />{stickyNote}
            </div>) },
        { id: "pol2", x: 70, y: 52, r: -2.5, w: 210, label: "Polaroid", node: (
            <div style={{ background: "#fff", padding: "10px 10px 34px", boxShadow: "0 12px 26px rgba(0,0,0,.35)" }}>
                <Magnet x="70%" />
                <Photo img={polaroid2} h={200} label="Polaroid" />
                <p style={{ margin: "8px 2px 0", fontFamily: HAND, fontSize: 22, lineHeight: 1, color: "#222" }}>{polaroid2Caption}</p>
            </div>) },
        { id: "postcard", x: 42, y: 66, r: 2, w: 250, label: "Postcard", node: (
            <div style={{ background: paper, padding: "16px 18px", boxShadow: "0 10px 22px rgba(0,0,0,.28)", fontFamily: HAND, fontSize: 24, lineHeight: 1.15, color: "#34406b", backgroundImage: "linear-gradient(90deg, transparent 62%, rgba(0,0,0,.12) 62%, rgba(0,0,0,.12) calc(62% + 1px), transparent calc(62% + 1px))" }}>
                <Magnet x="20%" tone="#c7b8e8" />{postcard}
            </div>) },
    ]

    // Oct 3 v2: matcha, a quote card, Tic Tac magnet, enamel pins and star stickers.
    items.push(
        { id: "matcha", x: 86, y: 34, r: 4, w: 130, label: "Matcha", node: (
            <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
                <svg width="110" height="120" viewBox="0 0 110 120" aria-hidden>
                    <path d="M18 30 h74 l-8 80 a6 6 0 0 1 -6 6 h-46 a6 6 0 0 1 -6 -6z" fill="rgba(255,255,255,.75)" stroke="rgba(0,0,0,.25)" strokeWidth="2" />
                    <path d="M22 56 h66 l-5 52 a5 5 0 0 1 -5 5 h-46 a5 5 0 0 1 -5 -5z" fill="#9dc183" />
                    <path d="M22 56 h66 l-1 10 h-64z" fill="#c9e0b4" />
                    <rect x="12" y="20" width="86" height="12" rx="4" fill="#f3f3f3" stroke="rgba(0,0,0,.2)" />
                    <path d="M64 20 L74 -4" stroke="#2f7d4a" strokeWidth="6" strokeLinecap="round" />
                </svg>
                <span style={{ background: "#fffdf3", padding: "4px 10px", fontFamily: HAND, fontSize: 20, color: "#2d4a2a", boxShadow: "0 4px 10px rgba(0,0,0,.2)", transform: "rotate(-3deg)" }}>{matchaNote}</span>
            </div>) },
        { id: "quote2", x: 4, y: 34, r: -3, w: 190, label: "Quote card", node: (
            <div style={{ background: "#1c1c1c", color: "#f4efe4", padding: "16px 16px", boxShadow: "0 10px 22px rgba(0,0,0,.3)", fontFamily: SERIF, fontStyle: "italic", fontSize: 26, lineHeight: 1.05 }}>
                <Magnet tone="#f5b5c8" />“{quote2}”
            </div>) },
        { id: "tictac", x: 62, y: 40, r: 18, w: 44, label: "Tic Tac magnet", node: (
            <svg width="44" height="96" viewBox="0 0 44 96" aria-hidden>
                <rect x="4" y="10" width="36" height="82" rx="8" fill="rgba(255,255,255,.75)" stroke="rgba(0,0,0,.2)" />
                <rect x="2" y="2" width="40" height="14" rx="4" fill="#2fb36b" />
                {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={14 + (i % 2) * 16} cy={34 + Math.floor(i / 2) * 18} rx="7" ry="4.5" fill="#fff" stroke="rgba(0,0,0,.12)" />)}
            </svg>) },
        { id: "pins", x: 88, y: 76, r: 0, w: 110, label: "Enamel pins and star stickers", node: (
            <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden>
                <path d="M30 6 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#ffd34d" stroke="#1b1b1b" strokeWidth="2.5" strokeLinejoin="round" />
                <circle cx="80" cy="34" r="20" fill="#f3500f" stroke="#1b1b1b" strokeWidth="2.5" /><text x="80" y="41" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="20" fill="#fff">hi</text>
                <path d="M60 78 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#c7b8e8" stroke="#1b1b1b" strokeWidth="2" strokeLinejoin="round" />
                <path d="M20 74 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#fff" stroke="#1b1b1b" strokeWidth="2" strokeLinejoin="round" />
            </svg>) },
    )
    if (showTamagotchi) items.push({ id: "tama", x: 26, y: 72, r: -6, w: 150, label: "Tamagotchi, opens DhwaniGPT", node: (
        <button type="button" onClick={() => { try { window.dispatchEvent(new CustomEvent("db-chat-open", { detail: {} })) } catch {} }} aria-label="Open DhwaniGPT"
            style={{ width: 150, height: 170, border: 0, cursor: "pointer", borderRadius: "50% 50% 46% 46% / 55% 55% 45% 45%", background: "radial-gradient(circle at 35% 25%, #f6d6ec, #c99bc4 60%, #9c6f9b)", boxShadow: "0 12px 24px rgba(0,0,0,.35), inset 0 -6px 12px rgba(0,0,0,.15)", display: "grid", placeItems: "center", padding: 0 }}>
            <span style={{ display: "grid", gap: 10, justifyItems: "center" }}>
                <span style={{ width: 84, height: 70, borderRadius: 10, background: "#b9c7a3", border: "4px solid #4b3a4d", display: "grid", placeItems: "center", fontFamily: MONO, fontSize: 11, color: "#2c3a1e", textAlign: "center", lineHeight: 1.2 }}>ask<br />me<br />stuff</span>
                <span style={{ display: "flex", gap: 10 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: "#4b3a4d" }} />)}</span>
            </span>
        </button>) })

    const css = `
        .dbfridge { --fr-a:#5d6166; --fr-b:#3b3e42; --fr-c:#80858b; }
        :root[data-db-theme="light"] .dbfridge { --fr-a:#e6e8ea; --fr-b:#c9cdd1; --fr-c:#f4f5f6; }
        .dbfridge-item:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 4px; }
        .dbfridge-reset:hover { background: var(--db-line, rgba(255,255,255,.14)); }
    `
    const metal: React.CSSProperties = {
        background: "linear-gradient(105deg, var(--fr-b) 0%, var(--fr-a) 38%, var(--fr-c) 55%, var(--fr-a) 70%, var(--fr-b) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px)",
        backgroundBlendMode: "overlay",
    }

    return (
        <section className="dbfridge" aria-label={title} style={{ width: "100%", fontFamily: SANS, ...style }}>
            <style>{css}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@500;700&display=swap" />
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                <div>
                    <h2 style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1, color: "var(--db-text, #fff)" }}>{title}</h2>
                    <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--db-text-2, rgba(255,255,255,.6))" }}>{narrow ? subtitle.replace(/ ?Drag them around\.?/, "") : subtitle}</p>
                </div>
                {!narrow && (
                    <button type="button" className="dbfridge-reset" onClick={() => setResetKey((k) => k + 1)} style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, border: "1px solid var(--db-line, rgba(255,255,255,.15))", background: "transparent", color: "var(--db-text, #fff)", fontSize: 14, cursor: "pointer" }}>
                        Tidy up
                    </button>
                )}
            </div>
            <div ref={boardRef} style={{ ...metal, position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08), 0 30px 60px -30px rgba(0,0,0,.6)", height: narrow ? "auto" : boardHeight, padding: narrow ? 20 : 0 }}>
                <span aria-hidden style={{ position: "absolute", right: 18, top: "30%", width: 10, height: 160, borderRadius: 6, background: "linear-gradient(90deg, #9aa0a6, #e9ecef, #9aa0a6)", boxShadow: "0 4px 10px rgba(0,0,0,.35)", display: narrow ? "none" : "block" }} />
                {narrow ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22, alignItems: "start" }}>
                        {items.map((it, i) => (
                            <div key={it.id} style={{ position: "relative", transform: `rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`, gridColumn: it.id === "postcard" || it.id === "receipt" ? "1 / -1" : undefined, justifySelf: "center", width: "100%", maxWidth: it.id === "tama" ? 150 : undefined }}>
                                {it.node}
                            </div>
                        ))}
                    </div>
                ) : (
                    items.map((it, i) => (
                        <motion.div
                            key={it.id + resetKey}
                            className="dbfridge-item"
                            tabIndex={it.id === "tama" ? -1 : 0}
                            aria-label={it.label}
                            drag={!onCanvas}
                            dragConstraints={boardRef}
                            dragElastic={0.08}
                            dragMomentum={!reduce}
                            whileDrag={{ scale: 1.04, rotate: 0, zIndex: 50 }}
                            whileHover={reduce ? undefined : { y: -4 }}
                            initial={reduce ? false : { opacity: 0, y: 18, rotate: it.r }}
                            whileInView={{ opacity: 1, y: 0, rotate: it.r }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 260, damping: 24, delay: reduce ? 0 : i * 0.05 }}
                            style={{ position: "absolute", left: `${it.x}%`, top: `${it.y}%`, width: it.w, rotate: it.r, cursor: onCanvas ? "default" : "grab", zIndex: i + 1, touchAction: "none" }}
                        >
                            {it.node}
                        </motion.div>
                    ))
                )}
            </div>
        </section>
    )
}

addPropertyControls(FridgeBoard, {
    title: { type: ControlType.String, title: "Title", defaultValue: "the fridge door" },
    subtitle: { type: ControlType.String, title: "Subtitle", defaultValue: "Things I'd stick on my fridge. Drag them around." },
    boardHeight: { type: ControlType.Number, title: "Board height", min: 520, max: 1100, step: 10, defaultValue: 760, unit: "px" },
    photo1: { type: ControlType.ResponsiveImage, title: "Portrait" },
    strip1: { type: ControlType.ResponsiveImage, title: "Strip 1" },
    strip2: { type: ControlType.ResponsiveImage, title: "Strip 2" },
    strip3: { type: ControlType.ResponsiveImage, title: "Strip 3" },
    polaroid1: { type: ControlType.ResponsiveImage, title: "Polaroid 1" },
    polaroid1Caption: { type: ControlType.String, title: "Polaroid 1 note", defaultValue: "where's the next adventure?" },
    polaroid2: { type: ControlType.ResponsiveImage, title: "Polaroid 2" },
    polaroid2Caption: { type: ControlType.String, title: "Polaroid 2 note", defaultValue: "first DJ set, very nervous" },
    ticketTitle: { type: ControlType.String, title: "Ticket title", defaultValue: "ADMIT ONE" },
    ticketLine: { type: ControlType.String, title: "Ticket line", defaultValue: "DJ SET · ANN ARBOR" },
    ticketDate: { type: ControlType.String, title: "Ticket date", defaultValue: "BRING EARPLUGS" },
    receiptNote: { type: ControlType.String, title: "Receipt note", displayTextArea: true, defaultValue: "i'm not super hungry, i just want like a little snack, ya know" },
    stickyNote: { type: ControlType.String, title: "Sticky note", displayTextArea: true, defaultValue: "get close to the real behavior. then build enough to test it." },
    postcard: { type: ControlType.String, title: "Postcard", displayTextArea: true, defaultValue: "from now on, let's feel light for the rest of the year." },
    quote2: { type: ControlType.String, title: "Quote card", defaultValue: "messy problems are the fun ones." },
    matchaNote: { type: ControlType.String, title: "Matcha note", defaultValue: "matcha > coffee. not up for debate." },
    showTamagotchi: { type: ControlType.Boolean, title: "Tamagotchi (opens GPT)", defaultValue: true },
})
