// CaseStudySearch.tsx — Dhwani Bagrecha portfolio
// AI-flavored case study search with custom cursor and dark brand cards.
// Oct 4 (light-mode sweep): this is a dark-in-both-modes panel with explicitly light text, so the
// root is marked data-db-keep — otherwise the nav's light-mode flip half-inverts it (light ground,
// grey #A0A0A0 copy) and the descriptions become unreadable.

import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { useState, useEffect, useRef, useCallback } from "react"

const T = {
    bg: "#0A0A0A",
    surface1: "#111111",
    surface2: "#1A1A1A",
    surface3: "#242424",
    borderSubtle: "#2A2A2A",
    textPrimary: "#FAFAFA",
    textSecondary: "#A0A0A0",
    textMuted: "#666666",
    orange: "#F3500F",
    orangeTint: "rgba(243,80,15,0.12)",
}

interface CaseStudy {
    id: string
    category: string
    title: string
    description: string
    company: string
    year: string
    readTime: string
    tags: string[]
    accentColor: string
    thumbnailGradient: string
    href: string
}

const CASE_STUDIES: CaseStudy[] = [
    {
        id: "dpss",
        category: "UX Research · Systems Design",
        title: "Unified Intelligence Interface",
        description: "End-to-end UX for DPSS's first unified platform — briefing system, fleet management, and threat assessment built from zero.",
        company: "University of Michigan DPSS",
        year: "2025",
        readTime: "8 min",
        tags: ["ux research", "systems design", "public safety", "enterprise", "0→1"],
        accentColor: "#FFCB05",
        thumbnailGradient: "linear-gradient(135deg, #00274C 0%, #003B70 60%, #1A5099 100%)",
        href: "#dpss",
    },
    {
        id: "amazon",
        category: "UX Design · Research",
        title: "Scale-First Search Experience",
        description: "Designing for hundreds of millions of users — where the smallest friction point isn't a UX problem, it's a math problem.",
        company: "Amazon",
        year: "2024",
        readTime: "6 min",
        tags: ["ux design", "consumer", "search", "e-commerce", "scale"],
        accentColor: "#FF9900",
        thumbnailGradient: "linear-gradient(135deg, #232F3E 0%, #1A2436 60%, #0F1924 100%)",
        href: "#amazon",
    },
    {
        id: "convoy",
        category: "UX Design · HCI",
        title: "GM Convoy — EV Range as a Social Problem",
        description: "First in-vehicle UX that reframes EV range anxiety as a collective challenge, not a battery spec.",
        company: "General Motors",
        year: "2024",
        readTime: "7 min",
        tags: ["automotive", "hci", "systems design", "prototyping", "enterprise"],
        accentColor: "#4EA8F8",
        thumbnailGradient: "linear-gradient(135deg, #0057A6 0%, #003D75 60%, #002050 100%)",
        href: "#convoy",
    },
    {
        id: "budgetcart",
        category: "Product Design · AI",
        title: "BudgetCart — Grocery Access & Budgeting",
        description: "AI-assisted grocery planning for households navigating food access and cost constraints — from needfinding to shipped prototype.",
        company: "Side Project",
        year: "2024",
        readTime: "5 min",
        tags: ["consumer", "ai", "mobile", "food access", "product design"],
        accentColor: "#3DFFB0",
        thumbnailGradient: "linear-gradient(135deg, #0D2B1F 0%, #153D2D 60%, #1E5440 100%)",
        href: "#budgetcart",
    },
    {
        id: "maizetix",
        category: "UX Research · Service Design",
        title: "MaizeTix — Game Day Without the Chaos",
        description: "Reducing stress around Michigan game-day experiences — ticket access, transit, and real-time coordination.",
        company: "University of Michigan",
        year: "2023",
        readTime: "4 min",
        tags: ["service design", "consumer", "mobile", "event ux", "research"],
        accentColor: "#FFCB05",
        thumbnailGradient: "linear-gradient(135deg, #1A1200 0%, #2A1E00 60%, #3D2C00 100%)",
        href: "#maizetix",
    },
]

const SUGGESTIONS = ["research-heavy", "consumer apps", "enterprise UX", "AI projects", "systems design", "0→1 work", "mobile"]

function filterStudies(studies: CaseStudy[], query: string): CaseStudy[] {
    if (!query.trim()) return studies
    const q = query.toLowerCase()
    return studies.filter((s) => {
        const searchable = [s.title, s.description, s.company, s.category, s.year, ...s.tags].join(" ").toLowerCase()
        const synonyms: Record<string, string[]> = {
            "research-heavy": ["ux research", "research", "interviews"],
            "consumer": ["consumer", "mobile", "e-commerce", "food", "event"],
            "enterprise": ["enterprise", "dpss", "amazon", "gm", "scale"],
            "ai projects": ["ai", "genai"],
            "systems": ["systems", "systems design"],
            "0→1": ["0→1", "from scratch", "first"],
            "mobile": ["mobile", "app"],
        }
        for (const [key, terms] of Object.entries(synonyms)) {
            if (q.includes(key) && terms.some((t) => searchable.includes(t))) return true
        }
        return searchable.includes(q) || q.split(" ").some((word) => word.length > 2 && searchable.includes(word))
    })
}

function CustomCursor({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
    const cursorX = useMotionValue(-200)
    const cursorY = useMotionValue(-200)
    const springX = useSpring(cursorX, { damping: 24, stiffness: 300, mass: 0.5 })
    const springY = useSpring(cursorY, { damping: 24, stiffness: 300, mass: 0.5 })
    const [hovering, setHovering] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const move = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect()
            cursorX.set(e.clientX - rect.left)
            cursorY.set(e.clientY - rect.top)
            setVisible(true)
        }
        const onEnter = () => setVisible(true)
        const onLeave = () => setVisible(false)
        el.addEventListener("mousemove", move)
        el.addEventListener("mouseenter", onEnter)
        el.addEventListener("mouseleave", onLeave)
        return () => {
            el.removeEventListener("mousemove", move)
            el.removeEventListener("mouseenter", onEnter)
            el.removeEventListener("mouseleave", onLeave)
        }
    }, [cursorX, cursorY, containerRef])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const onHover = (e: Event) => setHovering((e as CustomEvent).detail === "enter")
        el.addEventListener("card-hover", onHover)
        return () => el.removeEventListener("card-hover", onHover)
    }, [containerRef])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="cursor"
                    style={{ position: "absolute", left: springX, top: springY, pointerEvents: "none", zIndex: 100, translateX: "-50%", translateY: "-50%" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                >
                    <motion.div
                        animate={{
                            width: hovering ? 52 : 18,
                            height: hovering ? 52 : 18,
                            borderColor: hovering ? T.orange : "rgba(255,255,255,0.55)",
                            backgroundColor: hovering ? T.orangeTint : "transparent",
                        }}
                        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                        style={{ borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <AnimatePresence>
                            {hovering && (
                                <motion.span
                                    key="label"
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    transition={{ duration: 0.16 }}
                                    style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", color: T.orange, textTransform: "uppercase", whiteSpace: "nowrap" }}
                                >
                                    View
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    <motion.div
                        animate={{ opacity: hovering ? 0 : 1 }}
                        transition={{ duration: 0.15 }}
                        style={{ position: "absolute", top: "50%", left: "50%", width: 4, height: 4, borderRadius: "50%", background: "#FAFAFA", transform: "translate(-50%,-50%)" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function CaseStudyCard({ study, containerRef, index }: { study: CaseStudy; containerRef: React.RefObject<HTMLDivElement>; index: number }) {
    const [hov, setHov] = useState(false)
    const signalHover = useCallback((entering: boolean) => {
        setHov(entering)
        containerRef.current?.dispatchEvent(new CustomEvent("card-hover", { detail: entering ? "enter" : "leave" }))
    }, [containerRef])

    return (
        <motion.a
            href={study.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            onMouseEnter={() => signalHover(true)}
            onMouseLeave={() => signalHover(false)}
            style={{ textDecoration: "none", display: "block", cursor: "none" }}
        >
            <motion.div
                animate={{
                    borderColor: hov ? T.orange + "55" : T.borderSubtle,
                    boxShadow: hov ? `0 0 0 1px ${T.orange}22, 0 12px 48px -12px ${T.orange}40` : "0 2px 16px rgba(0,0,0,0.4)",
                }}
                transition={{ duration: 0.22 }}
                style={{ background: T.surface1, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
                <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                    <motion.div
                        animate={{ scale: hov ? 1.04 : 1 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
                        style={{ position: "absolute", inset: 0, background: study.thumbnailGradient }}
                    />
                    <div style={{ position: "absolute", top: 14, right: 14 }}>
                        <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 9px", borderRadius: 999 }}>
                            {study.readTime}
                        </span>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${study.accentColor} 0%, transparent 100%)`, opacity: hov ? 1 : 0.5, transition: "opacity 0.2s ease" }} />
                </div>
                <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: study.accentColor, alignSelf: "flex-start" }}>
                        {study.category}
                    </span>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 18, fontWeight: 600, color: T.textPrimary, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                        {study.title}
                    </div>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 400, color: T.textSecondary, lineHeight: 1.6 }}>
                        {study.description}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, paddingTop: 14, borderTop: `1px solid ${T.borderSubtle}` }}>
                        <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 500, color: T.textMuted }}>
                            {study.company} · {study.year}
                        </span>
                        <motion.div
                            animate={{ x: hov ? 3 : 0, color: hov ? T.orange : T.textMuted }}
                            transition={{ duration: 0.2 }}
                            style={{ fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 600 }}
                        >→</motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.a>
    )
}

function SearchBar({ value, onChange, onSuggestion, focused, onFocus, onBlur }: { value: string; onChange: (v: string) => void; onSuggestion: (s: string) => void; focused: boolean; onFocus: () => void; onBlur: () => void }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.div
                animate={{ borderColor: focused ? T.orange + "99" : T.borderSubtle, boxShadow: focused ? `0 0 0 3px ${T.orange}18, 0 4px 24px rgba(0,0,0,0.5)` : "0 2px 12px rgba(0,0,0,0.4)" }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2, border: `1px solid ${T.borderSubtle}`, borderRadius: 12, padding: "0 18px", height: 52 }}
            >
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx={6.5} cy={6.5} r={5} stroke={focused ? T.orange : T.textMuted} strokeWidth={1.4} />
                    <path d="M10.5 10.5 L14 14" stroke={focused ? T.orange : T.textMuted} strokeWidth={1.4} strokeLinecap="round" />
                </svg>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Search by project, skill, or just ask — 'show me research-heavy work'"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "Poppins, sans-serif", fontSize: 13, color: T.textPrimary, caretColor: T.orange }}
                />
                <AnimatePresence>
                    {value && (
                        <motion.button key="clear" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
                            onClick={() => onChange("")}
                            style={{ background: T.surface3, border: `1px solid ${T.borderSubtle}`, borderRadius: 6, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                            <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                                <path d="M1 1 L7 7 M7 1 L1 7" stroke={T.textMuted} strokeWidth={1.2} strokeLinecap="round" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: T.orangeTint, border: `1px solid ${T.orange}33`, borderRadius: 6, padding: "3px 8px", flexShrink: 0 }}>
                    <svg width={9} height={9} viewBox="0 0 9 9" fill="none">
                        <circle cx={4.5} cy={4.5} r={3.5} stroke={T.orange} strokeWidth={1} />
                        <path d="M4.5 2.5 L4.5 4.5 L6 5.5" stroke={T.orange} strokeWidth={1} strokeLinecap="round" />
                    </svg>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.orange }}>AI</span>
                </div>
            </motion.div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {SUGGESTIONS.map((s) => (
                    <motion.button key={s} whileHover={{ borderColor: T.orange + "66", color: T.textPrimary }}
                        onClick={() => onSuggestion(s)}
                        style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", color: value.toLowerCase() === s ? T.orange : T.textSecondary, background: value.toLowerCase() === s ? T.orangeTint : T.surface2, border: `1px solid ${value.toLowerCase() === s ? T.orange + "55" : T.borderSubtle}`, borderRadius: 999, padding: "5px 13px", cursor: "pointer", transition: "all 0.18s ease" }}>
                        {s}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

export default function CaseStudySearch({ columns = 2, showSearch = true, showCursor = true }: { columns?: number; showSearch?: boolean; showCursor?: boolean }) {
    const [query, setQuery] = useState("")
    const [focused, setFocused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const filtered = filterStudies(CASE_STUDIES, query)
    const empty = filtered.length === 0
    const handleSuggestion = useCallback((s: string) => setQuery((prev) => (prev.toLowerCase() === s ? "" : s)), [])

    return (
        <div ref={containerRef} data-db-keep="" style={{ position: "relative", background: T.bg, minHeight: "100%", padding: "56px 32px 80px", fontFamily: "Poppins, -apple-system, sans-serif", cursor: showCursor ? "none" : "default", overflow: "hidden" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); input::placeholder { color: #555; }`}</style>
            {showCursor && <CustomCursor containerRef={containerRef as React.RefObject<HTMLDivElement>} />}
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.orange, marginBottom: 12 }}>Selected Work</div>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 36, fontWeight: 600, color: T.textPrimary, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Case Studies</div>
                </div>
                {showSearch && (
                    <div style={{ marginBottom: 40 }}>
                        <SearchBar value={query} onChange={setQuery} onSuggestion={handleSuggestion} focused={focused} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {query && (
                        <motion.div key="count" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                            style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, color: T.textMuted, marginBottom: 24 }}>
                            {empty ? `No matches for "${query}"` : `${filtered.length} case stud${filtered.length === 1 ? "y" : "ies"} matching "${query}"`}
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence mode="popLayout">
                    {empty ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "64px 0", color: T.textMuted, fontFamily: "Poppins, sans-serif", fontSize: 14 }}>
                            Nothing found for "{query}" — try "research", "consumer", or "systems"
                        </motion.div>
                    ) : (
                        <motion.div key="grid" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(columns, filtered.length)}, 1fr)`, gap: 20 }}>
                            {filtered.map((study, i) => (
                                <CaseStudyCard key={study.id} study={study} containerRef={containerRef as React.RefObject<HTMLDivElement>} index={i} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{CASE_STUDIES.length} projects · {new Date().getFullYear()}</span>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, color: T.textMuted }}>Dhwani Bagrecha</span>
                </div>
            </div>
        </div>
    )
}

addPropertyControls(CaseStudySearch, {
    columns: { type: ControlType.Number, title: "Columns", defaultValue: 2, min: 1, max: 3, step: 1, displayStepper: true },
    showSearch: { type: ControlType.Boolean, title: "Show Search", defaultValue: true },
    showCursor: { type: ControlType.Boolean, title: "Custom Cursor", defaultValue: true },
})