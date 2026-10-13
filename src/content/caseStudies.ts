// Case studies — single source for /work/<slug> pages and the DhwaniGPT / ask APIs.
//
// Sources: previously published copy in cases.ts / caseStories.ts (confirmed by Dhwani), the
// BudgetCart contribution split she confirmed, and her project notes. Nothing here may be
// added without a source: no invented metrics, quotes, findings, launches or impact.
//
// Every screen carries an `owner` so team work is never presented as Dhwani's alone.
// DPSS screens stay out of the public site until DPSS clears them (see docs/case-study-assets.md).

import type { Annotation, IterationEvidence } from "@/lib/case-ui"

export type Owner = "mine" | "team" | "shared"

export type Screen = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
  owner: Owner
  /** who owned it, when owner is "team" — shown next to the screen */
  ownerNote?: string
  annotations?: Annotation[]
}

/** A visual we intend to show but can't yet: missing export, or waiting on clearance. */
export type AssetSlot = {
  label: string
  reason: "missing" | "clearance"
  /** exact file(s) to drop in, relative to /public */
  expected: string[]
  note: string
  aspect?: string // CSS aspect-ratio, e.g. "16 / 10"
}

export type Decision = {
  title: string
  chose: string
  over: string
  because: string
  /** where the support for this decision comes from, stated plainly */
  evidence: string
  owner: Owner
}

export type CaseStudy = {
  slug: string
  name: string
  org: string
  /** one sentence: what the product is, in plain words */
  product: string
  /** Short, evidence-based tension: shown in the 30-second scan. */
  challenge?: string
  role: string
  team: string
  timeline: string
  status: string
  contributions: { mine: string[]; team?: string[] }
  hero: { type: "screens"; screens: Screen[]; caption: string } | { type: "slot"; slot: AssetSlot }
  context: string[]
  decisions: Decision[]
  experience?: { heading: string; intro: string; screens: Screen[] }
  prototype?: { url: string; title: string; note: string }
  beforeAfter?: {
    heading: string
    before: Screen | AssetSlot
    after: Screen | AssetSlot
    changed: string
    why: string
    evidence: IterationEvidence
  }
  slots?: AssetSlot[]
  evaluation: { method: string; learned: string[]; notTested: string[] }
  outcome: { confirmed: string; limitation: string; next: string }
  ai?: string
  links?: { label: string; href: string }[]
}

const phone = { width: 339, height: 750 } // current BudgetCart exports (low-res; see asset doc)

export const caseStudies: CaseStudy[] = [
  {
    slug: "general-motors",
    name: "Convoy",
    org: "General Motors · sponsored UMSI project",
    product: "A phone and in-car experience to help groups plan and coordinate road trips together.",
    challenge: "The project began with biometric personalization for one driver, then shifted to group road trips.",
    role: "Research, advanced Figma interactions, reusable components",
    team: "Three designers: me, Sara and Julia",
    timeline: "Jan – May 2026",
    status: "Concept prototype. Tested three times using a physical vehicle mockup; not on the road.",
    contributions: {
      mine: [
        "Worked on research and prototyping for the GM-sponsored design project",
        "Built the interactive screens in Figma",
        "Built reusable components for our first shared team design system",
      ],
      team: [
        "Explored HVAC and in-drive views at vehicle size",
        "Ran three usability tests using a physical vehicle mockup",
      ],
    },
    hero: {
      type: "slot",
      slot: {
        label: "Final in-drive screen (Figma export)",
        reason: "missing",
        expected: ["case-shots/gm/in-drive.png"],
        note: "The original exports live in the Framer GM page and the team Figma file; they are not in this repo yet. Some details are under NDA, so only cleared screens go here.",
        aspect: "16 / 10",
      },
    },
    context: [
      "GM asked our team to explore experiences for a future electric truck. Our first concept used biometrics to personalize the vehicle for one driver.",
      "After the initial biometric concept, the team explored a different direction: helping people travel together in separate cars.",
    ],
    decisions: [
      {
        title: "Design for the group, not one driver",
        chose: "A convoy concept for a group travelling across several vehicles",
        over: "Personalizing the drive for a single driver with biometrics",
        because: "The interview was about planning and staying together across cars, which the biometric concept didn't address.",
        evidence: "The project included a driver interview. Who proposed the change in direction has not been confirmed.",
        owner: "shared",
      },
      {
        title: "Plan on the phone. Keep driving updates simple.",
        chose: "Trip planning on the phone; the car screen shows where everyone is and how the group is doing",
        over: "Putting planning on the in-car display",
        because: "People can plan together on their phones before leaving. Once they're driving, the car screen only needs essential group updates.",
        evidence: "Team rationale, tried in the three cab tests. We still need to test whether that information is easy and safe to use on the road.",
        owner: "team",
      },
      {
        title: "Who should organize the trip?",
        chose: "One person organizes the trip and sets the plan",
        over: "Everyone in the group editing the plan equally",
        because: "We explored having one person manage the shared trip plan.",
        evidence: "Not settled. We didn't test whether everyone else feels included and comfortable with that setup.",
        owner: "team",
      },
    ],
    slots: [
      { label: "Early biometric exploration", reason: "missing", expected: ["case-shots/gm/biometric-early.png"], note: "Shows the direction we moved away from.", aspect: "16 / 10" },
      { label: "Phone trip-planning screen", reason: "missing", expected: ["case-shots/gm/phone-planning.png"], note: "Final phone export.", aspect: "9 / 19.5" },
      { label: "Physical prototype test photo", reason: "clearance", expected: ["case-shots/gm/cab-test.jpg"], note: "Only with permission from the team and sponsor; don't show participant faces.", aspect: "4 / 3" },
    ],
    evaluation: {
      method: "Three usability tests using a physical vehicle mockup, run by the team.",
      learned: [
        "We could see how the screens worked in a physical setup rather than only in Figma.",
        "How much control the trip organizer should have stayed an open question.",
      ],
      notTested: ["Real driving conditions", "Whether in-car updates are easy and safe to use while driving", "How the rest of the group feels about the organizer role"],
    },
    outcome: {
      confirmed: "A concept prototype evaluated in three usability sessions.",
      limitation: "We didn't test it in real driving conditions. Some details aren't available for public sharing.",
      next: "How much control should the trip organizer have?",
    },
  },

  {
    slug: "briefs",
    name: "BRIEFS",
    org: "U-M Division of Public Safety & Security",
    product: "A tool that helps U-M emergency dispatchers find a building's contacts, access details, hazards and floor plans during a call.",
    role: "UX design intern — contextual inquiry, information architecture, prototype, PRD",
    team: "With Aaron Tucker, DPSS",
    timeline: "Summer 2026",
    status: "Interactive prototype and PRD handed to DPSS. Not launched; not yet tested with dispatchers.",
    contributions: {
      mine: [
        "Contextual inquiry with the DPSS Dispatch Group",
        "Mapped the lookup workflow across tools",
        "Designed the information architecture and the building-profile prototype (tabbed sections, pinned critical strip)",
        "Wrote the PRD and explored a Sheets-backed Apps Script version",
      ],
      team: ["Aaron Tucker collaborated on the DPSS workstream"],
    },
    hero: {
      type: "slot",
      slot: {
        label: "Building profile with pinned critical strip",
        reason: "clearance",
        expected: ["case-shots/briefs/building-profile.png"],
        note: "Waiting on DPSS publication clearance. Use a synthetic building (fictional names, no real contacts or hazards).",
        aspect: "16 / 10",
      },
    },
    context: [
      "I sat with dispatchers during their shifts. Building information was spread across PDFs, Dropbox and other tools; one workstation had seven screens and the lookup touched more than ten tools. To check whether a building contact still worked at U-M, a dispatcher continued into MCommunity.",
      "There were no existing design files. The field notes also showed outdated contacts and building details, so a faster search alone could surface the wrong record sooner.",
    ],
    decisions: [
      {
        title: "Pin the urgent details",
        chose: "A persistent strip with the details needed mid-call, visible from every section of the profile",
        over: "Giving every piece of building information equal weight",
        because: "During a call, the dispatcher needs contacts, access and hazards while moving through the rest of the profile. The strip costs screen space; I chose it for the mid-call task.",
        evidence: "What I observed in the contextual inquiry. Not yet tested with dispatchers.",
        owner: "mine",
      },
      {
        title: "Predictable sections instead of one long document",
        chose: "Tabbed sections with a stable home for each kind of information",
        over: "A single scrolling document per building, like the existing PDFs",
        because: "A dispatcher shouldn't have to remember where in a long file a detail lives.",
        evidence: "Iterated across several design-direction rounds, where I fixed sticky-header, tab-navigation and icon-meaning problems in my own prototype. Reviewed internally; no dispatcher test yet.",
        owner: "mine",
      },
      {
        title: "A record has to be current, not just findable",
        chose: "Include checking and maintaining records in the scope",
        over: "Only making the lookup faster",
        because: "Finding an outdated contact faster doesn't help on a call.",
        evidence: "Field notes. Who maintains the records is still unresolved.",
        owner: "mine",
      },
    ],
    evaluation: {
      method: "Contextual inquiry with the DPSS Dispatch Group; internal reviews of my prototype iterations.",
      learned: [
        "The lookup is a multi-tool workflow, not a single document problem.",
        "Keeping records up to date matters as much as finding them fast.",
      ],
      notTested: ["Dispatcher use of the prototype", "The 30-second lookup goal", "Who maintains the records"],
    },
    outcome: {
      confirmed: "Prototype and PRD handed to DPSS.",
      limitation: "Not launched and not tested with dispatchers. Record ownership is unresolved.",
      next: "On a real shift, can a dispatcher find a detail, check that it's current, and trust the structure?",
    },
    ai: "The PRD proposes an assistant that answers only from approved records, cites them, and says when information is missing. Changes to documents need human approval.",
  },

  {
    slug: "intel",
    name: "Intelligence Hub",
    org: "Intelligence Group workspace · U-M DPSS",
    product: "A shared workspace where a DPSS analyst team keeps requests, investigation work, reviews and next steps in one place. Built as a Google Apps Script web app.",
    role: "Co-lead — stakeholder interviews, workflow design, Apps Script prototype, PRD",
    team: "Co-led with Aaron Tucker, DPSS",
    timeline: "2026",
    status: "Piloted internally; feedback is being worked into the tool. No impact metrics claimed.",
    contributions: {
      mine: [
        "Led a full-team stakeholder interview session",
        "Designed the workflow and role-aware navigation",
        "Built the Apps Script prototype and wrote the PRD and design requirements",
      ],
      team: ["Co-led the project and pilot with Aaron Tucker"],
    },
    hero: {
      type: "slot",
      slot: {
        label: "Case workspace (synthetic data)",
        reason: "clearance",
        expected: ["case-shots/intel/case-detail-synthetic.png"],
        note: "Screens exist in the repo but show DPSS branding and the structure of an operational tool. Withheld until DPSS clears a synthetic version.",
        aspect: "16 / 10",
      },
    },
    context: [
      "The Intelligence Group's requests and investigation work lived in separate places, so whoever picked up a case had to piece its history back together.",
      "BRIEFS and this workspace are separate projects. This one is about casework: who asked for what, what's been done, who owns it, and what happens next.",
    ],
    decisions: [
      {
        title: "Role-aware views",
        chose: "Navigation and dashboards that change with the person's role",
        over: "One undifferentiated view for everyone",
        because: "Everyone works from the same case, but not everyone should see everything.",
        evidence: "The stakeholder interview session I led.",
        owner: "shared",
      },
      {
        title: "Keep the case's history attached to the case",
        chose: "Request, status, owner and history travel with the case as the view changes",
        over: "Separate intake and spreadsheet tracking",
        because: "The next analyst should be able to see what happened before the case reached them.",
        evidence: "Stakeholder interviews, then the internal pilot.",
        owner: "shared",
      },
    ],
    evaluation: {
      method: "Full-team stakeholder interviews before design; an internal pilot with feedback collected by the team.",
      learned: ["Pilot feedback is still being worked through. I'm not publishing findings or impact from it."],
      notTested: ["Whether the workspace makes casework faster or more accurate"],
    },
    outcome: {
      confirmed: "The workspace went through an internal pilot, which I co-led.",
      limitation: "No measured speed or quality claims. Screens withheld pending clearance.",
      next: "Can each role identify the next action on a case without asking someone?",
    },
  },

  {
    slug: "budgetcart",
    name: "BudgetCart",
    org: "UMSI course project",
    product: "A mobile grocery concept for shopping within a budget, SNAP/WIC eligibility and dietary needs, with an assistant that drafts an editable starting cart.",
    role: "Interviews, paper prototypes, the AI cart builder and Budget Calendar, Figma components",
    team: "Three designers: me, Anne and Tunisia",
    timeline: "UMSI course project",
    status: "Prototype tested with tasks. Not a live service.",
    contributions: {
      mine: [
        "Owned the AI cart builder interaction and the Budget Calendar",
        "Interviews and paper prototypes before Figma",
        "Taught myself Figma components and developed the visual language with the team",
      ],
      team: ["Anne led buying and checkout", "Tunisia led onboarding and account screens"],
    },
    hero: {
      type: "screens",
      caption: "The two flows I owned: the AI cart builder and the Budget Calendar.",
      screens: [
        { src: "/case-shots/budgetcart/smart-ai.png", alt: "BudgetCart Smart AI screen: a chat where the shopper asks for a cart with the best deals on listed items", caption: "AI cart builder", ...phone, owner: "mine" },
        { src: "/case-shots/budgetcart/budget-calendar.png", alt: "BudgetCart Budget Schedule screen: remaining monthly budget ring and a calendar of spending days", caption: "Budget Calendar", ...phone, owner: "mine" },
      ],
    },
    context: [
      "BudgetCart explored grocery shopping when several constraints apply at once: a weekly budget, SNAP/WIC eligibility and dietary needs.",
      "I started with interviews and paper prototypes before moving into Figma. It was my first Figma project.",
    ],
    decisions: [
      {
        title: "Show the cues people choose with",
        chose: "Item-first browsing with price, brand and store visible",
        over: "Hiding brands, stores and prices to make the screen look simpler",
        because: "In prototype testing, people struggled to find items and trusted their choices less when those details were hidden.",
        evidence: "Prototype task testing. The revised screens weren't retested.",
        owner: "team",
      },
      {
        title: "Give the AI a starting point",
        chose: "Upload cues and a starter prompt in the cart builder",
        over: "An empty chat input",
        because: "A blank prompt doesn't tell a shopper what the assistant can do. The cart it drafts is a starting point they edit.",
        evidence: "My design rationale. Not retested.",
        owner: "mine",
      },
      {
        title: "Keep the budget in view while shopping",
        chose: "Budget and spending days in a calendar the shopper can check any time",
        over: "Showing the budget only at checkout",
        because: "The budget matters while choosing, not after.",
        evidence: "Design rationale. No spending outcome measured.",
        owner: "mine",
      },
    ],
    experience: {
      heading: "Choosing a store",
      intro: "Anne's store-comparison step, where eligibility and totals sit next to the choice. The browse screen is in the before/after below.",
      screens: [
        {
          src: "/case-shots/budgetcart/store-comparison.png", alt: "BudgetCart Select a Store screen comparing cart totals at Costco and Aldi with eligibility labels", caption: "Store comparison", ...phone, owner: "team", ownerNote: "Anne's flow",
          annotations: [
            { x: 52, y: 27, title: "Eligibility before checkout", body: "SNAP/WIC and dietary labels appear where the shopper picks a store." },
            { x: 86, y: 51.5, title: "Total per store", body: "The comparison is the cart total, the number the budget decision depends on." },
          ],
        },
      ],
    },
    prototype: {
      url: "https://www.figma.com/proto/UUNYyLmIxrEFfMTnM3u2e6/BudgetCart-HighFi-Prototype?node-id=1-5643&starting-point-node-id=1%3A5643",
      title: "BudgetCart high-fidelity prototype",
      note: "The team's clickable Figma prototype.",
    },
    beforeAfter: {
      heading: "What testing changed",
      before: { label: "Earlier simplified browse screen", reason: "missing", expected: ["case-shots/budgetcart/browse-before.png"], note: "The version that hid brand, store and price. Export from the team Figma file.", aspect: "339 / 750" },
      after: { src: "/case-shots/budgetcart/item-first-browse.png", alt: "Revised BudgetCart browse screen with prices visible", caption: "Revised browse", ...phone, owner: "team", ownerNote: "Anne's flow" },
      changed: "Brand, store and price came back onto the browse screen.",
      why: "Testers struggled to find items and trusted their choices less without them.",
      evidence: "untested",
    },
    evaluation: {
      method: "Prototype task testing with the high-fidelity Figma prototype.",
      learned: ["Hiding brand, store and price made items harder to find and choices harder to trust."],
      notTested: ["The revised screens", "Long-term spending or checkout behavior"],
    },
    outcome: {
      confirmed: "Prototype tasks tested; the browse and store screens were revised in response.",
      limitation: "Not a live service. No change in spending measured, and the revisions weren't retested.",
      next: "In a retest, do shoppers find items faster and put fewer back at checkout?",
    },
    ai: "The AI cart builder drafts a starting cart from a budget and needs; shoppers edit it rather than starting from an empty prompt.",
  },

  {
    slug: "openlibrary",
    name: "Open Library",
    org: "Internet Archive · SI 500 client project",
    product: "Research into how multilingual readers use language support while reading, with recommendations for the Open Library team.",
    role: "Client calls, interviews, my first affinity map, synthesis and report organization",
    team: "Five-person SI 500 team (In4mation)",
    timeline: "Aug – Dec 2025",
    status: "Research report and recommendations delivered. No live product test.",
    contributions: {
      mine: [
        "Contributed to interviews and client calls",
        "Built my first affinity map",
        "Helped organize the final report, summarize progress and set next steps",
      ],
      team: ["Eight semi-structured interviews", "330 data points mapped as a team"],
    },
    hero: {
      type: "slot",
      slot: {
        label: "Team affinity map",
        reason: "missing",
        expected: ["case-shots/openlibrary/affinity-map.jpg"],
        note: "Cleared photo or crop of the team's map. The Framer Open Library page has the two original images.",
        aspect: "16 / 10",
      },
    },
    context: [
      "All five of us were international students, so language access felt familiar. That was a reason to check our assumptions, not skip research.",
      "We interviewed students, academic-support staff and subject-matter experts in the U-M community about reading in a second language.",
    ],
    decisions: [
      {
        title: "Let the interviews change the question",
        chose: "Focus on the switching between tools",
        over: "Our starting assumption that readers lacked translation tools",
        because: "Readers had tools; moving between the book, dictionaries and translators cost them their place.",
        evidence: "Eight interviews, synthesized into 330 data points.",
        owner: "team",
      },
      {
        title: "Recommend surfacing what exists",
        chose: "Make existing translation and comprehension support easier to find inside the reading flow",
        over: "Adding another separate translation tool",
        because: "A new tool would leave the switching problem in place.",
        evidence: "Team synthesis. A proposal, not an implemented interface. Copyright, privacy and feasibility were open constraints.",
        owner: "team",
      },
    ],
    slots: [
      { label: "Recommendation visual", reason: "missing", expected: ["case-shots/openlibrary/recommendation.png"], note: "Existing recommendation image from the report or the Framer page. Label it as a proposal.", aspect: "16 / 10" },
    ],
    evaluation: {
      method: "Eight semi-structured interviews; team affinity mapping of 330 data points.",
      learned: [
        "Readers switched between books, dictionaries and translation tools.",
        "Academic and technical language led some readers to cross-check terms or keep personal glossaries.",
      ],
      notTested: ["Any of the recommendations with readers"],
    },
    outcome: {
      confirmed: "Report and recommendations delivered. Open Library later improved its feedback process and increased its investment in the project.",
      limitation: "That's a partner response, not a measured reader outcome. Nothing was built or tested.",
      next: "Can readers find language help without losing their place, and do they trust it?",
    },
    links: [{ label: "Read the research report", href: "https://docs.google.com/document/d/1A3DYPNe7f7799FZ6WSzoFFgkkHUHTBwmLgYzPkPPsjs/edit" }],
  },
]

/** Plain-text version for the chat APIs. Only fields from the case study itself. */
export function caseStudyText(c: CaseStudy): string {
  return [
    `## ${c.name} · ${c.org} | link: /work/${c.slug}`,
    c.product,
    `Role: ${c.role}; Team: ${c.team}; When: ${c.timeline}; Status: ${c.status}`,
    `Dhwani's own work: ${c.contributions.mine.join("; ")}.`,
    c.contributions.team?.length ? `Team work: ${c.contributions.team.join("; ")}.` : "",
    c.context.join(" "),
    ...c.decisions.map((d) => `Decision (${d.owner === "mine" ? "hers" : d.owner === "team" ? "team" : "shared"}): ${d.title}. Chose ${d.chose} over ${d.over}. ${d.because} Evidence: ${d.evidence}`),
    `Evaluation: ${c.evaluation.method} Learned: ${c.evaluation.learned.join(" ")} Not tested: ${c.evaluation.notTested.join("; ")}.`,
    c.ai ? `AI: ${c.ai}` : "",
    `Outcome: ${c.outcome.confirmed} Limitation: ${c.outcome.limitation} Open question: ${c.outcome.next}`,
  ].filter(Boolean).join("\n")
}
