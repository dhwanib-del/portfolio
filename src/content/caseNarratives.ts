/**
 * A story is a sequence of small, verifiable turns—not a list of methods.
 * Keep each beat short enough to read beside a project screenshot.
 * Don't turn inferred participant sentiment into quotes or invented observations.
 *
 * mediaIndex references src/content/caseMedia.ts; if missing, no visual is claimed.
 */
export type StoryBeat = {
  title: string
  body: string
  kicker?: string
  mediaIndex?: number
}
export const caseNarratives: Record<string, { opening: string; takeaway: string; beats: StoryBeat[] }> = {
  "general-motors": {
    opening: "We thought we were designing for one driver. Then the research took us somewhere else.",
    takeaway: "I learned to challenge the brief while there’s still time to change it. The first idea wasn’t a failure; it helped us notice a better problem.",
    beats: [
      { kicker: "Where we started", title: "One driver. One personalized truck.", body: "GM asked us to explore a future electric truck. Our early direction was biometric personalization—making the drive adapt to the person behind the wheel.", mediaIndex: 0 },
      { kicker: "The moment it changed", title: "The driver talked about everyone else.", body: "In one interview, a truck driver kept coming back to planning trips and keeping multiple cars together. That problem was more compelling than the one we’d started with.", mediaIndex: 1 },
      { kicker: "The new idea", title: "Plan together. Drive with less on screen.", body: "We moved trip planning to the phone. In the truck, the interface focused on where the group was and how the journey was going.", mediaIndex: 2 },
      { kicker: "What I made", title: "From components to something you could try.", body: "I explored the driver and center displays, built interactive Figma prototypes and contributed reusable pieces to the shared design library.", mediaIndex: 3 },
      { kicker: "Where it landed", title: "Three tests in a physical cab. Not on the road.", body: "The team tested the concept three times in a truck-cab mockup. It helped us evaluate the idea, but real driving conditions and organizer control remain open questions.", mediaIndex: 4 },
    ],
  },
  briefs: {
    opening: "One building question could mean ten different tools. I saw it happen mid-shift.",
    takeaway: "Watching someone do the work taught me that a good search result is only useful when the source behind it is current.",
    beats: [
      { kicker: "On the dispatch floor", title: "Seven screens. Still searching.", body: "I watched dispatchers work with PDFs, Dropbox and other tools. Even confirming a building contact could mean opening another system." },
      { kicker: "The harder problem", title: "Faster access to stale information isn’t enough.", body: "Some contacts and building details were out of date. A new search box wouldn’t solve that by itself." },
      { kicker: "What I designed", title: "Keep the urgent details where you can see them.", body: "I designed a building profile with a pinned strip for contacts, access and hazards, plus predictable sections for everything else." },
      { kicker: "Where it landed", title: "A prototype and a PRD. The test is still ahead.", body: "I handed the prototype and requirements to DPSS. It hasn’t been tested with dispatchers, so I’m not claiming time saved." },
    ],
  },
  intel: {
    opening: "The request was in one place. The investigation was somewhere else.",
    takeaway: "Different roles can need different views without losing a shared history. Designing the handoff was as important as designing the screen.",
    beats: [
      { kicker: "The gap", title: "Every handoff meant rebuilding the story.", body: "An analyst picking up a case needed to piece together the original request, status, ownership and the work already done." },
      { kicker: "Our direction", title: "Make the case carry its history.", body: "We brought those pieces into one workspace. The underlying case stays consistent while the navigation changes by role." },
      { kicker: "What I did", title: "Research, design—and a working prototype.", body: "I led a stakeholder interview session, designed role-aware flows, built the Apps Script prototype and documented the requirements." },
      { kicker: "Where it landed", title: "We piloted it internally.", body: "I co-led the internal pilot. We’re still working through feedback, and I’m keeping operational screens private until they’re cleared." },
    ],
  },
  budgetcart: {
    opening: "We made the screen cleaner. Shoppers lost the information they needed.",
    takeaway: "I learned that visual simplicity can make a decision harder. It matters more to keep the right clues visible than to remove every detail.",
    beats: [
      { kicker: "The setup", title: "Grocery shopping is more than finding the lowest price.", body: "A weekly budget, SNAP/WIC eligibility and dietary needs can all matter in the same decision.", mediaIndex: 0 },
      { kicker: "The first mistake", title: "We hid too much.", body: "The first browse direction stripped away brand, price and store details for simplicity. During prototype tasks, people struggled to find items and felt less sure of their choices.", mediaIndex: 2 },
      { kicker: "What changed", title: "Put the decision-making clues back.", body: "The revised browse and store screens showed details at the moment of choice. We did not retest those revisions.", mediaIndex: 3 },
      { kicker: "My part", title: "Make the next step easier to start.", body: "I designed the AI cart builder with starter cues instead of an empty prompt, and the Budget Calendar for planning spending over time.", mediaIndex: 1 },
      { kicker: "What we know", title: "A tested concept, not a spending outcome.", body: "We revised the prototype based on task feedback. The project didn’t launch, and no grocery spending changes were measured.", mediaIndex: 4 },
    ],
  },
  openlibrary: {
    opening: "The readers already had translation tools. They kept losing their place while using them.",
    takeaway: "This was my first real affinity-mapping project. It taught me to question assumptions I personally identify with, then let the research change the recommendation.",
    beats: [
      { kicker: "Our assumption", title: "Maybe readers needed better tools.", body: "All five of us were international students. We recognized the problem, but we needed to check whether our own experiences matched other readers’ needs.", mediaIndex: 1 },
      { kicker: "What we heard", title: "The tools were already there.", body: "Across eight interviews, readers described switching between a book, dictionary and translation tools—and struggling to keep their place.", mediaIndex: 0 },
      { kicker: "The pivot", title: "Don’t add one more place to switch to.", body: "Our recommendations focused on making existing language support easier to find inside the reading flow.", mediaIndex: 1 },
      { kicker: "Where it landed", title: "Research and recommendations. Not a product launch.", body: "We mapped 330 data points as a team and delivered the report. The ideas still need feasibility work and testing with readers.", mediaIndex: 0 },
    ],
  },
}
