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
  poster?: string
  nda?: boolean
  hint: string // talk-to-me cursor line
}

export const projects: Project[] = [
  {
    slug: "briefs",
    title: "BRIEFS · UM DPSS",
    result: "Prototype + PRD, not shipped",
    tags: ["Public safety", "Research", "AI"],
    body: "Dispatchers dig through separate tools for a building's details while the caller waits. I designed one search for it and handed off a prototype and PRD.",
    hint: "dispatchers, mid-call, no time to dig →",
  },
  {
    slug: "intel",
    title: "Intel workspace · UM DPSS",
    result: "In use by the team",
    tags: ["Workflow", "Apps Script", "Chatbot"],
    body: "The Intelligence Group ran on spreadsheets. I built the workspace in Google Apps Script so we could test it safely. Public tips now come in through a chatbot.",
    hint: "in use by a real intel team →",
  },
  {
    slug: "general-motors",
    title: "Convoy · General Motors",
    result: "3 usability tests in a truck cab",
    tags: ["HMI", "Prototyping", "Figma"],
    body: "In-cab HVAC controls, prototyped in Figma and run on real screens. We tested in a 3D-printed truck cab. The details stay under NDA.",
    hint: "HVAC prototyping in a 3D-printed cab →",
  },
  {
    slug: "prime-video",
    title: "Prime Video · Capstone",
    result: "Under NDA",
    tags: ["Streaming", "Capstone"],
    body: "Current capstone with Prime Video. Nothing goes here until it's cleared. Ask me about the process.",
    nda: true,
    hint: "NDA 🔒 ask me about this one",
  },
  {
    slug: "openlibrary",
    title: "Open Library · Internet Archive",
    result: "Found the real issue: language help was hard to find",
    tags: ["Research", "Multilingual", "Accessibility"],
    body: "My first affinity map helped our team see that readers needed support they could find without leaving the book. I helped carry the research into clear partner recommendations.",
    hint: "language help in the reading flow →",
  },
  {
    slug: "budgetcart",
    title: "BudgetCart · UMSI",
    result: "Concept",
    tags: ["Grocery", "AI", "Budgeting"],
    body: "Shoppers find out they're over budget at the register. BudgetCart shows what fits before checkout, with an AI-built cart.",
    hint: "the moment before checkout →",
  },
]

export type Role = { org: string; role: string; dates: string; summary: string; current?: boolean }

// Newest first
export const experience: Role[] = [
  { org: "Adobe", role: "Student Ambassador", dates: "Jul 2026 – now", summary: "Workshops, content and campus events for creative students.", current: true },
  { org: "U-M Division of Public Safety & Security", role: "UX Design Intern", dates: "May – Aug 2026", summary: "Designed tools for campus dispatch and the Intelligence Group. The Intel workspace is in use." },
  { org: "General Motors", role: "UX Researcher & Designer", dates: "Jan – May 2026", summary: "In-cab HVAC prototyping on real screens, tested in a 3D-printed truck cab." },
  { org: "Iska Press for African Perspectives", role: "UX Researcher & Project Manager", dates: "Jan – May 2026", summary: "Led a research and project-management consulting engagement." },
  { org: "SOCHI, University of Michigan", role: "Project Manager & UX Researcher", dates: "Sep 2025 – May 2026", summary: "Product strategy, research and project management." },
  { org: "U-M Global Scholars Program", role: "Project Manager & Social Media Coordinator", dates: "Aug 2025 – May 2026", summary: "Led project teams and global community programming." },
  { org: "Open Library", role: "UX Researcher", dates: "Aug – Dec 2025", summary: "Multilingual reading research, affinity mapping, and recommendations for in-book language support." },
  { org: "MSU College of Social Science", role: "Research Assistant", dates: "May 2024 – May 2025", summary: "Organized and analyzed eye-tracking data for behavioral research." },
  { org: "Miller Johnson", role: "Human Resources Systems Intern", dates: "Jun – Aug 2024", summary: "Internal systems and operations at a law firm." },
  { org: "DDB Mudra Group", role: "User Experience DEI Intern", dates: "Jun – Aug 2023", summary: "Research on accessible social media and representation in advertising." },
]
