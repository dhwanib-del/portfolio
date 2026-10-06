// Authored narration and illustrative scenarios. Not participant quotations.
// Evidence: confirmed case records, Portfolio Content, Open Library report and dispatch field notes.
export type Story = {
 role: string; question: string; doubt: string; finding: string; call: string;
 move: string; result: string; lens: string; theory: string; interpretation: string; source: string; sourceUrl?: string; sourceLabel?: string
}
export const caseStories: Record<string, Story> = {
  "briefs": {
    "role": "Dispatcher",
    "question": "What do responders need to know about this building?",
    "doubt": "The building lookup included contacts, access, hazards and floor plans. Finding the document was only one step.",
    "finding": "Urgent information needed a predictable place; the separate contact check also exposed a question of currency.",
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
    "doubt": "A shared workspace needs to explain current status and the next action for each role.",
    "finding": "The design direction brings related work into a shared picture while respecting differences between roles.",
    "call": "The public demo illustrates the workflow. Adoption and delivery status need an approved source.",
    "move": "Connect related work in a role-aware workspace.",
    "result": "Workflow demo; launch and adoption are not claimed.",
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
    "lens": "Sunk cost: four weeks already invested.",
    "theory": "Time already spent can make it harder to change direction.",
    "interpretation": "The team had invested four weeks. My pushback asked us to judge the next step against the interview and the group task it revealed. I use sunk cost as an editorial lens on that decision; we did not measure a psychological bias.",
    "source": "8",
    "sourceUrl": "https://www.sciencedirect.com/science/article/pii/0749597885900494",
    "sourceLabel": "Arkes & Blumer · The psychology of sunk cost (1985)"
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
