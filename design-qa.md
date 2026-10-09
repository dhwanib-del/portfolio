# Live portfolio replication QA

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
