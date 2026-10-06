# Portfolio rebuild brief

## Goal
A concise, distinctive portfolio that lets a senior UX reviewer understand Dhwani's craft, judgment, personal contribution, and impact in a 30-second skim, with optional deeper reading.

## Product principles
- Lead with the decision, contribution, and outcome; keep process detail only when it proves a skill.
- Use short sections, strong visuals, and clear media placeholders.
- Separate personal contribution from team output. Link to final reports and project presentations where available.
- Never invent metrics. Mark unknown outcomes as unmeasured and gather evidence before making claims.
- Keep Prime Video private until NDA restrictions are cleared.
- Make the voice warm, direct, and specific. Preserve the user's playful personality without hobby-list clutter.
- Respect motion preferences, keyboard access, readable contrast, and responsive layouts.

## Storytelling framework · Growth.Design reference
Reference: https://growth.design/case-studies. Studied the Amber Alert and YouTube retention stories for their scene-led pacing, annotated friction, redesign reveals, and explanations tied to specific actions. This is an editorial adaptation for an authored portfolio, not a teardown template.

Each case follows one central tension:
1. **Enter the moment.** Start with a real person attempting a concrete task. Show the relevant interface or workflow. Use an observed scene, or explicitly label an illustrative scenario.
2. **Expose the friction.** Show the exact step that interrupts the task and its consequence. One annotated visual should make the problem understandable before the methods are described.
3. **Reveal what changed our understanding.** Use the interview, observation, or prototype finding that challenged the initial direction. Include a quotation only when its wording and source are verified.
4. **Name my decision.** Say what Dhwani changed, why, and what she chose against. Distinguish her work from the team's output; retain the constraint that makes the decision interesting.
5. **Show the changed experience.** Pair before/after views around the same task. Captions explain what the change allows someone to do. Label concepts and fictionalized records.
6. **Explain the behavior.** Connect a design choice to the observed behavior. Add a psychology or HCI principle only when it clarifies the mechanism and has an appropriate source; do not present a principle as proof of impact.
7. **Close with evidence.** State what was delivered, adopted, tested, or measured, then the remaining question. A recommendation, prototype, partner response, and shipped result are different outcomes.

Pacing: a 30-second skim through the headline, personal contribution, decisive visual, and result; an optional three-minute deeper read. Give each section one story beat, one purposeful visual, and short copy. Use headlines that advance the story, not generic process labels. Avoid invented dialogue, dramatic stakes, causal claims, and unsupported metrics. Preserve all NDA restrictions, including Prime Video.

Story anchors already supported by the brief:
- BRIEFS: a building lookup during a call → scattered information → predictable building profiles and checkable answers.
- GM: a biometric direction → interview-led reframing → Dhwani's pushback, convoy coordination, and vehicle-size prototyping.
- Open Library: international-student language needs → leaving the reading flow for help → research recommendations and verified partner follow-through.
- Intelligence Hub: fragmented case history → stakeholder interviews → a shared case-management workflow, kept separate from BRIEFS.
- BudgetCart: grocery decisions under budget and SNAP/WIC constraints → interviews/prototypes → a clearly labeled concept.

- [x] Adopt this story framework in the rebuild brief.
- [x] Rewrite the five public case narratives around a concrete task, friction, a change in understanding, Dhwani's decision, and the documented result.
- [ ] Complete the illustrated sequence with cleared before/after project media. Existing media slots and the BRIEFS workflow illustration remain available.

## Project story checklist
- [x] **Open Library:** uneven team collaboration; first affinity mapping; client calls; international-student language needs; partner adopted feedback-process improvements and increased project investment. The case page states the recommendations were not implemented or tested with readers; no reader outcome is claimed. Evidence: final report plus Dhwani-confirmed partner follow-through.
- [ ] **GM:** user's critical pushback on biometrics; pivot to a community convoy; advanced prototyping, components, first team design system, and enterprise trade-offs.
- [ ] **BRIEFS:** high-stakes supporting case; first contextual inquiry; no existing Figma files; built the concept and design foundation; Apps Script + Sheets prototype and server/deployment work; explain the sensitive-data discovery without exposing real information. Verify any time-saved claim first.
- [ ] **Intel / Intelligence Hub:** keep separate from BRIEFS; verify interview and analyst counts before publication; email/phone intake and spreadsheets made case history hard to retrieve; case-management database; stakeholder interviews and inclusive facilitation; explain navigation choices with usability evidence and HCI principles.
- [ ] **BudgetCart:** SNAP/WIC-aware grocery budgeting; interviews and paper prototypes; first Figma project; self-taught components and visual language; make the concept's value clear without implying later DoorDash features were shipped by this project.
- [ ] **Prime Video:** family-plan concept, but remain hidden or labeled under NDA until cleared.
- [ ] **Lab / About:** concise personal introduction, tasteful photo wall, concise learning note (IoT/automotive UX), distinctive details, no long hobby list.

## Experience and content
- [ ] About gallery: seamless image wall, graceful missing-photo placeholders, subtle hover motion, reduced-motion support, and clear instructions for replacing images in public/gallery/.
- [ ] Project pages: provide media slots for images/video and working “View final report” / “View final project” links where source materials exist.
- [ ] Add an accessible theme picker with Go Blue, Go Green, pink, orange, and a custom two-color gradient. Keep text contrast safe and persist the user's choice.
- [ ] Footer: preserve the user's preferred footer voice and connect “How can I help?” to the actual chat UI. Clearly indicate when the AI service is unavailable; do not pretend it is live.
- [ ] Keep animations purposeful, fast, and optional for reduced-motion users.

## Daily iteration loop
1. Review this checklist and current deployed site.
2. Pick the highest-impact incomplete item that can be completed with available evidence.
3. Make the change, run the relevant build/check, and verify the deployed preview when available.
4. Update this checklist with what changed, evidence used, and any blockers.
5. Do not publish sensitive/NDA material or unsupported outcome claims.

## Current evidence gates
- No confirmed measured time reduction for BRIEFS or Intel: do not state a number.
- Sensitive BRIEFS example must be fictionalized or generalized.
- Prime Video remains confidential.
- Gallery assets require the user's photos; keep friendly image placeholders until supplied.


## Current iteration · October 2
- [x] The four presets (Orange, Go Blue, Pink, Go Green) and custom gradients recolor gallery placeholders, map-game art and pin, playlist background, and track-placeholder discs. Original album art keeps its real colors; the open-to-work indicator stays green because it signals availability.
- [x] Add a first-visit typewriter greeting with a direct Ask DhwaniGPT action.
- [x] Make DhwaniGPT answer from portfolio facts without an external model key; link project answers to case studies, protect Prime Video details, and say when a fact is not verified.
- [x] Do not store chat history. Do not connect the portfolio to the unrelated Luma or Glimmer Supabase databases.
- [x] Vercel production build is READY. Verified Cherry pink and an editable blue-to-orange gradient across the About gallery and playlist; verified map art and pin inherit Cherry pink after fixing their hard-coded mint/orange colors.
- [x] DhwaniGPT `/api/ask` GET reports portfolio mode; the BRIEFS suggestion POST returned HTTP 200 in Vercel logs.
- [ ] Verify a visible chatbot reply and an unknown-question fallback in a normal browser session. The cloud preview returned a browser-level “This page couldn’t load” after the successful POST, so the rendered reply still needs a clean session check.
- [ ] Optional: enable free-form model responses only after configuring a server-side model API key in Vercel. The grounded FAQ remains available without it.


## Palette follow-up · October 2
- [x] Cherry’s accent was separated from Pink, then merged into Pink after the palette was simplified.

- [x] Simplify palette to Orange, Sky Blue, Pink, Yellow, plus the custom gradient. Legacy Cherry selections map to Pink; the renamed Sky Blue and Yellow retain their saved theme IDs.

- [x] Add the Hindi `ध्वनि?` wordmark to desktop and mobile navigation.


## Deployment verification · October 3
- [x] GM contribution update is deployed in Vercel production on commit `6533079`. Build state: READY. `/work/general-motors` returned HTTP 200 with the updated personal contribution, biometric pushback, and shared design-system copy.
- [ ] Verify a visible chatbot reply and unknown-question fallback in a normal browser session. The earlier preview redirected this browser to Vercel login; this iteration verified the GM page response, not interactive chat.
- [ ] Confirm `dhwanibagrecha.com` serves the rebuilt app. The earlier October 3 check rendered the older Framer portfolio; this iteration verified the Vercel deployment only.

## GM contribution update · October 3
- [x] Name Dhwani's biometric pushback in the case narrative and her advanced Figma interactions, reusable components, and first shared team design system in the contribution section.
- Evidence: Dhwani's confirmed account recorded in this brief and the existing GM project card in `src/content/site.ts`. Added no metrics or implementation outcomes.
- Checks: TypeScript syntax/module loading; preserved all other case records, existing GM metrics and NDA status; Vercel build READY; updated copy confirmed in the deployed page response.
- The broader GM story checklist remains open pending cleared source evidence for enterprise constraints.

## Story narrative pass · October 5
- [x] Rewrote BRIEFS, Intelligence Hub, GM, Open Library, and BudgetCart in `src/content/cases.ts` using the framework above. Each has three short sections and a task-specific opening.
- Evidence: existing confirmed case records, the project cards, and the evidence gates in this brief. No invented dialogue or new metrics; existing statistics, statuses, resource links, and NDA exclusions preserved.
- [x] TypeScript syntax/module loading and content-shape checks passed; verified preservation of metrics, media slots, links, project statuses, and confidential-case exclusion.
- [ ] Add cleared project screenshots and annotations before treating the visual storytelling pass as complete.
- [x] Vercel build READY on `a4d8a4a`; all five deployed case routes returned HTTP 200 and their rewritten headlines were confirmed in the page responses. This verifies deployed copy, not a full browser layout review.

## Visual story layout · October 6
- [x] Adapt the Apple sleep-notification reference (https://growth.design/case-studies/apple-sleep-notification) into a concise scroll sequence: numbered friction scenes, an early decision reveal, solution details, then evidence and its limits.
- [x] Add keyboard-accessible chapter anchors and responsive, theme-aware scene styling to all five public case pages. Keep the existing BRIEFS workflow illustration.
- [x] Hide empty media placeholders and their authoring instructions from public pages; preserve content media slots for cleared assets. No project facts or metrics changed; Prime Video stays under NDA.
- [x] TypeScript syntax check passed. Vercel build READY for `7d85a38`; all five case routes returned HTTP 200 with chapter, scene, decision, and evidence markup. Prime Video returned HTTP 200 with only its NDA notice.
- [ ] Complete browser layout review: the Vercel alias redirects this browser to login. `dhwanibagrecha.com/work/budgetcart` still rendered the older portfolio in the browser on October 6, despite the new deployment listing that alias.
- [ ] Add cleared screenshots and annotations; the illustrated sequence remains incomplete until real project media is available.

## Intel illustrated sequence · October 5 evening
- [x] Add a compact workflow schematic and two annotated existing screenshots: original-request overview → case workup. Use only the repository's fictional demo records; identify them as a portfolio demo, not evidence of measured impact.
- [x] TypeScript syntax and diff checks passed; Vercel build READY for `85ed025`. Browser verified both screenshot panels on `portfolio-xi-lilac-73.vercel.app/work/intel`, with no horizontal overflow at the desktop viewport.
- [x] Found an accessible public Vercel production alias; the browser login limitation applies to the protected aliases, not this public alias.
- [ ] Custom-domain routing still needs Cloudflare DNS access. Vercel lists the domain as externally managed with Cloudflare nameservers; the current domain response identifies Framer. No DNS settings were changed.
- [ ] User requested replication of the current dhwanibagrecha.com design with the new stories; source capture in progress. Keep NDA exclusions and evidence gates.

## Story microinteractions · October 5 evening
- [x] Add handwritten, native disclosure notes (“why this choice?”) to all five public case decisions. Reuse the existing verified rationale rather than adding dialogue, metrics, or duplicated copy.
- [x] Make Intel's existing fictional Overview and Workup screenshots an interactive handoff scene, with persistent context, pressed-state buttons, live caption, and full-size screen links. Both images load ahead of switching to avoid a blank first transition.
- [x] Keyboard activation and note expansion verified in the public Vercel browser. Final build READY on `2fc51c4`; both screenshot images loaded and switched correctly with no horizontal overflow at the desktop viewport.
- [x] All other public case routes returned HTTP 200 with note controls. Prime Video returned only its NDA notice, with no note or handoff.
- Responsive layout uses wrapping controls and fluid images; reduced-motion styles disable movement. Mobile viewport verification remains pending.
- [x] Add each remaining project's signature interaction using verified or clearly labeled illustrative material; the seven-scene redo adds BRIEFS lookup, GM pivot, Open Library support and BudgetCart cue restoration alongside the Intel handoff.

## Character-led depth · October 5 evening
Direction: follow one person's task → let the first design fall short → show the documented finding → reveal the revised decision → explain the behavioral mechanism → close with evidence and limits. Use named speaker roles and Dhwani's narration. Clearly label illustrative dialogue; never present it as a participant quote.

- [x] Rebuild BudgetCart's first two beats with shopper/narrator dialogue and a keyboard-accessible hide/restore decision-cues interaction. This is a labeled schematic, not a fabricated screenshot or usability test.
- [x] Add recognition-versus-recall and task-focused minimalism as editorial HCI lenses, sourced to Jakob Nielsen's heuristics 6 and 8: https://www.nngroup.com/articles/ten-usability-heuristics/ (reviewed Jan. 30, 2024). State explicitly that these interpretations do not establish revised-prototype impact.
- [x] Preserve Dhwani's contribution, prototype status, next research question, and outcome limits. Add no prices, quotations, or metrics.
- [x] TSX syntax passed; Vercel build READY on `bfdd97e`. Browser verified hide/restore with keyboard and click, live content changes, source link, and no desktop horizontal overflow.
- [x] Apply this story direction to the other public cases using each case's specific documented evidence. Avoid assigning psychological effects without a source and a concrete design mechanism.
- [ ] Replace schematic and speaker initials with cleared project screens and an authored character treatment where available; do not call the illustrated storytelling complete yet.

## Live-site elements and story order · October 5 evening
- [x] Port the existing `framer/ExperienceFormats.tsx` two-deck experience mixer into the rebuilt homepage, adapting it to the current theme and React version. Use existing repository role records and explicit project-backed skills; disable inferred fallback skills.
- [x] Move case summary claims and statistics after the story and contribution sections, before closing evidence. Preserve project facts, existing metrics, and the Prime Video NDA branch.
- [x] TSX syntax checks passed; Vercel build READY on `1c26b41`. Public preview browser verified the mixer, loading General Motors into deck A, and keyboard crossfade changing from 50 to 51.
- [ ] Copy the remaining live-site elements: photo-strip treatment, project media cards, preferred footer, and About gallery. Do not mark full visual replication complete from the mixer port.
- [ ] Verify the mixer at mobile viewport sizes and complete character-led sequences for the remaining cases with cleared media.

## Photobooth concept · October 6
- [x] Add a compact mechanical photo-strip printer beside the homepage intro, with a stepped feed animation, native Print again control, theme-colored light, and reduced-motion styling. Stack it beneath the intro on narrow layouts.
- [x] Reuse three existing public live-site photographs, optimized and embedded in local SVG assets; no remote photo requests at runtime. This is a concept playground for later Framer adaptation, not a Framer release.
- [x] TSX syntax, targeted ESLint, and diff checks passed. Vercel build READY on `6c30c6b`. Browser verified all three photos loaded, click and Enter replay, live status change, and no desktop horizontal overflow.
- Local full-build attempt was blocked by the borrowed dependency directory (Turbopack symlink root and missing existing packages); the successful Vercel build used the repository dependencies.
- [ ] Verify the stacked layout on mobile, then adapt the approved concept to a Framer component with editable photos and controls.

## Photobooth polish · October 6
- [x] Replace chrome bar with a cream printer body, recessed output slot, screws, and a tactile vibe-colored replay button. Widen the strip, use a subtle paper edge/curl, and remove extra visible status copy in favor of a handwritten note. Keep status available to assistive technology.
- [x] Refine feed/pause/settle animation and rebalance the hero with smaller name typography. Preserve existing photos and reduced-motion support; do not fabricate photo dates.
- [x] Targeted ESLint and TSX syntax passed. Vercel build READY on `6c71efe`; browser verified the new layout, Enter replay, all photos loaded, and no desktop horizontal overflow. Mobile verification and Framer adaptation remain pending.

## Hero spacing · October 6
- [x] Align hero columns at the top with a 24px inset for intro copy; remove inherited minimum height and tighten copy/control spacing.
- [x] Reduce desktop work-section top padding from 118px to 48px and hero bottom padding from 48px to 32px. Use 32px work top padding in the stacked layout.
- [x] Vercel build READY on `6f9c217`. Browser confirmed the deployed padding and reviewed the desktop layout: Selected Work begins closer to the strip. Mobile browser verification remains pending.

## Evidence-led story playground · October 6
- [x] Deepen all five public narratives around the documented turning point and Dhwani’s contribution. Preserve existing statistics, project status, media and NDA restrictions.
- Evidence reviewed: Portfolio Content (Dhwani-authored source notes); UMSI x Open Library Final Report (8 interviews, 330 affinity points); Contextual Inquiry - Dispatch Group (retrieval, separate verification, record ownership). GM and Intel use previously confirmed project facts. BudgetCart uses the authored project account; original Figma access remains blocked.
- [x] Add a theme-aware working folder with Problem → Finding → Decision controls, a connected-thread mode, and a plan-versus-learning notebook. Notes are explicitly reconstructed summaries, not original comments or screenshots; the notebook uses project sequence without invented dates.
- [x] Add an illustrated, skippable Dhwani guide with explicitly authored narration. Add contextual method labels to the existing decorative Figma-style cursor. Visible method labels and native buttons keep the reasoning accessible without a mouse.
- [x] Replace the placeholder About gallery with a compact photo archive using the three existing live-site photos, overlapping paper cards, caption reveal, Tidy up reset, and the printed strip. Preserve reduced-motion support.
- [x] New components and story/content files passed targeted ESLint (one existing image warning). Companion lint still reports the pre-existing synchronous clock-state effect; the added pointer-event label introduces no new lint finding. Diff checks passed.
- [x] Vercel production build READY on 9896f24. Browser verified all five case routes, keyboard note selection, thread advance, notebook switch, guide skip/restore control, contextual cursor label, photo loading, keyboard caption reveal and reset. No desktop horizontal overflow. Prime Video renders only the NDA notice.
- [ ] Replace reconstructed working notes with cleared sketches, research artifacts and final screens where available. Figma denied editor access to the linked BudgetCart prototype; do not imply its original screens were inspected.
- [ ] Verify mobile viewports and reduced-motion behavior in a browser; styles support both but these modes were not independently exercised in this pass.
- [ ] Refine character art and adapt approved interactions to Framer after concept review. This remains the concept playground.

## Full case-story redo · October 6
- [x] Rewrite all five public cases in plain language, keeping core narrative text around 177–207 words per case before optional notes. Lead with the decision, personal role and supported outcome.
- [x] Replace repeated scroll blocks with a seven-scene player: task → friction → finding → decision → behavior → personal contribution → outcome. Adapt Growth.Design’s Apple sleep story pacing, with explicit attribution. Include a native one-page reading option.
- [x] Integrate signature interactions at the decision: observed BRIEFS lookup vs proposed pinned profile; Intel fictional Overview/Workup handoff; GM driver-to-group pivot and phone/in-car split; Open Library contextual support; BudgetCart hide/restore cues.
- [x] Preserve optional connected notes and plan-versus-learning folder. Add case-specific authored commentary, handwritten marginal notes and task prompts labeled as illustrative rather than participant quotations.
- [x] Source recognition, system-status and contextual-help explanations to Nielsen’s heuristics. GM’s sunk-cost interpretation cites Arkes & Blumer (1985), DOI 10.1016/0749-5978(85)90049-4; abstract reviewed. No psychological effect or bias is claimed as measured.
- [x] Make cursor labels specific to verified methods. Open Library says Research recommendations; it does not imply a Figma file was inspected.
- [x] Fix first-load clicks arriving before client hydration: controls enable only when the story player is ready. Preserve native reading access without JavaScript.
- [x] Targeted ESLint and diff checks passed. Local TypeScript reported only the existing borrowed-dependency framer-motion gaps; Vercel’s full production build passed on cef85a4, including the ready-state fix.
- [x] Browser verified seven-scene navigation, ArrowRight, outcome/replay, all five signature interactions, Intel image load/switch, optional reading and folder, guide expand/switch/skip, dark theme and no desktop horizontal overflow. Fresh first-load chapter click works. Prime Video still renders only its NDA notice.
- [x] Preserve existing statistics, statuses, resource links and media fields; add no metrics. Keep missing media hidden.
- [x] Save docs/case-study-storyboards.md with evidence gates, scene outlines and a 12-frame structure for each future whiteboard presentation. Presentations themselves are the next task.
- [ ] Original cleared screenshots, detailed enterprise artifacts and measured test results still need source access before expansion. No invented data, original comments or participant quotes.
- [ ] Mobile viewport and reduced-motion browser verification remain pending. Responsive and motion-preference styles are implemented.

## Scroll-first, 30-second story pass · October 6
- [x] Put an evidence-derived three-beat summary at the top of all five public cases: problem → discovery → Dhwani’s decision. Highlight the decision and pair it with a labeled before → design-direction workflow schematic.
- [x] Restore scrolling as the default: all seven scenes render together, including without JavaScript. Keep optional slide view with a native, keyboard-accessible chapter range and Back/Next controls. Chapter jumps land below the main navigation.
- [x] Use project-specific book, grocery and vehicle illustrations; keep schematic labels, verified personal contributions and supported outcome status visible. Reduce repeated authored notebook commentary to the turning points.
- [x] Targeted ESLint and diff checks passed. Vercel full production build READY on 5e0632e.
- [x] Public preview browser verified all five summary texts, seven scroll scenes per public case, no desktop horizontal overflow, optional slide view, keyboard range End, Back, return to scroll and decision anchor position. Prime Video has only its NDA notice and no story scenes.
- [ ] Cleared original media and mobile viewport verification remain pending. These workflow diagrams are illustrative, not original screens or measured outcomes.
- Whiteboard presentations are the next stage; use the existing evidence-gated storyboards and expand each turning point with verified research, original artifacts and supported results.


## About direction, screen-led stories and accuracy follow-up · October 6
- [x] Replace the About opening with a real existing portrait, a plain introduction, and three expandable project-backed examples of how Dhwani works: contextual observation (BRIEFS), collaborative synthesis (Open Library), and questioning a direction before prototyping it (GM Convoy). Keep the photo archive and personal extras below this introduction.
- [x] Add approximate reading time, a slim collapsible scroll-aware chapter rail adapted from the existing Framer navigation, a softer illustrated guide, and more open scroll spacing. Preserve optional slide view and keyboard navigation.
- [x] Bring two screen frames into each story's friction and decision scenes. Intel uses existing fictional demo images; other cases explicitly show placeholders awaiting cleared media. The first two case figures fill these frames; additional figures remain in the media appendix.
- [x] Correct public copy: remove unresolved Intel interview counts, adoption and migration claims; remove the incorrect GM HVAC description; broaden BRIEFS beyond contact lookup and withhold the conflicting final tab count. Clarify team ownership in Open Library summary copy. Prime Video remains NDA-only.
- Evidence: freshly reviewed Dhwani-authored Portfolio Content notes (https://docs.google.com/document/d/12OCsbwIuQLgdDO-PC9dVf6qBGZRcqodN_Cj4PSepj0w/edit), public project pages on dhwanibagrecha.com, existing repository media and Framer navigation, and previously confirmed personal contributions. The current BRIEFS page says four tabs while earlier PRD notes describe five areas; reconcile before publishing a count. Intel source notes explicitly require verification of counts and outcomes.
- [x] Targeted ESLint for changed About, story, guide, route and content files passed; diff checks passed. ExperienceMixer retains the same baseline five lint errors and five warnings; this pass changes its copy only. Local TypeScript remains blocked by existing borrowed-dependency framer-motion gaps. Vercel full production build READY on fcfa86b.
- [x] Desktop preview verified: About portrait loads; working notes expand with Enter; seven scenes on each public case; chapter selection closes the rail and lands below navigation; Escape restores toggle focus; active chapter follows scroll; guide controls work; no horizontal overflow. Prime Video exposes no story scenes or screen slots.
- [x] Update docs/case-study-storyboards.md with corrected source gates. Whiteboard presentations remain the next stage.
- [ ] Complete the broader fact audit. These corrections resolve identified mismatches, not every claim. Verify Intel delivery status and source counts, BRIEFS final information architecture, and cleared original project media before expansion.
- [ ] Verify mobile viewports and reduced-motion behavior in a browser. Responsive and motion-preference styles are implemented; these modes were not independently exercised.
- [ ] Adapt approved concepts to Framer. The rebuilt preview is available at https://portfolio-xi-lilac-73.vercel.app/about; the custom domain still serves the earlier Framer site and DNS was not changed.


## Supplied interaction references and compact gallery · October 6
- [x] Adapt the uploaded StickyNote reference into the existing case-study notebook narration: palette-aware paper gradients, curled corner, gentle hover lift and reduced-motion styling. No project facts changed.
- [x] Adapt the uploaded WebX cursor spotlight inside screen frames using local pointer events and CSS variables, without adding global listeners or per-move React state. The decorative overlay has pointer-events:none; touch and reduced-motion modes omit the glow.
- [x] Make the About photo wall smaller (920px maximum width and shorter photo stage), preserve all three existing local photos in full color, and move the photo-strip printer into a native optional disclosure. This is the existing three-photo archive, not a restoration of the full Framer gallery collection.
- [x] Targeted ESLint and diff checks passed. Vercel full production build READY on f306e0d. Standalone local CSS parser was unavailable in the borrowed dependencies; deployment compilation succeeded.
- [x] Desktop browser verified all three photo assets load, keyboard caption reveal/reset and printer disclosure, screen disclosure clicks through the spotlight, pointer coordinates update and glow reaches 0.1 opacity, and no horizontal overflow. Reviewed paper-note layout with chapter rail.
- [ ] Mobile and reduced-motion browser review remain pending. Original cleared case screens and the rest of the gallery collection still need assets before expansion.


## Device presentation reference · October 6
- [x] Adapt the supplied DeviceMockups reference into locally styled responsive silver phone shells for both BudgetCart screen slots. Angled frames straighten on hover/focus; narrow layouts and reduced-motion preferences use a static front view. No external mockup overlays or new runtime dependencies.
- [x] Preserve explicit missing-screen labels and original media fields. Wider desktop and paired phone/dashboard GM frames remain wide; add a dedicated GM phone mockup when cleared individual screen media is available.
- [x] Targeted ESLint and diff checks passed. Vercel production build READY on c33d73e. Desktop browser verified phone shells, keyboard caption disclosure, focus straightening and no horizontal overflow; saved preview proof.
- [ ] Cleared original mobile screens and mobile/reduced-motion browser review remain pending. The shell is a visual adaptation, not an exact reproduction of the reference's iPhone overlay assets.
