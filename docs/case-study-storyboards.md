# Case study storyboards and evidence gates

The website uses seven scenes: task, friction, finding, decision, behavior, contribution, outcome. This file prepares the subsequent whiteboard presentation pass; it is not a finished presentation.

## Editorial rules
- Each scene makes one point. Explain the person’s task before naming a method.
- Task prompts and guide dialogue are authored, illustrative narration. They are not participant quotes.
- Distinguish observed behavior, proposed direction, delivered work and measured outcomes.
- Keep GM cleared at workflow level; exclude Prime Video project details.
- Borrow Growth.Design’s scene pacing, not its characters, artwork or psychological claims.
- HCI interpretations are grounded in Nielsen’s original heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- GM uses an editorial sunk-cost lens, sourced to Arkes & Blumer (1985): https://www.sciencedirect.com/science/article/pii/0749597885900494. The abstract was reviewed; no team bias is claimed or measured.
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
6. **Personal contribution:** There were no existing Figma files. I built the information architecture and building-profile prototype around stable information areas, with urgent details pinned in view. The pinned strip uses space that other information could occupy; I chose it for the mid-call task. My work included contextual inquiry, the prototype and PRD, plus a Sheets-backed Apps Script exploration. I handed off the concept and specification. The next step is testing with dispatchers and confirming record ownership.
7. **Outcome:** Prototype and PRD handed to DPSS. Not launched, and the 30-second goal hasn't been tested yet. Next question: Put it in front of dispatchers: can they find a detail, check the answer, and trust the structure on a real shift?

**Confirmed numbers and their meaning:** 7: screens at one dispatch workstation; 10+: tools in the lookup; 30s: goal to find a detail · not yet tested

**Visual plan:** Observed PDF → separate verification schematic; proposed pinned profile. Replace the schematic only with cleared prototype media.

## Intel workspace · U-M Division of Public Safety & Security
**Source gate:** The source notes require approved evidence before publishing interview counts, adoption, launch or server-migration claims. Earlier versions overstated these; keep the outline at workflow level.
1. **Task:** Intelligence Hub is separate from BRIEFS: it focuses on requests and investigation work. My design focus was a shared workspace where each role can understand current status and the next action.
2. **Friction:** I explored how related requests and investigation work could stay connected in a shared workspace. The design question was how to make status and the next step clear across roles.
3. **Turning point:** A useful overview has to respect role-appropriate access. The design direction connects related work while keeping the current state reviewable.
4. **Decision:** Connect related requests and investigation work in a role-aware workspace. A shared picture should clarify status without exposing the same information to every role.
5. **Behavioral lens:** Visibility of system status, as an editorial interpretation of the fictional demo—not evidence of improved performance.
6. **Public demo:** The screens here use fictional records to illustrate the proposed handoff between views. They are not operational screens or evidence of adoption. Delivery and launch status need confirmation against an approved project source; no speed improvement is claimed.
7. **Outcome:** Workflow direction and fictional portfolio demo. Launch status and impact are not claimed. Next question: Confirm the approved delivery status, then evaluate whether each role can identify the next action.

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

## Accuracy follow-up · October 6
- The live BRIEFS page and earlier PRD notes disagree on the final tab count; avoid a count until current artifacts are reconciled.
- Intel interview count, adoption and server claims require an approved source. Use the revised workflow-level outline above.
- GM Convoy is not an HVAC project; keep its convoy and multi-screen interaction focus.
- Treat this as an evidence-gated presentation plan, not proof that the complete content audit is finished.
