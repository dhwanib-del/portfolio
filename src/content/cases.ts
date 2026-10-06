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
    "headline": "Finding the contact was only half the job.",
    "hook": "A dispatcher needed a building contact. The lookup meant opening Dropbox, scrolling a PDF, then checking another system to see whether that person still worked there. I started with the search problem. The fieldwork showed me a second one: the information could be out of date.",
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
        "heading": "The document was there. The answer was not ready to use.",
        "body": [
          "In my first contextual inquiry, I watched dispatchers work across seven screens and more than ten tools. A building lookup crossed several sources before the information was ready to act on. Improving search alone would still leave the verification step."
        ]
      },
      {
        "heading": "A faster lookup would not fix an outdated record.",
        "body": [
          "The field notes identified outdated contacts and building information, alongside an unanswered ownership question: who keeps these records current? I treated retrieval and verification as two parts of the same task.",
          "That changed the prototype’s priorities: give information a consistent home, keep urgent details visible, and make proposed assistant answers checkable against approved sources. These were design intentions, not measured improvements."
        ]
      },
      {
        "heading": "I built the structure—and kept the remaining questions visible.",
        "body": [
          "With no existing Figma files to start from, I mapped the workflow and built a building-profile concept around five stable information areas. A pinned strip keeps mid-call details in view; it also takes space from the rest of the page.",
          "My work included contextual inquiry, information architecture, prototyping and the PRD, plus exploration of a Sheets-backed Apps Script. The handoff was a prototype and specification. Testing the lookup and confirming record ownership remain necessary."
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
    "headline": "The next analyst needed the history, not another spreadsheet.",
    "hook": "A request arrived by email or phone. The work continued across spreadsheets. When someone else picked up the case, understanding what had happened became a task of its own. I focused on that handoff.",
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
        "heading": "I asked six analysts how they picked up someone else’s work.",
        "body": [
          "The stakeholder interviews helped me map what an analyst needed to retrieve: case history, current status and ownership. I adjusted my questions to include quieter voices, rather than letting the most vocal person define the workflow."
        ]
      },
      {
        "heading": "The scope was continuity—not replacing every tool.",
        "body": [
          "The team already relied on monitoring tools. Replacing them would broaden the project without first resolving the handoff.",
          "I focused the design on a shared case workspace: connect the request, status, ownership and related information so the next analyst can continue the work."
        ]
      },
      {
        "heading": "I made a version the team could actually try.",
        "body": [
          "I designed the workflow and built the first version in Google Apps Script, separate from production systems. The Intelligence Group uses the workspace and has started building its own server version.",
          "That adoption is the outcome I can report. It does not establish a measured time saving. The public screens below use fictional records to explain the workflow."
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
    "headline": "We had four weeks of work. I argued for a different problem.",
    "hook": "Our biometric concept centered on one driver. An interview pointed toward people coordinating a road trip across vehicles, phones and messages. I challenged the original direction: were we personalizing the car while missing the group?",
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
        "heading": "The interview changed who the experience needed to serve.",
        "body": [
          "I pushed back on biometrics and advocated for a community convoy. The team set aside four weeks of work. The difficult choice was giving up an established direction before investing further in it."
        ]
      },
      {
        "heading": "The group needed coordination. The dashboard did not need everything.",
        "body": [
          "We kept planning on the phone, where groups already organized. The in-car concept focused on position, spacing and group status, with a host coordinating the plan.",
          "This gave each screen a job. It also introduced a question we had not resolved: would a host make the group feel organized, or controlled?"
        ]
      },
      {
        "heading": "I learned to build for the cab, not just the canvas.",
        "body": [
          "I built advanced Figma interactions and reusable components within our first shared team design system. The team explored HVAC and in-drive views on vehicle-size screens and conducted three usability tests in a 3D-printed cab.",
          "Those tests describe the prototype work, not road-tested safety or a shipped outcome. Cleared details only are shown here; NDA restrictions still apply."
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
    "headline": "The translation problem was also a reading problem.",
    "hook": "We began with a question we recognized as international students: how could multilingual readers get better language support? The research changed the question. What happened to the reading experience every time someone left the book to find help?",
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
        "heading": "Our experience gave us a starting point, not the answer.",
        "body": [
          "All five of us were international students. I contributed to client calls and interviews, then helped synthesize the research in my first affinity map. The team conducted eight interviews and mapped 330 data points.",
          "The research included students, academic-support staff and subject-matter experts. We looked beyond our own experience before making recommendations."
        ]
      },
      {
        "heading": "Readers had workarounds. Each one interrupted the book.",
        "body": [
          "The final report describes switching between books, dictionaries and translation tools, alongside mistrust of academic or technical translations. Some readers cross-checked terms or built personal glossaries.",
          "More translation options alone would not resolve that fragmentation. Our recommendation shifted toward making existing support visible and connected within the reading flow."
        ]
      },
      {
        "heading": "The recommendation became specific—and the limits stayed clear.",
        "body": [
          "We proposed moving translation out of a secondary menu, grouping comprehension tools, and offering contextual language prompts. These recommendations still needed technical and legal review; we did not implement or test them in the live interface.",
          "Collaboration was uneven. I helped keep synthesis and next steps visible and organized the final report. Open Library later improved its feedback process and increased project investment, as I confirmed; that is separate from proving reader impact."
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
    "headline": "Our simpler grocery screen hid what people needed to decide.",
    "hook": "BudgetCart was a grocery concept for people balancing price, SNAP/WIC eligibility and dietary needs. We tried simplifying the interface by hiding brands, stores and prices. Prototype testing exposed the problem: those details helped people judge what they were choosing.",
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
