// Authored narration and illustrative scenarios. Not participant quotations.
// Evidence: confirmed case records, Portfolio Content, Open Library report and dispatch field notes.
export type Story = {
 role: string; question: string; doubt: string; finding: string; call: string;
 move: string; result: string; lens: string; theory: string; interpretation: string; source: string
}
export const caseStories: Record<string, Story> = {
  "briefs": {
    "role": "Dispatcher",
    "question": "Who do I contact for this building?",
    "doubt": "I first saw a lookup problem. But finding a name was not the end of the task.",
    "finding": "The separate employment check mattered. I needed to think about the record’s currency, not just search.",
    "call": "I pinned urgent details and gave the rest a predictable home. Ownership still needs an answer.",
    "move": "Keep urgent details visible and make the record checkable.",
    "result": "Prototype + PRD handed off; lookup goal untested.",
    "lens": "Recognition rather than recall",
    "theory": "Keep needed information visible or easy to retrieve.",
    "interpretation": "The pinned strip keeps mid-call details available while the dispatcher moves through a profile. Whether that reduces lookup effort remains a test question.",
    "source": "6"
  },
  "intel": {
    "role": "Analyst",
    "question": "What happened before this case reached me?",
    "doubt": "A new database could still leave the handoff broken. I wanted to understand what the next analyst needed.",
    "finding": "Six interviews helped me connect the request, ownership and case history without replacing the monitoring tools.",
    "call": "I built a workspace the team could use, then kept adoption separate from an unmeasured speed claim.",
    "move": "Connect case context while keeping existing monitoring tools.",
    "result": "Workspace in use; the team is building a server version.",
    "lens": "Visibility of system status",
    "theory": "Show the current state so people can decide what to do next.",
    "interpretation": "The demo keeps the request, status and assigned team with the case as the view changes. This explains the intended handoff; it does not prove faster work.",
    "source": "1"
  },
  "general-motors": {
    "role": "Trip participant",
    "question": "How do we keep the group coordinated?",
    "doubt": "Four weeks in, I questioned whether personalizing one driver addressed the task the interview had surfaced.",
    "finding": "Designing for the group changed the brief. It also changed what belonged on the phone versus the dashboard.",
    "call": "I built the interactions and reusable components. Three cab tests did not answer every question about group control.",
    "move": "Pivot from one driver to a convoy; separate planning from in-car coordination.",
    "result": "Concept evaluated in three truck-cab usability tests.",
    "lens": "Aesthetic and minimalist design",
    "theory": "Prioritize information relevant to the task.",
    "interpretation": "Planning stays on the phone; the in-car concept focuses on group coordination. This is a task-based rationale, not evidence of reduced distraction or road safety.",
    "source": "8"
  },
  "openlibrary": {
    "role": "Multilingual reader",
    "question": "Can I get help with this term and keep reading?",
    "doubt": "Language access was familiar to us. I still needed the interviews to tell us what was actually getting in the way.",
    "finding": "The affinity map connected translation confidence with interruptions between tools. The recommendation had to address both.",
    "call": "I helped organize the report and next steps. The recommendations still need technical and legal review.",
    "move": "Bring existing language support into the reading flow.",
    "result": "Research + recommendations delivered; no live reader test.",
    "lens": "Help in context",
    "theory": "Make help easy to find and focused on the user’s task.",
    "interpretation": "Grouping translation and comprehension support near the book addresses the switching described in the report. The proposed reading flow has not been validated.",
    "source": "10"
  },
  "budgetcart": {
    "role": "Shopper",
    "question": "Can I judge this item against my budget and needs?",
    "doubt": "We called the screen simpler. Testing made me question what we had actually removed.",
    "finding": "Price, brand and store were decision cues. Hiding them made items harder to find and choices harder to trust.",
    "call": "I kept budget and price context in the shopping flow. The AI cart is a starting point people can edit, not a finished answer.",
    "move": "Restore decision cues and keep budget context in the shopping flow.",
    "result": "Prototype tasks tested; spending impact unmeasured.",
    "lens": "Recognition rather than recall",
    "theory": "Keep decision information available instead of requiring memory.",
    "interpretation": "Visible prices and budget context let someone judge the item in the shopping flow. Testing exposed the original problem; it did not establish improved spending in the revision.",
    "source": "6"
  }
}
