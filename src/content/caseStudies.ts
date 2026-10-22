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
    challenge: "How do you design a road-trip experience that feels like it came with a GM truck, instead of a phone app stuck to the dashboard?",
    role: "Interface explorations, interactive Figma prototypes, reusable components",
    team: "Three designers: me, Sara and Julia",
    timeline: "Jan – May 2026",
    status: "Concept prototype. Tested three times in a physical vehicle mockup, never on the road.",
    contributions: {
      mine: [
        "Explored driver- and center-display interface layouts",
        "Built interactive Figma prototypes",
        "Helped build the shared design library and reusable components",
      ],
      team: [
        "Explored HVAC and in-drive views at vehicle size",
        "Ran three usability tests in a physical vehicle mockup",
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
      "GM asked our team to explore experiences for a future electric truck. Our first idea used biometrics to personalize the vehicle for a single driver.",
      "Then we talked to a truck driver. The conversation was about planning trips and keeping a group together across separate cars, so we dropped the biometric idea and started designing for people traveling together.",
    ],
    decisions: [
      {
        title: "From one driver to a group road trip",
        chose: "A convoy concept for a group traveling in several vehicles",
        over: "Personalizing the drive for a single driver with biometrics",
        because: "The interview centered on planning and staying together across cars, and the biometric concept didn't address either.",
        evidence: "One interview with a truck driver, talked through as a team. Changing direction was a team call.",
        owner: "shared",
      },
      {
        title: "Plan on the phone. Keep driving updates simple.",
        chose: "Trip planning on the phone; the car screen shows where everyone is and how the group is doing",
        over: "Putting planning on the in-car display",
        because: "Groups can plan together on their phones before they leave. Once they're driving, the car screen only needs the essentials about the group.",
        evidence: "Team rationale, tried in the three cab tests. We haven't tested whether those updates are easy and safe to read on the road.",
        owner: "team",
      },
      {
        title: "A dark interface that feels at home in a Silverado",
        chose: "A dark-mode visual direction for the in-car screens",
        over: "A light-mode visual direction",
        because: "We wanted Convoy to look like it shipped with the truck. Dark mode was part of getting there.",
        evidence: "A visual direction the team chose. We're not claiming it makes driving safer, and we didn't validate contrast in testing.",
        owner: "shared",
      },
      {
        title: "Who should organize the trip?",
        chose: "One person organizes the trip and sets the plan",
        over: "Everyone in the group editing the plan equally",
        because: "We explored giving one person control of the shared trip plan.",
        evidence: "Still open. We didn't test whether the rest of the group feels included under that setup.",
        owner: "team",
      },
    ],
    slots: [
      { label: "Driver display sketches and alternatives", reason: "missing", expected: ["case-shots/gm/display-iterations.png"], note: "Use original versions from the GM Figma file to show layout decisions.", aspect: "16 / 9" },
      { label: "Shared component library and variants", reason: "missing", expected: ["case-shots/gm/component-library.png"], note: "Show the real components, states and where they appear in final screens.", aspect: "16 / 9" },
      { label: "Early biometric exploration", reason: "missing", expected: ["case-shots/gm/biometric-early.png"], note: "Shows the direction we moved away from.", aspect: "16 / 10" },
      { label: "Phone trip-planning screen", reason: "missing", expected: ["case-shots/gm/phone-planning.png"], note: "Final phone export.", aspect: "9 / 19.5" },
      { label: "Physical prototype test photo", reason: "clearance", expected: ["case-shots/gm/cab-test.jpg"], note: "Only with permission from the team and sponsor; don't show participant faces.", aspect: "4 / 3" },
    ],
    evaluation: {
      method: "Three usability tests in a physical vehicle mockup, run by the team.",
      learned: [
        "Testing in a physical setup showed us how the screens held up outside Figma.",
        "How much control the trip organizer should have was still an open question afterward.",
      ],
      notTested: ["Real driving conditions", "Whether in-car updates are easy and safe to use while driving", "How the rest of the group feels about the organizer role"],
    },
    outcome: {
      confirmed: "A concept prototype, evaluated in three usability sessions.",
      limitation: "Not tested in real driving conditions, and some details can't be shared publicly.",
      next: "How much control should the trip organizer have?",
    },
  },

  {
    slug: "briefs",
    name: "BRIEFS",
    org: "U-M Division of Public Safety & Security",
    product: "A tool that helps U-M emergency dispatchers find a building's contacts, access details, hazards and floor plans during a call.",
    role: "UX design intern: contextual inquiry, information architecture, prototype, PRD",
    team: "With Aaron Tucker, DPSS",
    timeline: "Summer 2026",
    status: "Interactive prototype and PRD handed off to DPSS. Not launched, and not tested with dispatchers yet.",
    contributions: {
      mine: [
        "Ran contextual inquiry with the DPSS Dispatch Group",
        "Mapped the lookup workflow across every tool it touched",
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
      "I sat with dispatchers during their shifts. Building information lived in PDFs, Dropbox and other tools. One workstation had seven screens, and a single lookup touched more than ten tools. To check whether a building contact still worked at U-M, a dispatcher had to jump into MCommunity too.",
      "There were no design files to start from. My field notes also turned up outdated contacts and building details, which meant a faster search on its own would just surface the wrong record sooner.",
    ],
    decisions: [
      {
        title: "Pin the urgent details",
        chose: "A persistent strip with the details needed mid-call, visible from every section of the profile",
        over: "Giving every piece of building information equal weight",
        because: "Mid-call, a dispatcher needs contacts, access and hazards while they move through the rest of the profile. The strip takes up screen space, and I decided the mid-call task was worth it.",
        evidence: "Based on what I saw during contextual inquiry. Not tested with dispatchers yet.",
        owner: "mine",
      },
      {
        title: "Predictable sections instead of one long document",
        chose: "Tabbed sections with a stable home for each kind of information",
        over: "A single scrolling document per building, like the existing PDFs",
        because: "A dispatcher shouldn't have to remember where a detail is buried in a long file.",
        evidence: "I went through several design-direction rounds and fixed sticky-header, tab-navigation and icon-meaning problems in my own prototype along the way. Reviewed internally; no dispatcher test yet.",
        owner: "mine",
      },
      {
        title: "A record has to be current, not just findable",
        chose: "Include checking and maintaining records in the scope",
        over: "Only making the lookup faster",
        because: "Finding an outdated contact faster doesn't help anyone on a call.",
        evidence: "From my field notes. Who maintains the records is still unresolved.",
        owner: "mine",
      },
    ],
    evaluation: {
      method: "Contextual inquiry with the DPSS Dispatch Group; internal reviews of my prototype iterations.",
      learned: [
        "The lookup spans many tools. Fixing one document wouldn't solve it.",
        "Keeping records current matters as much as finding them quickly.",
      ],
      notTested: ["Dispatcher use of the prototype", "The 30-second lookup goal", "Who maintains the records"],
    },
    outcome: {
      confirmed: "Prototype and PRD handed off to DPSS.",
      limitation: "It hasn't launched or been tested with dispatchers, and nobody owns record upkeep yet.",
      next: "On a real shift, can a dispatcher find a detail, check that it's current, and trust the structure?",
    },
    ai: "In the PRD, I proposed an assistant that answers only from approved records, cites its source, and says when something is missing. Any change to a document needs a person to approve it.",
  },

  {
    slug: "intel",
    name: "Intelligence Hub",
    org: "Intelligence Group workspace · U-M DPSS",
    product: "A shared workspace where a DPSS analyst team keeps requests, investigation work, reviews and next steps together. Built as a Google Apps Script web app.",
    role: "Co-lead: stakeholder interviews, workflow design, Apps Script prototype, PRD",
    team: "Co-led with Aaron Tucker, DPSS",
    timeline: "2026",
    status: "Piloted internally, and the team is working the feedback into the tool. No impact metrics claimed.",
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
      "The Intelligence Group kept requests in one place and investigation work in another. Whoever picked up a case had to piece its history back together.",
      "BRIEFS and this workspace are separate projects. This one is about casework: who asked for what, what's been done, who owns it, and what happens next.",
    ],
    decisions: [
      {
        title: "Role-aware views",
        chose: "Navigation and dashboards that change with the person's role",
        over: "One undifferentiated view for everyone",
        because: "Everyone works from the same case, but not everyone should see everything.",
        evidence: "From the stakeholder interview session I led.",
        owner: "shared",
      },
      {
        title: "Keep the case's history attached to the case",
        chose: "Request, status, owner and history stay with the case as the view changes",
        over: "Separate intake and spreadsheet tracking",
        because: "The next analyst should be able to see what happened before the case reached them.",
        evidence: "Stakeholder interviews first, then the internal pilot.",
        owner: "shared",
      },
    ],
    evaluation: {
      method: "Full-team stakeholder interviews before design; an internal pilot with feedback collected by the team.",
      learned: ["We're still working through pilot feedback, so I'm not publishing findings or impact from it yet."],
      notTested: ["Whether the workspace makes casework faster or more accurate"],
    },
    outcome: {
      confirmed: "The workspace went through an internal pilot, which I co-led.",
      limitation: "No claims about speed or quality, and the screens stay internal to DPSS.",
      next: "Can each role identify the next action on a case without asking someone?",
    },
  },

  {
    slug: "budgetcart",
    name: "BudgetCart",
    org: "UMSI course project",
    product: "A mobile grocery concept for shopping on a budget with SNAP/WIC eligibility and dietary needs built in, plus an assistant that drafts a starting cart you can edit.",
    role: "Interviews, paper prototypes, the AI cart builder and Budget Calendar, Figma components",
    team: "Three designers: me, Anne and Tunisia",
    timeline: "UMSI course project",
    status: "Prototype tested through task-based sessions. Not a live service.",
    contributions: {
      mine: [
        "Owned the AI cart builder interaction and the Budget Calendar",
        "Did interviews and paper prototypes before moving to Figma",
        "Taught myself Figma components and built the visual language with the team",
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
      "BudgetCart looked at grocery shopping when several constraints pile up at once: a weekly budget, SNAP/WIC eligibility and dietary needs.",
      "I started with interviews and paper prototypes before opening Figma. It was my first Figma project.",
    ],
    decisions: [
      {
        title: "Show the cues people choose with",
        chose: "Item-first browsing with price, brand and store visible",
        over: "Hiding brand, store and price to make the screen look cleaner",
        because: "When those details were hidden in testing, people had a harder time finding items and trusted their picks less.",
        evidence: "Prototype task testing. We didn't retest the revised screens.",
        owner: "team",
      },
      {
        title: "Give the AI a starting point",
        chose: "Upload cues and a starter prompt in the cart builder",
        over: "An empty chat input",
        because: "An empty prompt doesn't tell a shopper what the assistant can do. The cart it drafts is a starting point, and they edit from there.",
        evidence: "My design rationale. Not retested.",
        owner: "mine",
      },
      {
        title: "Keep the budget in view while shopping",
        chose: "Budget and spending days in a calendar the shopper can check any time",
        over: "Showing the budget only at checkout",
        because: "The budget matters while you're choosing, not after you've checked out.",
        evidence: "Design rationale. We didn't measure spending.",
        owner: "mine",
      },
    ],
    experience: {
      heading: "Choosing a store",
      intro: "Anne's store-comparison step puts eligibility and totals right next to the choice. The browse screen shows up in the before/after below.",
      screens: [
        {
          src: "/case-shots/budgetcart/store-comparison.png", alt: "BudgetCart Select a Store screen comparing cart totals at Costco and Aldi with eligibility labels", caption: "Store comparison", ...phone, owner: "team", ownerNote: "Anne's flow",
          annotations: [
            { x: 52, y: 27, title: "Eligibility before checkout", body: "SNAP/WIC and dietary labels appear where the shopper picks a store." },
            { x: 86, y: 51.5, title: "Total per store", body: "Stores are compared by cart total, since that's the number the budget decision hangs on." },
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
      changed: "Brand, store and price went back on the browse screen.",
      why: "Testers struggled to find items and trusted their choices less without them.",
      evidence: "untested",
    },
    evaluation: {
      method: "Prototype task testing with the high-fidelity Figma prototype.",
      learned: ["Hiding brand, store and price made items harder to find and choices harder to trust."],
      notTested: ["The revised screens", "Long-term spending or checkout behavior"],
    },
    outcome: {
      confirmed: "Tested with prototype tasks, then revised the browse and store screens based on what we saw.",
      limitation: "Not a live service. We didn't measure spending, and the revisions weren't retested.",
      next: "In a retest, do shoppers find items faster and put fewer back at checkout?",
    },
    ai: "The AI cart builder drafts a starting cart from a shopper's budget and needs. They edit that draft instead of staring at an empty prompt.",
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
      "All five of us were international students, so language access felt familiar. That familiarity was exactly why we had to check our assumptions.",
      "We interviewed students, academic-support staff and subject-matter experts in the U-M community about reading in a second language.",
    ],
    decisions: [
      {
        title: "Let the interviews change the question",
        chose: "Focus on the switching between tools",
        over: "Our starting assumption that readers lacked translation tools",
        because: "Readers already had tools. Bouncing between the book, dictionaries and translators is what cost them their place.",
        evidence: "Eight interviews, synthesized into 330 data points.",
        owner: "team",
      },
      {
        title: "Recommend surfacing what exists",
        chose: "Make existing translation and comprehension support easier to find inside the reading flow",
        over: "Adding another separate translation tool",
        because: "A new tool would leave the switching problem exactly where it was.",
        evidence: "Team synthesis. It's a proposal, not a built interface, and copyright, privacy and feasibility were still open questions.",
        owner: "team",
      },
    ],
    slots: [
      { label: "Recommendation visual", reason: "missing", expected: ["case-shots/openlibrary/recommendation.png"], note: "Existing recommendation image from the report or the Framer page. Label it as a proposal.", aspect: "16 / 10" },
    ],
    evaluation: {
      method: "Eight semi-structured interviews; team affinity mapping of 330 data points.",
      learned: [
        "Readers kept switching between books, dictionaries and translation tools.",
        "Academic and technical language led some readers to cross-check terms or keep personal glossaries.",
      ],
      notTested: ["Any of the recommendations with readers"],
    },
    outcome: {
      confirmed: "Report and recommendations delivered. Open Library later improved its feedback process and increased its investment in the project.",
      limitation: "That's the partner's response, not a measured change for readers. Nothing was built or tested.",
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
