# Live portfolio replication QA

## October 10: Restore About gallery movement

- [x] Added slow automatic horizontal drift with gentle direction reversal at the ends; all 15 originals remain interactive without duplicate tiles.
- [x] Pause on hover, keyboard focus, touch/mouse interaction, open photo dialog, hidden tab or offscreen gallery. Manual pause/resume provided; reduced motion disables drift.
- [x] Animation updates the scroll position through requestAnimationFrame without per-frame React state. Resize/visibility observers and animation frames are cleaned up.
- [x] Changed-file ESLint, production build, check-gallery-drift.mjs and the existing check-about-world.mjs passed, including both themes at five widths and photo/dialog/playlist/shuffle behavior.

Motion reproduction: BASE_URL=http://127.0.0.1:3020 node scripts/check-gallery-drift.mjs with the site running.

## October 9: Curved About gallery implementation

- [x] Implemented approved curved-wall concept with concise introduction and designer/DJ/off-the-clock controls.
- [x] Imported all 15 original gallery items from the current live Framer About module, retaining source captions, years and source URLs in src/content/gallery.json. These are public existing gallery records, not invented biographical claims.
- [x] Added horizontal mouse drag/touch scroll, keyboard panning, shuffle without loss, full gallery and photo enlargement using a native dialog with Escape/focus return.
- [x] Retained original three-photo archive, printer, playlist and project examples in About. DJ link opens the playlist disclosure.
- [x] Changed-file ESLint and production build passed. Playwright exercised 1440/1024/768/390/320 widths in light and dark, all image sources, role controls, playlist opening, shuffle preservation, dialog and reduced-motion behavior.
- [x] Desktop dark and mobile light screenshots visually reviewed; no page horizontal overflow. The gallery itself intentionally scrolls horizontally.
- [ ] Check new deployment availability after publishing.

Reproduce interaction checks: BASE_URL=http://127.0.0.1:3010 node scripts/check-about-world.mjs (with the site running). Screenshots are written to scratch rather than committed.

## October 9: About side wall and AI Lab

- [x] Shortened About introduction; moved all three existing archive photos into a prominent side wall, stacking below on phones.
- [x] Retained caption pickup/reset, photo-strip printer and playlist (playlist now expandable).
- [x] Renamed desktop/mobile Play navigation to AI Lab; moved the existing map-game link into Lab without labeling it an AI-powered game.
- [x] Connect retains /#contact and lands on the hiring heading with fixed-header clearance.
- [x] TypeScript, changed-file ESLint, production build and diff whitespace checks passed.
- [x] Playwright exercised 1440/390/320 widths in light and dark: three wall images loaded, no horizontal overflow; photo pickup/reset, Lab game link and mobile Connect navigation exercised.
- [x] Desktop dark and phone light screenshots visually reviewed. Existing intro was suppressed for article-layout testing; its behavior was not changed.
- [ ] Verify the new Vercel deployment after release.

The older full-site replication limitation below remains separate from this scoped improvement.

final result: blocked

The requested live-site replication is not implemented. Desktop homepage source was captured; the latest instruction ends with “but” and its remaining constraint is missing. Mobile source capture and all interaction states have not been captured; the exposed browser controls lack viewport resizing. No source/prototype fidelity comparison has passed. See docs/live-portfolio-source.md.

The separate Intel illustrated-sequence improvement passed its build and desktop browser checks; this does not constitute full-site replication QA.
