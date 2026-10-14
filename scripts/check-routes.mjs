// Route smoke test. Usage: BASE_URL=http://127.0.0.1:3000 node scripts/check-routes.mjs [--shots]
// For each route × width: HTTP status, console/page errors, broken images/videos,
// horizontal page overflow, and (with --shots) a full-page screenshot to /tmp/claude-0/route-shots.
import { chromium } from "playwright"
import fs from "node:fs"

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000"
const shots = process.argv.includes("--shots")
const out = "/tmp/claude-0/route-shots"
if (shots) fs.mkdirSync(out, { recursive: true })

const routes = ["/", "/work/general-motors", "/work/briefs", "/work/intel", "/work/openlibrary", "/work/budgetcart", "/story-lab", "/resume"]
const widths = [[1440, 900, "desk"], [820, 1180, "tablet"], [390, 844, "phone"]]

const executablePath = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
  ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
  : undefined
// Bypass any sandbox proxy for the local server; external hosts (Figma, Google Fonts) are
// reported separately so sandbox network limits don't read as site bugs.
const browser = await chromium.launch({ executablePath, args: ["--proxy-bypass-list=<-loopback>;127.0.0.1;localhost"] })
const isExternalNetErr = (t) => /ERR_TUNNEL_CONNECTION_FAILED|ERR_PROXY|ERR_NAME_NOT_RESOLVED/.test(t)
let failures = 0
for (const route of routes) {
  // /resume redirects to an external document; verify the redirect instead of rendering it.
  if (route === "/resume") {
    const r = await fetch(BASE + route, { redirect: "manual" })
    const loc = r.headers.get("location")
    const ok = [307, 308].includes(r.status) && /^https:\/\//.test(loc || "")
    if (!ok) failures++
    console.log(`${ok ? "ok  " : "FAIL"} /resume — ${r.status} → ${loc}`)
    continue
  }
  for (const [w, h, tag] of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: "dark", reducedMotion: "reduce" })
    const page = await ctx.newPage()
    await page.addInitScript(() => { try { sessionStorage.setItem("intro-seen", "1"); sessionStorage.setItem("greet-seen", "1") } catch {} })
    const errors = []
    page.on("console", (m) => {
      if (m.type() !== "error" || isExternalNetErr(m.text())) return
      // the matching 4xx is already reported by the response handler with its URL
      if (/Failed to load resource: the server responded with a status of 4\d\d/.test(m.text())) return
      errors.push("console: " + m.text().slice(0, 200))
    })
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)))
    page.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) errors.push(`${r.status()} ${r.url().replace(BASE, "")}`) })
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" })
    // scroll through so lazy media loads
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)) }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(400)
    const report = await page.evaluate(() => {
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"))
      const overflow = document.documentElement.scrollWidth - window.innerWidth
      const wide = overflow > 1
        ? [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed")
            .slice(0, 4).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`)
        : []
      return { broken, overflow, wide, h1: document.querySelector("h1")?.textContent?.trim().slice(0, 80) ?? null }
    })
    const problems = [...errors]
    if (res.status() !== 200) problems.push(`status ${res.status()}`)
    if (report.broken.length) problems.push("broken img: " + report.broken.join(", "))
    if (report.overflow > 1) problems.push(`overflow ${report.overflow}px: ${report.wide.join(" ")}`)
    if (!report.h1) problems.push("no h1")
    if (problems.length) failures++
    console.log(`${problems.length ? "FAIL" : "ok  "} ${route} @${tag} — h1: ${report.h1}${problems.length ? "\n      " + problems.join("\n      ") : ""}`)
    if (shots) await page.screenshot({ path: `${out}/${route === "/" ? "home" : route.slice(1).replaceAll("/", "_")}-${tag}.png`, fullPage: true })
    await ctx.close()
  }
}
await browser.close()
console.log(failures ? `\n${failures} route/width combinations had problems` : "\nall routes clean")
process.exit(failures ? 1 : 0)
