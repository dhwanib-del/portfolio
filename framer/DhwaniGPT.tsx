// DhwaniGPT — floating portfolio assistant for Dhwani's Framer site.
// Brief (Oct 10): "Make DhwaniGPT much better." Offline answers grounded only in the reviewed
// case-study copy (src/content/cases.ts, caseStories.ts, about.ts, site.ts + the live /work pages);
// fuzzy intent matching with project names and aliases; every project answer cites and links its
// case study; honest "I don't know, ask Dhwani" fallback; hiring quick answers. Prime Video = NDA.
// No invented metrics. UI: cleaner panel on the --db-* theme tokens (light/dark), recruiter starter
// questions, typed-out replies, clickable links, follow-up chips tied to the last answer, Enter to
// send, Esc to close, focus return, reduced motion, full-height sheet on phones.
// Earlier history: Oct 4 conversation thread + optional LLM backend via "API URL"
// (POST {messages} -> {reply, followUps?}); with no API URL, or on any network error, it answers
// from the facts below. Opens on window event "db-chat-open"; sets window.__dbChatReady = true.
// Oct 5 click-through audit (kept): the <body> portal layer and the Framer host never catch clicks;
// only the greeting card, the launcher and the open panel do.
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import type { CSSProperties, ReactNode } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const FONT = "'Poppins', 'Inter', sans-serif"
const LINKEDIN = "https://www.linkedin.com/in/dhwanibagrecha/"
const EMAIL = "dhwanib@umich.edu"
const CONNECT = "/#contact"
const GREETING_KEY = "db-gpt-greeted"
const GREETING_TEXT = "Hi, I’m DhwaniGPT. Ask me anything about Dhwani’s work, or something silly."
const API_TIMEOUT_MS = 15000
const MAX_HISTORY = 12
const MAX_CHARS = 2000

// ── Portfolio facts (mirror src/content/*.ts on the Next.js site; reviewed copy only) ──────────
type Aspect = "overview" | "role" | "decision" | "research" | "outcome" | "ai" | "next"
type CaseFacts = {
    slug: string
    name: string
    org: string
    when: string
    aliases: string[] // lowercase; "=word" means exact match only
    oneLiner: string
    overview: string
    role: string
    decision: string
    research: string
    outcome: string
    ai?: string
    next: string
}

const CASES: CaseFacts[] = [
    {
        slug: "briefs",
        name: "BRIEFS",
        org: "U-M DPSS",
        when: "Summer 2026",
        aliases: ["briefs", "=brief", "dispatch", "dispatcher", "building lookup", "building profile", "building information", "building details", "mcommunity", "floor plans", "pinned strip"],
        oneLiner: "BRIEFS (U-M DPSS) gives dispatchers one building profile with urgent details pinned in view, instead of a search across seven screens and 10+ tools.",
        overview: "BRIEFS (U-M DPSS, Summer 2026): dispatchers need building contacts, access details, hazards and floor plans during a call. In her first contextual inquiry, Dhwani watched them move between building PDFs, Dropbox and other tools: seven screens at one workstation, more than ten tools in the lookup. She shaped a building profile that pins urgent details in view and gives everything else a predictable place.",
        role: "Her role on BRIEFS: UX design intern doing the contextual inquiry, information architecture, the building-profile prototype and the PRD, plus a Sheets-backed Apps Script exploration. She worked with Aaron Tucker at DPSS in Summer 2026. There were no existing design files, so she started by mapping the workflow.",
        decision: "The key decision on BRIEFS: keep urgent details visible in a pinned strip and give everything else a predictable place. The tradeoff she names is that the strip takes screen space other information could use; she chose it for the mid-call task. What she rejected: giving every detail equal urgency.",
        research: "What the BRIEFS research showed: finding a record didn’t make it current. Field notes flagged outdated contacts and building information, and contact checks continued in MCommunity to confirm someone was still employed. A faster search could surface the wrong record sooner, so retrieval, verification and maintenance had to be designed together. Who owns the records is still open.",
        outcome: "BRIEFS status: prototype and PRD handed to DPSS. It isn’t launched, and the 30-second find-a-detail goal hasn’t been tested yet, so there’s no measured impact to quote.",
        ai: "In BRIEFS, the proposed assistant answers only from approved records, cites them, and flags missing information instead of guessing. Document changes need human approval. That’s part of the proposal, not a shipped feature.",
        next: "Next for BRIEFS, per the case study: put it in front of dispatchers and see whether they can find a detail, check the answer, and trust the structure on a real shift. Record ownership still needs an answer.",
    },
    {
        slug: "intel",
        name: "Intel workspace",
        org: "U-M DPSS",
        when: "2026",
        aliases: ["intel", "intelligence", "intelligence hub", "intelligence group", "casework", "case management", "analyst", "investigation", "handoffs"],
        oneLiner: "The Intel workspace (U-M DPSS) connects requests and investigation work in one role-aware workspace, so the next analyst sees status, ownership and history.",
        overview: "The Intel workspace (U-M DPSS, 2026; “Casework” on the site) is separate from BRIEFS and covers requests and investigation work. The problem: the next analyst inherited scattered context. Dhwani’s design direction is a shared, role-aware workspace where each role can see the request, owner, status and history, and know the next action.",
        role: "Her part on the Intel workspace: stakeholder interviews, workflow design and a Google Apps Script prototype, with Aaron Tucker at DPSS in 2026.",
        decision: "The key decision on the Intel workspace: connect related requests and investigation work in a role-aware workspace. A shared picture should clarify status without exposing the same information to every role. Rejected: one undifferentiated view for everyone.",
        research: "What came out of her stakeholder work on the Intel workspace: each role needs to see current status and the next step, and a useful overview still has to respect role-appropriate access.",
        outcome: "Intel workspace status: a workflow direction plus a public demo built on fictional records. The case study doesn’t claim launch, adoption or speed improvements, so neither will I.",
        next: "Next for the Intel workspace, per the case study: confirm the approved delivery status, then test whether each role can identify its next action.",
    },
    {
        slug: "general-motors",
        name: "GM Convoy",
        org: "General Motors",
        when: "Jan – May 2026",
        aliases: ["=gm", "general motors", "convoy", "trip together", "truck", "=cab", "=hmi", "in car", "in vehicle", "vehicle", "automotive", "=car", "biometric", "=hvac", "road trip", "=sara", "=julia", "=driver"],
        oneLiner: "GM Convoy (General Motors-sponsored) is where she challenged a biometric brief four weeks in and moved the team to design for a group coordinating a trip.",
        overview: "Convoy (General Motors-sponsored, Jan – May 2026; “Trip Together” on the site): four weeks into a biometric concept for one driver, an interview showed the real task was a group coordinating a trip across people and vehicles. Dhwani pushed the team to change direction. They cut the biometric work and designed for the convoy: planning on the phone, and a narrower in-car job of position, spacing and group status.",
        role: "Her part on GM Convoy: research, advanced Figma interactions, and reusable components in the team’s first shared design system. The team explored HVAC and in-drive views at vehicle size. She worked with Sara and Julia, Jan – May 2026. The pushback on the biometric direction was hers.",
        decision: "The key decision on GM Convoy: cut four weeks of biometric work and design for the whole trip. One interview showed a group coordinating across phones, screens and messages while moving. Rejected: personalizing the drive for a single driver.",
        research: "GM Convoy research: one driver interview changed the brief, and the concept was evaluated in three usability tests in a 3D-printed truck cab. Adding a host to organize the plan raised a question they still need to test: when does coordination start to feel controlling?",
        outcome: "GM Convoy status: a concept evaluated in three usability tests in a 3D-printed truck cab. It isn’t road-tested or a safety finding, and details stay under NDA, so there are no real-world claims.",
        next: "The open question on GM Convoy: does a host make the group feel organized, or controlled?",
    },
    {
        slug: "openlibrary",
        name: "Open Library",
        org: "Internet Archive",
        when: "Aug – Dec 2025",
        aliases: ["open library", "openlibrary", "internet archive", "multilingual", "translation", "affinity map", "in4mation", "si 500"],
        oneLiner: "Open Library (Internet Archive) is research: eight interviews, 330 data points, and a recommendation to put language help inside the reading flow.",
        overview: "Open Library (Internet Archive, Aug – Dec 2025): a five-person SI 500 team studied multilingual readers in the U-M community. Readers already had translation tools, but switching between the book, dictionaries and translators cost them their place. The team recommended making existing language support easier to find inside the reading flow instead of adding another separate tool.",
        role: "Her part on Open Library: client calls, interviews, her first affinity map and synthesis. She also helped organize the final report, summarize progress and clarify next steps. Team: five people (In4mation) in SI 500, Aug – Dec 2025.",
        decision: "The key decision on Open Library: make existing language support easier to find in the reading flow, because switching between tools cost readers context. Rejected: adding one more separate translation tool. The recommendations included more visible translation, grouped comprehension tools, and a prompt when the book and system languages differ.",
        research: "Open Library research: the team ran eight semi-structured interviews with students, academic-support staff and subject-matter experts, then mapped 330 data points. Academic and technical language made some readers cross-check terms or keep personal glossaries, so the problem was continuity and confidence in translation together.",
        outcome: "Open Library status: research report and recommendations delivered; no live product test or measured reader impact. After the team shared its work, Open Library improved its feedback process and increased investment in the project. That’s a partner response, not a validated reader outcome.",
        next: "Next for Open Library, per the case study: test whether readers can find help without losing their place, and whether the support earns their trust. The recommendations still need technical and legal review.",
    },
    {
        slug: "budgetcart",
        name: "BudgetCart",
        org: "UMSI",
        when: "a UMSI course project",
        aliases: ["budgetcart", "budget cart", "budget card", "=snap", "=wic", "grocery", "grocer", "food benefits", "budget calendar", "cart builder", "ai cart", "=anne", "tunisia", "checkout"],
        oneLiner: "BudgetCart (UMSI) is a grocery concept for budget, SNAP/WIC and dietary needs, where testing showed that hiding prices made choices harder to trust.",
        overview: "BudgetCart (UMSI, three designers) explored grocery shopping under budget, SNAP/WIC and dietary constraints. The team hid brands, stores and prices to make screens simpler, and prototype testing showed those were exactly the details people needed to judge their choices. The revision keeps the lowest price visible, compares stores where the tradeoff happens, and shows eligibility and dietary checks before checkout.",
        role: "On BudgetCart, Dhwani owned the AI interaction (the AI cart builder) and the Budget Calendar. Anne led buying and checkout, and Tunisia led onboarding and account screens. Dhwani also worked on interviews and paper prototypes and taught herself Figma components; it was her first Figma project.",
        decision: "The key decision on BudgetCart: keep the lowest price visible and compare stores where the tradeoff happens. People trusted their cart less when the numbers were hidden; as the case study puts it, simple can’t mean hidden. Rejected: hiding brands, stores and prices to look simple.",
        research: "BudgetCart research: stakeholder interviews and paper prototypes, then prototype testing in Figma. People struggled to find items and trusted their choices less when brands, stores and prices were hidden, which pushed the team toward item-first browsing with budget context while shopping.",
        outcome: "BudgetCart status: prototype tasks tested. It’s a concept, not a live service, and there’s no measured change in spending yet.",
        ai: "BudgetCart’s AI cart builder (Dhwani’s part) drafts a starting cart from a budget and needs, and shoppers edit it instead of starting from an empty prompt. Testing added upload cues and a starter prompt.",
        next: "Next for BudgetCart, per the case study: measure whether shoppers put fewer items back at checkout.",
    },
]

const EXPERIENCE: { kws: string[]; line: string }[] = [
    { kws: ["adobe", "ambassador"], line: "Adobe Student Ambassador, Jul 2026 – now: workshops, content and campus events for creative students." },
    { kws: ["iska", "iska press"], line: "UX Researcher & Project Manager at Iska Press for African Perspectives, Jan – May 2026: led a research and project-management consulting engagement." },
    { kws: ["sochi"], line: "Project Manager & UX Researcher at SOCHI, University of Michigan, Sep 2025 – May 2026: product strategy, research and project management." },
    { kws: ["global scholars"], line: "Project Manager & Social Media Coordinator at the U-M Global Scholars Program, Aug 2025 – May 2026: led project teams and global community programming." },
    { kws: ["eye tracking", "research assistant", "=msu", "michigan state"], line: "Research Assistant at the MSU College of Social Science, May 2024 – May 2025: organized and analyzed eye-tracking data for behavioral research. Her psychology degree at Michigan State took three years." },
    { kws: ["miller johnson", "human resources", "=hr"], line: "Human Resources Systems Intern at Miller Johnson, Jun – Aug 2024: internal systems and operations at a law firm." },
    { kws: ["=ddb", "mudra", "=dei"], line: "User Experience DEI Intern at DDB Mudra Group, Jun – Aug 2023: research on accessible social media and representation in advertising." },
]

// ── Matching ────────────────────────────────────────────────────────────────────────────────────
type Q = { s: string; c: string; toks: string[] }
function prep(raw: string): Q {
    const s = raw
        .toLowerCase()
        .replace(/[’‘'`]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
    return { s, c: s.replace(/ /g, ""), toks: s ? s.split(" ") : [] }
}
function lev(a: string, b: string, max: number): number {
    if (Math.abs(a.length - b.length) > max) return max + 1
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
    for (let i = 1; i <= a.length; i++) {
        const cur = [i]
        let best = i
        for (let j = 1; j <= b.length; j++) {
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
            if (cur[j] < best) best = cur[j]
        }
        if (best > max) return max + 1
        prev = cur
    }
    return prev[b.length]
}
function wordHit(tok: string, kw: string): boolean {
    if (tok === kw || tok === kw + "s" || tok === kw + "es") return true
    if (kw.length < 5) return false
    if (tok.startsWith(kw) && tok.length - kw.length <= 3) return true
    const max = kw.length >= 8 ? 2 : 1
    return lev(tok, kw, max) <= max
}
/** 0 = no hit, 1 = single word, 2 = phrase (phrases count double). */
function hit(q: Q, raw: string): number {
    const exact = raw.startsWith("=")
    const kw = exact ? raw.slice(1) : raw
    if (kw.includes(" ")) {
        if ((" " + q.s + " ").includes(" " + kw + " ") || (" " + q.s + " ").includes(" " + kw + "s ")) return 2
        const words = kw.split(" ")
        for (let i = 0; i + words.length <= q.toks.length; i++) if (words.every((w, j) => wordHit(q.toks[i + j], w))) return 2
        if (kw.length >= 9 && q.c.includes(kw.replace(/ /g, ""))) return 2
        return 0
    }
    if (exact) return q.toks.some((t) => t === kw || t === kw + "s") ? 1 : 0
    if (kw.length >= 8 && q.c.includes(kw)) return 1
    return q.toks.some((t) => wordHit(t, kw)) ? 1 : 0
}
const score = (q: Q, kws: string[]) => kws.reduce((n, k) => n + hit(q, k), 0)

const ASPECTS: [Aspect, string[]][] = [
    ["ai", ["=ai", "artificial intelligence", "chatbot", "=llm", "assistant", "machine learning", "=gpt"]],
    ["role", ["=role", "=part", "=own", "=owned", "owner", "contribution", "contribute", "responsible", "teammates", "=team", "who did what", "her job", "work on", "worked on", "=split", "=when", "timeline", "how long"]],
    ["decision", ["decision", "decide", "=pivot", "choice", "=chose", "tradeoff", "trade off", "pushback", "push back", "challenge", "=why", "changed"]],
    ["research", ["research", "interview", "finding", "=found", "insight", "learned", "discover", "method", "testing", "usability", "=data", "synthesis", "=users", "problem"]],
    ["outcome", ["status", "outcome", "result", "impact", "shipped", "=ship", "launch", "=live", "metric", "numbers", "success", "happened", "measure"]],
    ["next", ["=next", "lesson", "differently", "future", "open question", "improve"]],
]
function aspectOf(q: Q): Aspect | null {
    for (const [a, kws] of ASPECTS) if (score(q, kws) > 0) return a
    return null
}

type IntentId =
    | "contact" | "resume" | "jobs" | "availability" | "location" | "education" | "experience" | "process"
    | "strengths" | "tools" | "ai" | "ownership" | "recommend" | "whyHire" | "unknown" | "projects" | "intro" | "personal"
const INTENTS: { id: IntentId; kws: string[] }[] = [
    { id: "unknown", kws: ["salary", "compensation", "=pay", "visa", "sponsor", "sponsorship", "work authorization", "authorization", "citizen", "citizenship", "references", "=gpa", "grades", "phone number", "address", "=age", "married"] },
    { id: "availability", kws: ["available", "availability", "start date", "when can she", "graduate", "graduation", "graduating", "notice period", "open to work"] },
    { id: "contact", kws: ["contact", "reach", "=email", "e mail", "linkedin", "get in touch", "=connect", "message her", "talk to her", "talk to dhwani", "chat with her", "schedule", "=call"] },
    { id: "resume", kws: ["resume", "=cv", "curriculum vitae"] },
    { id: "jobs", kws: ["looking for", "open to", "seeking", "what roles", "which roles", "kind of role", "type of role", "roles", "=job", "position", "hiring", "full time", "opportunity", "career goals", "want to do", "what does she want"] },
    { id: "location", kws: ["based", "location", "located", "=live", "relocate", "relocation", "=move", "moving", "remote", "on site", "hybrid", "where is she", "ann arbor", "time zone", "timezone"] },
    { id: "education", kws: ["school", "education", "degree", "=study", "studied", "studying", "=umsi", "masters", "=ms", "psychology", "=psych", "undergrad", "college", "university"] },
    { id: "experience", kws: ["experience", "background", "career", "work history", "internship", "previous roles", "worked before", "past roles"] },
    { id: "process", kws: ["process", "approach", "how does she work", "how she works", "methodology", "principles", "philosophy", "how does she design", "how she thinks", "observe connect question"] },
    { id: "strengths", kws: ["good at", "best at", "strength", "skills", "superpower", "what does she do", "specialty", "specialize", "stand out", "unique"] },
    { id: "tools", kws: ["=tool", "software", "figma", "=stack", "framer", "apps script", "=code", "coding", "next js", "built with", "this site"] },
    { id: "ai", kws: ["=ai", "artificial intelligence", "chatbot", "=llm", "machine learning", "=gpt", "ai native"] },
    { id: "ownership", kws: ["what did she own", "her role", "her part", "=own", "=owned", "contribution", "team projects", "who did what", "individual contribution", "she personally", "on each"] },
    { id: "recommend", kws: ["start with", "read first", "which case study", "which project", "best project", "strongest", "favorite project", "favourite project", "most proud", "only read", "where should i start", "begin with"] },
    { id: "whyHire", kws: ["why hire", "why should", "should we hire", "should i hire", "good fit", "fit for", "convince me", "pitch", "elevator pitch"] },
    { id: "projects", kws: ["projects", "=work", "portfolio", "case study", "case studies", "show me", "what has she built", "what has she done", "examples"] },
    { id: "intro", kws: ["who is she", "who is dhwani", "tell me about her", "about dhwani", "about her", "summary", "=tldr", "introduce", "quick version", "in short"] },
    { id: "personal", kws: ["hobby", "hobbies", "for fun", "personal", "outside work", "free time", "weekend", "interests", "personality"] },
]

// ── Answers ─────────────────────────────────────────────────────────────────────────────────────
type Link = { href: string; label: string; external?: boolean }
type Reply = { text: string; links?: Link[]; topic: string; project?: string; aspect?: Aspect }
type Ctx = { project?: string; asked: Record<string, Aspect[]> }

const LI: Link = { href: LINKEDIN, label: "LinkedIn", external: true }
const CN: Link = { href: CONNECT, label: "Connect section" }
const EM: Link = { href: "mailto:" + EMAIL, label: "Email her", external: true }
const ORDER: Aspect[] = ["overview", "role", "decision", "research", "outcome", "ai", "next"]
const byslug = (s: string) => CASES.find((p) => p.slug === s) as CaseFacts

function answer(raw: string, base: string, ctx: Ctx): Reply {
    const q = prep(raw)
    const cite = (p: CaseFacts): Link => ({ href: base + p.slug, label: p.name + " case study" })
    const projectReply = (p: CaseFacts, want: Aspect): Reply => {
        if (want === "ai" && !p.ai) return { topic: "project", project: p.slug, aspect: "overview", text: "The " + p.name + " case study doesn’t describe an AI feature, so I won’t invent one. Here’s what it does cover: " + p.overview, links: [cite(p)] }
        return { topic: "project", project: p.slug, aspect: want, text: p[want] as string, links: [cite(p)] }
    }
    if (!q.s) return { topic: "default", text: "Ask me about a project, what she’s looking for, or how to reach her." }

    // NDA first, so nothing below can leak detail.
    if (score(q, ["prime video", "=prime", "amazon", "capstone", "streaming"]) > 0) {
        return { topic: "nda", text: "Prime Video is Dhwani’s current capstone, and it’s under NDA, so that’s genuinely all I can say. Ask her about the process directly; I’m happy to cover anything else on the portfolio.", links: [LI] }
    }
    if (/\b(are you (real|human|a bot|a person|dhwani|her|ai)|who are you|what are you|is this (really )?(dhwani|a bot|real|her|a person)|am i (talking|chatting) (to|with))\b/.test(q.s)) {
        return { topic: "identity", text: "I’m DhwaniGPT, an automated assistant, not Dhwani. I only answer from her case studies and About page, and this chat isn’t saved. For the real Dhwani, LinkedIn is the way.", links: [LI] }
    }

    // Named projects (one, or a comparison of several).
    const hits = CASES.map((p) => ({ p, s: score(q, p.aliases) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)
    if (hits.length >= 2) {
        return { topic: "compare", text: hits.slice(0, 3).map((x) => x.p.oneLiner).join("\n\n"), links: hits.slice(0, 3).map((x) => cite(x.p)), project: hits[0].p.slug }
    }
    if (hits.length === 1) return projectReply(hits[0].p, aspectOf(q) || "overview")

    if (score(q, ["=dpss", "public safety", "aaron tucker", "=aaron"]) > 0) {
        return { topic: "dpss", text: "Dhwani was a UX Design Intern at U-M DPSS in Summer 2026, working on building-information and case-management workflows. Two case studies came out of it: BRIEFS (building details for dispatchers mid-call) and the Intel workspace (requests and investigation work). The public screens use fictional demo data.", links: [cite(byslug("briefs")), cite(byslug("intel"))] }
    }

    // "Tell me more" style follow-ups continue the last project.
    const last = ctx.project ? byslug(ctx.project) : undefined
    if (last && /^(and )?(tell me )?more\b|\b(go on|elaborate|keep going|what else|more detail|details please|continue)\b/.test(q.s)) {
        const asked = ctx.asked[last.slug] || []
        const nextAspect = ORDER.find((a) => !asked.includes(a) && (a !== "ai" || !!last.ai))
        if (nextAspect) return projectReply(last, nextAspect)
        return { topic: "project", project: last.slug, aspect: "next", text: "That’s everything the " + last.name + " case study covers. Want another project, or how to reach her?", links: [cite(last)] }
    }

    const expLine = EXPERIENCE.find((r) => score(q, r.kws) > 0)
    if (expLine) return { topic: "experience", text: expLine.line }

    const ranked = INTENTS.map((it, i) => ({ id: it.id, s: score(q, it.kws), i })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i)
    const best = ranked[0]
    // Follow-ups like "what was her role?" or "did it ship?" refer to the last project discussed,
    // unless the question is clearly about all projects or a general topic.
    const aspect = aspectOf(q)
    const global = score(q, ["team projects", "on each", "each project", "every project", "all projects", "across projects", "in general", "overall"]) > 0
    const pronoun = /\b(it|this|that|this project|the project|there)\b/.test(q.s)
    if (last && aspect && !global) {
        const weak = !best || best.s <= 1 || best.id === "ownership" || best.id === "projects"
        if (pronoun || (weak && best?.id !== "ai")) return projectReply(last, aspect)
    }

    if (best) {
        switch (best.id) {
            case "unknown":
                return { topic: "unknown", text: "That isn’t on her portfolio, so I won’t guess. It’s a good one to ask Dhwani directly; LinkedIn is the fastest route.", links: [LI, CN] }
            case "contact":
                return { topic: "contact", text: "Best routes: message her on LinkedIn, or use the Connect section at the bottom of the home page, which has a LinkedIn button and an email option. I’m a bot, so I can’t pass messages along (and I’d paraphrase you badly).", links: [LI, CN, EM] }
            case "resume":
                return { topic: "resume", text: "There’s no résumé linked on the site right now. LinkedIn is the closest thing, or ask her for one through the Connect section.", links: [LI, CN] }
            case "jobs":
                return { topic: "jobs", text: "She’s looking for product, UX and experience design roles, ideally where the problems are messy and operational: fragmented workflows turned into systems people actually adopt. She’s finishing an MS at the University of Michigan School of Information (graduating May 2027), based in Ann Arbor and open to moving anywhere.", links: [LI, CN] }
            case "availability":
                return { topic: "availability", text: "The site marks her as open to work. She graduates from UMSI in May 2027 and is based in Ann Arbor (Eastern Time), open to relocating anywhere. A specific start date isn’t on the portfolio, so ask her directly: LinkedIn or the Connect section.", links: [LI, CN] }
            case "location":
                return { topic: "location", text: "Ann Arbor, Michigan (Eastern Time), and open to moving anywhere. The portfolio doesn’t state a remote or hybrid preference, so that one’s for Dhwani.", links: [LI] }
            case "education":
                return { topic: "education", text: "She’s doing a Master’s in UX Research & Design at the University of Michigan School of Information (UMSI), graduating May 2027. Before that: a psychology degree at Michigan State, finished in three years, with eye-tracking research on high-stakes decision-making along the way." }
            case "experience":
                return { topic: "experience", text: "Most recent first: Adobe Student Ambassador (Jul 2026 – now), UX Design Intern at U-M DPSS (Summer 2026), and UX Researcher & Designer on the General Motors-sponsored Convoy project (Jan – May 2026). Before that: Iska Press, SOCHI, the U-M Global Scholars Program, Open Library research, an MSU research assistantship, Miller Johnson and DDB Mudra Group." }
            case "process":
                return { topic: "process", text: "Her About page puts it as Observe, Connect, Question. Observe: she watched dispatchers work before shaping the BRIEFS information architecture. Connect: on Open Library she helped turn eight interviews into a 330-point affinity map. Question: on GM Convoy she challenged the biometric direction four weeks in. Her principles: psychology first, workflow before interface, honest tradeoffs, prototype early.", links: [cite(byslug("briefs"))] }
            case "strengths":
                return { topic: "strengths", text: "Messy, operational problems: field research, workflow and information architecture, then prototypes people can react to. BRIEFS shows high-stakes information design, GM Convoy shows advanced prototyping and pushing back on a brief, and Open Library shows research synthesis.", links: [cite(byslug("briefs")), cite(byslug("general-motors"))] }
            case "tools":
                return { topic: "tools", text: "Figma shows up most: advanced interactions and a shared design system on GM Convoy, a self-taught component system on BudgetCart. She built working prototypes in Google Apps Script for BRIEFS and the Intel workspace. This site was designed in Figma and Framer, prototyped in Next.js, with Claude and ChatGPT as pair-programmers. Anything beyond that isn’t listed, so I won’t guess." }
            case "ai":
                return { topic: "ai", text: "Grounded, with a person in the loop. In BRIEFS, the proposed assistant answers only from approved records, cites them and flags missing information; document changes need human approval. In BudgetCart, her AI cart builder drafts a starting cart that shoppers edit. Her AI Lab experiments come out of directed sessions: she specifies the intent, corrects drift and throws away what doesn’t earn its place.", links: [cite(byslug("briefs")), cite(byslug("budgetcart"))] }
            case "ownership":
                return { topic: "ownership", text: "What she owned, project by project:\n• BRIEFS: contextual inquiry, IA, prototype and PRD.\n• Intel workspace: stakeholder interviews, workflow design, Apps Script prototype.\n• GM Convoy: research, advanced Figma interactions, reusable components, and the pushback that changed the brief.\n• Open Library: client calls, interviews, her first affinity map, synthesis.\n• BudgetCart: the AI cart builder and Budget Calendar (Anne led checkout, Tunisia onboarding).", links: [cite(byslug("general-motors")), cite(byslug("budgetcart"))] }
            case "recommend":
                return { topic: "recommend", text: "Depends on the role. Research-heavy: Open Library. Complex workflows or internal tools: BRIEFS. Prototyping and challenging a brief: GM Convoy. Consumer product and AI interaction: BudgetCart. If you only have two minutes, BRIEFS runs from field research to a PRD in one story.", links: [cite(byslug("briefs")), cite(byslug("openlibrary"))] }
            case "whyHire":
                return { topic: "whyHire", text: "I’m biased: I literally live on her website. The fair test is one case study. Each one says what she did, what the team did, and what’s still untested, which is rarer than it should be.", links: [cite(byslug("briefs")), LI] }
            case "projects":
                return { topic: "projects", text: "Five case studies: BRIEFS and the Intel workspace (both U-M DPSS), GM Convoy (General Motors), Open Library (Internet Archive) and BudgetCart (UMSI). There’s also a Prime Video capstone that’s under NDA. Pick one and I’ll give you the short version." }
            case "intro":
                return { topic: "intro", text: "Dhwani Bagrecha is a product, UX and experience designer finishing an MS at the University of Michigan School of Information (May 2027), with a psychology degree from Michigan State. She likes messy, operational problems: dispatch tools and case workflows at U-M DPSS, a GM-sponsored in-vehicle concept, multilingual reading research for Open Library.", links: [LI] }
            case "personal":
                return { topic: "personal", text: "Off the clock: music (she DJs and is in her “Spotify playlists as preparation” era), singing, campus events, celebrating every festival from home, and trips with too many museum stops. She’s vegetarian and will find the good vegetarian option in any city." }
        }
    }

    // Silly corner (Oct 3: "make the bot quirky, answer silly questions too").
    const s = q.s
    if (/pineapple/.test(s)) return { topic: "silly", text: "On pizza? I’m legally a bot, so I’m staying out of it. Dhwani is vegetarian, though, so ask her for food recs instead. She takes those seriously." }
    if (/\b(joke|make me laugh|funny)\b/.test(s)) return { topic: "silly", text: "A UX designer walks into a bar. Then walks back out, because the door said push and had a handle. She filed a bug report." }
    if (/meaning of life|\b42\b/.test(s)) return { topic: "silly", text: "Probably good information architecture. Or a really well-sequenced playlist. Dhwani would argue those are the same thing." }
    if (/\b(sentient|alive|conscious|feelings|dream)\b/.test(s)) return { topic: "silly", text: "Not even a little. I’m a pile of if-statements wearing a nice font." }
    if (/\b(dj|music|playlist|song|instruments?|spotify)\b/.test(s)) return { topic: "silly", text: "She DJs, loves music theory and plays four instruments. Her playlists have a taxonomy. That’s not a joke, it’s a warning." }
    if (/\b(food|eat|vegetarian|restaurant|hungry|snack)\b/.test(s)) return { topic: "silly", text: "Vegetarian, and very willing to give you recommendations. Finding the good vegetarian option is, in her words, a public service." }
    if (/\b(coffee|chai|tea|matcha)\b/.test(s)) return { topic: "silly", text: "Her About page says chai is a valid research method. I can’t argue with that.", links: [LI] }
    if (/\b(run|running|gym|workout|work out|fitness)\b/.test(s)) return { topic: "silly", text: "She works out a lot and is currently trying to become the kind of person who likes running. Progress: ongoing." }
    if (/\b(weather|time is it|stocks?|bitcoin|crypto)\b/.test(s)) return { topic: "silly", text: "I only know what’s on this portfolio. For that, a window or a search engine will serve you better." }
    if (/\b(cats?|dogs?)\b/.test(s)) return { topic: "silly", text: "I don’t have a verified stance on that, and I refuse to start a war on her website." }
    if (/favou?rite colou?r/.test(s)) return { topic: "silly", text: "Judging by this site? Somewhere between ember orange and whatever vibe you picked." }
    if (/\bthank/.test(s)) return { topic: "thanks", text: "Anytime. If you want the real Dhwani, she’s on LinkedIn.", links: [LI] }
    if (q.toks.length <= 4 && /^(hi|hello|hey|hiya|yo|howdy|sup)\b/.test(s)) return { topic: "identity", text: "Hi! I’m DhwaniGPT, an automated assistant. Ask me about a project, what she’s looking for, or how to reach her." }

    return { topic: "default", text: "I don’t know that one, and I’d rather not guess. It isn’t in her case studies or About page. Ask Dhwani directly on LinkedIn, or ask me about BRIEFS, the Intel workspace, GM Convoy, Open Library or BudgetCart.", links: [LI, CN] }
}

// Follow-ups. Every string here routes back to an answer above.
const ASPECT_Q: Record<Aspect, (n: string) => string> = {
    overview: (n) => "Give me the short version of " + n,
    role: (n) => "What did she own on " + n + "?",
    decision: (n) => "What was the key decision on " + n + "?",
    research: (n) => "What did the research show on " + n + "?",
    outcome: (n) => "What’s the status of " + n + "?",
    ai: (n) => "How does " + n + " use AI?",
    next: (n) => "What’s next for " + n + "?",
}
const FOLLOW_UPS: Record<string, string[]> = {
    nda: ["What other projects are there?", "Which case study should I read first?", "How do I reach her?"],
    identity: ["Which case study should I read first?", "What roles is she looking for?", "How do I reach her?"],
    dpss: ["Give me the short version of BRIEFS", "Give me the short version of the Intel workspace", "How does BRIEFS use AI?"],
    contact: ["What roles is she looking for?", "Is she available, and when?", "Which case study should I read first?"],
    resume: ["How do I reach her?", "What’s her experience?", "What roles is she looking for?"],
    jobs: ["Is she available, and when?", "Which case study should I read first?", "How do I reach her?"],
    availability: ["What roles is she looking for?", "Where is she based?", "What did she own on team projects?"],
    location: ["Is she available, and when?", "What roles is she looking for?", "How do I reach her?"],
    education: ["What’s her experience?", "How does she work?", "What roles is she looking for?"],
    experience: ["Tell me about DPSS", "What did she own on team projects?", "What roles is she looking for?"],
    process: ["What does she do best?", "What did the research show on Open Library?", "What was the key decision on GM Convoy?"],
    strengths: ["Which case study should I read first?", "How does she work?", "Which tools does she use?"],
    tools: ["How does she use AI?", "How does she work?", "What did she own on GM Convoy?"],
    ai: ["How does BRIEFS use AI?", "How does BudgetCart use AI?", "How does she work?"],
    ownership: ["What did she own on BudgetCart?", "What was the key decision on GM Convoy?", "What roles is she looking for?"],
    recommend: ["Give me the short version of BRIEFS", "What roles is she looking for?", "How do I reach her?"],
    whyHire: ["Which case study should I read first?", "What does she do best?", "How do I reach her?"],
    unknown: ["How do I reach her?", "What roles is she looking for?", "Is she available, and when?"],
    projects: ["Give me the short version of BRIEFS", "Give me the short version of GM Convoy", "Which case study should I read first?"],
    intro: ["What roles is she looking for?", "Which case study should I read first?", "How does she work?"],
    personal: ["Tell me a joke", "What does she do best?", "How do I reach her?"],
    compare: ["What did she own on team projects?", "Which case study should I read first?", "How do I reach her?"],
    silly: ["Tell me a joke", "Are you sentient?", "What other projects are there?"],
    thanks: ["What other projects are there?", "How do I reach her?"],
    default: ["What other projects are there?", "What roles is she looking for?", "How do I reach her?"],
}
function followUpsFor(r: Reply, asked: Aspect[]): string[] {
    if (r.topic === "project" && r.project) {
        const p = byslug(r.project)
        const label = p.slug === "intel" ? "the Intel workspace" : p.name
        const rest = ORDER.filter((a) => a !== r.aspect && !asked.includes(a) && (a !== "ai" || !!p.ai) && a !== "overview")
        const out = rest.slice(0, 2).map((a) => ASPECT_Q[a](label))
        const next = CASES[(CASES.indexOf(p) + 1) % CASES.length]
        out.push(ASPECT_Q.overview(next.slug === "intel" ? "the Intel workspace" : next.name))
        return out
    }
    return FOLLOW_UPS[r.topic] || FOLLOW_UPS.default
}

// ── Rich text: [label](href), bare URLs and /work/<slug> paths become links ─────────────────────
type Seg = { t: string; href?: string; external?: boolean }
function safeHref(h: string): string | null {
    return /^(https?:\/\/|mailto:|\/|#)/i.test(h) ? h : null
}
function parseRich(text: string, base: string): Seg[] {
    const out: Seg[] = []
    const re = /\[([^\]\n]{1,80})\]\(([^)\s]{1,300})\)|(https?:\/\/[^\s)]+[^\s).,;:!?])|(^|[\s(])(\/(?:work|projects)\/[a-z0-9-]+)\/?/gi
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
        let start = m.index
        let label = ""
        let href: string | null = null
        if (m[1]) { label = m[1]; href = safeHref(m[2]) }
        else if (m[3]) { label = m[3].replace(/^https?:\/\/(www\.)?/, ""); href = m[3] }
        else if (m[5]) {
            start += m[4].length
            const slug = m[5].split("/").pop() || ""
            const c = CASES.find((x) => x.slug === slug)
            label = c ? c.name + " case study" : m[5]
            href = base + slug
        }
        if (start > last) out.push({ t: text.slice(last, start) })
        if (href) out.push({ t: label, href, external: /^(https?:|mailto:)/i.test(href) })
        else out.push({ t: label })
        last = re.lastIndex
    }
    if (last < text.length) out.push({ t: text.slice(last) })
    return out
}
const segLen = (segs: Seg[]) => segs.reduce((n, s) => n + s.t.length, 0)

// ── Search index (projects, roles, skills, FAQ) ─────────────────────────────────────────────────
type IndexItem = { kind: "Project" | "Role" | "Skill" | "FAQ"; title: string; sub: string; query: string; keys: string }
const INDEX: IndexItem[] = [
    ...CASES.map((p): IndexItem => ({ kind: "Project", title: p.name, sub: p.org + " · " + p.when, query: ASPECT_Q.overview(p.slug === "intel" ? "the Intel workspace" : p.name), keys: p.aliases.join(" ").replace(/=/g, "") + " " + p.oneLiner })),
    { kind: "Role", title: "UX Design Intern, U-M DPSS", sub: "Summer 2026", query: "Tell me about DPSS", keys: "dpss public safety dispatch intelligence internship" },
    { kind: "Role", title: "UX Researcher & Designer, General Motors", sub: "Jan – May 2026", query: "Give me the short version of GM Convoy", keys: "gm convoy automotive vehicle sponsored" },
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
    { kind: "Skill", title: "What she owned", sub: "Her part on each team project", query: "What did she own on team projects?", keys: "role contribution ownership team" },
    { kind: "FAQ", title: "What roles she’s looking for", sub: "Product, UX, experience design", query: "What roles is she looking for?", keys: "jobs hiring open to work full-time" },
    { kind: "FAQ", title: "Availability", sub: "Open to work · graduating May 2027", query: "Is she available, and when?", keys: "available start date graduate graduation" },
    { kind: "FAQ", title: "Where she’s based", sub: "Ann Arbor, open to moving", query: "Where is she based?", keys: "location relocate move ann arbor remote" },
    { kind: "FAQ", title: "Education", sub: "MS at UMSI, psych undergrad", query: "Where did she study?", keys: "school education degree umsi masters psychology university" },
    { kind: "FAQ", title: "How to reach her", sub: "LinkedIn or the Connect section", query: "How do I reach her?", keys: "contact email linkedin reach resume hire" },
    { kind: "FAQ", title: "Prime Video capstone", sub: "Under NDA", query: "What about Prime Video?", keys: "prime video amazon capstone nda" },
    { kind: "FAQ", title: "Is this bot Dhwani?", sub: "No, it’s a bot", query: "Are you real?", keys: "bot real human who are you" },
]
function searchIndex(raw: string, limit: number): IndexItem[] {
    const words = prep(raw).toks.filter((w) => w.length >= 2)
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

// Starter questions recruiters actually ask.
const STARTERS = [
    "What roles is she looking for?",
    "Which case study should I read first?",
    "What did she own on team projects?",
    "Is she available, and how do I reach her?",
]

type Message = { id: number; role: "user" | "assistant"; content: string; segs: Seg[]; links?: Link[]; followUps?: string[]; offline?: boolean }
type Props = { accentColor: string; greeting: string; casePath: string; showGreeting: boolean; bottomOffset: number; apiUrl: string }

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DhwaniGPT({ accentColor, greeting, casePath, showGreeting, bottomOffset, apiUrl }: Props) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const reduce = !!useReducedMotion()
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [pending, setPending] = useState(false)
    const [typing, setTyping] = useState<{ id: number; n: number } | null>(null)
    const [mode, setMode] = useState<"chat" | "search">("chat")
    const [searchQ, setSearchQ] = useState("")
    const [announce, setAnnounce] = useState("")
    const [greetVisible, setGreetVisible] = useState(false)
    const [typed, setTyped] = useState("")
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const logRef = useRef<HTMLDivElement>(null)
    const launcherRef = useRef<HTMLButtonElement>(null)
    const openerRef = useRef<HTMLElement | null>(null)
    const messagesRef = useRef<Message[]>([])
    const ctxRef = useRef<Ctx>({ asked: {} })
    const stickRef = useRef(true)
    const convRef = useRef(0)
    const idRef = useRef(0)
    const abortRef = useRef<AbortController | null>(null)

    const base = (() => {
        let b = (casePath || "/work/").trim()
        if (!b.startsWith("/") && !/^https?:/.test(b)) b = "/" + b
        return b.endsWith("/") ? b : b + "/"
    })()
    const api = (apiUrl || "").trim()
    const offset = typeof bottomOffset === "number" ? bottomOffset : 84
    const welcome = greeting?.trim() || "Hi, I’m DhwaniGPT, a little bot that knows this portfolio. Ask about a project, what she’s looking for, or something silly. Heads up: I’m a bot, so I might get things wrong."
    const pos = isCanvas ? "absolute" : "fixed"
    const accentFallback = accentColor || "#F3500F"

    const coarse = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(pointer: coarse)").matches
    const focusInput = (force?: boolean) => {
        if (!force && coarse()) return // don't pop the phone keyboard after a chip tap
        setTimeout(() => inputRef.current?.focus(), 40)
    }

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
        ctxRef.current = { asked: {} }
        commit([])
        setTyping(null)
        setPending(false)
        setInput("")
        setSearchQ("")
        setMode("chat")
        setAnnounce("New chat started.")
        focusInput(true)
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

    // "/#contact" links: the home page's Connect band has no #contact id, so scroll to it by hand.
    const scrollToConnect = useCallback((): boolean => {
        if (typeof document === "undefined") return false
        const el = document.getElementById("contact") || document.getElementById("cb-heading")
        if (!el) return false
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" })
        return true
    }, [reduce])
    useEffect(() => {
        if (isCanvas || typeof window === "undefined" || window.location.hash !== "#contact") return
        const t = window.setTimeout(() => { if (!document.getElementById("contact")) scrollToConnect() }, 700)
        return () => window.clearTimeout(t)
    }, [isCanvas, scrollToConnect])

    // Esc: leave search first, otherwise close.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return
            e.preventDefault()
            if (mode === "search") { setMode("chat"); focusInput(true) }
            else close()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [open, close, mode])

    useEffect(() => () => abortRef.current?.abort(), [])

    // Typed-out replies (instant with reduced motion).
    useEffect(() => {
        if (!typing) return
        const msg = messagesRef.current.find((m) => m.id === typing.id)
        const len = msg ? segLen(msg.segs) : 0
        if (!msg || typing.n >= len) { setTyping(null); return }
        const step = Math.max(2, Math.ceil(len / 70))
        const t = window.setTimeout(() => setTyping({ id: typing.id, n: Math.min(len, typing.n + step) }), 16)
        return () => window.clearTimeout(t)
    }, [typing])

    // Keep the newest message in view unless the visitor scrolled up to read.
    useEffect(() => {
        const el = logRef.current
        if (!el || mode !== "chat" || !stickRef.current) return
        el.scrollTop = el.scrollHeight
    }, [messages, pending, open, mode, typing])

    // Auto-grow the composer.
    useEffect(() => {
        const el = inputRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = Math.min(el.scrollHeight, 120) + "px"
    }, [input, open, messages.length, mode])

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

    // Sources for an LLM reply: case studies it names, plus contact links it mentions.
    const linksFor = (text: string): Link[] => {
        const q = prep(text)
        const out: Link[] = []
        for (const p of CASES) {
            if (out.length >= 2) break
            if (score(q, p.aliases) > 0) out.push({ href: base + p.slug, label: p.name + " case study" })
        }
        if (/linkedin/i.test(text)) out.push(LI)
        if (/connect section/i.test(text)) out.push(CN)
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

    const send = async (text: string, fromChip?: boolean) => {
        const m = text.trim().slice(0, 600)
        if (!m || pending) return
        if (typing) setTyping(null) // finish the current reply instantly
        const conv = convRef.current
        stickRef.current = true
        setMode("chat")
        setInput("")
        const userMsg: Message = { id: ++idRef.current, role: "user", content: m, segs: [{ t: m }] }
        const history = [...messagesRef.current, userMsg]
        commit(history)
        focusInput(!fromChip)

        // Canned answer (also the fallback for the API), with conversation context.
        const ctx = ctxRef.current
        const canned = answer(m, base, ctx)
        if (canned.project) {
            ctx.project = canned.project
            if (canned.aspect) ctx.asked[canned.project] = [...(ctx.asked[canned.project] || []), canned.aspect]
        }
        const cannedFollow = followUpsFor(canned, canned.project ? ctx.asked[canned.project] || [] : [])
        const cannedMsg = (offline: boolean): Message => ({ id: ++idRef.current, role: "assistant", content: canned.text, segs: parseRich(canned.text, base), links: canned.links, followUps: cannedFollow, offline })

        setPending(true)
        let bot: Message
        if (!api) {
            await new Promise((r) => setTimeout(r, reduce ? 0 : 320))
            if (conv !== convRef.current) return
            bot = cannedMsg(false)
        } else {
            const r = await askApi(history)
            if (conv !== convRef.current) return // chat was reset mid-flight
            bot = r
                ? { id: ++idRef.current, role: "assistant", content: r.reply, segs: parseRich(r.reply, base), links: linksFor(r.reply), followUps: r.followUps.length ? r.followUps : cannedFollow }
                : cannedMsg(true)
        }
        setPending(false)
        commit([...messagesRef.current, bot])
        if (!reduce) setTyping({ id: bot.id, n: 0 })
        setAnnounce("DhwaniGPT: " + bot.content)
    }

    const pick = (it: IndexItem) => { setSearchQ(""); send(it.query) }
    const toggleSearch = () => {
        const next = mode === "search" ? "chat" : "search"
        setMode(next)
        setTimeout(() => (next === "chat" ? inputRef.current : searchRef.current)?.focus(), 50)
    }

    const typeAhead = useMemo(() => (mode === "chat" && !pending && input.trim().length >= 2 ? searchIndex(input, 3) : []), [input, mode, pending])
    const searchResults = useMemo(() => (searchQ.trim() ? searchIndex(searchQ, 12) : INDEX), [searchQ])

    const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]
    const dur = reduce ? 0 : 0.22

    // Theme: --db-* tokens from the site, with light/dark fallbacks if a token is missing.
    const T = {
        glass: "var(--g-glass)",
        glassLine: "var(--g-glass-line)",
        surface: "var(--g-surface)",
        text: "var(--g-text)",
        text2: "var(--g-text-2)",
        line: "var(--g-line)",
        shadow: "var(--g-shadow)",
        accent: "var(--g-accent)",
        onAccent: "var(--g-on-accent)",
    }
    const css = `
.dbgpt { --g-glass: var(--db-glass, rgba(14,14,14,0.9)); --g-glass-line: var(--db-glass-line, rgba(255,255,255,0.10)); --g-surface: var(--db-surface, rgba(255,255,255,0.05)); --g-text: var(--db-text, #FAFAFA); --g-text-2: var(--db-text-2, #A3A3A3); --g-line: var(--db-line, rgba(255,255,255,0.12)); --g-shadow: var(--db-shadow, 0 24px 64px -16px rgba(0,0,0,0.6)); --g-accent: var(--db-accent, ${accentFallback}); --g-on-accent: var(--db-on-accent, #0A0A0A); }
@media (prefers-color-scheme: light) { .dbgpt { --g-glass: var(--db-glass, rgba(255,255,255,0.92)); --g-glass-line: var(--db-glass-line, rgba(0,0,0,0.08)); --g-surface: var(--db-surface, rgba(0,0,0,0.04)); --g-text: var(--db-text, #0A0A0A); --g-text-2: var(--db-text-2, #555555); --g-line: var(--db-line, rgba(0,0,0,0.12)); --g-shadow: var(--db-shadow, 0 24px 64px -20px rgba(0,0,0,0.25)); --g-on-accent: var(--db-on-accent, #FFFFFF); } }
.dbgpt, .dbgpt button, .dbgpt input, .dbgpt textarea, .dbgpt a { font-family: ${FONT}; -webkit-font-smoothing: antialiased; }
.dbgpt *, .dbgpt *::before, .dbgpt *::after { box-sizing: border-box; }
.dbgpt button:focus-visible, .dbgpt a:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
.dbgpt-field { transition: border-color .18s ease, box-shadow .18s ease; }
.dbgpt-field:focus-within { border-color: color-mix(in srgb, ${T.accent} 55%, ${T.line}); box-shadow: 0 0 0 3px color-mix(in srgb, ${T.accent} 16%, transparent); }
.dbgpt-field input:focus, .dbgpt-field textarea:focus { outline: none; }
.dbgpt-field input::placeholder, .dbgpt-field textarea::placeholder { color: ${T.text2}; opacity: 1; }
.dbgpt-chip, .dbgpt-starter, .dbgpt-ghost, .dbgpt-result, .dbgpt-src { transition: background .18s ease, border-color .18s ease, color .18s ease; }
.dbgpt-chip:hover, .dbgpt-starter:hover { background: ${T.surface}; border-color: color-mix(in srgb, ${T.accent} 40%, ${T.line}); color: ${T.text}; }
.dbgpt-starter:hover .dbgpt-arrow { transform: translateX(2px); color: ${T.accent}; }
.dbgpt-arrow { transition: transform .18s ease, color .18s ease; }
.dbgpt-ghost:hover, .dbgpt-ghost[aria-pressed="true"] { background: ${T.surface}; color: ${T.text}; }
.dbgpt-result:hover { background: ${T.surface}; }
.dbgpt-src:hover { border-color: color-mix(in srgb, ${T.accent} 50%, ${T.line}); color: ${T.text}; }
.dbgpt-launch { transition: transform .2s ease, border-color .2s ease; }
.dbgpt-launch:hover { transform: translateY(-1px); border-color: color-mix(in srgb, ${T.accent} 45%, ${T.glassLine}); }
.dbgpt-msg a { color: ${T.text}; text-decoration: underline; text-decoration-color: color-mix(in srgb, ${T.accent} 70%, transparent); text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
.dbgpt-msg a:hover { text-decoration-color: ${T.accent}; }
.dbgpt-orb { background: radial-gradient(circle at 30% 30%, var(--vibe-c, #FFD27A), var(--vibe-b, ${T.accent}) 55%, var(--vibe-a, #8A2A04)); }
@keyframes dbgpt-pulse { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.08); opacity: 1 } }
.dbgpt-orb-live { animation: dbgpt-pulse 3.2s ease-in-out infinite; }
.dbgpt-caret { display: inline-block; width: 1px; height: 1em; margin-left: 2px; vertical-align: -.12em; background: ${T.text2}; animation: dbgpt-caret .9s steps(1,end) infinite; }
@keyframes dbgpt-caret { 50% { opacity: 0; } }
@keyframes dbgpt-dot { 0%, 80%, 100% { opacity: .25 } 40% { opacity: 1 } }
.dbgpt-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${T.text2}; animation: dbgpt-dot 1.2s ease-in-out infinite; }
.dbgpt-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.dbgpt-log { scrollbar-width: thin; scrollbar-color: ${T.line} transparent; overscroll-behavior: contain; }
.dbgpt-chip { min-height: 36px; }
@media (pointer: coarse) { .dbgpt-chip { min-height: 44px; } }
@media (max-width: 520px) {
  .dbgpt-panel { inset: 0 !important; width: 100% !important; height: 100% !important; max-height: none !important; border-radius: 0 !important; border: 0 !important; }
  .dbgpt-head { padding-top: max(10px, env(safe-area-inset-top)) !important; }
  .dbgpt-compose { padding-bottom: max(10px, env(safe-area-inset-bottom)) !important; }
  .dbgpt-compose textarea { font-size: 16px !important; }
}
@media (prefers-reduced-motion: reduce) { .dbgpt-chip, .dbgpt-starter, .dbgpt-launch, .dbgpt-ghost, .dbgpt-result, .dbgpt-src, .dbgpt-arrow, .dbgpt-field { transition: none; } .dbgpt-launch:hover { transform: none; } .dbgpt-caret, .dbgpt-orb-live, .dbgpt-dot { animation: none; } }
`

    const Orb = ({ size, live }: { size: number; live?: boolean }) => (
        <span aria-hidden="true" className={"dbgpt-orb" + (live && !reduce ? " dbgpt-orb-live" : "")} style={{ display: "inline-block", flexShrink: 0, width: size, height: size, borderRadius: "50%", boxShadow: "0 0 0 1px " + T.line + ", 0 4px 14px color-mix(in srgb, " + T.accent + " 30%, transparent)" }} />
    )
    const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
    )
    const CLOSE = "M6 6l12 12M18 6L6 18"
    const NEW = "M12 5v14M5 12h14"
    const SEARCH = "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4"
    const ghost: CSSProperties = { width: 40, height: 40, flexShrink: 0, borderRadius: 10, border: 0, background: "transparent", color: T.text2, cursor: "pointer", display: "grid", placeItems: "center" }
    const chip: CSSProperties = { padding: "6px 12px", border: "1px solid " + T.line, borderRadius: 999, background: "transparent", color: T.text2, fontSize: 13, lineHeight: 1.35, fontWeight: 500, cursor: "pointer", textAlign: "left" }
    const canSend = !!input.trim() && !pending
    const lastMsg = messages[messages.length - 1]

    const onLinkClick = (href: string) => (e: { preventDefault: () => void }) => {
        if (href === CONNECT && scrollToConnect()) {
            e.preventDefault()
            if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 520px)").matches) close()
        }
    }
    const renderSegs = (segs: Seg[], limit?: number): ReactNode[] => {
        const out: ReactNode[] = []
        let left = limit === undefined ? Infinity : limit
        segs.forEach((s, i) => {
            if (left <= 0) return
            const t = s.t.length > left ? s.t.slice(0, left) : s.t
            left -= t.length
            if (s.href) {
                out.push(
                    <a key={i} href={s.href} onClick={onLinkClick(s.href)} {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {t}
                        {s.external && <span className="dbgpt-sr"> (opens in a new tab)</span>}
                    </a>
                )
            } else out.push(<span key={i}>{t}</span>)
        })
        return out
    }

    // Render into <body> on the live site so the fixed launcher is never clipped by Framer wrappers.
    const [mounted, setMounted] = useState(false)
    const hostRef = useRef<HTMLDivElement>(null)
    useEffect(() => { setMounted(true) }, [])
    useEffect(() => {
        if (isCanvas || typeof window === "undefined") return
        let el: HTMLElement | null = hostRef.current
        for (let i = 0; el && i < 5; i++) {
            el.style.pointerEvents = "none"
            if (window.getComputedStyle(el).position === "fixed") break
            const up: HTMLElement | null = el.parentElement
            if (!up || up === document.body || up.id === "main") break
            if (Array.from(up.children).filter((c) => !/^(STYLE|LINK|SCRIPT|TEMPLATE)$/.test(c.tagName)).length !== 1) break
            el = up
        }
    }, [isCanvas])
    const live: CSSProperties = { pointerEvents: "auto" }

    const ui = (
        <div className="dbgpt" style={{ fontFamily: FONT, ...(isCanvas ? { position: "relative", width: "100%", height: "100%", minWidth: 220, minHeight: 160 } : { pointerEvents: "none" }) }}>
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
                        style={{ ...live, position: pos, right: 16, bottom: offset + 56, zIndex: 2147480001, width: "min(320px, calc(100vw - 32px))", display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 8px 14px 14px", borderRadius: 16, background: T.glass, border: "1px solid " + T.glassLine, boxShadow: T.shadow, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxSizing: "border-box" }}
                    >
                        <span style={{ paddingTop: 2 }}><Orb size={22} live /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="dbgpt-sr">{GREETING_TEXT}</span>
                            <p aria-hidden="true" style={{ margin: 0, minHeight: 42, color: T.text, fontSize: 14, lineHeight: 1.5 }}>{typed}<i className="dbgpt-caret" /></p>
                            <button type="button" onClick={openPanel} className="dbgpt-chip" style={{ ...chip, marginTop: 10, color: T.text, minHeight: 40 }}>Start the tour</button>
                        </div>
                        <button type="button" aria-label="Dismiss greeting" onClick={() => setGreetVisible(false)} className="dbgpt-ghost" style={{ ...ghost, width: 44, height: 44 }}><Icon d={CLOSE} /></button>
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
                    style={{ ...live, position: pos, right: 16, bottom: offset, zIndex: 2147480001, height: 44, padding: "0 16px 0 10px", borderRadius: 999, border: "1px solid " + T.glassLine, background: T.glass, color: T.text, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: T.shadow, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
                >
                    <Orb size={22} live />
                    Ask DhwaniGPT
                </button>
            )}

            {/* Screen-reader announcements for new bot messages (full text, not the typing effect). */}
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
                        style={{ ...live, position: pos, right: 12, bottom: 12, zIndex: 2147480002, width: "min(420px, calc(100vw - 24px))", height: "min(660px, calc(100dvh - 24px))", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 20, background: T.glass, border: "1px solid " + T.glassLine, boxShadow: T.shadow, backdropFilter: "blur(28px) saturate(140%)", WebkitBackdropFilter: "blur(28px) saturate(140%)", color: T.text, boxSizing: "border-box", transformOrigin: "bottom right" }}
                    >
                        {/* Header */}
                        <div className="dbgpt-head" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 8px 10px 16px", flexShrink: 0, borderBottom: "1px solid " + T.line }}>
                            <Orb size={28} live />
                            <div style={{ flex: 1, minWidth: 0, marginLeft: 6 }}>
                                <h2 id="dbgpt-title" style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: T.text, lineHeight: 1.3 }}>DhwaniGPT</h2>
                                <p style={{ margin: 0, fontSize: 12, color: T.text2, lineHeight: 1.4 }}>{mode === "search" ? "Search the portfolio" : "Answers from her case studies"}</p>
                            </div>
                            <button type="button" aria-label="Search the portfolio" aria-pressed={mode === "search"} title="Search the portfolio" onClick={toggleSearch} className="dbgpt-ghost" style={ghost}><Icon d={SEARCH} /></button>
                            <button type="button" aria-label="New chat" title="New chat" onClick={reset} className="dbgpt-ghost" style={ghost}><Icon d={NEW} /></button>
                            <button type="button" aria-label="Close chat" title="Close (Esc)" onClick={close} className="dbgpt-ghost" style={ghost}><Icon d={CLOSE} /></button>
                        </div>

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
                            <div
                                ref={logRef}
                                className="dbgpt-log"
                                role="region"
                                aria-label="Conversation"
                                onScroll={(e) => { const el = e.currentTarget; stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48 }}
                                style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 16px 8px", display: "flex", flexDirection: "column", gap: 18 }}
                            >
                                {messages.length === 0 ? (
                                    /* Empty state */
                                    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 4 }}>
                                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                            <span style={{ paddingTop: 2 }}><Orb size={22} /></span>
                                            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: T.text, maxWidth: "36em" }}>{welcome}</p>
                                        </div>
                                        <div role="group" aria-labelledby="dbgpt-starters" style={{ display: "grid", gap: 8 }}>
                                            <p id="dbgpt-starters" style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text2 }}>Common questions</p>
                                            {STARTERS.map((s) => (
                                                <button key={s} type="button" className="dbgpt-starter" onClick={() => send(s, true)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", minHeight: 48, padding: "10px 14px", border: "1px solid " + T.line, borderRadius: 12, background: "transparent", color: T.text, fontSize: 14, fontWeight: 500, lineHeight: 1.4, cursor: "pointer", textAlign: "left" }}>
                                                    <span>{s}</span>
                                                    <span aria-hidden="true" className="dbgpt-arrow" style={{ color: T.text2, flexShrink: 0 }}>→</span>
                                                </button>
                                            ))}
                                            <button type="button" onClick={toggleSearch} className="dbgpt-chip" style={{ ...chip, justifySelf: "start", border: 0, padding: "6px 2px", textDecoration: "underline", textUnderlineOffset: 3 }}>Or search the portfolio</button>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isTyping = typing?.id === m.id
                                        const done = !isTyping
                                        return (
                                            <motion.div key={m.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} style={{ display: "grid", gap: 8, alignSelf: m.role === "user" ? "flex-end" : "stretch", justifyItems: m.role === "user" ? "end" : "start", maxWidth: m.role === "user" ? "82%" : "100%" }}>
                                                <span className="dbgpt-sr">{m.role === "user" ? "You said:" : "DhwaniGPT said:"}</span>
                                                {m.role === "user" ? (
                                                    <p style={{ margin: 0, padding: "9px 14px", borderRadius: "16px 16px 4px 16px", background: T.surface, border: "1px solid " + T.line, color: T.text, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</p>
                                                ) : (
                                                    <p className="dbgpt-msg" aria-hidden={isTyping ? true : undefined} style={{ margin: 0, color: T.text, fontSize: 14.5, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: "36em" }}>
                                                        {renderSegs(m.segs, isTyping ? typing?.n : undefined)}
                                                        {isTyping && <i className="dbgpt-caret" />}
                                                    </p>
                                                )}
                                                {done && !!m.links?.length && (
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                        {m.links.map((l) => (
                                                            <a key={l.href} className="dbgpt-src" href={l.href} onClick={onLinkClick(l.href)} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "4px 10px", borderRadius: 8, border: "1px solid " + T.line, color: T.text2, fontSize: 12.5, fontWeight: 500, textDecoration: "none" }}>
                                                                {/case study$/.test(l.label) && <span style={{ color: T.text2 }}>Source ·</span>}
                                                                <span style={{ color: T.text }}>{l.label}</span>
                                                                <span aria-hidden="true">{l.external ? "↗" : "→"}</span>
                                                                {l.external && <span className="dbgpt-sr"> (opens in a new tab)</span>}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                {done && m.offline && <span style={{ fontSize: 11, color: T.text2 }}>Offline mode · canned answer</span>}
                                                {done && m === lastMsg && m.role === "assistant" && !pending && !!m.followUps?.length && (
                                                    <div role="group" aria-label="Suggested follow-up questions" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                                                        {m.followUps.map((f) => (
                                                            <button key={f} type="button" className="dbgpt-chip" onClick={() => send(f, true)} style={chip}>{f}</button>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )
                                    })
                                )}
                                {pending && (
                                    <div aria-hidden="true" style={{ display: "flex", gap: 5, padding: "6px 0" }}>
                                        <i className="dbgpt-dot" /><i className="dbgpt-dot" style={{ animationDelay: ".15s" }} /><i className="dbgpt-dot" style={{ animationDelay: ".3s" }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Composer: always available */}
                        <form className="dbgpt-compose" onSubmit={(e) => { e.preventDefault(); send(input) }} style={{ padding: "8px 12px 10px", flexShrink: 0, borderTop: "1px solid " + T.line }}>
                            {typeAhead.length > 0 && (
                                <div role="group" aria-label="Matching topics" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                    {typeAhead.map((it) => (
                                        <button key={it.kind + it.title} type="button" className="dbgpt-chip" onClick={() => pick(it)} style={{ ...chip, fontSize: 12 }}>
                                            <span style={{ color: T.text2, marginRight: 6 }}>{it.kind}</span>{it.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <label htmlFor="dbgpt-in" className="dbgpt-sr">Ask about Dhwani. Enter sends, Shift+Enter adds a new line.</label>
                            <div className="dbgpt-field" style={{ display: "flex", alignItems: "flex-end", gap: 6, padding: "4px 4px 4px 14px", borderRadius: 14, border: "1px solid " + T.line, background: T.surface }}>
                                <textarea
                                    id="dbgpt-in"
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onFocus={() => mode === "search" && setMode("chat")}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input) }
                                    }}
                                    placeholder={messages.length ? "Ask a follow-up…" : "Ask about her work…"}
                                    maxLength={600}
                                    autoComplete="off"
                                    enterKeyHint="send"
                                    style={{ flex: 1, minWidth: 0, minHeight: 40, maxHeight: 120, padding: "10px 0", border: 0, background: "transparent", color: T.text, fontSize: 15, lineHeight: 1.35, caretColor: T.accent, resize: "none", overflowY: "auto" }}
                                />
                                <button type="submit" disabled={!canSend} aria-label="Send" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, border: 0, display: "grid", placeItems: "center", background: canSend ? T.accent : T.line, color: canSend ? T.onAccent : T.text2, cursor: canSend ? "pointer" : "default", transition: reduce ? "none" : "background .18s ease, color .18s ease" }}>
                                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                </button>
                            </div>
                            <p style={{ margin: "8px 0 0", color: T.text2, fontSize: 11, lineHeight: 1.4, textAlign: "center" }}>Automated, not Dhwani. Answers come from her portfolio and can still be wrong. Nothing is saved.</p>
                        </form>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    )
    if (isCanvas) return ui
    return <div ref={hostRef} style={{ width: 1, height: 1, pointerEvents: "none" }}>{mounted && typeof document !== "undefined" ? createPortal(ui, document.body) : null}</div>
}

addPropertyControls(DhwaniGPT, {
    apiUrl: { type: ControlType.String, title: "API URL", defaultValue: "", placeholder: "https://<your-app>.vercel.app/api/dhwanigpt", description: "Leave empty for offline answers from her case studies. Set to the deployed /api/dhwanigpt route to use Claude." },
    casePath: { type: ControlType.String, title: "Case pages live at", defaultValue: "/work/" },
    showGreeting: { type: ControlType.Boolean, title: "Show greeting", defaultValue: true },
    greeting: { type: ControlType.String, title: "Welcome Message", defaultValue: "", placeholder: "Hey! I’m DhwaniGPT, an automated assistant…", displayTextArea: true },
    accentColor: { type: ControlType.Color, title: "Accent fallback", defaultValue: "#F3500F", description: "Used only if --db-accent isn’t set." },
    bottomOffset: { type: ControlType.Number, title: "Launcher bottom", defaultValue: 84, min: 16, max: 240, step: 4, unit: "px", description: "Keeps the launcher above the “open to work” pill." },
})
