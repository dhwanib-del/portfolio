// Case studies. Source: "Dhwani Bagrecha — Portfolio Content" (story-led drafts) + facts Dhwani confirmed.
// Kept short on purpose: hook, TL;DR, 3 short sections, honest status. Screens go in `figures`
// (drop files in /public/media/<slug>/ and list them here with a caption that says what to notice).

export type Figure = { src: string; alt: string; caption: string; video?: boolean }
export type Section = { heading: string; body: string[] }
export type Case = {
  slug: string
  org: string
  headline: string
  hook: string
  meta: { label: string; value: string }[]
  sections: Section[]
  ai?: string
  status: string
  next: string
  figures: Figure[]
  decision?: { tension: string; decision: string; why: string; rejected: string }
  stats?: { value: number; prefix?: string; suffix?: string; label: string }[]
  video?: string // e.g. /media/briefs.mp4 — the main clip under the header
  claim?: { pre?: string; emphasis: string; post?: string } // one big sentence: the strongest moment
  scene?: "briefs" // a drawn before/after placed after the first section
}

export const cases: Case[] = [
  {
    slug: "briefs",
    org: "BRIEFS · U-M Division of Public Safety & Security",
    headline: "The information was there. The hard part was finding it during a call.",
    hook: "Dispatchers needed building details mid-call: who to call, how to get in, what to watch for. Those details lived in long PDFs and across more than ten tools.",
    meta: [
      { label: "Role", value: "UX design intern: field research, IA, prototype, PRD" },
      { label: "Team", value: "With Aaron Tucker, DPSS" },
      { label: "When", value: "Summer 2026" },
      { label: "Status", value: "Interactive prototype + PRD, not shipped" },
    ],
    claim: { pre: "A dispatcher shouldn't have to ", emphasis: "scroll a PDF", post: " to find one phone number." },
    stats: [
      { value: 7, label: "screens at one dispatch workstation" },
      { value: 10, suffix: "+", label: "tools in the lookup" },
      { value: 30, suffix: "s", label: "goal to find a detail · not yet tested" },
    ],
    sections: [
      { heading: "I sat in the dispatch center and watched the lookup happen.", body: ["One workstation, seven screens. To answer a building question, a dispatcher found the right file in Dropbox, scrolled it by hand, then checked another system to make sure the contact was still current. Then back to the call.", "Nothing was missing. It just had no predictable place."] },
      { heading: "So every building profile got the same five places.", body: ["Response, contacts, maps and floor plans, documents, details. Same order, every building. The few details that matter mid-call sit in a strip that stays visible while you move between sections."] },
      { heading: "The assistant had to show its work.", body: ["Fast answers are useless if you can't check them. It answers only from approved records, links to where each answer came from, and says \"that's not in the records\" instead of guessing. When AI helped restructure old documents, a person approved every change."] },
    ],
    ai: "AI is in the product, with guardrails: answers cite the record, it admits when the records don't say, and nothing changes without a person approving it.",
    status: "Prototype and PRD handed to DPSS. Not launched, and the 30-second goal hasn't been tested yet.",
    next: "Put it in front of dispatchers: can they find a detail, check the answer, and trust the structure on a real shift?",
    decision: { tension: "The tradeoff", decision: "Warnings only for things you act on now. Everything else stays calm and findable.", why: "When every field shouts, nothing does. A fixed structure lets someone find the one detail they need. The pinned strip costs screen space, and I chose that on purpose.", rejected: "Turning every item into an alert" },
    scene: "briefs",
    figures: [],
  },
  {
    slug: "intel",
    org: "Intel workspace · U-M Division of Public Safety & Security",
    headline: "A shared view is only useful when it gives the right people the right context.",
    hook: "The Intelligence Group tracked sensitive, multi-step work across spreadsheets. Handoffs were where things got lost.",
    meta: [
      { label: "Role", value: "UX design intern: workflow design, prototype" },
      { label: "Team", value: "With Aaron Tucker, DPSS" },
      { label: "When", value: "2026" },
      { label: "Status", value: "In use by the team" },
    ],
    sections: [
      { heading: "The problem was clarity at the handoff.", body: ["Someone picking up a case needs to see where it stands, what needs attention and what happens next, without seeing more than their role needs."] },
      { heading: "I built it where we could test it safely.", body: ["The first version ran in Google Apps Script so the team could try it without touching production systems. Public tips now come in through a chatbot intake. The team has since started building its own server version."] },
    ],
    ai: "The public intake is a chatbot, so reports arrive structured instead of as free-form messages.",
    status: "In use by the Intelligence Group. Shown here at workflow level with invented records.",
    next: "Measure time from intake to first review now that reports arrive structured.",
    decision: { tension: "The scope call", decision: "Make the handoff clear instead of replacing the team's tools.", why: "The team still relies on its monitoring apps. The workspace connects the work around them, so it got used.", rejected: "Replacing the team's monitoring apps with one platform" },
    figures: [],
  },
  {
    slug: "general-motors",
    org: "Convoy · General Motors",
    headline: "Most cars are designed around one driver. Our trip wasn't.",
    hook: "We started with how a vehicle could personalize the drive for one person. One driver interview reframed it: a road trip is a group coordinating across phones, screens and messages.",
    meta: [
      { label: "Role", value: "UX researcher & designer: research, advanced prototyping" },
      { label: "Team", value: "With Sara and Julia, GM-sponsored" },
      { label: "When", value: "Jan – May 2026" },
      { label: "Status", value: "Concept, tested in a 3D-printed truck cab" },
    ],
    sections: [
      { heading: "We cut four weeks of biometric work to design for the whole trip.", body: ["The first direction was technically interesting and disconnected from the need. Planning stayed on the phone, where groups already organize. In the car, the screen shows position, spacing and group status, not another phone on the dashboard."] },
      { heading: "I prototyped the in-cab controls on real screens.", body: ["HVAC and in-drive views were built in Figma and run on vehicle-size screens alongside other prototyping tools, so testers reached for them the way they would while driving. A host coordinates the plan; everyone else follows and can signal when they need something."] },
    ],
    status: "Concept. Three usability tests in a 3D-printed cab. Details stay under NDA, so no real-world claims.",
    next: "Does a host make the group feel organized, or controlled?",
    decision: { tension: "Four weeks in", decision: "Cut the biometric work and design for the whole trip.", why: "One driver interview showed the real job: a group coordinating across phones, screens and messages while moving.", rejected: "Personalizing the drive for a single driver" },
    stats: [{ value: 4, label: "weeks of work cut at the pivot" }, { value: 3, label: "usability tests in a truck cab" }, { value: 1, label: "interview that changed the brief" }],
    figures: [],
  },
  // Sources: "UMSI x Open Library_ Final Report" (methods, findings, recommendations, limitations) and "Dhwani Bagrecha — Portfolio Content" (personal contribution and reflection). The report supports the research and proposed direction; it does not establish live implementation or measured impact.
  {
    slug: "openlibrary",
    org: "Open Library · Internet Archive",
    headline: "Readers needed language support without leaving the book.",
    hook: "Across eight interviews with multilingual students, academic-support staff, and subject-matter experts, our team heard a pattern: a difficult passage could send readers between Open Library, translation tools, and dictionaries. Each switch cost context; doubts about technical terms led readers to cross-check.",
    meta: [
      { label: "My role", value: "Interviews, affinity-wall synthesis, report organization, team coordination" },
      { label: "Team", value: "Five-person SI 500 team · In4mation" },
      { label: "Project", value: "SI 500 partner project" },
      { label: "Status", value: "Research report + recommendations; no live product test" },
    ],
    claim: { pre: "The problem wasn’t only translation quality. It was ", emphasis: "leaving the book for help", post: "." },
    stats: [
      { value: 8, label: "semi-structured interviews · team research" },
      { value: 330, label: "data points in the team affinity wall" },
    ],
    sections: [
      {
        heading: "The research pointed to the gaps between tools.",
        body: [
          "Our team paired interviews with an UMSI community survey and literature review. I helped synthesize 330 data points on the affinity wall. Readers described switching between the book, translation tools, dictionaries, and other sources; uncertainty around academic and technical terms made them check meaning in several places.",
          "The barrier was bigger than whether a translation tool worked. Language support was hard to discover, scattered across the reading process, and difficult to trust in context.",
        ],
      },
      {
        heading: "The answer wasn’t another standalone translator.",
        body: [
          "We began by asking how to improve language access. Peer and partner feedback pushed us back to the evidence, where we found that some support already existed but was easy to miss. The team shifted from proposing a new tool to making existing help easier to find and use while reading.",
          "We recommended moving translation into the primary reading controls, grouping related language support, and offering a prompt when a book’s language differs from the reader’s interface language. I also helped organize the report and keep the team aligned on next steps.",
        ],
      },
    ],
    ai: "We did not use AI to produce this project. As a possible product direction, the team proposed optional, consent-based AI explanations for selected text, limited to comprehension support. This remained a recommendation and would need privacy, copyright, and academic-integrity review.",
    status: "The project produced a research report and recommendations. We did not implement or test a prototype in the live Open Library interface, so adoption and product impact are unknown.",
    next: "If revisited, test whether readers can find support, get help without losing their place, and judge when a translation needs checking.",
    decision: {
      tension: "What the evidence changed",
      decision: "Make existing support easier to find before adding another tool.",
      why: "Readers already lost context while switching between tools. The recommendations focused on visibility and integration, with privacy, copyright, and academic integrity treated as product constraints.",
      rejected: "A separate translation product that adds another stop to the reading workflow",
    },
    figures: [],
  },
  {
    slug: "budgetcart",
    org: "BudgetCart · UMSI",
    headline: "A grocery cart is a budget decision, one item at a time.",
    hook: "Shoppers balancing cost, benefits eligibility and dietary needs aren't just looking for food. They're deciding what they can confidently put in the cart.",
    meta: [
      { label: "Role", value: "Product designer: budget tracking and AI cart-building flows" },
      { label: "Team", value: "3 designers" },
      { label: "When", value: "UMSI project" },
      { label: "Status", value: "Concept, tested as a prototype" },
    ],
    sections: [
      { heading: "Hiding prices to look simple backfired.", body: ["Our early interface removed brands, stores and prices. In testing, people struggled to find items and trusted their choices less. We made browsing item-first, kept the lowest price visible, and moved store comparisons to the moment people make that tradeoff."] },
      { heading: "Make the decision lighter without hiding the information behind it.", body: ["Budget context shows while people shop. Eligibility and dietary safety appear before checkout. The AI cart builder helps someone start a cart instead of leaving them with a blank prompt."] },
    ],
    ai: "The AI cart builder drafts a starting cart from a budget and needs; people edit it, they don't start from an empty prompt.",
    status: "Prototype tasks tested, not a live service. No measured change in spending yet.",
    next: "Measure whether shoppers put fewer items back at checkout.",
    decision: { tension: "What testing showed", decision: "Keep the lowest price visible and compare stores where the tradeoff happens.", why: "People trusted their cart less when we hid the numbers. Simple can't mean hidden.", rejected: "Hiding brands, stores and prices to look simple" },
    figures: [],
  },
]
