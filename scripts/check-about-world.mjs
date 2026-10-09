import { chromium } from "playwright"
import assert from "node:assert/strict"

const base = process.env.BASE_URL || "http://127.0.0.1:3010"
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on("pageerror", e => errors.push(e.message))
await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"))
// Allow the local start command to bind before beginning the browser checks.
await new Promise(resolve => setTimeout(resolve, 1000))
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    for (const theme of ["dark", "light"]) {
      await page.setViewportSize({ width, height: 960 })
      await page.goto(`${base}/about`, { waitUntil: "domcontentloaded" })
      await page.evaluate(t => document.documentElement.dataset.theme = t, theme)
      const tiles = page.locator('button[aria-label^="Enlarge photo:"]')
      assert.equal(await tiles.count(), 15)
      await page.locator('button[aria-label^="Enlarge photo:"] img').evaluateAll(nodes=>nodes.forEach(img=>img.loading="eager"))
      await page.waitForFunction(() => [...document.querySelectorAll('button[aria-label^="Enlarge photo:"] img')].every(img => img.complete && img.naturalWidth > 0))
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.screenshot({ path: `/workspace/scratch/5d5fa4891bd7/world-${width}-${theme}.png` })
      console.log(`${width}/${theme}: 15 photos loaded, no page overflow`)
    }
  }
  await page.getByRole("button", {name: "DJ in progress", exact: true}).click()
  assert.equal(await page.getByRole("button", {name: "DJ in progress", exact: true}).getAttribute("aria-pressed"), "true")
  await page.getByRole("link", {name: "Open my playlist"}).click()
  assert.equal(await page.locator("#playlist").evaluate(el => el.open), true)
  await page.getByRole("button", {name: "designer", exact: true}).click()
  await page.getByRole("button", {name: "off the clock", exact: true}).click()
  const before = await page.locator('button[aria-label^="Enlarge photo:"]').evaluateAll(nodes => nodes.map(n => n.getAttribute("aria-label")).sort())
  await page.getByRole("button", {name: "Shuffle the wall"}).click()
  const after = await page.locator('button[aria-label^="Enlarge photo:"]').evaluateAll(nodes => nodes.map(n => n.getAttribute("aria-label")).sort())
  assert.deepEqual(before, after)
  await page.getByRole("button", {name: "Open my world"}).click()
  const dialog = page.getByRole("dialog")
  await dialog.waitFor({state: "visible"})
  assert.equal(await dialog.locator('button[aria-label^="Enlarge photo:"]').count(), 15)
  await dialog.locator('button[aria-label^="Enlarge photo:"]').first().click()
  assert.equal(await dialog.locator("figure img").count(), 1)
  await page.keyboard.press("Escape")
  await dialog.waitFor({state:"hidden"})
  assert.equal(await page.getByRole("button", {name: "Open my world"}).evaluate(el => el === document.activeElement), true)
  await page.emulateMedia({reducedMotion:"reduce"})
  await page.getByRole("button", {name:"DJ in progress",exact:true}).click()
  assert.deepEqual(errors, [])
  console.log("Role controls, playlist opening, shuffle preservation, gallery/photo dialog, Escape/focus return and reduced motion: passed")
} finally { await browser.close() }
