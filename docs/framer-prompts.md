# Framer fix prompts

Paste these into Framer AI one at a time, on the page named. Check the result in both light and dark (toggle in the preview) before moving on. If the Framer MCP plugin is open, Claude can do most of these directly instead.

## 1. Same nav on every page
Page: About, Lab, every /work page, 404

> On this page, hide the old "MainNavigation" / "NavBar" instance. Add the "PortfolioNav" code component, position fixed, top 0, centered, with the same settings as on the Home page: brand "dhwani", font size 15, tab height 40, tab padding 16, show theme on, show lights on, show ask on, vibe glow on, breakpoint 810. Do this on the Desktop, Tablet and Phone breakpoints.

## 2. Vibe picker on every page
Page: About, Lab, every /work page

> Copy the "WorldIntro" instance from the Home page and paste it onto this page with the same settings (show when: session, show switcher: on, switcher side: left, cursor name "dhwani"). Position fixed, 0 × 0, top left. It should only play the intro once per visit, but the vibe chip stays on every page.

## 3. Remove the big gap at the top of About
Page: About

> Select the "Hero" stack at the top of the page. Change its height from 1517px to fit content. Then make sure the space between the nav and the "about me" eyebrow is 120px on Desktop, 104px on Tablet and 96px on Phone, and nothing else adds empty space above the gallery.

## 4. Page backgrounds that work in light mode
Page: every page

> Change this page's background color on every breakpoint from "/Black" to the "/DB/Bg" color style. Then find any frame or text on this page using a hard-coded color (like rgb(13,13,13), white or black values) and switch it to the matching color style: backgrounds to "/Background" or "/Primary", body text to "/Text Primary", secondary text to "/Text Secondary", borders to "/Mono white/10".

## 5. Connect actually connects
Page: Home

> Add a section with id "contact" at the bottom of the Home page, above the footer: eyebrow "say hi", heading "Send a signal.", one line "For research, design, weird systems, or vegetarian food recommendations.", and three buttons: Email (mailto: your email), LinkedIn, Résumé (PDF). Use the existing Primary Button component. The nav's "connect" tab should scroll here.

(Fill in your email, LinkedIn and résumé links before publishing.)

## 6. BRIEFS videos are clickable
Page: /work/briefs

> Every video on this page should play inline, with controls visible on hover and on keyboard focus. Clicking a video opens it larger in a lightbox with a close button and Esc to close. Videos stay muted until the visitor turns sound on.

## 7. Lab framing
Page: /lab

> Above the drag canvas, add: eyebrow "play", heading "Things I build when nobody asked.", one line "Side projects and AI experiments. Each one taught me something I used in real work." Under the canvas add a one-line hint: "Drag the board to look around, or tab through the projects." Keep the "how the lab is built" card. Remove the "Your turn" artboard section.

## 8. Final check (each page)

> Check this page at 390px wide: no horizontal scroll, text at least 16px, buttons at least 44px tall, nothing overlaps the nav. List anything that fails.
