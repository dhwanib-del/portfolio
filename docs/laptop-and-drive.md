# Laptop + in-car scenes: how to use them

Two Framer code components. Both are extensions of components that already existed (no new files):

- **DeviceStudio** (`DeviceStudio.tsx`, backup `framer/DeviceStudio.tsx`): a laptop that opens as it scrolls into view and closes as it leaves. The screen can run your live site.
- **ConvoyDrive** (`ConvoyDrive.tsx`, backup `framer/ConvoyDrive.tsx`): the GM Convoy story from the driver's seat. The road moves as you scroll, and your in-car screen sits in the dash.

Demo instances of both are on the design page **Screen components**, in the frame at y 3200. They aren't on any live page yet. To use one, copy it onto a page.

## DeviceStudio (laptop)

1. Paste your site into **Live site URL**. Any https site works, and so does a Figma prototype link.
2. Add a **Poster image** (a screenshot of the site), or paste a **Poster URL**. Visitors see the poster until they click into the screen. That way, a site that refuses to load inside another page never shows up as a blank screen.
3. Visitors click **Click to try it** to use the site. The first click goes to the overlay, so the page scroll doesn't get stuck. **Done** gives the scroll back. **Full screen** and **Open in a new tab ↗** are always under the laptop.

| Property | What it does |
|---|---|
| Live in screen | Turn this **Off** for sites that block being shown inside another page. You get the poster plus an **Open live site** button instead. |
| Open on | **Scroll** makes the lid open and close as you scroll. **Always** keeps it open. With reduced motion turned on, the lid is always open. |
| Closed angle / Open tilt | How far the lid folds shut (92° is flat), and how far it leans back when open (0 is upright). |
| Site width / Site width (phone) | The width your site is drawn at before it's scaled into the screen. Phones use the narrower value so the text stays readable. |
| Give up after | How many seconds to wait for the site before showing the poster + **Open live site**. |
| Caption | One small line under the laptop. |
| Use site vibe / Accent | The accent color follows the site's vibe unless you switch this off. |

On light theme the laptop is silver. On dark theme it's graphite.

**Sites that block being shown inside another page.** Many sites send `X-Frame-Options` or a CSP `frame-ancestors` header, and the browser won't tell the page when that happens (tested: a blocked frame still reports that it loaded). Framer sites and Figma prototypes usually work. Sites that won't load at all fall back on their own after the timeout. A site that's blocked shows blank once someone clicks in, and the "Blank? Open in a new tab" link covers that case. If you know a site blocks embedding, turn **Live in screen** off.

## ConvoyDrive (in the car)

- **Display image / Display URL / Display video**: your real in-car screen. It replaces the drawn Convoy display. The demo uses the existing in-car screen PNG. The video has to be set in the panel, because Framer won't accept file props through the MCP.
- **Beats**: the navigation-card story. Keep it factual. This is a presentation of the concept, not a road test.
- Light theme shows a daytime sky, and dark theme shows dusk. The cabin is dark in both.
- With reduced motion turned on, you get one still frame with Previous / Next buttons. On phones, the display and the story card stack.

## Performance

Both components start listening to scroll only while they're on screen (an IntersectionObserver turns the listener on and off). Each frame writes styles directly, so nothing animates on its own. The laptop loads its site only when it's close to the viewport, inside a sandboxed iframe. Videos play only while they're on screen.

## Testing

Tested in a local harness: esbuild bundle, Framer stubbed, Playwright/Chromium at 1440 and 390, in dark and light. Checks: closed, half-open and open poses; clicking inside the live site; the poster fallback for a site that never loads; an `X-Frame-Options: DENY` site; Live in screen off; reduced motion; no console errors; and zero scroll listeners while off screen.
