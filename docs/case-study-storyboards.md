# Case study storyboards and evidence gates

The website uses seven scenes: task, friction, finding, decision, behavior, contribution, outcome. This file prepares the subsequent whiteboard presentation pass; it is not a finished presentation.

## Editorial rules
- Each scene makes one point. Explain the person’s task before naming a method.
- Task prompts and guide dialogue are authored, illustrative narration. They are not participant quotes.
- Distinguish observed behavior, proposed direction, delivered work and measured outcomes.
- Keep GM cleared at workflow level; exclude Prime Video project details.
- Borrow Growth.Design’s scene pacing, not its characters, artwork or psychological claims.
- HCI interpretations are grounded in Nielsen’s original heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Story reference: https://growth.design/case-studies/apple-sleep-notification

## Reviewed sources
- Portfolio Content (Dhwani-authored record): https://docs.google.com/document/d/12OCsbwIuQLgdDO-PC9dVf6qBGZRcqodN_Cj4PSepj0w/edit
- Open Library final report: https://docs.google.com/document/d/1A3DYPNe7f7799FZ6WSzoFFgkkHUHTBwmLgYzPkPPsjs/edit
- Dispatch field notes: Contextual Inquiry - Dispatch Group, prepared by Dhwani. Use generalized workflow findings only; no real contacts or operational records.
- Previously confirmed contribution and outcome records: src/content/cases.ts and PORTFOLIO_PRD.md.
- BudgetCart original Figma links are recorded in Portfolio Content. Connector denied editor access; original screens have not been inspected in this pass.

## BRIEFS · U-M Division of Public Safety & Security

**Headline:** One building lookup. Two places to check.

1. **Task:** A dispatcher could find a contact in a building PDF and still need another system to check whether that person worked there. My first contextual inquiry turned a search problem into a question of trust—and who keeps the information current.
2. **Friction:** I watched dispatchers move between building PDFs, Dropbox and other tools. One workstation had seven screens; the workflow involved more than ten tools. The contact lookup continued in MCommunity to check whether the person was still employed. I began by mapping the task, rather than treating the PDF as the whole problem.
3. **Turning point:** The field notes identified outdated contacts and building information. A faster search could surface the wrong record sooner. The unresolved question was ownership: who would maintain it? That finding changed my priorities. Retrieval, verification and maintenance needed to be considered together.
4. **Decision:** Keep the urgent details visible; give everything else a predictable place. A pinned strip takes screen space, but keeps mid-call details in view as someone moves through a building profile. Alternative not chosen: Giving every detail equal urgency.
5. **Behavioral explanation:** Use the case-specific lens in src/content/caseStories.ts. Label interpretation separately from research.
6. **Personal contribution:** There were no existing Figma files. I built the information architecture and building-profile prototype around five stable areas, with urgent details pinned in view. The pinned strip uses space that other information could occupy; I chose it for the mid-call task. My work included contextual inquiry, the prototype and PRD, plus a Sheets-backed Apps Script exploration. I handed off the concept and specification. The next step is testing with dispatchers and confirming record ownership.
7. **Outcome:** Prototype and PRD handed to DPSS. Not launched, and the 30-second goal hasn't been tested yet. Next question: Put it in front of dispatchers: can they find a detail, check the answer, and trust the structure on a real shift?

**Confirmed numbers and their meaning:** 7: screens at one dispatch workstation; 10+: tools in the lookup; 30s: goal to find a detail · not yet tested

**Visual plan:** Observed PDF → separate verification schematic; proposed pinned profile. Replace the schematic only with cleared prototype media.

## Intel workspace · U-M Division of Public Safety & Security

**Headline:** The next analyst needed the whole story.

1. **Task:** Requests arrived by email or phone, and work continued in spreadsheets. A handoff meant piecing the case back together. I interviewed six analysts and built a shared workspace around the information the next person needed to continue.
2. **Friction:** Email and phone handled intake; spreadsheets held the work. I interviewed six analysts to understand how they found the request, current status and ownership when picking up a case. I made space for quieter stakeholders in those conversations so the workflow would not reflect only the most vocal person.
3. **Turning point:** The analysts already relied on monitoring tools. Replacing those tools would enlarge the project before resolving the handoff. I narrowed the scope to a shared case-management workflow: keep the request, status, ownership and related information connected.
4. **Decision:** Connect the case history before trying to replace the surrounding tools. The analysts needed continuity across handoffs while keeping the monitoring tools they already relied on. Alternative not chosen: Replacing the monitoring apps with one platform.
5. **Behavioral explanation:** Use the case-specific lens in src/content/caseStories.ts. Label interpretation separately from research.
6. **Personal contribution:** I designed the workflow and built the first Google Apps Script version outside production systems. The Intelligence Group uses the workspace and has begun building its own server version. Adoption is the outcome I can support. A faster intake or handoff still needs measurement. The screens here contain fictional demo records, not operational case data.
7. **Outcome:** In use by the Intelligence Group. Shown here at workflow level with invented records. Next question: Measure time from intake to first review now that reports arrive structured.

**Confirmed numbers and their meaning:** No numerical impact claim. Do not manufacture one.

**Visual plan:** Existing fictional Overview and Workup screens. Keep the fictional-record caption visible.

## Convoy · General Motors

**Headline:** Four weeks in, I challenged the brief.

1. **Task:** We had spent four weeks on a biometric concept for one driver. An interview pointed toward a different task: coordinating a trip across people and vehicles. I pushed the team to reconsider whom we were designing for.
2. **Friction:** The original concept focused on personalizing one driver’s experience. After the interview, I advocated for a community convoy instead. The team set aside four weeks of work. My contribution was the pushback: the research needed to change the direction, even after we had invested in it.
3. **Turning point:** A group trip needs planning and coordination. We kept planning on the phone and gave the in-car concept a narrower job: position, spacing and group status. A host helped organize the plan. That choice introduced a trade-off we still needed to test: when does coordination begin to feel controlling?
4. **Decision:** Cut the biometric work and design for the whole trip. One driver interview showed the real job: a group coordinating across phones, screens and messages while moving. Alternative not chosen: Personalizing the drive for a single driver.
5. **Behavioral explanation:** Use the case-specific lens in src/content/caseStories.ts. Label interpretation separately from research.
6. **Personal contribution:** I built advanced Figma interactions and reusable components as part of our first shared team design system. The team explored HVAC and in-drive views at vehicle size and ran three usability tests in a 3D-printed truck cab. The work was a concept and prototype evaluation. It was not a road-tested system or a safety finding. Only cleared details are included here.
7. **Outcome:** Concept. Three usability tests in a 3D-printed cab. Details stay under NDA, so no real-world claims. Next question: Does a host make the group feel organized, or controlled?

**Confirmed numbers and their meaning:** 4: weeks of work cut at the pivot; 3: usability tests in a truck cab; 1: interview that changed the brief

**Visual plan:** Single-driver → group concept schematic; phone planning → in-car coordination. Original screens and detailed enterprise constraints need NDA clearance.

## Open Library · Internet Archive

**Headline:** Readers needed help without leaving the book.

1. **Task:** All five of us were international students, so language access felt familiar. Interviews challenged our initial framing: readers had translation tools, but using them could interrupt the book. I helped turn those observations into a shared affinity map and recommendations.
2. **Friction:** We studied multilingual readers in the U-M community. The team conducted eight semi-structured interviews with students, academic-support staff and subject-matter experts, then organized 330 data points. I contributed to interviews, client calls and my first affinity map. We looked beyond our own experience before choosing a direction.
3. **Turning point:** The report describes readers switching between books, dictionaries and translation tools. Academic and technical language made some readers cross-check terms or create personal glossaries. The problem combined continuity and confidence in translation. Adding a separate tool would leave the switching problem unresolved.
4. **Decision:** Make existing language support easier to find in the reading flow. Readers already had tools; switching between them cost context. Alternative not chosen: Adding one more separate translation tool.
5. **Behavioral explanation:** Use the case-specific lens in src/content/caseStories.ts. Label interpretation separately from research.
6. **Personal contribution:** We recommended making translation more visible, grouping comprehension tools and prompting readers when the book and system languages differ. Copyright, privacy and technical feasibility remained constraints. Collaboration was uneven. I helped organize the final report, summarize progress and clarify next steps. Open Library later improved its feedback process and increased project investment, as I confirmed. That partner response is separate from a validated reader outcome.
7. **Outcome:** Research report and recommendations delivered; no live product test or measured reader impact. Next question: Test whether readers can find help without losing their place—and whether the support earns their trust.

**Confirmed numbers and their meaning:** 8: team interviews; 330: data points mapped as a team

**Visual plan:** Book and separate tools → contextual support schematic. The recommendation was not implemented or tested live.

## BudgetCart · UMSI

**Headline:** We simplified the screen—and hid the decision.

1. **Task:** BudgetCart explored grocery shopping under budget, SNAP/WIC and dietary constraints. We hid brands, stores and prices to simplify the screen. Prototype testing showed that those were the details people needed to judge their choices.
2. **Friction:** I worked on interviews and paper prototypes before moving into Figma. Budget, benefit eligibility and dietary needs all shaped the choice. We tried reducing the detail on the screen. In prototype testing, people struggled to find items and trusted their choices less when brands, stores and prices were hidden.
3. **Turning point:** We moved toward item-first browsing, visible prices and budget context during shopping. Store comparisons appeared where shoppers weighed that trade-off; eligibility and dietary information appeared before checkout. The AI cart-builder also needed a recognizable starting point. We added upload cues and a starter prompt instead of relying on an empty input.
4. **Decision:** Keep the lowest price visible and compare stores where the tradeoff happens. People trusted their cart less when we hid the numbers. Simple can't mean hidden. Alternative not chosen: Hiding brands, stores and prices to look simple.
5. **Behavioral explanation:** Use the case-specific lens in src/content/caseStories.ts. Label interpretation separately from research.
6. **Personal contribution:** I taught myself Figma components and developed the visual language with the team. My work included budget tracking and AI cart-building flows. The concept gives shoppers a starting cart they can edit. We tested prototype tasks, not long-term spending. The next evaluation needs to establish whether the revised choices are understandable and useful.
7. **Outcome:** Prototype tasks tested, not a live service. No measured change in spending yet. Next question: Measure whether shoppers put fewer items back at checkout.

**Confirmed numbers and their meaning:** No numerical impact claim. Do not manufacture one.

**Visual plan:** Hide and restore brand/price/store cues. Obtain editor access to the recorded Figma prototype before reconstructing original screens.

## Whiteboard presentation build next
Use a 12-frame outline for each project: headline → person/task → observed friction → research and my part → turning point → rejected alternative → chosen experience → behavioral interpretation → craft and implementation → evidence of delivery/adoption/testing → limits → next question. Use actual artifacts to expand the story; do not add decorative “data” without a source.

Evidence still needed: cleared before/after screens, original annotated research artifacts, documented test task results and participant counts where absent, source-backed enterprise trade-offs, and any measured product outcomes. Missing results stay explicitly unknown. No Prime Video presentation until cleared.
