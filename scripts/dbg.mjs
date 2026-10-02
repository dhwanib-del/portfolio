import { chromium } from "playwright"
import AxeBuilder from "@axe-core/playwright"
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" })
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" })
const p = await ctx.newPage()
await p.addInitScript(() => { sessionStorage.setItem("intro-seen","1"); sessionStorage.setItem("greet-seen","1") })
await p.goto("http://localhost:3000/about", { waitUntil: "load" }); await p.waitForTimeout(600)
const r = await new AxeBuilder({ page: p }).withTags(["wcag2aa","wcag22aa"]).analyze()
for (const v of r.violations) for (const n of v.nodes.slice(0,3)) console.log(v.id, n.target.join(" "), "|", n.any.map(a=>a.message).join(";").slice(0,200))
console.log(await p.$eval(".nav-tab", e => JSON.stringify(e.getBoundingClientRect())))
await b.close()
