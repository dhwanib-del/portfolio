// CaseStudy — one whole case study page, ported from the Next.js build (dhwanib-del/portfolio).
// Drop it on a /work page, pick the project in the right panel, add videos. Words live in CASES
// below (same text as the code site). Story order: hook → video + honest numbers → the strongest
// sentence → what I saw → (BRIEFS: before/after) → what I did → the decision → where AI fit →
// where it stands → next case.
//  • Theme: reads the site tokens (--db-*) from PortfolioNav, so it flips with light/dark.
//  • Videos (Oct 2 PDF: "BRIEFS videos clickable"): every clip plays inline, has a visible
//    "watch larger" button, and opens in a dialog (Esc closes, focus returns). Muted, no autoplay
//    under reduced motion.
//  • Numbers count up once on screen; screen readers get the final value. Only real numbers.
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type Stat = { value: number; prefix?: string; suffix?: string; label: string }
type Case = {
    slug: string
    org: string
    headline: string
    hook: string
    meta: { label: string; value: string }[]
    sections: { heading: string; body: string[] }[]
    ai?: string
    status: string
    next: string
    decision?: { tension: string; decision: string; why: string; rejected?: string }
    stats?: Stat[]
    claim?: { pre?: string; emphasis: string; post?: string }
    scene?: string
}
type Clip = { video: string; caption: string }

const CASES: Case[] = [
 {
  "slug": "briefs",
  "org": "BRIEFS · U-M Division of Public Safety & Security",
  "headline": "The information was there. The hard part was finding it during a call.",
  "hook": "Dispatchers needed building details mid-call: who to call, how to get in, what to watch for. Those details lived in long PDFs and across more than ten tools.",
  "meta": [
   {
    "label": "Role",
    "value": "UX design intern: field research, IA, prototype, PRD"
   },
   {
    "label": "Team",
    "value": "With Aaron Tucker, DPSS"
   },
   {
    "label": "When",
    "value": "Summer 2026"
   },
   {
    "label": "Status",
    "value": "Interactive prototype + PRD, not shipped"
   }
  ],
  "claim": {
   "pre": "A dispatcher shouldn't have to ",
   "emphasis": "scroll a PDF",
   "post": " to find one phone number."
  },
  "stats": [
   {
    "value": 7,
    "label": "screens at one dispatch workstation"
   },
   {
    "value": 10,
    "suffix": "+",
    "label": "tools in the lookup"
   },
   {
    "value": 30,
    "suffix": "s",
    "label": "goal to find a detail · not yet tested"
   }
  ],
  "sections": [
   {
    "heading": "I sat in the dispatch center and watched the lookup happen.",
    "body": [
     "One workstation, seven screens. To answer a building question, a dispatcher found the right file in Dropbox, scrolled it by hand, then checked another system to make sure the contact was still current. Then back to the call.",
     "Nothing was missing. It just had no predictable place."
    ]
   },
   {
    "heading": "So every building profile got the same five places.",
    "body": [
     "Response, contacts, maps and floor plans, documents, details. Same order, every building. The few details that matter mid-call sit in a strip that stays visible while you move between sections."
    ]
   },
   {
    "heading": "The assistant had to show its work.",
    "body": [
     "Fast answers are useless if you can't check them. It answers only from approved records, links to where each answer came from, and says \"that's not in the records\" instead of guessing. When AI helped restructure old documents, a person approved every change."
    ]
   }
  ],
  "ai": "AI is in the product, with guardrails: answers cite the record, it admits when the records don't say, and nothing changes without a person approving it.",
  "status": "Prototype and PRD handed to DPSS. Not launched, and the 30-second goal hasn't been tested yet.",
  "next": "Put it in front of dispatchers: can they find a detail, check the answer, and trust the structure on a real shift?",
  "decision": {
   "tension": "The tradeoff",
   "decision": "Warnings only for things you act on now. Everything else stays calm and findable.",
   "why": "When every field shouts, nothing does. A fixed structure lets someone find the one detail they need. The pinned strip costs screen space, and I chose that on purpose.",
   "rejected": "Turning every item into an alert"
  },
  "scene": "briefs"
 },
 {
  "slug": "intel",
  "org": "Intel workspace · U-M Division of Public Safety & Security",
  "headline": "A shared view is only useful when it gives the right people the right context.",
  "hook": "The Intelligence Group tracked sensitive, multi-step work across spreadsheets. Handoffs were where things got lost.",
  "meta": [
   {
    "label": "Role",
    "value": "UX design intern: workflow design, prototype"
   },
   {
    "label": "Team",
    "value": "With Aaron Tucker, DPSS"
   },
   {
    "label": "When",
    "value": "2026"
   },
   {
    "label": "Status",
    "value": "In use by the team"
   }
  ],
  "sections": [
   {
    "heading": "The problem was clarity at the handoff.",
    "body": [
     "Someone picking up a case needs to see where it stands, what needs attention and what happens next, without seeing more than their role needs."
    ]
   },
   {
    "heading": "I built it where we could test it safely.",
    "body": [
     "The first version ran in Google Apps Script so the team could try it without touching production systems. Public tips now come in through a chatbot intake. The team has since started building its own server version."
    ]
   }
  ],
  "ai": "The public intake is a chatbot, so reports arrive structured instead of as free-form messages.",
  "status": "In use by the Intelligence Group. Shown here at workflow level with invented records.",
  "next": "Measure time from intake to first review now that reports arrive structured.",
  "decision": {
   "tension": "The scope call",
   "decision": "Make the handoff clear instead of replacing the team's tools.",
   "why": "The team still relies on its monitoring apps. The workspace connects the work around them, so it got used.",
   "rejected": "Replacing the team's monitoring apps with one platform"
  }
 },
 {
  "slug": "general-motors",
  "org": "Convoy · General Motors",
  "headline": "Most cars are designed around one driver. Our trip wasn't.",
  "hook": "We started with how a vehicle could personalize the drive for one person. One driver interview reframed it: a road trip is a group coordinating across phones, screens and messages.",
  "meta": [
   {
    "label": "Role",
    "value": "UX researcher & designer: research, advanced prototyping"
   },
   {
    "label": "Team",
    "value": "With Sara and Julia, GM-sponsored"
   },
   {
    "label": "When",
    "value": "Jan – May 2026"
   },
   {
    "label": "Status",
    "value": "Concept, tested in a 3D-printed truck cab"
   }
  ],
  "sections": [
   {
    "heading": "We cut four weeks of biometric work to design for the whole trip.",
    "body": [
     "The first direction was technically interesting and disconnected from the need. Planning stayed on the phone, where groups already organize. In the car, the screen shows position, spacing and group status, not another phone on the dashboard."
    ]
   },
   {
    "heading": "I prototyped the in-cab controls on real screens.",
    "body": [
     "HVAC and in-drive views were built in Figma and run on vehicle-size screens alongside other prototyping tools, so testers reached for them the way they would while driving. A host coordinates the plan; everyone else follows and can signal when they need something."
    ]
   }
  ],
  "status": "Concept. Three usability tests in a 3D-printed cab. Details stay under NDA, so no real-world claims.",
  "next": "Does a host make the group feel organized, or controlled?",
  "decision": {
   "tension": "Four weeks in",
   "decision": "Cut the biometric work and design for the whole trip.",
   "why": "One driver interview showed the real job: a group coordinating across phones, screens and messages while moving.",
   "rejected": "Personalizing the drive for a single driver"
  },
  "stats": [
   {
    "value": 4,
    "label": "weeks of work cut at the pivot"
   },
   {
    "value": 3,
    "label": "usability tests in a truck cab"
   },
   {
    "value": 1,
    "label": "interview that changed the brief"
   }
  ]
 },
 {
  "slug": "openlibrary",
  "org": "Open Library · Internet Archive",
  "headline": "The reader's problem wasn't only translation. It was losing the thread.",
  "hook": "In eight interviews, readers who hit unfamiliar language left the book to find help, and lost their place and their trust in the answer.",
  "meta": [
   {
    "label": "Role",
    "value": "UX researcher: interviews, survey, synthesis, recommendations"
   },
   {
    "label": "Team",
    "value": "5-person course team (SI 500)"
   },
   {
    "label": "When",
    "value": "Aug – Dec 2025"
   },
   {
    "label": "Status",
    "value": "Recommendations; Open Library acted on them"
   }
  ],
  "sections": [
   {
    "heading": "A better translator alone wouldn't fix it.",
    "body": [
     "The fix had to keep people in the passage. We recommended bringing existing language support into the reading flow, optional contextual help, and a lightweight way to report problems."
    ]
   },
   {
    "heading": "I drove the research and pushed all three recommendations.",
    "body": [
     "We worked inside copyright, privacy and academic-integrity limits, so every recommendation was something the library could realistically build."
    ]
   }
  ],
  "ai": "One recommendation was an optional AI reading assistant, kept inside the reading view so answers don't pull people away from the book.",
  "status": "After our research, Open Library improved its feedback flow and added context around international books.",
  "next": "Test whether readers get help and return to the same passage with less interruption.",
  "decision": {
   "tension": "The reframe",
   "decision": "Keep readers in the passage instead of sending them to a translator.",
   "why": "Every switch away cost context and trust. Help had to live where the reading happens.",
   "rejected": "A better translation tool on its own"
  },
  "stats": [
   {
    "value": 8,
    "label": "reader interviews"
   },
   {
    "value": 3,
    "label": "recommendations I pushed"
   }
  ]
 },
 {
  "slug": "budgetcart",
  "org": "BudgetCart · UMSI",
  "headline": "A grocery cart is a budget decision, one item at a time.",
  "hook": "Shoppers balancing cost, benefits eligibility and dietary needs aren't just looking for food. They're deciding what they can confidently put in the cart.",
  "meta": [
   {
    "label": "Role",
    "value": "Product designer: budget tracking and AI cart-building flows"
   },
   {
    "label": "Team",
    "value": "3 designers"
   },
   {
    "label": "When",
    "value": "UMSI project"
   },
   {
    "label": "Status",
    "value": "Concept, tested as a prototype"
   }
  ],
  "sections": [
   {
    "heading": "Hiding prices to look simple backfired.",
    "body": [
     "Our early interface removed brands, stores and prices. In testing, people struggled to find items and trusted their choices less. We made browsing item-first, kept the lowest price visible, and moved store comparisons to the moment people make that tradeoff."
    ]
   },
   {
    "heading": "Make the decision lighter without hiding the information behind it.",
    "body": [
     "Budget context shows while people shop. Eligibility and dietary safety appear before checkout. The AI cart builder helps someone start a cart instead of leaving them with a blank prompt."
    ]
   }
  ],
  "ai": "The AI cart builder drafts a starting cart from a budget and needs; people edit it, they don't start from an empty prompt.",
  "status": "Prototype tasks tested, not a live service. No measured change in spending yet.",
  "next": "Measure whether shoppers put fewer items back at checkout.",
  "decision": {
   "tension": "What testing showed",
   "decision": "Keep the lowest price visible and compare stores where the tradeoff happens.",
   "why": "People trusted their cart less when we hid the numbers. Simple can't mean hidden.",
   "rejected": "Hiding brands, stores and prices to look simple"
  }
 }
]
const ORDER = ["briefs", "intel", "general-motors", "openlibrary", "budgetcart"]
const TITLES: Record<string, string> = { briefs: "BRIEFS · UM DPSS", intel: "Intel workspace · UM DPSS", "general-motors": "Convoy · General Motors", openlibrary: "Open Library · Internet Archive", budgetcart: "BudgetCart · UMSI" }

const FONT = "'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

function useSeen<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const [seen, setSeen] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined") return setSeen(true)
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setSeen(true)
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.25 })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    return [ref, seen] as const
}

function StatBox({ s, run }: { s: Stat; run: boolean }) {
    const [n, setN] = useState(0)
    useEffect(() => {
        if (!run) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(s.value)
        let raf = 0
        const t0 = performance.now()
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1400)
            setN(Math.round(s.value * (1 - Math.pow(1 - p, 3))))
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [run, s.value])
    return (
        <div className="cs-stat">
            <dt className="cs-sr">{s.label}</dt>
            <dd>
                <span className="cs-stat-n" aria-hidden="true"><em>{s.prefix}</em>{n}<em>{s.suffix}</em></span>
                <span className="cs-sr">{s.prefix}{s.value}{s.suffix}</span>
                <span className="cs-stat-l" aria-hidden="true">{s.label}</span>
            </dd>
        </div>
    )
}

function Video({ clip, label, onOpen }: { clip?: Clip; label: string; onOpen: (c: Clip) => void }) {
    const ref = useRef<HTMLVideoElement>(null)
    const [reduced, setReduced] = useState(false)
    useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), [])
    useEffect(() => {
        const v = ref.current
        if (!v || reduced || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 })
        io.observe(v)
        return () => io.disconnect()
    }, [clip?.video, reduced])
    return (
        <figure className="cs-video">
            <div className="cs-video-frame">
                {clip?.video ? (
                    <>
                        <video ref={ref} src={clip.video} muted loop playsInline controls={reduced} preload="metadata" aria-label={clip.caption || label} />
                        <button type="button" className="cs-watch" onClick={() => onOpen(clip)}>
                            <span aria-hidden="true">▶</span> Watch larger<span className="cs-sr">: {clip.caption || label}</span>
                        </button>
                    </>
                ) : (
                    <div className="cs-video-ph"><span aria-hidden="true" className="cs-play">▶</span><span>{label}</span></div>
                )}
            </div>
            {clip?.caption && <figcaption>{clip.caption}</figcaption>}
        </figure>
    )
}

function BriefsBeforeAfter() {
    const lines = (n: number, seed: number) => Array.from({ length: n }).map((_, i) => <i key={seed + i} style={{ width: `${55 + (((i + seed) * 37) % 40)}%` }} />)
    return (
        <figure className="cs-ba">
            <div className="cs-ba-grid">
                <div className="cs-ba-panel">
                    <p className="cs-ba-tag">Before</p>
                    <div className="cs-ba-win">
                        <div className="cs-ba-path">Dropbox › Buildings › <b>building-records.pdf</b></div>
                        <div className="cs-ba-pdf" aria-hidden="true">{lines(8, 0)}<span className="cs-ba-needle">the detail you need, somewhere in here</span>{lines(4, 9)}</div>
                    </div>
                    <ul className="cs-ba-chips" aria-label="Also open"><li>CAD</li><li>contact sheet</li><li>shared drive</li><li>+8 more tools</li></ul>
                    <p className="cs-ba-note">Find the document, scroll it, check the contact is still current somewhere else, then get back to the call.</p>
                </div>
                <div className="cs-ba-panel cs-ba-after">
                    <p className="cs-ba-tag">After</p>
                    <div className="cs-ba-win">
                        <div className="cs-ba-path"><b>Building profile</b> · synthetic example</div>
                        <div className="cs-ba-strip" aria-label="Always visible"><span>access</span><span>on-call contact</span><span>active notes</span></div>
                        <ul className="cs-ba-tabs" aria-label="Sections"><li aria-current="true">Response</li><li>Contacts</li><li>Maps &amp; floor plans</li><li>Documents</li><li>Details</li></ul>
                        <div className="cs-ba-body" aria-hidden="true"><i /><i /><i style={{ width: "70%" }} /></div>
                    </div>
                    <p className="cs-ba-note">Every profile has the same five places. The few details that matter mid-call stay pinned while you move between them.</p>
                </div>
            </div>
            <figcaption>Recreated with made-up content. Section names follow the PRD; they could still change after testing.</figcaption>
        </figure>
    )
}

interface Props {
    project: string
    clips: Clip[]
    videoPlaceholder: string
    showNext: boolean
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CaseStudy(props: Props) {
    const { project = "briefs", clips = [], videoPlaceholder = "Screen recording coming soon", showNext = true } = props
    const c = CASES.find((x) => x.slug === project) || CASES[0]
    const [statsRef, statsSeen] = useSeen<HTMLDListElement>()
    const [claimRef, claimSeen] = useSeen<HTMLParagraphElement>()
    const [open, setOpen] = useState<Clip | null>(null)
    const dlg = useRef<HTMLDialogElement>(null)
    const lastFocus = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const d = dlg.current
        if (!d) return
        if (open && !d.open) {
            lastFocus.current = document.activeElement as HTMLElement
            d.showModal()
        }
        if (!open && d.open) d.close()
    }, [open])

    const i = ORDER.indexOf(c.slug)
    const next = ORDER[(i + 1) % ORDER.length]
    const nextCase = CASES.find((x) => x.slug === next)
    const [first, ...rest] = c.sections
    const extra = clips.slice(1)

    const css = `
        .cs { font-family: ${FONT}; color: var(--db-text, #fff); width: 100%; padding: 140px 0 80px; }
        .cs * { box-sizing: border-box; }
        .cs-w { max-width: 868px; margin: 0 auto; padding: 0 24px; }
        .cs-wide { max-width: 1028px; margin: 0 auto; padding: 0 24px; }
        .cs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .cs-eyebrow { margin: 0 0 16px; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-h1 { margin: 0; font-size: clamp(34px, 5vw, 56px); line-height: 1.05; letter-spacing: -.03em; font-weight: 700; text-wrap: balance; max-width: 22ch; }
        .cs-hook { margin: 20px 0 0; font-size: clamp(18px, 2vw, 21px); line-height: 1.5; color: var(--db-text-2, rgba(255,255,255,.6)); max-width: 58ch; }
        .cs-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px 24px; margin: 36px 0 0; padding: 20px 0 0; border-top: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .cs-meta dt { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-meta dd { margin: 4px 0 0; font-size: 15px; line-height: 1.45; }
        .cs-media { margin-top: 40px; }
        .cs-video { margin: 0; }
        .cs-video-frame { position: relative; aspect-ratio: 16 / 9; border-radius: 24px; overflow: hidden; border: 1px solid var(--db-line, rgba(255,255,255,.1)); background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--db-accent, #F3500F) 16%, transparent), transparent 55%), var(--db-surface, #111); }
        .cs-video-frame video { width: 100%; height: 100%; object-fit: contain; display: block; }
        .cs-video-ph { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 12px; color: var(--db-text-2, rgba(255,255,255,.6)); font-size: 14px; letter-spacing: .1em; text-transform: uppercase; }
        .cs-play { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; background: var(--db-accent, #F3500F); color: var(--db-on-accent, #0A0A0A); font-size: 18px; }
        .cs-watch { position: absolute; right: 14px; bottom: 14px; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--db-glass-line, rgba(255,255,255,.12)); background: var(--db-glass, rgba(18,18,18,.82)); color: var(--db-text, #fff); font: 600 14px ${FONT}; cursor: pointer; backdrop-filter: blur(12px); }
        .cs-video figcaption, .cs-ba figcaption { margin-top: 10px; font-size: 14px; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-stats { display: flex; flex-wrap: wrap; gap: 16px; margin: 20px 0 0; padding: 0; }
        .cs-stat { flex: 1 1 200px; padding: 22px 24px; border-radius: 16px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .cs-stat dd { margin: 0; display: grid; gap: 6px; }
        .cs-stat-n { font-size: clamp(40px, 6vw, 64px); line-height: 1; letter-spacing: -.02em; font-weight: 700; font-variant-numeric: tabular-nums; }
        .cs-stat-n em { font-style: normal; color: var(--db-accent, #F3500F); font-size: .5em; }
        .cs-stat-l { font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-claim { margin: 72px 0 24px; font-size: clamp(30px, 5vw, 56px); line-height: 1.12; letter-spacing: -.02em; font-weight: 700; max-width: 22ch; transition: opacity .7s ease, transform .7s ease; }
        .cs-claim[data-seen="false"] { opacity: 0; transform: translateY(16px); }
        .cs-claim em { font-style: normal; color: var(--db-accent, #F3500F); }
        .cs-sec { margin: 48px 0 0; }
        .cs-sec h2 { margin: 0 0 12px; font-size: clamp(22px, 2.4vw, 28px); line-height: 1.2; letter-spacing: -.02em; text-wrap: balance; }
        .cs-sec p { margin: 0 0 12px; font-size: 18px; line-height: 1.6; color: var(--db-text-2, rgba(255,255,255,.6)); max-width: 64ch; }
        .cs-sec strong { color: var(--db-text, #fff); }
        .cs-decision { margin: 48px 0 0; padding: 32px 32px 28px; border-radius: 20px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .cs-decision-t { margin: 0 0 12px; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: var(--db-accent, #F3500F); font-weight: 600; }
        .cs-decision-d { margin: 0 0 14px; font-size: clamp(24px, 3vw, 34px); line-height: 1.2; letter-spacing: -.02em; }
        .cs-decision-w { margin: 0; font-size: 17px; line-height: 1.55; color: var(--db-text-2, rgba(255,255,255,.6)); max-width: 60ch; }
        .cs-decision-r { margin: 20px 0 0; padding-top: 16px; border-top: 1px solid var(--db-line, rgba(255,255,255,.1)); color: var(--db-text-2, rgba(255,255,255,.6)); font-size: 15px; }
        .cs-decision-r span { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; margin-right: 6px; }
        .cs-ai { margin: 40px 0 0; padding: 20px 22px; border-radius: 16px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); border-left: 3px solid var(--db-accent, #F3500F); }
        .cs-ai p { margin: 0; font-size: 17px; line-height: 1.55; }
        .cs-ai .cs-eyebrow { margin-bottom: 8px; }
        .cs-clips { display: grid; gap: 32px; margin-top: 48px; }
        .cs-result { margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .cs-next { display: grid; gap: 4px; margin-top: 40px; padding: 24px; border-radius: 24px; background: var(--db-line, rgba(255,255,255,.06)); border: 1px solid var(--db-line, rgba(255,255,255,.1)); color: inherit; text-decoration: none; transition: transform .3s ease; }
        .cs-next:hover { transform: translateY(-2px); }
        .cs-next-t { font-size: 15px; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-next-r { font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
        .cs a:focus-visible, .cs button:focus-visible { outline: 2px solid var(--db-accent, #F3500F); outline-offset: 3px; }
        .cs-ba { margin: 40px 0 0; }
        .cs-ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cs-ba-panel { padding: 20px; border-radius: 20px; border: 1px solid var(--db-line, rgba(255,255,255,.1)); background: var(--db-line, rgba(255,255,255,.04)); display: grid; gap: 14px; align-content: start; }
        .cs-ba-after { border-color: color-mix(in srgb, var(--db-accent, #F3500F) 45%, transparent); }
        .cs-ba-tag { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-ba-after .cs-ba-tag { color: var(--db-accent, #F3500F); }
        .cs-ba-win { border-radius: 12px; border: 1px solid var(--db-line, rgba(255,255,255,.1)); background: var(--db-surface, #111); overflow: hidden; }
        .cs-ba-path { padding: 10px 14px; border-bottom: 1px solid var(--db-line, rgba(255,255,255,.1)); font-size: 13px; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-ba-path b { color: var(--db-text, #fff); font-weight: 600; }
        .cs-ba-pdf { height: 220px; overflow: hidden; padding: 14px; display: grid; gap: 9px; align-content: start; -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); }
        .cs-ba-pdf i, .cs-ba-body i { display: block; height: 6px; border-radius: 3px; background: var(--db-line, rgba(255,255,255,.14)); }
        .cs-ba-needle { justify-self: start; padding: 3px 8px; border-radius: 6px; font-size: 12px; background: color-mix(in srgb, var(--db-accent, #F3500F) 18%, transparent); color: var(--db-text, #fff); }
        .cs-ba-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
        .cs-ba-chips li { padding: 4px 10px; border-radius: 999px; border: 1px dashed var(--db-line, rgba(255,255,255,.2)); font-size: 12px; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-ba-strip { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 14px; border-bottom: 1px solid var(--db-line, rgba(255,255,255,.1)); background: color-mix(in srgb, var(--db-accent, #F3500F) 10%, transparent); }
        .cs-ba-strip span { padding: 4px 10px; border-radius: 999px; background: var(--db-bg, #000); border: 1px solid var(--db-line, rgba(255,255,255,.2)); font-size: 12px; font-weight: 600; }
        .cs-ba-tabs { list-style: none; margin: 0; padding: 0 10px; display: flex; flex-wrap: wrap; gap: 2px; border-bottom: 1px solid var(--db-line, rgba(255,255,255,.1)); }
        .cs-ba-tabs li { padding: 10px 8px; font-size: 12px; color: var(--db-text-2, rgba(255,255,255,.6)); border-bottom: 2px solid transparent; }
        .cs-ba-tabs li[aria-current] { color: var(--db-text, #fff); border-bottom-color: var(--db-accent, #F3500F); font-weight: 600; }
        .cs-ba-body { padding: 14px; display: grid; gap: 9px; }
        .cs-ba-note { margin: 0; font-size: 15px; line-height: 1.55; color: var(--db-text-2, rgba(255,255,255,.6)); }
        .cs-dialog { width: min(1200px, 94vw); max-height: 92vh; padding: 0; border: 0; border-radius: 20px; background: var(--db-bg, #000); color: var(--db-text, #fff); }
        .cs-dialog::backdrop { background: rgba(0,0,0,.78); }
        .cs-dialog video { display: block; width: 100%; max-height: 80vh; background: #000; }
        .cs-dialog-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 12px 12px 20px; font: 15px ${FONT}; }
        .cs-close { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--db-line, rgba(255,255,255,.2)); background: transparent; color: inherit; font: 600 14px ${FONT}; cursor: pointer; }
        @media (max-width: 760px) { .cs { padding-top: 104px; } .cs-ba-grid { grid-template-columns: 1fr; } .cs-decision { padding: 24px 20px; } }
        @media (prefers-reduced-motion: reduce) { .cs-claim { transition: none; } .cs-claim[data-seen="false"] { opacity: 1; transform: none; } .cs-next { transition: none; } }
    `

    return (
        <article className="cs" style={props.style}>
            <style>{css}</style>
            <header className="cs-w">
                <p className="cs-eyebrow">{c.org}</p>
                <h1 className="cs-h1">{c.headline}</h1>
                <p className="cs-hook">{c.hook}</p>
                <dl className="cs-meta">
                    {c.meta.map((m) => (
                        <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>
                    ))}
                </dl>
            </header>

            <div className="cs-wide cs-media">
                <Video clip={clips[0]} label={videoPlaceholder} onOpen={setOpen} />
                {c.stats && c.stats.length > 0 && (
                    <dl ref={statsRef} className="cs-stats">{c.stats.map((s) => <StatBox key={s.label} s={s} run={statsSeen} />)}</dl>
                )}
            </div>

            <div className="cs-w">
                {c.claim && (
                    <p ref={claimRef} className="cs-claim" data-seen={claimSeen ? "true" : "false"}>
                        {c.claim.pre}<em>{c.claim.emphasis}</em>{c.claim.post}
                    </p>
                )}
                {first && (
                    <section className="cs-sec">
                        <h2>{first.heading}</h2>
                        {first.body.map((p) => <p key={p}>{p}</p>)}
                    </section>
                )}
            </div>

            {c.scene === "briefs" && <div className="cs-wide"><BriefsBeforeAfter /></div>}

            <div className="cs-w">
                {rest.map((s) => (
                    <section key={s.heading} className="cs-sec">
                        <h2>{s.heading}</h2>
                        {s.body.map((p) => <p key={p}>{p}</p>)}
                    </section>
                ))}
                {c.decision && (
                    <section className="cs-decision" aria-label="Key decision">
                        <p className="cs-decision-t">{c.decision.tension}</p>
                        <h3 className="cs-decision-d">{c.decision.decision}</h3>
                        <p className="cs-decision-w">{c.decision.why}</p>
                        {c.decision.rejected && <p className="cs-decision-r"><span>Rejected</span> <s>{c.decision.rejected}</s></p>}
                    </section>
                )}
                {c.ai && (
                    <aside className="cs-ai" aria-label="Where AI fit">
                        <p className="cs-eyebrow">where AI fit</p>
                        <p>{c.ai}</p>
                    </aside>
                )}
            </div>

            {extra.length > 0 && (
                <div className="cs-wide cs-clips">
                    {extra.map((cl, k) => <Video key={cl.video + k} clip={cl} label={videoPlaceholder} onOpen={setOpen} />)}
                </div>
            )}

            <div className="cs-w">
                <section className="cs-sec cs-result">
                    <h2>Where it stands</h2>
                    <p>{c.status}</p>
                    <p><strong>Next question:</strong> {c.next}</p>
                </section>
                {showNext && nextCase && (
                    <a className="cs-next" href={`/work/${next}`}>
                        <span className="cs-eyebrow" style={{ margin: 0 }}>next</span>
                        <span className="cs-next-t">{TITLES[next]}</span>
                        <span className="cs-next-r">{nextCase.headline} →</span>
                    </a>
                )}
            </div>

            <dialog ref={dlg} className="cs-dialog" aria-label={open?.caption || "Video"} onClose={() => { setOpen(null); lastFocus.current?.focus() }}>
                <div className="cs-dialog-bar">
                    <span>{open?.caption || ""}</span>
                    <button type="button" className="cs-close" onClick={() => setOpen(null)}>Close</button>
                </div>
                {open && <video src={open.video} controls autoPlay playsInline />}
            </dialog>
        </article>
    )
}

addPropertyControls(CaseStudy, {
    project: { type: ControlType.Enum, title: "Project", options: ORDER, optionTitles: ORDER.map((s) => TITLES[s]), defaultValue: "briefs" },
    clips: {
        type: ControlType.Array,
        title: "Videos",
        control: {
            type: ControlType.Object,
            controls: {
                video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm", "mov"] },
                caption: { type: ControlType.String, title: "What to notice", defaultValue: "" },
            },
        },
        defaultValue: [],
    },
    videoPlaceholder: { type: ControlType.String, title: "No-video label", defaultValue: "Screen recording coming soon" },
    showNext: { type: ControlType.Boolean, title: "Next case link", defaultValue: true },
})
