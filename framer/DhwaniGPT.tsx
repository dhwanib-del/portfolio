// DhwaniGPT — floating portfolio assistant for Dhwani's Framer site.
// Oct 3: grounded portfolio answers ported from the Next.js site; runs client-side, no API key.
// Answers only from the facts embedded below (mirrors src/content/site.ts + cases.ts on the
// Next.js site). No network calls, no chat history stored. Prime Video stays under NDA.
// Opens on window event "db-chat-open"; sets window.__dbChatReady = true while mounted.
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const FONT = "'Poppins', 'Inter', sans-serif"
const LINKEDIN = "https://www.linkedin.com/in/dhwanibagrecha/"
const GREETING_KEY = "db-gpt-greeted"
const GREETING_TEXT = "Hi, I’m DhwaniGPT, Dhwani’s portfolio assistant. Want the quick tour?"

// ── Portfolio facts (keep in sync with the Next.js site's content files) ─────
type Project = { slug: string; name: string; terms: RegExp; summary: string; status: string; role: string; team: string; when: string; ai?: string }

const PROJECTS: Project[] = [
    {
        slug: "briefs",
        name: "BRIEFS",
        terms: /\bbriefs?\b|dispatch|building lookup|apps script/,
        summary: "BRIEFS (U-M DPSS): in her first contextual inquiry, Dhwani watched dispatchers search across seven screens mid-call to find building details. Starting with no design files, she mapped the workflow and built a prototype and PRD, then explored a Sheets-backed Apps Script. Every building profile got the same five places, with the details that matter mid-call pinned in view.",
        status: "Status: prototype and PRD handed to DPSS. Not launched, and the 30-second find-a-detail goal hasn’t been tested yet.",
        role: "UX design intern doing field research, IA, prototype and PRD",
        team: "with Aaron Tucker at DPSS",
        when: "Summer 2026",
        ai: "the assistant answers only from approved records, links to where each answer came from, and says “that’s not in the records” instead of guessing. When AI helped restructure old documents, a person approved every change.",
    },
    {
        slug: "intel",
        name: "Intel workspace",
        terms: /\bintel\b|intelligence|analysts?\b|case management|handoff/,
        summary: "Intel workspace (U-M DPSS): Dhwani interviewed six analysts and adjusted her questions to bring quieter voices in. The concept brings case history, status, ownership and related information into one workspace, so handoffs stop being where things get lost. The first version ran in Google Apps Script so the team could try it without touching production systems.",
        status: "Status: in use by the Intelligence Group, and the team has since started building its own server version.",
        role: "UX design intern doing workflow design and the prototype",
        team: "with Aaron Tucker at DPSS",
        when: "2026",
        ai: "public tips come in through a chatbot intake, so reports arrive structured instead of as free-form messages.",
    },
    {
        slug: "general-motors",
        name: "GM Convoy",
        terms: /\bgm\b|general motors|convoy|biometric|truck|\bcab\b|automotive|vehicle|\bcars?\b|hvac|road trip/,
        summary: "Convoy (General Motors): Dhwani challenged the biometric direction. One driver interview showed a road trip is a group coordinating across phones, screens and messages, so the team cut four weeks of biometric work and designed for the whole trip. She prototyped HVAC and in-drive views in Figma on vehicle-size screens, with reusable components in the team’s first shared design system.",
        status: "Status: concept, with three usability tests in a 3D-printed truck cab. Details stay under NDA, so no real-world claims.",
        role: "UX researcher and designer doing research and advanced prototyping",
        team: "with Sara and Julia, GM-sponsored",
        when: "Jan – May 2026",
    },
    {
        slug: "openlibrary",
        name: "Open Library",
        terms: /open ?library|internet archive|multilingual|translation|language|affinity|international student/,
        summary: "Open Library (Internet Archive): Dhwani joined client calls and interviews and built her first affinity map, 330 data points from the team’s eight interviews. Readers kept leaving the book for dictionaries and translation tools and losing their place, so the team recommended making existing language support easier to find inside the reading flow.",
        status: "Status: research and recommendations, not a tested product. After the team shared its feedback, Open Library improved its feedback system and invested more in the project.",
        role: "client calls, interviews, the first affinity map and synthesis",
        team: "a five-person SI 500 team (In4mation)",
        when: "Aug – Dec 2025",
    },
    {
        slug: "budgetcart",
        name: "BudgetCart",
        terms: /budget ?cart|budget card|\bsnap\b|\bwic\b|grocer|food benefit/,
        summary: "BudgetCart (UMSI): her first Figma project, with stakeholder interviews, paper prototypes and a self-taught component system. Testing showed that hiding prices to look simple backfired, so the concept kept the lowest price visible, compared stores where the tradeoff happens, and put SNAP/WIC eligibility and dietary checks before checkout.",
        status: "Status: prototype tasks tested, not a live service. No measured change in spending yet.",
        role: "product designer on the budget tracking and AI cart-building flows",
        team: "three designers",
        when: "a UMSI project (exact dates aren’t listed)",
        ai: "the AI cart builder drafts a starting cart from a budget and needs. Shoppers edit it instead of starting from an empty prompt.",
    },
]

const EXPERIENCE: { terms: RegExp; line: string }[] = [
    { terms: /adobe|ambassador/, line: "Adobe Student Ambassador, Jul 2026 – now: workshops, content and campus events for creative students." },
    { terms: /iska/, line: "UX Researcher & Project Manager at Iska Press for African Perspectives, Jan – May 2026: led a research and project-management consulting engagement." },
    { terms: /sochi/, line: "Project Manager & UX Researcher at SOCHI, University of Michigan, Sep 2025 – May 2026: product strategy, research and project management." },
    { terms: /global scholars/, line: "Project Manager & Social Media Coordinator at the U-M Global Scholars Program, Aug 2025 – May 2026: led project teams and global community programming." },
    { terms: /eye[- ]?tracking|research assistant|\bmsu\b|michigan state/, line: "Research Assistant at the MSU College of Social Science, May 2024 – May 2025: organized and analyzed eye-tracking data for behavioral research." },
    { terms: /miller johnson|\bhr\b|human resources/, line: "Human Resources Systems Intern at Miller Johnson, Jun – Aug 2024: internal systems and operations at a law firm." },
    { terms: /\bddb\b|mudra|\bdei\b/, line: "User Experience DEI Intern at DDB Mudra Group, Jun – Aug 2023: research on accessible social media and representation in advertising." },
]

type Link = { href: string; label: string; external?: boolean }
type Reply = { text: string; links?: Link[] }
type Message = { role: "user" | "assistant"; content: string; links?: Link[] }

const LI: Link = { href: LINKEDIN, label: "Connect on LinkedIn ↗", external: true }

function answer(raw: string, base: string): Reply {
    const q = raw.toLowerCase().replace(/[’‘]/g, "'").trim()
    const caseLink = (p: Project): Link => ({ href: base + p.slug, label: "Read the " + p.name + " case study ↗" })
    const byslug = (s: string) => PROJECTS.find((p) => p.slug === s) as Project
    const asksAI = /\bai\b|artificial intelligence|chatbot|\bllm\b|machine learning/.test(q)

    // NDA first, so nothing below can leak detail.
    if (/prime|amazon|capstone|streaming/.test(q)) return { text: "Prime Video is Dhwani’s current capstone, and it’s under NDA, so that’s genuinely all I can say. Happy to talk about anything else on the portfolio.", links: [LI] }

    if (/are you (real|human|a bot|a person|dhwani|her|ai)|who are you|what are you|is this (really )?(dhwani|a bot|real|her|a person)|am i (talking|chatting) (to|with)/.test(q)) {
        return { text: "I’m DhwaniGPT, an automated assistant, not Dhwani. I answer only from what’s on her portfolio, and this chat isn’t saved. For the real Dhwani, LinkedIn is the way.", links: [LI] }
    }

    const project = PROJECTS.find((p) => p.terms.test(q))
    if (project) {
        let text: string
        if (asksAI && project.ai) text = "In " + project.name + ", " + project.ai
        else if (asksAI) text = "The " + project.name + " case study doesn’t describe an AI piece, so I won’t invent one. Here’s what it does cover. " + project.summary
        else text = project.summary + " " + project.status
        if (/team|who .*with|\brole\b|when|timeline|how long/.test(q)) text += " Her role: " + project.role + ". Team: " + project.team + ". When: " + project.when + "."
        return { text, links: [caseLink(project)] }
    }

    if (/\bdpss\b|public safety/.test(q)) {
        return { text: "Dhwani was a UX Design Intern at U-M DPSS, May – Aug 2026, designing tools for campus dispatch and the Intelligence Group. Two case studies came out of it: BRIEFS (finding building details mid-call) and the Intel workspace, which is in use.", links: [caseLink(byslug("briefs")), caseLink(byslug("intel"))] }
    }

    if (/contact|reach|e-?mail|linkedin|resume|résumé|\bcv\b|hire|hiring|get in touch|connect|talk to (her|dhwani)|message her/.test(q)) {
        return { text: "LinkedIn is the best way to reach Dhwani. I’m a bot, so I can’t pass messages along (and I’d probably paraphrase you badly).", links: [LI] }
    }

    if (/looking for|open to work|available|availability|what roles?|kind of (role|job)|\bjobs?\b|full[- ]time|graduat/.test(q)) {
        return { text: "She’s looking for product, UX and experience design roles. She’s finishing an MS at the University of Michigan School of Information, graduating May 2027, based in Ann Arbor and open to moving anywhere.", links: [LI] }
    }

    if (/relocat|\bmove\b|moving|location|where .*(based|live|located|from)|ann arbor/.test(q)) {
        return { text: "Dhwani is based in Ann Arbor and open to moving anywhere." }
    }

    if (/school|education|degree|study|studying|umsi|master|\bms\b|psych|undergrad|college|university/.test(q)) {
        return { text: "She’s an MS student at the University of Michigan School of Information (UMSI), graduating May 2027. Before that: a psychology degree, finished in three years." }
    }

    if (asksAI) {
        return { text: "Thoughtfully, with guardrails. In BRIEFS, the assistant answers only from approved records, cites its source, and admits when information is missing. In Intel, public tips arrive through a chatbot intake. In BudgetCart, an AI cart builder drafts a starting cart that shoppers edit.", links: [caseLink(byslug("briefs"))] }
    }

    if (/good at|best at|strength|skill|superpower|what does (she|dhwani) do|special/.test(q)) {
        return { text: "Her work spans research, interaction design and prototyping for complex workflows. Start with BRIEFS for high-stakes information design, or GM Convoy for advanced in-car prototyping.", links: [caseLink(byslug("briefs")), caseLink(byslug("general-motors"))] }
    }

    if (/process|approach|how does she (work|design)|method/.test(q)) {
        return { text: "She starts where the work happens: sitting in the dispatch center for BRIEFS, interviewing six analysts for Intel, joining client calls on Open Library. Then she maps it (workflows, affinity maps), prototypes, and changes direction when the research says so, like cutting four weeks of biometric work on GM Convoy.", links: [caseLink(byslug("briefs"))] }
    }

    if (/tools?\b|software|figma|stack|prototyp/.test(q)) {
        return { text: "Figma shows up most: advanced interactions and a shared design system on GM Convoy, a self-taught component system on BudgetCart. She also built working prototypes in Google Apps Script for BRIEFS and Intel. Anything beyond that isn’t listed on the portfolio, so I won’t guess." }
    }

    const role = EXPERIENCE.find((r) => r.terms.test(q))
    if (role) return { text: role.line }

    if (/experience|background|career|worked|work history|internships?|resume/.test(q)) {
        return { text: "Most recent: Adobe Student Ambassador (Jul 2026 – now), UX Design Intern at U-M DPSS (May – Aug 2026), and UX Researcher & Designer on a General Motors-sponsored project (Jan – May 2026). Earlier: Open Library research, SOCHI, the Global Scholars Program, Iska Press, an MSU research assistantship, Miller Johnson and DDB Mudra Group." }
    }

    if (/projects?|\bwork\b|portfolio|case stud|show me/.test(q)) {
        return { text: "Five case studies: BRIEFS and the Intel workspace (both U-M DPSS), Convoy for General Motors, Open Library for the Internet Archive, and BudgetCart at UMSI. There’s also a Prime Video capstone, which is under NDA. Pick one and I’ll give you the short version." }
    }

    if (/thank/.test(q)) return { text: "Anytime. If you want the real Dhwani, she’s on LinkedIn.", links: [LI] }
    if (/^(hi|hello|hey|hiya|yo|howdy)\b/.test(q)) return { text: "Hi! I’m DhwaniGPT, an automated assistant. Ask me about a project, her process, or what she’s looking for." }

    return { text: "That isn’t on the portfolio, so I won’t guess or make it up. I can talk about BRIEFS, Intel, GM Convoy, Open Library or BudgetCart, or you can ask Dhwani directly on LinkedIn.", links: [LI] }
}

const SUGGESTIONS = [
    { label: "Design superpower", query: "What does Dhwani do best?", n: "01" },
    { label: "The BRIEFS story", query: "Tell me about BRIEFS", n: "02" },
    { label: "AI, thoughtfully", query: "How does she use AI?", n: "03" },
    { label: "Open to a move?", query: "Is she open to relocating?", n: "04" },
]

type Props = { accentColor: string; greeting: string; casePath: string; showGreeting: boolean; bottomOffset: number }

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DhwaniGPT({ accentColor, greeting, casePath, showGreeting, bottomOffset }: Props) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const reduce = useReducedMotion()
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [greetVisible, setGreetVisible] = useState(false)
    const [typed, setTyped] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const logRef = useRef<HTMLDivElement>(null)
    const launcherRef = useRef<HTMLButtonElement>(null)
    const openerRef = useRef<HTMLElement | null>(null)

    const T = {
        glass: "var(--db-glass, rgba(14,14,14,0.88))",
        glassLine: "var(--db-glass-line, rgba(255,255,255,0.10))",
        surface: "var(--db-surface, #111111)",
        text: "var(--db-text, #FAFAFA)",
        text2: "var(--db-text-2, #A0A0A0)",
        line: "var(--db-line, rgba(255,255,255,0.12))",
        shadow: "var(--db-shadow, 0 24px 64px -16px rgba(0,0,0,0.6))",
        accent: "var(--db-accent, " + (accentColor || "#F3500F") + ")",
        onAccent: "var(--db-on-accent, #0A0A0A)",
    }
    const base = (() => {
        let b = (casePath || "/projects/").trim()
        if (!b.startsWith("/") && !/^https?:/.test(b)) b = "/" + b
        return b.endsWith("/") ? b : b + "/"
    })()
    const offset = typeof bottomOffset === "number" ? bottomOffset : 84
    const welcome = greeting?.trim() || "Hey! I’m DhwaniGPT, an automated assistant, not Dhwani herself. Ask me about a project, her process, or what she’s looking for. I only answer from what’s on this portfolio."
    const pos = isCanvas ? "absolute" : "fixed"

    const openPanel = useCallback(() => {
        if (typeof document !== "undefined") openerRef.current = document.activeElement as HTMLElement
        setGreetVisible(false)
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
    }, [])

    const close = useCallback(() => {
        setOpen(false)
        setTimeout(() => {
            const o = openerRef.current
            if (o && o !== document.body && document.contains(o)) o.focus()
            else launcherRef.current?.focus()
        }, 0)
    }, [])

    // Nav hook-up: listen for "db-chat-open" and advertise readiness.
    useEffect(() => {
        if (isCanvas) return
        const w = window as unknown as { __dbChatReady?: boolean }
        w.__dbChatReady = true
        window.dispatchEvent(new Event("db-chat-ready"))
        window.addEventListener("db-chat-open", openPanel)
        return () => {
            window.removeEventListener("db-chat-open", openPanel)
            w.__dbChatReady = false
        }
    }, [isCanvas, openPanel])

    // Esc closes from anywhere while open.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close() } }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [open, close])

    useEffect(() => { const el = logRef.current; if (el) el.scrollTop = el.scrollHeight }, [messages, open])

    // First-visit greeting, once per session.
    useEffect(() => {
        if (!showGreeting) { setGreetVisible(false); return }
        if (isCanvas) { setGreetVisible(true); setTyped(GREETING_TEXT); return }
        let seen = false
        try { seen = sessionStorage.getItem(GREETING_KEY) === "1" } catch { /* storage blocked: still greet */ }
        if (seen) return
        const t = window.setTimeout(() => {
            setGreetVisible(true)
            try { sessionStorage.setItem(GREETING_KEY, "1") } catch { /* ignore */ }
        }, 1800)
        return () => window.clearTimeout(t)
    }, [showGreeting, isCanvas])

    useEffect(() => {
        if (!greetVisible || isCanvas) return
        if (reduce) { setTyped(GREETING_TEXT); return }
        let i = 0
        setTyped("")
        const timer = window.setInterval(() => {
            i += 1
            setTyped(GREETING_TEXT.slice(0, i))
            if (i >= GREETING_TEXT.length) window.clearInterval(timer)
        }, 34)
        return () => window.clearInterval(timer)
    }, [greetVisible, reduce, isCanvas])

    const send = (text: string) => {
        const m = text.trim().slice(0, 600)
        if (!m) return
        const r = answer(m, base)
        setInput("")
        setMessages((prev) => [...prev, { role: "user", content: m }, { role: "assistant", content: r.text, links: r.links }])
    }

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]
    const dur = reduce ? 0 : 0.26

    const css = `
.dbgpt button, .dbgpt input, .dbgpt a { font-family: ${FONT}; }
.dbgpt button:focus-visible, .dbgpt a:focus-visible, .dbgpt input:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
.dbgpt-chip { transition: transform .18s ease, border-color .18s ease; }
.dbgpt-chip:hover { transform: translateY(-2px); border-color: color-mix(in srgb, ${T.accent} 58%, ${T.line}) !important; }
.dbgpt-launch { transition: transform .18s ease, filter .18s ease; }
.dbgpt-launch:hover { transform: translateY(-2px); filter: brightness(1.06); }
.dbgpt-link:hover { text-decoration: underline !important; }
.dbgpt-caret { display: inline-block; width: 1px; height: 1em; margin-left: 2px; vertical-align: -.12em; background: ${T.accent}; animation: dbgpt-caret .75s steps(1,end) infinite; }
@keyframes dbgpt-caret { 50% { opacity: 0; } }
.dbgpt-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.dbgpt-log::-webkit-scrollbar { width: 0; }
@media (prefers-reduced-motion: reduce) { .dbgpt-chip, .dbgpt-launch { transition: none; } .dbgpt-chip:hover, .dbgpt-launch:hover { transform: none; } .dbgpt-caret { animation: none; } }
`

    const iconBtn: React.CSSProperties = { width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: "1px solid " + T.line, background: "transparent", color: T.text2, fontSize: 22, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }

    // Oct 3 fix: render into <body> on the live site. Inside Framer's 1px wrapper, ancestors with
    // transforms/overflow clipped the fixed launcher, so DhwaniGPT never showed up.
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    const ui = (
        <div className="dbgpt" style={{ fontFamily: FONT, ...(isCanvas ? { position: "relative", width: "100%", height: "100%", minWidth: 220, minHeight: 160 } : {}) }}>
            <style>{css}</style>

            {/* ── First-visit greeting ─────────────────────────────────── */}
            <AnimatePresence>
                {greetVisible && !open && (
                    <motion.div
                        key="greet"
                        role="region"
                        aria-label="DhwaniGPT greeting"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: dur, ease }}
                        style={{ position: pos, right: 16, bottom: offset + 56, zIndex: 2147480001, width: "min(340px, calc(100vw - 32px))", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "10px 10px 10px 14px", borderRadius: 18, background: T.glass, border: "1px solid color-mix(in srgb, " + T.accent + " 22%, " + T.glassLine + ")", boxShadow: T.shadow, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxSizing: "border-box" }}
                    >
                        <span aria-hidden="true" style={{ display: "grid", placeItems: "center", flex: "0 0 28px", width: 28, height: 28, borderRadius: "50%", background: T.accent, color: T.onAccent, fontSize: 14 }}>✳</span>
                        <span className="dbgpt-sr">{GREETING_TEXT}</span>
                        <span aria-hidden="true" style={{ flex: "1 1 180px", minHeight: 22, color: T.text, fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>{typed}<i className="dbgpt-caret" /></span>
                        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                            <button type="button" onClick={openPanel} style={{ minHeight: 44, padding: "0 14px", border: 0, borderRadius: 12, background: T.accent, color: T.onAccent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ask DhwaniGPT <span aria-hidden="true">↗</span></button>
                            <button type="button" aria-label="Dismiss greeting" onClick={() => setGreetVisible(false)} style={iconBtn}>×</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Launcher (sits above the "open to work" pill) ────────── */}
            {!open && (
                <button
                    ref={launcherRef}
                    type="button"
                    className="dbgpt-launch"
                    onClick={openPanel}
                    aria-haspopup="dialog"
                    aria-expanded={false}
                    aria-controls="dbgpt-panel"
                    style={{ position: pos, right: 16, bottom: offset, zIndex: 2147480001, height: 44, minWidth: 44, padding: "0 18px 0 14px", borderRadius: 999, border: "1px solid color-mix(in srgb, " + T.accent + " 40%, transparent)", background: T.accent, color: T.onAccent, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 8px 28px color-mix(in srgb, " + T.accent + " 35%, transparent)" }}
                >
                    <span aria-hidden="true" style={{ fontSize: 14 }}>✦</span>
                    Ask DhwaniGPT
                </button>
            )}

            {/* ── Panel ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.section
                        key="panel"
                        id="dbgpt-panel"
                        role="dialog"
                        aria-modal="false"
                        aria-labelledby="dbgpt-title"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: dur, ease }}
                        style={{ position: pos, right: 12, bottom: 12, zIndex: 2147480002, width: "min(400px, calc(100vw - 24px))", maxHeight: "min(600px, calc(100dvh - 24px))", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 20, background: T.glass, border: "1px solid color-mix(in srgb, " + T.accent + " 28%, " + T.glassLine + ")", boxShadow: T.shadow, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", color: T.text, boxSizing: "border-box" }}
                    >
                        <div aria-hidden="true" style={{ height: 3, flexShrink: 0, background: "linear-gradient(90deg, transparent, " + T.accent + ", transparent)" }} />

                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 14px 12px 18px", borderBottom: "1px solid " + T.line, flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                                <span lang="hi" aria-hidden="true" style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 12, background: "color-mix(in srgb, " + T.accent + " 14%, " + T.surface + ")", border: "1px solid color-mix(in srgb, " + T.accent + " 30%, " + T.line + ")", color: T.text, fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>ध्वनि<span style={{ color: T.accent, fontWeight: 700 }}>?</span></span>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: "0 0 2px", color: T.text2, fontSize: 9, fontWeight: 600, letterSpacing: "0.13em" }}>A LITTLE PORTFOLIO SIDEKICK</p>
                                    <h2 id="dbgpt-title" style={{ margin: 0, fontSize: 17, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
                                        DhwaniGPT
                                        <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent }} />
                                    </h2>
                                    <p style={{ margin: "3px 0 0", fontSize: 12, color: T.text2 }}>Automated assistant, not Dhwani · portfolio facts only</p>
                                </div>
                            </div>
                            <button type="button" aria-label="Close chat" onClick={close} style={iconBtn}>×</button>
                        </div>

                        {/* Log */}
                        <div ref={logRef} className="dbgpt-log" role="log" aria-live="polite" aria-relevant="additions" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
                            <Bubble role="assistant" T={T}>{welcome}</Bubble>
                            {messages.map((m, i) => (
                                <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.22 }} style={{ display: "grid", gap: 6, maxWidth: "88%", alignSelf: m.role === "user" ? "flex-end" : "flex-start", justifyItems: m.role === "user" ? "end" : "start" }}>
                                    <Bubble role={m.role} T={T}>{m.content}</Bubble>
                                    {m.links?.map((l) => (
                                        <a key={l.href} className="dbgpt-link" href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 8px", color: T.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{l.label}</a>
                                    ))}
                                </motion.div>
                            ))}
                        </div>

                        {/* Suggestions */}
                        {messages.length === 0 && (
                            <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
                                <p style={{ display: "flex", justifyContent: "space-between", margin: "0 0 8px", color: T.text2, fontSize: 9, fontWeight: 600, letterSpacing: "0.14em" }}>PICK A THREAD <span aria-hidden="true" style={{ color: T.accent, fontSize: 14 }}>↘</span></p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 7 }}>
                                    {SUGGESTIONS.map((s) => (
                                        <button key={s.n} type="button" className="dbgpt-chip" onClick={() => send(s.query)} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, minHeight: 48, padding: "7px 9px", border: "1px solid " + T.line, borderRadius: "13px 13px 13px 5px", background: T.surface, color: T.text, textAlign: "left", fontSize: 12, fontWeight: 500, lineHeight: 1.2, cursor: "pointer" }}>
                                            <span aria-hidden="true" style={{ display: "grid", placeItems: "center", flex: "0 0 24px", width: 24, height: 24, borderRadius: 8, background: "color-mix(in srgb, " + T.accent + " 14%, " + T.surface + ")", color: T.accent, fontSize: 9, fontWeight: 600 }}>{s.n}</span>
                                            <span>{s.label}</span>
                                            <span aria-hidden="true" style={{ marginLeft: "auto", color: T.accent, fontSize: 13 }}>↗</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid " + T.line, flexShrink: 0 }}>
                            <label htmlFor="dbgpt-in" className="dbgpt-sr">Ask about Dhwani</label>
                            <input id="dbgpt-in" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me something…" maxLength={600} autoComplete="off" style={{ flex: 1, minWidth: 0, minHeight: 44, padding: "0 14px", borderRadius: 12, border: "1px solid " + T.line, background: T.surface, color: T.text, fontSize: 15, caretColor: T.accent, boxSizing: "border-box" }} />
                            <button type="submit" disabled={!input.trim()} style={{ minHeight: 44, padding: "0 16px", borderRadius: 12, border: 0, background: T.accent, color: T.onAccent, fontSize: 14, fontWeight: 600, cursor: input.trim() ? "pointer" : "default", opacity: input.trim() ? 1 : 0.55, flexShrink: 0 }}>Send <span aria-hidden="true">↗</span></button>
                        </form>
                        <p style={{ margin: 0, padding: "0 16px 12px", color: T.text2, fontSize: 11, textAlign: "center" }}>Automated answers from the portfolio only. No private details, please. This chat isn’t saved.</p>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    )
    if (isCanvas) return ui
    return <div style={{ width: 1, height: 1 }}>{mounted && typeof document !== "undefined" ? createPortal(ui, document.body) : null}</div>
}

function Bubble({ role, T, children }: { role: "user" | "assistant"; T: Record<string, string>; children: React.ReactNode }) {
    const user = role === "user"
    return (
        <p style={{ margin: 0, maxWidth: user ? "100%" : "88%", padding: "10px 14px", borderRadius: user ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: user ? T.accent : "color-mix(in srgb, " + T.accent + " 7%, " + T.surface + ")", border: user ? "none" : "1px solid color-mix(in srgb, " + T.accent + " 18%, " + T.line + ")", color: user ? T.onAccent : T.text, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {children}
        </p>
    )
}

addPropertyControls(DhwaniGPT, {
    casePath: { type: ControlType.String, title: "Case pages live at", defaultValue: "/projects/" },
    showGreeting: { type: ControlType.Boolean, title: "Show greeting", defaultValue: true },
    greeting: { type: ControlType.String, title: "Welcome Message", defaultValue: "", placeholder: "Hey! I’m DhwaniGPT, an automated assistant…", displayTextArea: true },
    accentColor: { type: ControlType.Color, title: "Accent fallback", defaultValue: "#F3500F", description: "Used only if --db-accent isn’t set." },
    bottomOffset: { type: ControlType.Number, title: "Launcher bottom", defaultValue: 84, min: 16, max: 240, step: 4, unit: "px", description: "Keeps the launcher above the “open to work” pill." },
})
