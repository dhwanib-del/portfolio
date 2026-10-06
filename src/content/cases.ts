// Case studies. Source: "Dhwani Bagrecha — Portfolio Content" (story-led drafts) + facts Dhwani confirmed.
// Kept short on purpose: hook, TL;DR, 3 short sections, honest status. Screens go in `figures`
// (drop files in /public/media/<slug>/ and list them here with a caption that says what to notice).

export type Figure = { src?: string; alt: string; caption: string; video?: boolean; placeholder?: string }
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
  links?: { label: string; href: string }[]
  decision?: { tension: string; decision: string; why: string; rejected: string }
  stats?: { value: number; prefix?: string; suffix?: string; label: string }[]
  video?: string // e.g. /media/briefs.mp4 — the main clip under the header
  claim?: { pre?: string; emphasis: string; post?: string } // one big sentence: the strongest moment
  scene?: "briefs" // a drawn before/after placed after the first section
}

// Narrative pass: scene, friction, decision, evidence. Facts retained from confirmed portfolio records.
export const cases: Case[] = [
  {
    "slug": "briefs",
    "org": "BRIEFS · U-M Division of Public Safety & Security",
    "headline": "One building question. Seven screens to search.",
    "hook": "During a call, a dispatcher needed a building detail. I watched the lookup move from Dropbox to a long PDF, then to another system to check the contact. The call was still waiting.",
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
        "heading": "The lookup kept pulling the dispatcher away from the call.",
        "body": [
          "This was my first contextual inquiry. At one workstation, I saw seven screens and a lookup spread across more than ten tools. Finding a detail meant knowing which file to open, where to scroll, and which system to check next."
        ]
      },
      {
        "heading": "I gave every building the same places to look.",
        "body": [
          "There were no existing Figma files to start from. I mapped the workflow and built the prototype around five sections: response, contacts, maps and floor plans, documents, and details. A pinned strip keeps the details needed mid-call visible.",
          "The structure trades some screen space for a predictable lookup. Someone can move between buildings without learning a new document each time."
        ]
      },
      {
        "heading": "An answer also needed a way to check it.",
        "body": [
          "The assistant concept uses approved records and links each answer to its source. Missing information stays missing. AI-assisted document changes require a person to approve them.",
          "I delivered a prototype and PRD and explored a Sheets-backed Apps Script. The next test is whether dispatchers can find and verify a detail during a real shift."
        ]
      }
    ],
    "ai": "The proposed assistant cites approved records and flags missing information. Document changes require human approval.",
    "status": "Prototype and PRD handed to DPSS. Not launched, and the 30-second goal hasn't been tested yet.",
    "next": "Put it in front of dispatchers: can they find a detail, check the answer, and trust the structure on a real shift?",
    "decision": {
      "tension": "The design decision",
      "decision": "Keep the urgent details visible; give everything else a predictable place.",
      "why": "A pinned strip takes screen space, but keeps mid-call details in view as someone moves through a building profile.",
      "rejected": "Giving every detail equal urgency"
    },
    "scene": "briefs",
    "figures": []
  },
  {
    "slug": "intel",
    "org": "Intel workspace · U-M Division of Public Safety & Security",
    "headline": "Picking up a case should not mean reconstructing its history.",
    "hook": "A case could begin by email or phone and continue across spreadsheets. Before an analyst could decide what to do next, they had to piece together what had already happened.",
    "meta": [
      {
        "label": "My part",
        "value": "Stakeholder interviews, workflow design, Apps Script prototype"
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
        "heading": "Six analysts helped me understand the handoff.",
        "body": [
          "I interviewed six analysts about how they tracked cases. I adjusted my questions to bring quieter voices into the discussion. The recurring design problem was retrieval: finding the history, current status, and ownership of a case."
        ]
      },
      {
        "heading": "I brought the case history into one workspace.",
        "body": [
          "I designed a case-management workspace around status, ownership, and related information. Someone picking up a case should see what needs attention and what happens next, with access appropriate to their role.",
          "The team still needed its monitoring tools. I focused the workspace on connecting the work around them."
        ]
      },
      {
        "heading": "The first version gave the team something to use.",
        "body": [
          "I built the first version in Google Apps Script so the team could try the workflow without touching production systems. The Intelligence Group uses the workspace and has started building its own server version.",
          "Public tips also arrive through structured chatbot intake. Time from intake to review remains a question to measure."
        ]
      }
    ],
    "ai": "The public intake is a chatbot, so reports arrive structured instead of as free-form messages.",
    "status": "In use by the Intelligence Group. Shown here at workflow level with invented records.",
    "next": "Measure time from intake to first review now that reports arrive structured.",
    "decision": {
      "tension": "The scope decision",
      "decision": "Connect the case history before trying to replace the surrounding tools.",
      "why": "The analysts needed continuity across handoffs while keeping the monitoring tools they already relied on.",
      "rejected": "Replacing the monitoring apps with one platform"
    },
    "figures": []
  },
  {
    "slug": "general-motors",
    "org": "Convoy · General Motors",
    "headline": "Four weeks into biometrics, I challenged who we were designing for.",
    "hook": "Our first direction personalized a vehicle for one driver. A driver interview exposed a different problem: a road trip meant a group coordinating across phones, screens, and messages.",
    "meta": [
      {
        "label": "My part",
        "value": "Research, advanced Figma interactions, reusable components"
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
        "heading": "The interview changed the unit of design: one driver became a group.",
        "body": [
          "I challenged the biometric direction and pushed us toward a community convoy. We set aside four weeks of work to address how people coordinate the whole trip."
        ]
      },
      {
        "heading": "Planning stayed on the phone. Coordination moved into the cab.",
        "body": [
          "Groups already organized on their phones. We kept planning there and focused the in-car view on position, spacing, and group status. A host coordinates the plan; other travelers can follow and signal when they need something.",
          "That split gave each screen a job instead of moving the entire planning experience onto the dashboard."
        ]
      },
      {
        "heading": "I had to prototype beyond the Figma canvas.",
        "body": [
          "I built advanced Figma interactions and reusable components in our first shared team design system. HVAC and in-drive views ran on vehicle-size screens alongside other prototyping tools.",
          "The team conducted three usability tests in a 3D-printed truck cab. The concept remains a prototype; the next question is whether a host helps people feel coordinated or controlled."
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
    ],
    "figures": []
  },
  {
    "slug": "openlibrary",
    "org": "Open Library · Internet Archive",
    "headline": "To understand the book, readers had to leave it.",
    "hook": "A reader switches from a book to a dictionary or translation tool, then has to find their place again. Our international-student team started with language barriers. The research pointed us to the disruption around getting help.",
    "meta": [
      {
        "label": "My part",
        "value": "Client calls, interviews, first affinity map, synthesis"
      },
      {
        "label": "Team",
        "value": "Five-person SI 500 team · In4mation"
      },
      {
        "label": "Read",
        "value": "1 minute"
      },
      {
        "label": "Status",
        "value": "Research and recommendations"
      }
    ],
    "claim": {
      "pre": "The reader should not have to leave the page to ",
      "emphasis": "find language support",
      "post": "."
    },
    "stats": [
      {
        "value": 8,
        "label": "team interviews"
      },
      {
        "value": 330,
        "label": "data points mapped as a team"
      }
    ],
    "sections": [
      {
        "heading": "Our own language barriers gave us a question to investigate.",
        "body": [
          "All five of us were international students. I joined client calls and interviews to check whether the difficulties we recognized matched other readers’ experiences. The team conducted eight interviews."
        ]
      },
      {
        "heading": "My first affinity map made the switching visible.",
        "body": [
          "I helped synthesize 330 research data points with the team. Readers moved between the book, dictionaries, and translation tools, losing their place and context along the way.",
          "We recommended making existing language support easier to find within the reading flow. The design opportunity was helping someone continue reading while getting support."
        ]
      },
      {
        "heading": "The partner acted on feedback. Reader impact is still unmeasured.",
        "body": [
          "After we shared our feedback, Open Library improved its feedback system and invested more in the project. Our reading-flow recommendations were not implemented or tested with readers.",
          "Collaboration was uneven. I kept the work moving by making synthesis visible, organizing the report, and clarifying next steps. The final report and presentation document the team’s recommendations."
        ]
      }
    ],
    "status": "Research report and recommendations delivered; no live product test or measured reader impact.",
    "next": "Test whether readers can find help without losing their place—and whether the support earns their trust.",
    "decision": {
      "tension": "The turning point",
      "decision": "Make existing language support easier to find in the reading flow.",
      "why": "Readers already had tools; switching between them cost context.",
      "rejected": "Adding one more separate translation tool"
    },
    "figures": [
      {
        "alt": "Open Library research affinity map",
        "caption": "Team synthesis · add a cleared photo or screenshot",
        "placeholder": "public/media/openlibrary/affinity-map.jpg"
      },
      {
        "alt": "Open Library recommendation concept",
        "caption": "Proposed reading-flow support · add final project screen",
        "placeholder": "public/media/openlibrary/recommendation.png"
      }
    ],
    "links": [
      {
        "label": "View final report",
        "href": "https://docs.google.com/document/d/1A3DYPNe7f7799FZ6WSzoFFgkkHUHTBwmLgYzPkPPsjs/edit"
      },
      {
        "label": "View final project",
        "href": "https://docs.google.com/presentation/d/1HDW0dLSZCc09ewu0dh__M0BJS2c-ByhvlvdnQMwyYZs"
      }
    ]
  },
  {
    "slug": "budgetcart",
    "org": "BudgetCart · UMSI",
    "headline": "We hid the prices to simplify shopping. People trusted the cart less.",
    "hook": "A shopper balancing a budget, SNAP/WIC eligibility, and dietary needs has to judge each item. Our early prototype removed brands, stores, and prices to simplify that decision. Testing showed why those details mattered.",
    "meta": [
      {
        "label": "My part",
        "value": "Interviews, paper prototypes, budget and cart flows, Figma components"
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
        "heading": "A cleaner screen made the choice harder.",
        "body": [
          "In prototype testing, people struggled to find items and trusted their choices less when brands, stores, and prices were hidden. We had removed information they needed to judge the cart."
        ]
      },
      {
        "heading": "We brought the price back to the moment of choice.",
        "body": [
          "We made browsing item-first, kept the lowest price visible, and moved store comparisons to the point where shoppers weigh that tradeoff. Budget context stays visible while they shop; eligibility and dietary information appear before checkout."
        ]
      },
      {
        "heading": "My first Figma project began with interviews and paper.",
        "body": [
          "I worked on stakeholder interviews and paper prototypes, then taught myself Figma components and developed the visual language with the team. My design work included budget tracking and AI cart-building flows.",
          "The cart-builder concept gives someone an editable starting cart based on their budget and needs. We tested prototype tasks; spending outcomes have not been measured."
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
    },
    "figures": []
  }
]
