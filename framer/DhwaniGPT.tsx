// DhwaniGPT — floating portfolio assistant for Dhwani's Framer site.
// Oct 4: real conversation thread (stacked messages, input always live, New chat + Close + Esc),
// contextual follow-up chips, "search the portfolio" mode + type-ahead suggestions, and an
// optional LLM backend via the "API URL" prop (POST {messages} -> {reply, followUps?}).
// With no API URL, or on any network error, it answers from the canned facts below (offline mode).
// Facts mirror src/content/site.ts + cases.ts on the Next.js site. Prime Video stays under NDA.
// Opens on window event "db-chat-open"; sets window.__dbChatReady = true while mounted.
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import type { CSSProperties, ReactNode } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const FONT = "'Poppins', 'Inter', sans-serif"
const LINKEDIN = "https://www.linkedin.com/in/dhwanibagrecha/"
const EMAIL = "dhwanib@umich.edu"
const GREETING_KEY = "db-gpt-greeted"
const GREETING_TEXT = "Hi, I’m DhwaniGPT. Ask me anything about Dhwani’s work, or something silly."
const API_TIMEOUT_MS = 15000
const MAX_HISTORY = 12
const MAX_CHARS = 2000

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
type Reply = { text: string; links?: Link[]; topic: string }
type Message = { id: number; role: "user" | "assistant"; content: string; links?: Link[]; followUps?: string[]; offline?: boolean }

const LI: Link = { href: LINKEDIN, label: "LinkedIn ↗", external: true }
const EM: Link = { href: "mailto:" + EMAIL, label: "Email her ↗", external: true }

function norm(raw: string) {
    return raw.toLowerCase().replace(/[’‘]/g, "'").trim()
}

function answer(raw: string, base: string): Reply {
    const q = norm(raw)
    const caseLink = (p: Project): Link => ({ href: base + p.slug, label: "Read the " + p.name + " case study ↗" })
    const byslug = (s: string) => PROJECTS.find((p) => p.slug === s) as Project
    const asksAI = /\bai\b|artificial intelligence|chatbot|\bllm\b|machine learning/.test(q)

    // NDA first, so nothing below can leak detail.
    if (/prime|amazon|capstone|streaming/.test(q)) return { topic: "nda", text: "Prime Video is Dhwani’s current capstone, and it’s under NDA, so that’s genuinely all I can say. Happy to talk about anything else on the portfolio.", links: [LI] }

    if (/are you (real|human|a bot|a person|dhwani|her|ai)|who are you|what are you|is this (really )?(dhwani|a bot|real|her|a person)|am i (talking|chatting) (to|with)/.test(q)) {
        return { topic: "identity", text: "I’m DhwaniGPT, an automated assistant, not Dhwani. I answer only from what’s on her portfolio, and this chat isn’t saved. For the real Dhwani, LinkedIn is the way.", links: [LI] }
    }

    const project = PROJECTS.find((p) => p.terms.test(q))
    if (project) {
        let text: string
        const asksRole = /team|who .*with|\brole\b|when|timeline|how long/.test(q)
        if (asksAI && project.ai) text = "In " + project.name + ", " + project.ai
        else if (asksAI) text = "The " + project.name + " case study doesn’t describe an AI piece, so I won’t invent one. Here’s what it does cover. " + project.summary
        else text = project.summary + " " + project.status
        if (asksRole) text += " Her role: " + project.role + ". Team: " + project.team + ". When: " + project.when + "."
        else if (!asksAI) text += project.ai ? " Want her role and timeline, or the AI angle?" : " Want her role and timeline next?"
        return { topic: "project:" + project.slug, text, links: [caseLink(project)] }
    }

    if (/\bdpss\b|public safety/.test(q)) {
        return { topic: "dpss", text: "Dhwani was a UX Design Intern at U-M DPSS, May – Aug 2026, designing tools for campus dispatch and the Intelligence Group. Two case studies came out of it: BRIEFS (finding building details mid-call) and the Intelligence Hub, which is in use.", links: [caseLink(byslug("briefs")), caseLink(byslug("intel"))] }
    }

    if (/contact|reach|e-?mail|linkedin|resume|résumé|\bcv\b|hire|hiring|get in touch|connect|talk to (her|dhwani)|message her/.test(q)) {
        return { topic: "contact", text: "Easiest way: email her or find her on LinkedIn. I’m a bot, so I can’t pass messages along (and I’d paraphrase you badly).", links: [EM, LI] }
    }

    if (/looking for|open to work|available|availability|what roles?|kind of (role|job)|\bjobs?\b|full[- ]time|graduat/.test(q)) {
        return { topic: "jobs", text: "She’s looking for product, UX and experience design roles. She’s finishing an MS at the University of Michigan School of Information, graduating May 2027, based in Ann Arbor and open to moving anywhere.", links: [LI] }
    }

    if (/relocat|\bmove\b|moving|location|where .*(based|live|located|from)|ann arbor/.test(q)) {
        return { topic: "jobs", text: "Dhwani is based in Ann Arbor and open to moving anywhere." }
    }

    if (/school|education|degree|study|studying|umsi|master|\bms\b|psych|undergrad|college|university/.test(q)) {
        return { topic: "school", text: "She’s an MS student at the University of Michigan School of Information (UMSI), graduating May 2027. Before that: a psychology degree, finished in three years." }
    }

    if (asksAI) {
        return { topic: "ai", text: "Thoughtfully, with guardrails. In BRIEFS, the assistant answers only from approved records, cites its source, and admits when information is missing. In Intel, public tips arrive through a chatbot intake. In BudgetCart, an AI cart builder drafts a starting cart that shoppers edit.", links: [caseLink(byslug("briefs"))] }
    }

    if (/good at|best at|strength|skill|superpower|what does (she|dhwani) do|special/.test(q)) {
        return { topic: "skills", text: "Her work spans research, interaction design and prototyping for complex workflows. Start with BRIEFS for high-stakes information design, or GM Convoy for advanced in-car prototyping.", links: [caseLink(byslug("briefs")), caseLink(byslug("general-motors"))] }
    }

    if (/process|approach|how does she (work|design)|method/.test(q)) {
        return { topic: "process", text: "She starts where the work happens: sitting in the dispatch center for BRIEFS, interviewing six analysts for Intel, joining client calls on Open Library. Then she maps it (workflows, affinity maps), prototypes, and changes direction when the research says so, like cutting four weeks of biometric work on GM Convoy.", links: [caseLink(byslug("briefs"))] }
    }

    if (/tools?\b|software|figma|stack|prototyp/.test(q)) {
        return { topic: "tools", text: "Figma shows up most: advanced interactions and a shared design system on GM Convoy, a self-taught component system on BudgetCart. She also built working prototypes in Google Apps Script for BRIEFS and Intel. Anything beyond that isn’t listed on the portfolio, so I won’t guess." }
    }

    const role = EXPERIENCE.find((r) => r.terms.test(q))
    if (role) return { topic: "experience", text: role.line }

    if (/experience|background|career|worked|work history|internships?|resume/.test(q)) {
        return { topic: "experience", text: "Most recent: Adobe Student Ambassador (Jul 2026 – now), UX Design Intern at U-M DPSS (May – Aug 2026), and UX Researcher & Designer on a General Motors-sponsored project (Jan – May 2026). Earlier: Open Library research, SOCHI, the Global Scholars Program, Iska Press, an MSU research assistantship, Miller Johnson and DDB Mudra Group." }
    }

    if (/projects?|\bwork\b|portfolio|case stud|show me/.test(q)) {
        return { topic: "projects", text: "Five case studies: the Intelligence Hub and BRIEFS (both U-M DPSS), Convoy for General Motors, Open Library for the Internet Archive, and BudgetCart at UMSI. There’s also a Prime Video capstone, which is under NDA. Pick one and I’ll give you the short version." }
    }

    // Silly corner (Oct 3: "make the bot quirky, answer silly questions too").
    if (/pineapple/.test(q)) return { topic: "silly", text: "On pizza? I’m legally a bot, so I’m staying out of it. Dhwani is vegetarian, though, so ask her for food recs instead. She takes those seriously." }
    if (/joke|make me laugh|funny/.test(q)) return { topic: "silly", text: "A UX designer walks into a bar. Then walks back out, because the door said push and had a handle. She filed a bug report." }
    if (/meaning of life|42\b/.test(q)) return { topic: "silly", text: "Probably good information architecture. Or a really well-sequenced playlist. Dhwani would argue those are the same thing." }
    if (/sentient|alive|conscious|feelings|do you dream/.test(q)) return { topic: "silly", text: "Not even a little. I’m a pile of if-statements wearing a nice font." }
    if (/\bdj\b|music|playlist|song|instrument|spotify/.test(q)) return { topic: "silly", text: "She DJs, loves music theory and plays four instruments. Her playlists have a taxonomy. That’s not a joke, it’s a warning." }
    if (/food|eat|vegetarian|restaurant|hungry|snack/.test(q)) return { topic: "silly", text: "Vegetarian, and very willing to give you recommendations. It’s literally in her contact section." }
    if (/coffee|chai|\btea\b/.test(q)) return { topic: "silly", text: "That’s above my clearance level. Ask her on LinkedIn and report back.", links: [LI] }
    if (/\brun|running|gym|workout|work out|fitness/.test(q)) return { topic: "silly", text: "She works out a lot and is currently trying to become the kind of person who likes running. Progress: ongoing." }
    if (/weather|time is it|stock|bitcoin|crypto/.test(q)) return { topic: "silly", text: "I only know what’s on this portfolio. For that, a window or a search engine will serve you better." }
    if (/\b(cat|cats|dog|dogs)\b/.test(q)) return { topic: "silly", text: "I don’t have a verified stance on that, and I refuse to start a war on her website." }
    if (/favou?rite (color|colour)/.test(q)) return { topic: "silly", text: "Judging by this site? Somewhere between ember orange and whatever vibe you picked." }
    if (/hire|should .*(hire|interview)/.test(q)) return { topic: "contact", text: "I’m biased, I literally live on her website. But the case studies make a decent argument.", links: [EM, LI] }

    if (/thank/.test(q)) return { topic: "thanks", text: "Anytime. If you want the real Dhwani, she’s on LinkedIn.", links: [LI] }
    if (/^(hi|hello|hey|hiya|yo|howdy)\b/.test(q)) return { topic: "identity", text: "Hi! I’m DhwaniGPT, an automated assistant. Ask me about a project, her process, or what she’s looking for." }

    return { topic: "default", text: "That isn’t on the portfolio, so I won’t guess or make it up. I can talk about the Intelligence Hub, BRIEFS, GM Convoy, Open Library or BudgetCart, or you can ask Dhwani directly.", links: [EM, LI] }
}

// Offline follow-ups per topic. Every string here is answerable by answer() above.
const FOLLOW_UPS: Record<string, string[]> = {
    nda: ["What other projects are there?", "What does she do best?", "How do I reach her?"],
    identity: ["What does she do best?", "Tell me about BRIEFS", "What roles is she looking for?"],
    dpss: ["Tell me about BRIEFS", "Tell me about the Intelligence Hub", "How does she use AI?"],
    contact: ["What roles is she looking for?", "Where is she based?", "What does she do best?"],
    jobs: ["How do I reach her?", "What does she do best?", "What's her experience?"],
    school: ["What's her experience?", "How does she work?", "What roles is she looking for?"],
    ai: ["Tell me about BRIEFS", "Tell me about BudgetCart", "How does she work?"],
    skills: ["How does she work?", "Which tools does she use?", "Tell me about GM Convoy"],
    process: ["Tell me about Open Library", "Which tools does she use?", "What does she do best?"],
    tools: ["How does she work?", "Tell me about GM Convoy", "How does she use AI?"],
    experience: ["Tell me about DPSS", "What roles is she looking for?", "What other projects are there?"],
    projects: ["Tell me about the Intelligence Hub", "Tell me about GM Convoy", "Tell me about Open Library"],
    silly: ["Tell me a joke", "Are you sentient?", "Show me her projects"],
    thanks: ["What other projects are there?", "How do I reach her?"],
    default: ["What other projects are there?", "What does she do best?", "How do I reach her?"],
}
function offlineFollowUps(topic: string): string[] {
    if (topic.startsWith("project:")) {
        const p = PROJECTS.find((x) => "project:" + x.slug === topic)
        if (p) {
            const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length]
            return ["Her role and timeline on " + p.name + "?", p.ai ? "How did " + p.name + " use AI?" : "How does she work?", "Tell me about " + next.name]
        }
    }
    return FOLLOW_UPS[topic] || FOLLOW_UPS.default
}

// ── Search index (projects, roles, skills, FAQ) ─────────────────────────────
type IndexItem = { kind: "Project" | "Role" | "Skill" | "FAQ"; title: string; sub: string; query: string; keys: string }
const INDEX: IndexItem[] = [
    ...PROJECTS.map((p): IndexItem => ({ kind: "Project", title: p.name, sub: p.when + " · " + p.team, query: "Tell me about " + p.name, keys: p.summary + " " + p.role })),
    { kind: "Role", title: "UX Design Intern, U-M DPSS", sub: "May – Aug 2026", query: "Tell me about DPSS", keys: "dpss public safety dispatch intelligence internship" },
    { kind: "Role", title: "UX Researcher & Designer, General Motors", sub: "Jan – May 2026", query: "Tell me about GM Convoy", keys: "gm convoy automotive vehicle sponsored" },
    { kind: "Role", title: "Adobe Student Ambassador", sub: "Jul 2026 – now", query: "Tell me about Adobe", keys: "adobe workshops creative" },
    { kind: "Role", title: "UX Researcher & PM, Iska Press", sub: "Jan – May 2026", query: "Tell me about Iska Press", keys: "iska consulting project manager" },
    { kind: "Role", title: "PM & UX Researcher, SOCHI", sub: "Sep 2025 – May 2026", query: "Tell me about SOCHI", keys: "sochi product strategy project manager" },
    { kind: "Role", title: "PM, U-M Global Scholars Program", sub: "Aug 2025 – May 2026", query: "Tell me about Global Scholars", keys: "global scholars social media community" },
    { kind: "Role", title: "Research Assistant, MSU", sub: "May 2024 – May 2025", query: "Tell me about her research assistant role", keys: "msu michigan state eye-tracking eye tracking behavioral research" },
    { kind: "Role", title: "HR Systems Intern, Miller Johnson", sub: "Jun – Aug 2024", query: "Tell me about Miller Johnson", keys: "hr human resources law firm" },
    { kind: "Role", title: "UX DEI Intern, DDB Mudra Group", sub: "Jun – Aug 2023", query: "Tell me about DDB Mudra", keys: "ddb mudra dei accessibility advertising" },
    { kind: "Skill", title: "Research & field work", sub: "Contextual inquiry, interviews, synthesis", query: "How does she work?", keys: "research process approach method interviews affinity" },
    { kind: "Skill", title: "Prototyping & Figma", sub: "Design systems, Apps Script prototypes", query: "Which tools does she use?", keys: "figma tools prototype software stack design system" },
    { kind: "Skill", title: "AI with guardrails", sub: "Grounded answers, human approval", query: "How does she use AI?", keys: "ai llm chatbot machine learning" },
    { kind: "Skill", title: "Complex workflows", sub: "What she does best", query: "What does she do best?", keys: "strengths skills best good at information design" },
    { kind: "FAQ", title: "What roles she’s looking for", sub: "Product, UX, experience design", query: "What roles is she looking for?", keys: "jobs hiring open to work available full-time graduate" },
    { kind: "FAQ", title: "Where she’s based", sub: "Ann Arbor, open to moving", query: "Where is she based?", keys: "location relocate move ann arbor" },
    { kind: "FAQ", title: "Education", sub: "MS at UMSI, psych undergrad", query: "Where did she study?", keys: "school education degree umsi masters psychology university" },
    { kind: "FAQ", title: "How to contact her", sub: "Email or LinkedIn", query: "How do I contact her?", keys: "contact email linkedin reach resume hire" },
    { kind: "FAQ", title: "Prime Video capstone", sub: "Under NDA", query: "What about Prime Video?", keys: "prime video amazon capstone nda" },
    { kind: "FAQ", title: "Is this bot Dhwani?", sub: "No, it’s a bot", query: "Are you real?", keys: "bot real human who are you" },
]
function searchIndex(raw: string, limit: number): IndexItem[] {
    const words = norm(raw).split(/[^a-z0-9-]+/).filter((w) => w.length >= 2)
    if (!words.length) return []
    const scored = INDEX.map((it) => {
        const title = it.title.toLowerCase()
        const hay = (it.title + " " + it.sub + " " + it.kind + " " + it.keys).toLowerCase()
        let s = 0
        for (const w of words) {
            if (title.includes(w)) s += 3
            else if (hay.includes(w)) s += 1
        }
        return { it, s }
    }).filter((x) => x.s > 0)
    scored.sort((a, b) => b.s - a.s)
    return scored.slice(0, limit).map((x) => x.it)
}

const SUGGESTIONS = [
    { label: "What does she do best?", query: "What does Dhwani do best?", n: "01" },
    { label: "The BRIEFS story", query: "Tell me about BRIEFS", n: "02" },
    { label: "Tell me a joke", query: "Tell me a joke", n: "03" },
    { label: "How do I reach her?", query: "How do I contact her?", n: "04" },
]

type Props = { accentColor: string; greeting: string; casePath: string; showGreeting: boolean; bottomOffset: number; apiUrl: string }

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DhwaniGPT({ accentColor, greeting, casePath, showGreeting, bottomOffset, apiUrl }: Props) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const reduce = useReducedMotion()
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [pending, setPending] = useState(false)
    const [mode, setMode] = useState<"chat" | "search">("chat")
    const [searchQ, setSearchQ] = useState("")
    const [announce, setAnnounce] = useState("")
    const [greetVisible, setGreetVisible] = useState(false)
    const [typed, setTyped] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const logRef = useRef<HTMLDivElement>(null)
    const launcherRef = useRef<HTMLButtonElement>(null)
    const openerRef = useRef<HTMLElement | null>(null)
    const messagesRef = useRef<Message[]>([])
    const convRef = useRef(0)
    const idRef = useRef(0)
    const abortRef = useRef<AbortController | null>(null)

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
    const api = (apiUrl || "").trim()
    const offset = typeof bottomOffset === "number" ? bottomOffset : 84
    const welcome = greeting?.trim() || "Hi, I’m DhwaniGPT, a little bot that knows this portfolio. Ask about a project, her process, or something silly. Heads up: I’m a bot, so I might get things wrong."
    const pos = isCanvas ? "absolute" : "fixed"

    const focusInput = () => setTimeout(() => inputRef.current?.focus(), 50)

    const openPanel = useCallback(() => {
        if (typeof document !== "undefined") openerRef.current = document.activeElement as HTMLElement
        setGreetVisible(false)
        setMode("chat")
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 60)
    }, [])

    const close = useCallback(() => {
        setOpen(false)
        setTimeout(() => {
            const o = openerRef.current
            if (o && o !== document.body && document.contains(o)) o.focus()
            else launcherRef.current?.focus()
        }, 0)
    }, [])

    const commit = (next: Message[]) => {
        messagesRef.current = next
        setMessages(next)
    }

    const reset = () => {
        convRef.current += 1
        abortRef.current?.abort()
        commit([])
        setPending(false)
        setInput("")
        setSearchQ("")
        setMode("chat")
        setAnnounce("New chat started.")
        focusInput()
    }

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

    useEffect(() => () => abortRef.current?.abort(), [])

    // Auto-scroll to the newest message.
    useEffect(() => {
        const el = logRef.current
        if (!el || mode !== "chat") return
        el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" })
    }, [messages, pending, open, mode, reduce])

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

    // Links for an LLM reply: case studies it names, plus contact links it mentions.
    const linksFor = (text: string): Link[] => {
        const t = text.toLowerCase()
        const out: Link[] = []
        for (const p of PROJECTS) {
            if (out.length >= 2) break
            if (p.terms.test(t) || t.includes(p.name.toLowerCase())) out.push({ href: base + p.slug, label: "Read the " + p.name + " case study ↗" })
        }
        if (/linkedin/.test(t)) out.push(LI)
        if (/e-?mail/.test(t)) out.push(EM)
        return out
    }

    const askApi = async (history: Message[]): Promise<{ reply: string; followUps: string[] } | null> => {
        const ctrl = new AbortController()
        abortRef.current = ctrl
        const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS)
        try {
            const res = await fetch(api, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) })) }),
                signal: ctrl.signal,
            })
            if (!res.ok) return null
            const data = (await res.json()) as { reply?: unknown; followUps?: unknown }
            if (typeof data.reply !== "string" || !data.reply.trim()) return null
            const f = Array.isArray(data.followUps) ? data.followUps.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim().slice(0, 80)).slice(0, 3) : []
            return { reply: data.reply.trim(), followUps: f }
        } catch {
            return null
        } finally {
            clearTimeout(timer)
        }
    }

    const send = async (text: string) => {
        const m = text.trim().slice(0, 600)
        if (!m || pending) return
        const conv = convRef.current
        setMode("chat")
        setInput("")
        const userMsg: Message = { id: ++idRef.current, role: "user", content: m }
        const history = [...messagesRef.current, userMsg]
        commit(history)
        focusInput()

        const canned = answer(m, base)
        const cannedMsg = (offline: boolean): Message => ({ id: ++idRef.current, role: "assistant", content: canned.text, links: canned.links, followUps: offlineFollowUps(canned.topic), offline })

        let bot: Message
        if (!api) {
            bot = cannedMsg(false)
        } else {
            setPending(true)
            const r = await askApi(history)
            if (conv !== convRef.current) return // chat was reset mid-flight
            setPending(false)
            bot = r
                ? { id: ++idRef.current, role: "assistant", content: r.reply, links: linksFor(r.reply), followUps: r.followUps.length ? r.followUps : offlineFollowUps(canned.topic) }
                : cannedMsg(true)
        }
        commit([...messagesRef.current, bot])
        setAnnounce("DhwaniGPT: " + bot.content)
    }

    const pick = (it: IndexItem) => { setSearchQ(""); send(it.query) }
    const openSearch = () => {
        setMode((m) => (m === "search" ? "chat" : "search"))
        setTimeout(() => (mode === "search" ? inputRef.current : searchRef.current)?.focus(), 50)
    }

    const typeAhead = useMemo(() => (mode === "chat" && !pending && input.trim().length >= 2 ? searchIndex(input, 3) : []), [input, mode, pending])
    const searchResults = useMemo(() => (searchQ.trim() ? searchIndex(searchQ, 12) : INDEX), [searchQ])

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
.dbgpt-ghost:hover, .dbgpt-ghost[aria-pressed="true"] { background: ${T.line}; color: ${T.text}; }
.dbgpt-result { transition: background .18s ease; }
.dbgpt-result:hover { background: ${T.line}; }
.dbgpt-launch { transition: transform .2s ease, border-color .2s ease; }
.dbgpt-launch:hover { transform: translateY(-1px); border-color: color-mix(in srgb, ${T.accent} 45%, ${T.glassLine}); }
.dbgpt-link:hover { text-decoration: underline !important; text-underline-offset: 3px; }
.dbgpt-orb { background: radial-gradient(circle at 30% 30%, var(--vibe-c, #FFD27A), var(--vibe-b, ${T.accent}) 55%, var(--vibe-a, #8A2A04)); }
@keyframes dbgpt-pulse { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.08); opacity: 1 } }
.dbgpt-orb-live { animation: dbgpt-pulse 3.2s ease-in-out infinite; }
.dbgpt-caret { display: inline-block; width: 1px; height: 1em; margin-left: 2px; vertical-align: -.12em; background: ${T.text2}; animation: dbgpt-caret .9s steps(1,end) infinite; }
@keyframes dbgpt-caret { 50% { opacity: 0; } }
@keyframes dbgpt-dot { 0%, 80%, 100% { opacity: .25 } 40% { opacity: 1 } }
.dbgpt-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${T.text2}; animation: dbgpt-dot 1.2s ease-in-out infinite; }
.dbgpt-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.dbgpt-log { scrollbar-width: none; }
.dbgpt-log::-webkit-scrollbar { width: 0; }
@media (max-width: 520px) {
  .dbgpt-panel { left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: min(88dvh, 100dvh) !important; border-radius: 20px 20px 0 0 !important; padding-bottom: env(safe-area-inset-bottom); }
}
@media (prefers-reduced-motion: reduce) { .dbgpt-chip, .dbgpt-launch, .dbgpt-ghost, .dbgpt-result { transition: none; } .dbgpt-launch:hover { transform: none; } .dbgpt-caret, .dbgpt-orb-live, .dbgpt-dot { animation: none; } }
`

    const Orb = ({ size, live }: { size: number; live?: boolean }) => (
        <span aria-hidden="true" className={"dbgpt-orb" + (live && !reduce ? " dbgpt-orb-live" : "")} style={{ display: "inline-block", flexShrink: 0, width: size, height: size, borderRadius: "50%", boxShadow: "0 0 0 1px " + T.line + ", 0 4px 14px color-mix(in srgb, " + T.accent + " 30%, transparent)" }} />
    )
    const Icon = ({ d }: { d: string }) => (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
    )
    const CLOSE = "M6 6l12 12M18 6L6 18"
    const NEW = "M12 5v14M5 12h14"
    const SEARCH = "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4"
    const ghost: CSSProperties = { width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: 0, background: "transparent", color: T.text2, cursor: "pointer", display: "grid", placeItems: "center" }
    const chip: CSSProperties = { minHeight: 44, padding: "0 14px", border: "1px solid " + T.line, borderRadius: 999, background: "transparent", color: T.text2, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left" }
    const canSend = !!input.trim() && !pending
    const last = messages[messages.length - 1]

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
                            <button type="button" onClick={openPanel} className="dbgpt-chip" style={{ ...chip, marginTop: 10, color: T.text }}>Start the tour</button>
                        </div>
                        <button type="button" aria-label="Dismiss greeting" onClick={() => setGreetVisible(false)} className="dbgpt-ghost" style={ghost}><Icon d={CLOSE} /></button>
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

            {/* Screen-reader announcements for new bot messages. */}
            <div className="dbgpt-sr" role="status" aria-live="polite" aria-atomic="true">{open ? announce : ""}</div>

            {/* ── Panel ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {open && (
                    <motion.section
                        key="panel"
                        id="dbgpt-panel"
                        className="dbgpt-panel"
                        role="dialog"
                        aria-modal="false"
                        aria-labelledby="dbgpt-title"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.15 } }}
                        transition={{ duration: dur, ease }}
                        style={{ position: pos, right: 12, bottom: 12, zIndex: 2147480002, width: "min(400px, calc(100vw - 24px))", height: "min(600px, calc(100dvh - 24px))", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 20, background: T.glass, border: "1px solid " + T.glassLine, boxShadow: T.shadow, backdropFilter: "blur(28px) saturate(140%)", WebkitBackdropFilter: "blur(28px) saturate(140%)", color: T.text, boxSizing: "border-box", transformOrigin: "bottom right" }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 6px 10px 16px", flexShrink: 0 }}>
                            <Orb size={30} live />
                            <div style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
                                <h2 id="dbgpt-title" style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: T.text }}>DhwaniGPT</h2>
                                <p style={{ margin: "1px 0 0", fontSize: 12, color: T.text2 }}>{mode === "search" ? "Search the portfolio" : "Answers from her portfolio"}</p>
                            </div>
                            <button type="button" aria-label="Search the portfolio" aria-pressed={mode === "search"} title="Search the portfolio" onClick={openSearch} className="dbgpt-ghost" style={ghost}><Icon d={SEARCH} /></button>
                            <button type="button" aria-label="New chat" title="New chat" onClick={reset} className="dbgpt-ghost" style={ghost}><Icon d={NEW} /></button>
                            <button type="button" aria-label="Close chat" title="Close (Esc)" onClick={close} className="dbgpt-ghost" style={ghost}><Icon d={CLOSE} /></button>
                        </div>
                        <div aria-hidden="true" style={{ height: 1, background: T.line, flexShrink: 0 }} />

                        {mode === "search" ? (
                            /* Search mode */
                            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                                <div style={{ padding: "12px 12px 8px", flexShrink: 0 }}>
                                    <label htmlFor="dbgpt-search" className="dbgpt-sr">Search projects, roles, skills and FAQ</label>
                                    <div className="dbgpt-field" style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px 2px 12px", borderRadius: 14, border: "1px solid " + T.line, background: T.surface }}>
                                        <span style={{ color: T.text2, display: "grid" }}><Icon d={SEARCH} /></span>
                                        <input id="dbgpt-search" ref={searchRef} type="search" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && searchResults[0] && searchQ.trim()) { e.preventDefault(); pick(searchResults[0]) } }} placeholder="Projects, roles, skills…" autoComplete="off" style={{ flex: 1, minWidth: 0, height: 40, border: 0, background: "transparent", color: T.text, fontSize: 15, caretColor: T.accent }} />
                                    </div>
                                    <p aria-live="polite" style={{ margin: "8px 2px 0", fontSize: 12, color: T.text2 }}>{searchQ.trim() ? searchResults.length + (searchResults.length === 1 ? " match" : " matches") : "Everything I know about"}</p>
                                </div>
                                <ul className="dbgpt-log" aria-label="Search results" style={{ listStyle: "none", margin: 0, padding: "0 8px 12px", flex: 1, minHeight: 0, overflowY: "auto" }}>
                                    {searchResults.map((it) => (
                                        <li key={it.kind + it.title}>
                                            <button type="button" className="dbgpt-result" onClick={() => pick(it)} style={{ width: "100%", minHeight: 52, display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", border: 0, borderRadius: 12, background: "transparent", color: T.text, cursor: "pointer", textAlign: "left" }}>
                                                <span style={{ fontSize: 11, fontWeight: 500, color: T.text2, width: 52, flexShrink: 0 }}>{it.kind}</span>
                                                <span style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>{it.title}</span>
                                                    <span style={{ display: "block", fontSize: 12, color: T.text2, marginTop: 1 }}>{it.sub}</span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <li style={{ padding: "8px 10px", fontSize: 14, color: T.text2 }}>
                                            Nothing matches that. <button type="button" className="dbgpt-chip" onClick={() => { const q = searchQ; setSearchQ(""); send(q) }} style={{ ...chip, marginTop: 8, display: "block" }}>Ask DhwaniGPT instead</button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            /* Conversation */
                            <div ref={logRef} className="dbgpt-log" role="region" aria-label="Conversation" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 16px 8px", display: "flex", flexDirection: "column", gap: 18 }}>
                                <Bubble role="assistant" T={T}>{welcome}</Bubble>
                                {messages.length === 0 && (
                                    <div role="group" aria-label="Suggested questions" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {SUGGESTIONS.map((s) => (
                                            <button key={s.n} type="button" className="dbgpt-chip" onClick={() => send(s.query)} style={chip}>{s.label}</button>
                                        ))}
                                        <button type="button" className="dbgpt-chip" onClick={openSearch} style={chip}>Search the portfolio</button>
                                    </div>
                                )}
                                {messages.map((m) => (
                                    <motion.div key={m.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} style={{ display: "grid", gap: 4, alignSelf: m.role === "user" ? "flex-end" : "stretch", justifyItems: m.role === "user" ? "end" : "start", maxWidth: m.role === "user" ? "85%" : "100%" }}>
                                        <span className="dbgpt-sr">{m.role === "user" ? "You said:" : "DhwaniGPT said:"}</span>
                                        <Bubble role={m.role} T={T}>{m.content}</Bubble>
                                        {m.links?.map((l) => (
                                            <a key={l.href} className="dbgpt-link" href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: T.text, fontSize: 13, fontWeight: 500, textDecoration: "underline", textDecorationColor: "color-mix(in srgb, " + T.accent + " 60%, transparent)", textUnderlineOffset: 3 }}>{l.label}</a>
                                        ))}
                                        {m.offline && <span style={{ fontSize: 11, color: T.text2 }}>Offline mode · canned answer</span>}
                                        {m === last && m.role === "assistant" && !pending && !!m.followUps?.length && (
                                            <div role="group" aria-label="Follow-up questions" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                                                {m.followUps.map((f) => (
                                                    <button key={f} type="button" className="dbgpt-chip" onClick={() => send(f)} style={chip}>{f}</button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {pending && (
                                    <div aria-hidden="true" style={{ display: "flex", gap: 5, padding: "6px 0" }}>
                                        <i className="dbgpt-dot" /><i className="dbgpt-dot" style={{ animationDelay: ".15s" }} /><i className="dbgpt-dot" style={{ animationDelay: ".3s" }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Input: always available */}
                        <form onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ padding: "8px 12px 10px", flexShrink: 0 }}>
                            {typeAhead.length > 0 && (
                                <div role="group" aria-label="Matching topics" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                    {typeAhead.map((it) => (
                                        <button key={it.kind + it.title} type="button" className="dbgpt-chip" onClick={() => pick(it)} style={{ ...chip, fontSize: 12 }}>
                                            <span style={{ color: T.text2, marginRight: 6 }}>{it.kind}</span>{it.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <label htmlFor="dbgpt-in" className="dbgpt-sr">Ask about Dhwani</label>
                            <div className="dbgpt-field" style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 2px 2px 14px", borderRadius: 14, border: "1px solid " + T.line, background: T.surface, transition: "border-color .18s ease, box-shadow .18s ease" }}>
                                <input id="dbgpt-in" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onFocus={() => mode === "search" && setMode("chat")} placeholder={messages.length ? "Ask a follow-up…" : "Ask about a project…"} maxLength={600} autoComplete="off" enterKeyHint="send" style={{ flex: 1, minWidth: 0, height: 44, border: 0, background: "transparent", color: T.text, fontSize: 15, caretColor: T.accent }} />
                                <button type="submit" disabled={!canSend} aria-label="Send" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, border: 0, display: "grid", placeItems: "center", background: canSend ? T.accent : T.line, color: canSend ? T.onAccent : T.text2, cursor: canSend ? "pointer" : "default", transition: "background .18s ease, color .18s ease" }}>
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

function Bubble({ role, T, children }: { role: "user" | "assistant"; T: Record<string, string>; children: ReactNode }) {
    const user = role === "user"
    return user ? (
        <p style={{ margin: 0, padding: "9px 14px", borderRadius: "16px 16px 4px 16px", background: T.line, color: T.text, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{children}</p>
    ) : (
        <p style={{ margin: 0, color: T.text, fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{children}</p>
    )
}

addPropertyControls(DhwaniGPT, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "", placeholder: "https://<your-app>.vercel.app/api/dhwanigpt", description: "Leave empty for offline canned answers. Set to the deployed /api/dhwanigpt route to use Claude." },
    casePath: { type: ControlType.String, title: "Case pages live at", defaultValue: "/projects/" },
    showGreeting: { type: ControlType.Boolean, title: "Show greeting", defaultValue: true },
    greeting: { type: ControlType.String, title: "Welcome Message", defaultValue: "", placeholder: "Hey! I’m DhwaniGPT, an automated assistant…", displayTextArea: true },
    accentColor: { type: ControlType.Color, title: "Accent fallback", defaultValue: "#F3500F", description: "Used only if --db-accent isn’t set." },
    bottomOffset: { type: ControlType.Number, title: "Launcher bottom", defaultValue: 84, min: 16, max: 240, step: 4, unit: "px", description: "Keeps the launcher above the “open to work” pill." },
})
