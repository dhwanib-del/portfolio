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
}

export const cases: Case[] = [
  {
    slug: "briefs",
    org: "BRIEFS · U-M Division of Public Safety & Security",
    headline: "In a time-sensitive workflow, information has to be easy to find and easy to verify.",
    hook: "Building information lived in long records. The person looking for it needed a predictable way to the right detail.",
    meta: [
      { label: "Role", value: "UX design intern: research, IA, prototype, PRD" },
      { label: "Team", value: "With Aaron Tucker, DPSS" },
      { label: "When", value: "Summer 2026" },
      { label: "Status", value: "Interactive prototype + PRD, not shipped" },
    ],
    sections: [
      { heading: "I watched dispatchers work, then structured every profile the same way.", body: ["The redesign makes each building profile easy to scan without turning every item into an alert. The most important details stay visible; the rest sits one predictable step away."] },
      { heading: "The assistant had to show its work, not just be fast.", body: ["It answers only from approved records, shows where each answer came from, and says plainly when the records don't have it. When AI helped restructure older documents, a person reviewed every proposed change."] },
    ],
    ai: "AI is in the product, with guardrails: cited answers, an honest \"not in the records\", and human review before any record changes.",
    status: "Prototype and PRD handed to DPSS. Not launched.",
    next: "Test with dispatchers: can they find a detail, verify the answer and trust the structure under real conditions?",
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
    figures: [],
  },
  {
    slug: "openlibrary",
    org: "Open Library · Internet Archive",
    headline: "The reader's problem wasn't only translation. It was losing the thread.",
    hook: "In eight interviews, readers who hit unfamiliar language left the book to find help, and lost their place and their trust in the answer.",
    meta: [
      { label: "Role", value: "UX researcher: interviews, survey, synthesis, recommendations" },
      { label: "Team", value: "5-person course team (SI 500)" },
      { label: "When", value: "Aug – Dec 2025" },
      { label: "Status", value: "Recommendations; Open Library acted on them" },
    ],
    sections: [
      { heading: "A better translator alone wouldn't fix it.", body: ["The fix had to keep people in the passage. We recommended bringing existing language support into the reading flow, optional contextual help, and a lightweight way to report problems."] },
      { heading: "I drove the research and pushed all three recommendations.", body: ["We worked inside copyright, privacy and academic-integrity limits, so every recommendation was something the library could realistically build."] },
    ],
    ai: "One recommendation was an optional AI reading assistant, kept inside the reading view so answers don't pull people away from the book.",
    status: "After our research, Open Library improved its feedback flow and added context around international books.",
    next: "Test whether readers get help and return to the same passage with less interruption.",
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
    figures: [],
  },
]
