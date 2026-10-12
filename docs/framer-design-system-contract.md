# Framer → portfolio design-system contract

Source of truth: `framer/PortfolioNav.tsx` (v14, October 11, 2026), `framer/AnnotatedScreen.tsx`, `framer/CaseStudyNav.tsx`, `framer/CaseStudy.tsx`.

## Typography
- Poppins is the primary interface and case-study typeface.
- Accent script is reserved for small expressive headlines/personal moments, never long paragraphs or UI controls.
- Editorial hierarchy is shared: display, page, section, body, caption, eyebrow.

## Color and theme
- Dark-first: background #000; surface #111; raised surface #1F1F1F; text #FFF; accent uses vibe-accent with orange #F3500F fallback.
- Light: background #FFF; surface #EEE; raised surface #E0E0E0; text #0A0A0A; accent #C23D08 fallback. With a vibe selected, light mode uses an ink version of the vibe accent (Next.js: `--vibe-accent-ink`, darkened to 4.5:1 against #E0E0E0; PortfolioNav targets white, which can fall under 4.5:1 on grey surfaces).
- Theme should be attribute and token driven; do not mutate individual layer inline styles on theme change.
- Framer uses `--db-*` tokens / `data-db-theme`; Next.js mirrored variables live in `src/app/globals.css`. Next.js still uses `data-theme` for its existing toggle.
- Preserve contrast and offer prefers-reduced-motion handling.

## Components
- Framer AnnotatedScreen already supports image/video, hotspots, guided and side modes, zoom dialog, mobile list, keyboard navigation. Do not duplicate this logic when porting the Vercel ScreenStory or PrototypeExplorer.
- Framer CaseStudyNav already supplies collapsible section progress/read time. Use it for case pages rather than adding another floating navigation pattern.
- Shared anatomy: project hero → role/scope/status → research evidence → 2–3 decisions → actual full-size screenshots/interactive prototype → honest outcome.
- Implemented Oct 12, 2026 (only where the library had a gap):
  - `framer/ScreenViewer.tsx` — several screens at native proportions, zoom dialog (100–300%, ←/→, +/−, 0, Esc, focus return), owner labels, phone stack/scroll, theme + accent controls.
  - `framer/PrototypeEmbed.tsx` — the PrototypeExplorer this contract called for: Figma URL → embed, click-to-load or automatic, timeout failure state, full screen, Open in Figma fallback, desktop/phone ratios.
  - `framer/BeforeAfter.tsx` — one iteration with a required evidence status (not tested / reviewed / retested) and labeled slots for missing sides.
  - Annotations stay in `AnnotatedScreen`; decisions stay in `DecisionCard`. No duplicates were built.
- Shared logic for these lives in `src/lib/case-ui` (Next.js) and is mirrored in a marked `case-ui` block in each Framer file, because Framer code files must be self-contained. Change both together.
- Known drift: `AnnotatedScreen` labels use JetBrains Mono (`MONO`), which breaks the two-font rule (Poppins + Pinyon Script).

## Porting rules
- Treat Figma exports as approved assets only after checking permissions for sensitive or NDA projects.
- Maintain stable source data, alt text, captions, interaction labels, and fallback links.
- Never fabricate outcomes, user quotes, shipped screens, or measured metrics.
- Reuse existing Framer navigation and theme conventions; do not build competing design systems.
