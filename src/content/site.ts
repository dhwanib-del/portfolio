// All site copy lives here so it can be edited without touching components.

export const person = {
  name: "Dhwani Bagrecha",
  roles: "Product · UX · Experience designer",
  school: "MS, University of Michigan School of Information",
  grad: "May 2027",
  location: "Ann Arbor, open to moving anywhere",
  email: "", // add to show an email button
  linkedin: "", // add to show a LinkedIn button
  resume: "", // e.g. "/resume.pdf"
}

export const bubbleLines = [
  "open to work · let's build something →",
  "currently: a prime video capstone (under nda 🤫)",
  "psych degree in 3 years, now designing at umsi",
  "adobe student ambassador ✨",
  "ann arbor based · happy to move ✈️",
]

export type Project = {
  slug: string
  title: string // "Project · Org"
  result: string // the one line a recruiter reads
  tags: string[]
  body: string // 2–3 blunt lines
  video?: string // /media/<slug>.mp4
  image?: string // /work/<slug>/cover.jpg
  poster?: string
  nda?: boolean
  hint: string // talk-to-me cursor line
  brand?: "dpss" | "gm" | "openlibrary" | "primevideo"
}

export const projects: Project[] = [
  {
    slug: "briefs",
    title: "BRIEFS · UM DPSS",
    result: "A clearer path through seven dispatch screens",
    tags: ["Contextual inquiry", "Workflow", "Apps Script"],
    body: "In my first contextual inquiry, I watched dispatchers search across seven screens. Starting with no design files, I mapped the workflow and built a prototype + PRD, then explored a Sheets-backed Apps Script.",
    hint: "dispatchers, mid-call, no time to dig →",
    brand: "dpss",
  },
  {
    slug: "intel",
    title: "Intel workspace · UM DPSS",
    result: "Case history in one shared workspace",
    tags: ["Case management", "Stakeholder research", "Workflow"],
    body: "The concept connects requests and investigation work in a shared, role-aware workspace. The public screens use fictional demo records.",
    hint: "explore the fictional workflow demo →",
  },
  {
    slug: "general-motors",
    title: "Convoy · General Motors",
    result: "I challenged the biometric direction",
    tags: ["HMI", "Advanced prototyping", "Design system"],
    body: "I pushed us from biometrics toward a community-centered convoy. I built advanced Figma interactions and reusable components in our first shared design system; cab testing helped us weigh the trade-offs.",
    hint: "group coordination across phone and vehicle →",
    brand: "gm",
  },
  {
    slug: "prime-video",
    title: "Prime Video · Capstone",
    result: "Under NDA",
    tags: ["Streaming", "Capstone"],
    body: "Current capstone with Prime Video. Nothing goes here until it's cleared. Ask me about the process.",
    nda: true,
    hint: "NDA 🔒 ask me about this one",
    brand: "primevideo",
  },
  {
    slug: "openlibrary",
    title: "Open Library · Internet Archive",
    result: "Language help, inside the reading flow",
    tags: ["Research", "Multilingual", "Accessibility"],
    body: "I contributed to interviews, client calls and my first affinity map. Our team synthesized 330 data points into recommendations for multilingual reading access.",
    hint: "language help in the reading flow →",
    brand: "openlibrary",
  },
  {
    slug: "budgetcart",
    title: "BudgetCart · UMSI",
    result: "Better grocery deals, built around SNAP/WIC",
    tags: ["Grocery", "SNAP / WIC", "Budgeting"],
    body: "My first Figma project: stakeholder interviews, paper prototypes, and a self-taught component system. We explored a concept that prioritized SNAP/WIC needs and better grocery deals.",
    hint: "the moment before checkout →",
  },
]

export type Role = { org: string; role: string; dates: string; summary: string; current?: boolean }

// Newest first
export const experience: Role[] = [
  { org: "Adobe", role: "Student Ambassador", dates: "Jul 2026 – now", summary: "Workshops, content and campus events for creative students.", current: true },
  { org: "U-M Division of Public Safety & Security", role: "UX Design Intern", dates: "Summer 2026", summary: "Designed building-information and case-management workflows for DPSS." },
  { org: "General Motors", role: "UX Researcher & Designer", dates: "Jan – May 2026", summary: "In-vehicle interaction prototyping for the GM-affiliated Convoy project." },
  { org: "Iska Press for African Perspectives", role: "UX Researcher & Project Manager", dates: "Jan – May 2026", summary: "Led a research and project-management consulting engagement." },
  { org: "SOCHI, University of Michigan", role: "Project Manager & UX Researcher", dates: "Sep 2025 – May 2026", summary: "Product strategy, research and project management." },
  { org: "U-M Global Scholars Program", role: "Project Manager & Social Media Coordinator", dates: "Aug 2025 – May 2026", summary: "Led project teams and global community programming." },
  { org: "Open Library", role: "UX Researcher", dates: "Aug – Dec 2025", summary: "Multilingual reading research, affinity mapping, and recommendations for in-book language support." },
  { org: "MSU College of Social Science", role: "Research Assistant", dates: "May 2024 – May 2025", summary: "Organized and analyzed eye-tracking data for behavioral research." },
  { org: "Miller Johnson", role: "Human Resources Systems Intern", dates: "Jun – Aug 2024", summary: "Internal systems and operations at a law firm." },
  { org: "DDB Mudra Group", role: "User Experience DEI Intern", dates: "Jun – Aug 2023", summary: "Research on accessible social media and representation in advertising." },
]
