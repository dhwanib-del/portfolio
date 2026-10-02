// DhwaniGPT backend. Answers only from the portfolio content in this repo.
// Off until ANTHROPIC_API_KEY is set (in Vercel: Project → Settings → Environment Variables).
import { cases } from "@/content/cases"
import { experience, person, projects } from "@/content/site"

const MODEL = process.env.DHWANIGPT_MODEL || "claude-haiku-4-5-20251001"

function knowledge() {
  const p = projects.map((x) => `- ${x.title}: ${x.result}. ${x.body}${x.nda ? " (Under NDA: share nothing beyond this line.)" : ""}`).join("\n")
  const c = cases.map((x) => `## ${x.org}\n${x.headline}\n${x.hook}\n${x.meta.map((m) => `${m.label}: ${m.value}`).join("; ")}\n${x.sections.map((s) => `${s.heading} ${s.body.join(" ")}`).join("\n")}\n${x.ai ? "AI: " + x.ai : ""}\nStatus: ${x.status}`).join("\n\n")
  const e = experience.map((r) => `- ${r.dates}: ${r.role}, ${r.org}. ${r.summary}`).join("\n")
  return `Name: ${person.name}\nRoles sought: ${person.roles}\nSchool: ${person.school}, graduating ${person.grad}\nLocation: ${person.location}\n\nProjects:\n${p}\n\nCase studies:\n${c}\n\nExperience:\n${e}`
}

const SYSTEM = `You are DhwaniGPT, a small assistant on Dhwani Bagrecha's portfolio. Visitors are usually recruiters and hiring managers.
Rules:
- Answer ONLY from the portfolio facts below. If the answer isn't there, say you don't know and suggest contacting Dhwani.
- Never invent numbers, outcomes, employers, dates or tools. Say "projected" only where the facts say so.
- Prime Video and GM details are under NDA: don't add anything beyond the facts.
- Keep answers to 2–4 short sentences, plain and friendly. Refer to her as "Dhwani" or "she".
- When useful, point to the case study page, e.g. /work/briefs.

Portfolio facts:
${knowledge()}`

export async function GET() {
  return Response.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) })
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return Response.json({ error: "DhwaniGPT is off." }, { status: 503 })
  let body: { message?: string; history?: { role: "user" | "assistant"; content: string }[] }
  try { body = await req.json() } catch { return Response.json({ error: "Bad request" }, { status: 400 }) }
  const message = (body.message || "").slice(0, 600).trim()
  if (!message) return Response.json({ error: "Empty message" }, { status: 400 })
  const history = (body.history || []).slice(-8).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 1200) }))

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, messages: [...history, { role: "user", content: message }] }),
  })
  if (!res.ok) return Response.json({ error: "The assistant couldn't answer right now." }, { status: 502 })
  const data = await res.json()
  const reply = (data.content || []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("").trim()
  return Response.json({ reply })
}
