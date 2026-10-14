// Framework-agnostic logic for the case-study components.
// Used by the Next.js components in src/components/case/ and mirrored (inlined) in the
// Framer code components in /framer, because Framer code files must be self-contained.
// If you change behavior here, update the matching block marked "case-ui" in:
//   framer/ScreenViewer.tsx · framer/PrototypeEmbed.tsx · framer/BeforeAfter.tsx

/* ---------- Figma prototype URLs ---------- */

export type FigmaLink = { embedUrl: string; openUrl: string } | null

/**
 * Turn any figma.com proto/design/file share link into an embeddable URL.
 * Returns null for anything that isn't a figma.com link, so callers can show a clear failure state
 * instead of an iframe that silently never loads.
 */
export function figmaEmbed(input: string | undefined | null): FigmaLink {
  if (!input) return null
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\./, "")
  if (host === "embed.figma.com") return { embedUrl: url.toString(), openUrl: url.toString().replace("embed.figma.com", "www.figma.com") }
  if (host !== "figma.com") return null
  const kind = url.pathname.split("/")[1]
  if (!["proto", "design", "file", "board", "deck", "slides"].includes(kind)) return null
  const embed = new URL(url.pathname, "https://embed.figma.com")
  url.searchParams.forEach((v, k) => embed.searchParams.set(k, v))
  embed.searchParams.set("embed-host", "portfolio")
  if (kind === "proto" && !embed.searchParams.has("scaling")) embed.searchParams.set("scaling", "scale-down")
  return { embedUrl: embed.toString(), openUrl: url.toString() }
}

/* ---------- Zoomable viewer ---------- */

export const ZOOM_STEPS = [1, 1.5, 2, 3] as const

export function nextZoom(current: number, dir: 1 | -1): number {
  const i = ZOOM_STEPS.findIndex((z) => z >= current - 0.001)
  const idx = i === -1 ? ZOOM_STEPS.length - 1 : i
  return ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, idx + dir))]
}

export function wrapIndex(i: number, length: number): number {
  if (length <= 0) return 0
  return ((i % length) + length) % length
}

export type ViewerAction = "prev" | "next" | "zoomIn" | "zoomOut" | "reset" | null

/** Keyboard map for the open viewer. Escape is handled by the native <dialog>. */
export function viewerKey(key: string): ViewerAction {
  switch (key) {
    case "ArrowLeft": return "prev"
    case "ArrowRight": return "next"
    case "+": case "=": return "zoomIn"
    case "-": case "_": return "zoomOut"
    case "0": return "reset"
    default: return null
  }
}

/* ---------- Annotations ---------- */

export type Annotation = { x: number; y: number; title: string; body: string }

/** Clamp pin coordinates (percent of the image) so pins never render outside the screen. */
export function normalizeAnnotations<T extends Annotation>(list: T[] | undefined): T[] {
  return (list || [])
    .filter((a) => a && a.title)
    .map((a) => ({ ...a, x: clamp(Number(a.x) || 0, 2, 98), y: clamp(Number(a.y) || 0, 2, 98) }))
}

/* ---------- Before / After ---------- */

/** Evidence status for an iteration. Only "retested" may be described as an improvement. */
export type IterationEvidence = "retested" | "reviewed" | "untested"

export const EVIDENCE_LABEL: Record<IterationEvidence, string> = {
  retested: "Retested with users",
  reviewed: "Reviewed, not retested",
  untested: "Revision not yet tested",
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
