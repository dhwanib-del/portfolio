// Screenshot + accessibility check. Usage: node scripts/shoot.mjs <path> [name] [--intro]
import { chromium } from "playwright"
import AxeBuilder from "@axe-core/playwright"
import fs from "node:fs"

const path = process.argv[2] || "/"
const name = process.argv[3] || (path === "/" ? "home" : path.replaceAll("/", "_"))
const intro = process.argv.includes("--intro")
const out = "/tmp/claude-0/shots"
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" })
const results = []
for (const scheme of ["dark", "light"]) {
  for (const [w, h, tag] of [[1440, 900, "desk"], [390, 844, "phone"]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: "no-preference" })
    const page = await ctx.newPage()
    if (!intro) await page.addInitScript(() => { try { sessionStorage.setItem("intro-seen", "1"); sessionStorage.setItem("greet-seen", "1") } catch {} })
    await page.goto("http://localhost:3000" + path, { waitUntil: "load" })
    await page.waitForTimeout(intro ? 2200 : 600)
    await page.screenshot({ path: `${out}/${name}-${tag}-${scheme}.png`, fullPage: !intro })
    if (tag === "desk") {
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
      for (const v of axe.violations) results.push(`${scheme}: ${v.id} (${v.nodes.length}) ${v.help} :: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log(results.length ? results.join("\n") : "axe: no violations")
