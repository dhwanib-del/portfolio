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
    "headline": "The critical detail should not be buried.",
    "hook": "Dispatchers need building contacts, access details, hazards and floor plans during a call. I observed the cross-tool lookup and shaped a profile that keeps urgent details visible, with the rest organized into predictable sections.",
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
        "heading": "The answer was spread across the workstation.",
        "body": [
          "I watched dispatchers move between building PDFs, Dropbox and other tools. One workstation had seven screens; the workflow involved more than ten tools. The contact lookup continued in MCommunity to check whether the person was still employed.",
          "I began by mapping the task, rather than treating the PDF as the whole problem."
        ]
      },
      {
        "heading": "Finding a record did not make it current.",
        "body": [
          "The field notes identified outdated contacts and building information. A faster search could surface the wrong record sooner. The unresolved question was ownership: who would maintain it?",
          "That finding changed my priorities. Retrieval, verification and maintenance needed to be considered together."
        ]
      },
      {
        "heading": "I gave the information a home—and a handoff.",
        "body": [
          "There were no existing Figma files. I built the information architecture and building-profile prototype around stable information areas, with urgent details pinned in view. The pinned strip uses space that other information could occupy; I chose it for the mid-call task.",
          "My work included contextual inquiry, the prototype and PRD, plus a Sheets-backed Apps Script exploration. I handed off the concept and specification. The next step is testing with dispatchers and confirming record ownership."
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
    "headline": "The next analyst needed the whole story.",
    "hook": "Intelligence Hub is separate from BRIEFS: it focuses on requests and investigation work. My design focus was a shared workspace where each role can understand current status and the next action.",
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
        "value": "Workflow and prototype"
      }
    ],
    "sections": [
      {
        "heading": "The case existed. Its context was scattered.",
        "body": [
          "I explored how related requests and investigation work could stay connected in a shared workspace.",
          "The design question was how to make status and the next step clear across roles."
        ]
      },
      {
        "heading": "A shared picture still needs boundaries.",
        "body": [
          "A useful overview has to respect role-appropriate access.",
          "The design direction connects related work while keeping the current state reviewable."
        ]
      },
      {
        "heading": "The public demo explains the workflow.",
        "body": [
          "The screens here use fictional records to illustrate the proposed handoff between views. They are not operational screens or evidence of adoption.",
          "Delivery and launch status need confirmation against an approved project source; no speed improvement is claimed."
        ]
      }
    ],
    "status": "Workflow direction and fictional portfolio demo. Launch status and impact are not claimed.",
    "next": "Confirm the approved delivery status, then evaluate whether each role can identify the next action.",
    "decision": {
      "tension": "The scope decision",
      "decision": "Connect related requests and investigation work in a role-aware workspace.",
      "why": "A shared picture should clarify status without exposing the same information to every role.",
      "rejected": "A single undifferentiated view for every role"
    },
    "figures": []
  },
  {
    "slug": "general-motors",
    "org": "Convoy · General Motors",
    "headline": "Four weeks in, I challenged the brief.",
    "hook": "We had spent four weeks on a biometric concept for one driver. An interview pointed toward a different task: coordinating a trip across people and vehicles. I pushed the team to reconsider whom we were designing for.",
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
        "heading": "We had a direction. The interview gave us a reason to question it.",
        "body": [
          "The original concept focused on personalizing one driver’s experience. After the interview, I advocated for a community convoy instead.",
          "The team set aside four weeks of work. My contribution was the pushback: the research needed to change the direction, even after we had invested in it."
        ]
      },
      {
        "heading": "Changing the user changed the screens.",
        "body": [
          "A group trip needs planning and coordination. We kept planning on the phone and gave the in-car concept a narrower job: position, spacing and group status.",
          "A host helped organize the plan. That choice introduced a trade-off we still needed to test: when does coordination begin to feel controlling?"
        ]
      },
      {
        "heading": "I prototyped for the cab, not just the canvas.",
        "body": [
          "I built advanced Figma interactions and reusable components as part of our first shared team design system. The team explored HVAC and in-drive views at vehicle size and ran three usability tests in a 3D-printed truck cab.",
          "The work was a concept and prototype evaluation. It was not a road-tested system or a safety finding. Only cleared details are included here."
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
    "headline": "Readers needed help without leaving the book.",
    "hook": "All five of us were international students, so language access felt familiar. Interviews challenged our initial framing: readers had translation tools, but using them could interrupt the book. I helped turn those observations into a shared affinity map and recommendations.",
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
        "heading": "Our own experience was a starting point.",
        "body": [
          "We studied multilingual readers in the U-M community. The team conducted eight semi-structured interviews with students, academic-support staff and subject-matter experts, then organized 330 data points.",
          "I contributed to interviews, client calls and my first affinity map. We looked beyond our own experience before choosing a direction."
        ]
      },
      {
        "heading": "The gaps between tools mattered.",
        "body": [
          "The report describes readers switching between books, dictionaries and translation tools. Academic and technical language made some readers cross-check terms or create personal glossaries.",
          "The problem combined continuity and confidence in translation. Adding a separate tool would leave the switching problem unresolved."
        ]
      },
      {
        "heading": "I helped make the recommendation—and the team’s progress—clear.",
        "body": [
          "We recommended making translation more visible, grouping comprehension tools and prompting readers when the book and system languages differ. Copyright, privacy and technical feasibility remained constraints.",
          "Collaboration was uneven. I helped organize the final report, summarize progress and clarify next steps. Open Library later improved its feedback process and increased project investment, as I confirmed. That partner response is separate from a validated reader outcome."
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
    "headline": "We simplified the screen—and hid the decision.",
    "hook": "BudgetCart explored grocery shopping under budget, SNAP/WIC and dietary constraints. We hid brands, stores and prices to simplify the screen. Prototype testing showed that those were the details people needed to judge their choices.",
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
        "heading": "A grocery choice had more than one constraint.",
        "body": [
          "I worked on interviews and paper prototypes before moving into Figma. Budget, benefit eligibility and dietary needs all shaped the choice.",
          "We tried reducing the detail on the screen. In prototype testing, people struggled to find items and trusted their choices less when brands, stores and prices were hidden."
        ]
      },
      {
        "heading": "The detail needed to be there when people chose.",
        "body": [
          "We moved toward item-first browsing, visible prices and budget context during shopping. Store comparisons appeared where shoppers weighed that trade-off; eligibility and dietary information appeared before checkout.",
          "The AI cart-builder also needed a recognizable starting point. We added upload cues and a starter prompt instead of relying on an empty input."
        ]
      },
      {
        "heading": "My first Figma project taught me to test what “simple” means.",
        "body": [
          "I taught myself Figma components and developed the visual language with the team. My work included budget tracking and AI cart-building flows.",
          "The concept gives shoppers a starting cart they can edit. We tested prototype tasks, not long-term spending. The next evaluation needs to establish whether the revised choices are understandable and useful."
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
