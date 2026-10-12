// Interaction + accessibility checks for the case-study components.
// Usage: BASE_URL=http://127.0.0.1:3000 node scripts/check-case-components.mjs
// Covers: ScreenViewer (open, zoom keys, next/prev, Esc, focus return), AnnotatedScreen (pins ↔ list),
// PrototypeEmbed (click-to-load, cover state), AssetSlot labels, light theme, and axe (WCAG 2.2 AA).
import { chromium } from "playwright"
import AxeBuilder from "@axe-core/playwright"
import fs from "node:fs"

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000"
const executablePath = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined
const browser = await chromium.launch({ executablePath, args: ["--proxy-bypass-list=<-loopback>;127.0.0.1;localhost"] })
const results = []
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? " — " + detail : ""}`) }

async function page(path, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, colorScheme: opts.scheme || "dark", reducedMotion: "reduce" })
  const p = await ctx.newPage()
  await p.addInitScript(() => { try { sessionStorage.setItem("intro-seen", "1"); sessionStorage.setItem("greet-seen", "1") } catch {} })
  await p.goto(BASE + path, { waitUntil: "networkidle" })
  return { p, ctx }
}

// ---- ScreenViewer (BudgetCart hero has two screens) ----
{
  const { p, ctx } = await page("/work/budgetcart")
  const thumb = p.getByRole("button", { name: /Enlarge: AI cart builder/ })
  await thumb.focus()
  await p.keyboard.press("Enter")
  const dlg = p.locator("dialog[open]")
  check("viewer opens from keyboard", await dlg.count() === 1)
  check("viewer moves focus inside", await p.evaluate(() => !!document.activeElement?.closest("dialog[open]")))
  const zoomText = () => dlg.locator("text=/^\\d+%$/").first().textContent()
  await p.keyboard.press("+"); check("+ zooms to 150%", (await zoomText()) === "150%")
  await p.keyboard.press("+"); await p.keyboard.press("+"); await p.keyboard.press("+"); check("zoom caps at 300%", (await zoomText()) === "300%")
  await p.keyboard.press("0"); check("0 resets to 100%", (await zoomText()) === "100%")
  const title = () => dlg.locator("p[aria-live]").first().textContent()
  await p.keyboard.press("ArrowRight"); check("→ goes to next screen", /2 \/ 2.*Budget Calendar/.test(await title()), await title())
  await p.keyboard.press("ArrowRight"); check("→ wraps to first", /1 \/ 2/.test(await title()))
  const imgW = await dlg.locator("img").evaluate((i) => i.getBoundingClientRect().width)
  check("viewer does not upscale past 2× native (339px)", imgW <= 339 * 2 + 1, `${Math.round(imgW)}px`)
  await p.keyboard.press("Escape")
  check("Esc closes viewer", await p.locator("dialog[open]").count() === 0)
  check("focus returns to the thumbnail", await p.evaluate(() => document.activeElement?.getAttribute("aria-label") || "") .then((l) => l.startsWith("Enlarge: AI cart builder")))

  // ---- AnnotatedScreen ----
  const pin = p.getByRole("button", { name: /^Note 1: Eligibility before checkout/ })
  check("annotation pins are buttons with names", await pin.count() === 1)
  await pin.click()
  const active = await p.locator('li[data-active="true"]').first().textContent()
  check("pin highlights its list item", /Eligibility before checkout/.test(active || ""))
  const listVisible = await p.getByText("SNAP/WIC and dietary labels appear where the shopper picks a store.").isVisible()
  check("annotation text is visible without hover", listVisible)

  // ---- PrototypeEmbed ----
  check("prototype starts as a cover (no iframe)", await p.locator('iframe[title*="Figma"]').count() === 0)
  await p.getByRole("button", { name: "Load interactive prototype" }).click()
  const src = await p.locator('iframe[title*="Figma"]').getAttribute("src")
  check("load creates embed.figma.com iframe", /^https:\/\/embed\.figma\.com\/proto\//.test(src || ""), src?.slice(0, 60))
  check("Open in Figma fallback present", await p.getByRole("link", { name: /Open in Figma/ }).count() === 1)

  // ---- BeforeAfter evidence ----
  check("before/after states it wasn't retested", await p.getByText("Revision not yet tested").isVisible())
  await ctx.close()
}

// ---- AssetSlot + ownership on GM ----
{
  const { p, ctx } = await page("/work/general-motors")
  check("GM hero is a labeled slot, not a fake interface", await p.getByText("Original designs coming soon").first().isVisible())
  check("GM shows 'What the team did'", await p.getByRole("heading", { name: "What the team did" }).isVisible())
  await ctx.close()
}

// ---- Phone: annotation list stacks below; toc scrolls not overflows ----
{
  const { p, ctx } = await page("/work/budgetcart", { viewport: { width: 390, height: 844 } })
  const [img, list] = await Promise.all([
    p.locator("figure:has(button[aria-label^='Note 1']) img").first().boundingBox(),
    p.locator("ol:has(button[aria-pressed])").first().boundingBox(),
  ])
  check("phone: notes stack under the screen", !!img && !!list && list.y > img.y + img.height - 1)
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  check("phone: no horizontal page overflow", over <= 1, `${over}px`)
  await ctx.close()
}

// ---- axe, both themes, every case page ----
for (const scheme of ["dark", "light"]) {
  for (const slug of ["general-motors", "briefs", "intel", "budgetcart", "openlibrary"]) {
    const { p, ctx } = await page(`/work/${slug}`, { scheme })
    const axe = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
    const v = axe.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)
    check(`axe ${scheme} /work/${slug}`, v.length === 0, v.join("; "))
    await ctx.close()
  }
}

await browser.close()
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
