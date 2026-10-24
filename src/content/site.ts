// All site copy lives here so it can be edited without touching components.

export const person = {
  name: "Dhwani Bagrecha",
  roles: "Product · UX · Experience designer",
  school: "MS, University of Michigan School of Information",
  grad: "May 2027",
  location: "Ann Arbor, open to moving anywhere",
  email: "", // add to show an email button
  linkedin: "", // add to show a LinkedIn button
  resume: "/resume", // stable résumé route; update destination in src/app/resume/page.tsx
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
  /** real screens for the card cover (phone exports) */
  coverScreens?: string[]
  /** shown on the typographic cover when there are no public screens */
  coverNote?: string
  nda?: boolean
  hint: string // talk-to-me cursor line
  brand?: "dpss" | "gm" | "openlibrary" | "primevideo"
}

export const projects: Project[] = [
  {
    slug: "general-motors",
    title: "Convoy · General Motors",
    result: "One interview changed a single-driver idea into a shared road-trip concept",
    tags: ["Automotive UI", "Design system", "Figma prototyping"],
    body: "A GM-sponsored team concept for groups road-tripping in separate cars. We explored interface layouts, built a reusable component library, and made an interactive prototype, then put it through three usability sessions.",
    coverNote: "Concept prototype · three cab tests",
    video: "https://framerusercontent.com/assets/0dibZtjqrd9g6cmZW8QH3f2A0Q.mov",
    poster: "https://framerusercontent.com/images/29A0ZOMxfReybbtzuRfATcryUjg.png",
    hint: "See the layouts, components, and prototype →",
    brand: "gm",
  },
  {
    slug: "intel",
    title: "Intelligence Hub · UM DPSS",
    result: "Case history, ownership and next actions — brought into one workspace",
    tags: ["Product design", "Complex workflows", "Pilot"],
    body: "Co-led an internal case-management workspace: stakeholder interviews, role-aware navigation, an Apps Script prototype and an internal pilot.",
    coverNote: "Internal pilot · co-led",
    hint: "How we organized complex casework →",
  },
  {
    slug: "briefs",
    title: "BRIEFS · UM DPSS",
    result: "One building lookup. More than ten different tools.",
    tags: ["Field research", "Information architecture", "Prototype"],
    body: "I sat in on dispatch shifts to watch the building lookup happen, then designed a prototype and wrote the PRD. Not tested with dispatchers yet.",
    coverNote: "Field research → prototype + PRD",
    hint: "See the mid-call information problem →",
    brand: "dpss",
  },
  {
    slug: "openlibrary",
    title: "Open Library · Internet Archive",
    result: "Readers had translation tools. Switching between them was the friction.",
    tags: ["UX research", "Synthesis", "Accessibility"],
    body: "Interviews, affinity mapping and recommendations to help multilingual readers get language support without leaving the book.",
    coverNote: "8 interviews · 330 data points",
    video: "https://framerusercontent.com/assets/RJtQzxfrsLVRsXkPPVUBkHPWsU.mp4",
    poster: "https://framerusercontent.com/images/khnJGJvOghz1Tnm55VQc0KOJMy0.png",
    hint: "Follow the research findings →",
    brand: "openlibrary",
  },
  {
    slug: "budgetcart",
    title: "BudgetCart · UMSI",
    result: "Designing around budgets, benefits and the details shoppers actually need",
    tags: ["Mobile design", "Grocery", "SNAP / WIC"],
    body: "A student team prototype for comparing groceries, staying on budget and shopping with SNAP/WIC in mind.",
    coverScreens: ["/case-shots/budgetcart/smart-ai.png", "/case-shots/budgetcart/budget-calendar.png"],
    hint: "Explore the mobile designs →",
  },
  {
    slug: "prime-video",
    title: "Prime Video · Capstone",
    result: "Current research project · details not public",
    tags: ["Capstone", "Research"],
    body: "Current capstone work. Details are not public.",
    nda: true,
    hint: "Current work · limited details",
    brand: "primevideo",
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
