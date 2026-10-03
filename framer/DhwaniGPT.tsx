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
const EMAIL = "dhwanib@umich.edu"
const GREETING_KEY = "db-gpt-greeted"
const GREETING_TEXT = "Hi, I’m DhwaniGPT. Ask me anything about Dhwani’s work, or something silly."

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
        name: "Intelligence Hub",
        terms: /\bintel\b|intelligence|analysts?\b|case management|handoff/,
        summary: "Intelligence Hub (U-M DPSS): Dhwani interviewed six analysts and adjusted her questions to bring quieter voices in. The concept brings case history, status, ownership and related information into one workspace, so handoffs stop being where things get lost. The first version ran in Google Apps Script so the team could try it without touching production systems.",
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

const LI: Link = { href: LINKEDIN, label: "LinkedIn ↗", external: true }
const EM: Link = { href: "mailto:" + EMAIL, label: "Email her ↗", external: true }

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
        return { text: "Dhwani was a UX Design Intern at U-M DPSS, May – Aug 2026, designing tools for campus dispatch and the Intelligence Group. Two case studies came out of it: BRIEFS (finding building details mid-call) and the Intelligence Hub, which is in use.", links: [caseLink(byslug("briefs")), caseLink(byslug("intel"))] }
    }

    if (/contact|reach|e-?mail|linkedin|resume|résumé|\bcv\b|hire|hiring|get in touch|connect|talk to (her|dhwani)|message her/.test(q)) {
        return { text: "Easiest way: email her or find her on LinkedIn. I’m a bot, so I can’t pass messages along (and I’d paraphrase you badly).", links: [EM, LI] }
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
        return { text: "Five case studies: the Intelligence Hub and BRIEFS (both U-M DPSS), Convoy for General Motors, Open Library for the Internet Archive, and BudgetCart at UMSI. There’s also a Prime Video capstone, which is under NDA. Pick one and I’ll give you the short version." }
    }


    // Silly corner (Oct 3: "make the bot quirky, answer silly questions too").
    if (/pineapple/.test(q)) return { text: "On pizza? I’m legally a bot, so I’m staying out of it. Dhwani is vegetarian, though, so ask her for food recs instead. She takes those seriously." }
    if (/joke|make me laugh|funny/.test(q)) return { text: "A UX designer walks into a bar. Then walks back out, because the door said push and had a handle. She filed a bug report." }
    if (/meaning of life|42\b/.test(q)) return { text: "Probably good information architecture. Or a really well-sequenced playlist. Dhwani would argue those are the same thing." }
    if (/sentient|alive|conscious|feelings|do you dream/.test(q)) return { text: "Not even a little. I’m a pile of if-statements wearing a nice font." }
    if (/\bdj\b|music|playlist|song|instrument|spotify/.test(q)) return { text: "She DJs, loves music theory and plays four instruments. Her playlists have a taxonomy. That’s not a joke, it’s a warning." }
    if (/food|eat|vegetarian|restaurant|hungry|snack/.test(q)) return { text: "Vegetarian, and very willing to give you recommendations. It’s literally in her contact section." }
    if (/coffee|chai|\btea\b/.test(q)) return { text: "That’s above my clearance level. Ask her on LinkedIn and report back.", links: [LI] }
    if (/\brun|running|gym|workout|work out|fitness/.test(q)) return { text: "She works out a lot and is currently trying to become the kind of person who likes running. Progress: ongoing." }
    if (/weather|time is it|stock|bitcoin|crypto/.test(q)) return { text: "I only know what’s on this portfolio. For that, a window or a search engine will serve you better." }
    if (/\b(cat|cats|dog|dogs)\b/.test(q)) return { text: "I don’t have a verified stance on that, and I refuse to start a war on her website." }
    if (/favou?rite (color|colour)/.test(q)) return { text: "Judging by this site? Somewhere between ember orange and whatever vibe you picked." }
    if (/hire|should .*(hire|interview)/.test(q)) return { text: "I’m biased, I literally live on her website. But the case studies make a decent argument.", links: [EM, LI] }

    if (/thank/.test(q)) return { text: "Anytime. If you want the real Dhwani, she’s on LinkedIn.", links: [LI] }
    if (/^(hi|hello|hey|hiya|yo|howdy)\b/.test(q)) return { text: "Hi! I’m DhwaniGPT, an automated assistant. Ask me about a project, her process, or what she’s looking for." }

    return { text: "That isn’t on the portfolio, so I won’t guess or make it up. I can talk about the Intelligence Hub, BRIEFS, GM Convoy, Open Library or BudgetCart, or you can ask Dhwani directly.", links: [EM, LI] }
}

const SUGGESTIONS = [
    { label: "What does she do best?", query: "What does Dhwani do best?", n: "01" },
    { label: "The BRIEFS story", query: "Tell me about BRIEFS", n: "02" },
    { label: "Tell me a joke", query: "Tell me a joke", n: "03" },
    { label: "How do I reach her?", query: "How do I contact her?", n: "04" },
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
    const welcome = greeting?.trim() || "Hi, I’m DhwaniGPT, a little bot that knows this portfolio. Ask about a project, her process, or something silly. Heads up: I’m a bot, so I might get things wrong."
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
    const dur = reduce ? 0 : 0.22

    // Oct 3 redesign ("this whole ui is ugly"): quiet, editorial. One accent moment (the orb +
    // send button), neutral surfaces, no numbered chips, no Hindi badge, no orange outlines.
    const css = `
.dbgpt, .dbgpt button, .dbgpt input, .dbgpt a { font-family: ${FONT}; -webkit-font-smoothing: antialiased; }
.dbgpt button:focus-visible, .dbgpt a:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
.dbgpt-field:focus-within { border-color: color-mix(in srgb, ${T.accent} 55%, ${T.line}); box-shadow: 0 0 0 3px color-mix(in srgb, ${T.accent} 16%, transparent); }
.dbgpt-field input:focus { outline: none; }
.dbgpt-field input::placeholder { color: ${T.text2}; opacity: 1; }
.dbgpt-chip { transition: background .18s ease, border-color .18s ease, color .18s ease; }
.dbgpt-chip:hover { background: ${T.line}; color: ${T.text}; }
.dbgpt-ghost { transition: background .18s ease, color .18s ease; }
.dbgpt-ghost:hover { background: ${T.line}; color: ${T.text}; }
.dbgpt-launch { transition: transform .2s ease, border-color .2s ease; }
.dbgpt-launch:hover { transform: translateY(-1px); border-color: color-mix(in srgb, ${T.accent} 45%, ${T.glassLine}); }
.dbgpt-link:hover { text-decoration: underline !important; text-underline-offset: 3px; }
.dbgpt-orb { background: radial-gradient(circle at 30% 30%, var(--vibe-c, #FFD27A), var(--vibe-b, ${T.accent}) 55%, var(--vibe-a, #8A2A04)); }
@keyframes dbgpt-pulse { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.08); opacity: 1 } }
.dbgpt-orb-live { animation: dbgpt-pulse 3.2s ease-in-out infinite; }
.dbgpt-caret { display: inline-block; width: 1px; height: 1em; margin-left: 2px; vertical-align: -.12em; background: ${T.text2}; animation: dbgpt-caret .9s steps(1,end) infinite; }
@keyframes dbgpt-caret { 50% { opacity: 0; } }
.dbgpt-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.dbgpt-log { scrollbar-width: none; }
.dbgpt-log::-webkit-scrollbar { width: 0; }
@media (prefers-reduced-motion: reduce) { .dbgpt-chip, .dbgpt-launch, .dbgpt-ghost { transition: none; } .dbgpt-launch:hover { transform: none; } .dbgpt-caret, .dbgpt-orb-live { animation: none; } }
`

    const Orb = ({ size, live }: { size: number; live?: boolean }) => (
        <span aria-hidden="true" className={"dbgpt-orb" + (live && !reduce ? " dbgpt-orb-live" : "")} style={{ display: "inline-block", flexShrink: 0, width: size, height: size, borderRadius: "50%", boxShadow: "0 0 0 1px " + T.line + ", 0 4px 14px color-mix(in srgb, " + T.accent + " 30%, transparent)" }} />
    )
    const CloseIcon = () => (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
    )
    const ghost: React.CSSProperties = { width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: 0, background: "transparent", color: T.text2, cursor: "pointer", display: "grid", placeItems: "center" }
    const canSend = !!input.trim()

    // Render into <body> on the live site so the fixed launcher is never clipped by Framer wrappers.
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
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: dur, ease }}
                        style={{ position: pos, right: 16, bottom: offset + 56, zIndex: 2147480001, width: "min(320px, calc(100vw - 32px))", display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 8px 14px 14px", borderRadius: 16, background: T.glass, border: "1px solid " + T.glassLine, boxShadow: T.shadow, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxSizing: "border-box" }}
                    >
                        <span style={{ paddingTop: 2 }}><Orb size={22} live /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="dbgpt-sr">{GREETING_TEXT}</span>
                            <p aria-hidden="true" style={{ margin: 0, minHeight: 42, color: T.text, fontSize: 14, lineHeight: 1.5 }}>{typed}<i className="dbgpt-caret" /></p>
                            <button type="button" onClick={openPanel} className="dbgpt-chip" style={{ marginTop: 10, minHeight: 36, padding: "0 14px", border: "1px solid " + T.line, borderRadius: 999, background: "transparent", color: T.text, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Start the tour</button>
                        </div>
                        <button type="button" aria-label="Dismiss greeting" onClick={() => setGreetVisible(false)} className="dbgpt-ghost" style={{ ...ghost, width: 36, height: 36, borderRadius: 10 }}><CloseIcon /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Launcher ─────────────────────────────────────────────── */}
            {!open && (
                <button
                    ref={launcherRef}
                    type="button"
                    className="dbgpt-launch"
                    onClick={openPanel}
                    aria-haspopup="dialog"
                    aria-expanded={false}
                    aria-controls="dbgpt-panel"
                    style={{ position: pos, right: 16, bottom: offset, zIndex: 2147480001, height: 44, padding: "0 16px 0 10px", borderRadius: 999, border: "1px solid " + T.glassLine, background: T.glass, color: T.text, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: T.shadow, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
                >
                    <Orb size={22} live />
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
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15 } }}
                        transition={{ duration: dur, ease }}
                        style={{ position: pos, right: 12, bottom: 12, zIndex: 2147480002, width: "min(380px, calc(100vw - 24px))", height: "min(560px, calc(100dvh - 24px))", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 20, background: T.glass, border: "1px solid " + T.glassLine, boxShadow: T.shadow, backdropFilter: "blur(28px) saturate(140%)", WebkitBackdropFilter: "blur(28px) saturate(140%)", color: T.text, boxSizing: "border-box", transformOrigin: "bottom right" }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px 12px 16px", flexShrink: 0 }}>
                            <Orb size={30} live />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 id="dbgpt-title" style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: T.text }}>DhwaniGPT</h2>
                                <p style={{ margin: "1px 0 0", fontSize: 12, color: T.text2 }}>Answers from her portfolio</p>
                            </div>
                            <button type="button" aria-label="Close chat" onClick={close} className="dbgpt-ghost" style={ghost}><CloseIcon /></button>
                        </div>
                        <div aria-hidden="true" style={{ height: 1, background: T.line, flexShrink: 0 }} />

                        {/* Log */}
                        <div ref={logRef} className="dbgpt-log" role="log" aria-live="polite" aria-relevant="additions" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 16px 8px", display: "flex", flexDirection: "column", gap: 18 }}>
                            <Bubble role="assistant" T={T}>{welcome}</Bubble>
                            {messages.length === 0 && (
                                <div role="group" aria-label="Suggested questions" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {SUGGESTIONS.map((s) => (
                                        <button key={s.n} type="button" className="dbgpt-chip" onClick={() => send(s.query)} style={{ minHeight: 36, padding: "0 14px", border: "1px solid " + T.line, borderRadius: 999, background: "transparent", color: T.text2, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} style={{ display: "grid", gap: 4, alignSelf: m.role === "user" ? "flex-end" : "stretch", justifyItems: m.role === "user" ? "end" : "start", maxWidth: m.role === "user" ? "85%" : "100%" }}>
                                    <Bubble role={m.role} T={T}>{m.content}</Bubble>
                                    {m.links?.map((l) => (
                                        <a key={l.href} className="dbgpt-link" href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ display: "inline-flex", alignItems: "center", minHeight: 36, color: T.text, fontSize: 13, fontWeight: 500, textDecoration: "underline", textDecorationColor: "color-mix(in srgb, " + T.accent + " 60%, transparent)", textUnderlineOffset: 3 }}>{l.label}</a>
                                    ))}
                                </motion.div>
                            ))}
                        </div>

                        {/* Input */}
                        <form onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ padding: "8px 12px 10px", flexShrink: 0 }}>
                            <label htmlFor="dbgpt-in" className="dbgpt-sr">Ask about Dhwani</label>
                            <div className="dbgpt-field" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 4px 4px 14px", borderRadius: 14, border: "1px solid " + T.line, background: T.surface, transition: "border-color .18s ease, box-shadow .18s ease" }}>
                                <input id="dbgpt-in" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a project…" maxLength={600} autoComplete="off" style={{ flex: 1, minWidth: 0, height: 40, border: 0, background: "transparent", color: T.text, fontSize: 15, caretColor: T.accent }} />
                                <button type="submit" disabled={!canSend} aria-label="Send" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, border: 0, display: "grid", placeItems: "center", background: canSend ? T.accent : T.line, color: canSend ? T.onAccent : T.text2, cursor: canSend ? "pointer" : "default", transition: "background .18s ease, color .18s ease" }}>
                                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                </button>
                            </div>
                            <p style={{ margin: "8px 0 0", color: T.text2, fontSize: 11, textAlign: "center" }}>Automated, not Dhwani. I’m a bot and I can get things wrong (lol). Nothing is saved.</p>
                        </form>
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
    return user ? (
        <p style={{ margin: 0, padding: "9px 14px", borderRadius: "16px 16px 4px 16px", background: T.line, color: T.text, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{children}</p>
    ) : (
        <p style={{ margin: 0, color: T.text, fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{children}</p>
    )
}

addPropertyControls(DhwaniGPT, {
    casePath: { type: ControlType.String, title: "Case pages live at", defaultValue: "/projects/" },
    showGreeting: { type: ControlType.Boolean, title: "Show greeting", defaultValue: true },
    greeting: { type: ControlType.String, title: "Welcome Message", defaultValue: "", placeholder: "Hey! I’m DhwaniGPT, an automated assistant…", displayTextArea: true },
    accentColor: { type: ControlType.Color, title: "Accent fallback", defaultValue: "#F3500F", description: "Used only if --db-accent isn’t set." },
    bottomOffset: { type: ControlType.Number, title: "Launcher bottom", defaultValue: 84, min: 16, max: 240, step: 4, unit: "px", description: "Keeps the launcher above the “open to work” pill." },
})
