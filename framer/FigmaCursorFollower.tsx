// Dhwani: "the microinteractions in nudge-folio are great, can we fix up the cursor"
// v2 (Dhwani: "my cursor is also BAD"): one cursor, not two.
// Page scope → a small pill rides right next to the real pointer (no second arrow,
// no lag) and only speaks when it has something useful to say: "reveal ↓" on cards,
// "watch ▶" on videos, "open ↗" on links, "click" on buttons. Otherwise it shows a
// tiny dot in your color (or nothing — "Idle" setting). Follows the visitor's vibe
// color when "Follow vibe" is on. Hidden on touch screens. Never blocks clicks.
// Section scope keeps the original Figma multiplayer tag inside its parent.
// Oct 2: colors follow the site theme tokens (--db-*) for light/dark.
import * as React from "react"
import { startTransition } from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType } from "framer"

type Ctx = "" | "reveal" | "hide" | "video" | "link" | "button"

type Props = {
    label: string
    color: string
    scope: "section" | "page"
    idle: "dot" | "name" | "none"
    followVibe: boolean
    hoverLabel: string
    flipLabel: string
    videoLabel: string
    buttonLabel: string
    textColor: string
}

function Tag({ label, color, textColor }: { label: string; color: string; textColor: string }) {
    return (
        <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                <path d="M2 1.5L15 8.5L9 9.5L6.5 15.5L2 1.5Z" style={{ fill: color }} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
            </svg>
            <div
                style={{
                    position: "absolute",
                    left: 16,
                    top: 14,
                    background: color,
                    color: textColor,
                    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "3px 8px 8px 8px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
            >
                {label}
            </div>
        </>
    )
}

function readableText(hex: string) {
    const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i)
    if (!m) return "#0A0A0A"
    const n = parseInt(m[1], 16)
    const r = (n >> 16) & 255,
        g = (n >> 8) & 255,
        b = n & 255
    return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#0A0A0A" : "#FFFFFF"
}

function toHex(c: string) {
    if (!c) return "#F3500F"
    if (c.startsWith("#")) return c
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return "#F3500F"
    const [r, g, b] = m[1].split(",").map((v) => parseInt(v.trim(), 10))
    return "#" + [r, g, b].map((v) => (isNaN(v) ? 0 : v).toString(16).padStart(2, "0")).join("")
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function FigmaCursorFollower(props: Props) {
    const { label, color, scope, idle, followVibe, hoverLabel, flipLabel, videoLabel, buttonLabel, textColor } = props
    const ref = React.useRef<HTMLDivElement | null>(null)
    const pillRef = React.useRef<HTMLDivElement | null>(null)
    const visibleRef = React.useRef(false)
    const [pos, setPos] = React.useState({ x: 0, y: 0 })
    const [visible, setVisible] = React.useState(false)
    const [ctx, setCtx] = React.useState<Ctx>("")
    const [mounted, setMounted] = React.useState(false)
    const [isTouch, setIsTouch] = React.useState(false)
    const [vibeColor, setVibeColor] = React.useState<string | null>(null)

    React.useEffect(() => {
        if (typeof window === "undefined") return
        startTransition(() => {
            setMounted(true)
            setIsTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches)
        })
    }, [])

    // Vibe color
    React.useEffect(() => {
        if (typeof window === "undefined" || !followVibe) return
        try {
            const raw = localStorage.getItem("db_vibe")
            if (raw) setVibeColor(JSON.parse(raw).accent || null)
        } catch {}
        const on = (e: Event) => {
            const d = (e as CustomEvent).detail
            if (d && d.accent) startTransition(() => setVibeColor(d.accent))
        }
        window.addEventListener("db-vibe", on)
        return () => window.removeEventListener("db-vibe", on)
    }, [followVibe])

    const tint = toHex((followVibe && vibeColor) || color)
    // The brand orange follows the theme accent (darker in light mode) with its matching text color
    const isBrandOrange = tint.toLowerCase() === "#f3500f"
    const fill = isBrandOrange ? "var(--db-accent, #F3500F)" : tint
    const tagText =
        isBrandOrange && ["rgb(10,10,10)", "#0a0a0a"].includes(String(textColor || "").replace(/\s+/g, "").toLowerCase())
            ? `var(--db-on-accent, ${textColor})`
            : textColor

    // Section mode: original behavior
    React.useEffect(() => {
        if (typeof window === "undefined" || scope !== "section") return
        function onMove(e: MouseEvent) {
            const el = ref.current
            if (!el) return
            const r = el.getBoundingClientRect()
            const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
            startTransition(() => {
                setVisible(inside)
                if (inside) setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
            })
        }
        window.addEventListener("mousemove", onMove)
        return () => window.removeEventListener("mousemove", onMove)
    }, [scope])

    // Page mode: pill glued to the pointer (transform only, no re-render per frame)
    React.useEffect(() => {
        if (typeof window === "undefined" || scope !== "page" || isTouch) return
        let last: Ctx = ""
        function onMove(e: MouseEvent) {
            const el = pillRef.current
            if (el) el.style.transform = `translate3d(${e.clientX + 14}px, ${e.clientY + 16}px, 0)`
            const t = e.target as Element | null
            let next: Ctx = ""
            if (t && t.closest) {
                const card = t.closest("[aria-expanded], [aria-pressed]") as HTMLElement | null
                if (card)
                    next =
                        card.getAttribute("aria-expanded") === "true" || card.getAttribute("aria-pressed") === "true"
                            ? "hide"
                            : "reveal"
                else if (t.closest("video, figure")) next = "video"
                else if (t.closest("a")) next = "link"
                else if (t.closest("button, [role='button'], [role='link']")) next = "button"
            }
            if (next !== last) {
                last = next
                startTransition(() => setCtx(next))
            }
            if (!visibleRef.current) {
                visibleRef.current = true
                startTransition(() => setVisible(true))
            }
        }
        function onLeave() {
            visibleRef.current = false
            startTransition(() => setVisible(false))
        }
        window.addEventListener("mousemove", onMove, { passive: true })
        document.addEventListener("mouseleave", onLeave)
        return () => {
            window.removeEventListener("mousemove", onMove)
            document.removeEventListener("mouseleave", onLeave)
        }
    }, [scope, isTouch])

    const pageLabel =
        ctx === "reveal"
            ? flipLabel
            : ctx === "hide"
              ? "hide ↺"
              : ctx === "video"
                ? videoLabel
                : ctx === "link"
                  ? hoverLabel
                  : ctx === "button"
                    ? buttonLabel
                    : idle === "name"
                      ? label
                      : ""

    if (scope === "page") {
        const hasText = !!pageLabel
        const showDot = !hasText && idle === "dot"
        const fg = isBrandOrange ? "var(--db-on-accent, #0A0A0A)" : readableText(tint)
        const follower =
            mounted && !isTouch
                ? createPortal(
                      <div
                          ref={pillRef}
                          aria-hidden="true"
                          style={{
                              position: "fixed",
                              left: 0,
                              top: 0,
                              pointerEvents: "none",
                              zIndex: 2147483000,
                              opacity: visible && (hasText || showDot) ? 1 : 0,
                              transition: "opacity 0.2s ease",
                              willChange: "transform",
                          }}
                      >
                          <div
                              style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  height: hasText ? 24 : 8,
                                  minWidth: hasText ? 0 : 8,
                                  padding: hasText ? "0 10px" : 0,
                                  borderRadius: 999,
                                  background: fill,
                                  color: fg,
                                  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  letterSpacing: "0.02em",
                                  whiteSpace: "nowrap",
                                  boxShadow: hasText ? `0 6px 18px -6px ${fill}` : `0 0 10px ${fill}`,
                                  transformOrigin: "left top",
                                  transition:
                                      "height .22s cubic-bezier(.16,1,.3,1), padding .22s cubic-bezier(.16,1,.3,1), min-width .22s, background .4s",
                                  overflow: "hidden",
                              }}
                          >
                              {pageLabel}
                          </div>
                      </div>,
                      document.body
                  )
                : null
        return (
            <div ref={ref} style={{ position: "relative", width: 1, height: 1, pointerEvents: "none" }}>
                {follower}
            </div>
        )
    }

    return (
        <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 40 }}>
            <div
                style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    opacity: visible && !isTouch ? 1 : 0,
                    transition: "left 0.09s linear, top 0.09s linear, opacity 0.25s ease",
                    transform: "translate(-2px, -2px)",
                }}
            >
                <Tag label={label} color={fill} textColor={tagText} />
            </div>
        </div>
    )
}

FigmaCursorFollower.defaultProps = {
    label: "dhwani",
    color: "rgb(243, 80, 15)",
    scope: "section",
    idle: "dot",
    followVibe: true,
    hoverLabel: "open ↗",
    flipLabel: "reveal ↓",
    videoLabel: "watch ▶",
    buttonLabel: "click",
    textColor: "rgb(10, 10, 10)",
}

addPropertyControls(FigmaCursorFollower, {
    label: { type: ControlType.String, defaultValue: "dhwani", title: "Label" },
    color: { type: ControlType.Color, defaultValue: "rgb(243, 80, 15)", title: "Color" },
    followVibe: { type: ControlType.Boolean, defaultValue: true, title: "Follow vibe" },
    textColor: {
        type: ControlType.Color,
        defaultValue: "rgb(10, 10, 10)",
        title: "Tag Text",
        hidden: (p: Props) => p.scope === "page",
    },
    scope: {
        type: ControlType.Enum,
        title: "Scope",
        options: ["section", "page"],
        optionTitles: ["Section", "Whole page"],
        defaultValue: "section",
        displaySegmentedControl: true,
    },
    idle: {
        type: ControlType.Enum,
        title: "Idle",
        options: ["dot", "name", "none"],
        optionTitles: ["Dot", "Name", "Nothing"],
        defaultValue: "dot",
        displaySegmentedControl: true,
        hidden: (p: Props) => p.scope !== "page",
    },
    hoverLabel: { type: ControlType.String, title: "Over links", defaultValue: "open ↗", hidden: (p: Props) => p.scope !== "page" },
    flipLabel: { type: ControlType.String, title: "Over cards", defaultValue: "reveal ↓", hidden: (p: Props) => p.scope !== "page" },
    videoLabel: { type: ControlType.String, title: "Over videos", defaultValue: "watch ▶", hidden: (p: Props) => p.scope !== "page" },
    buttonLabel: { type: ControlType.String, title: "Over buttons", defaultValue: "click", hidden: (p: Props) => p.scope !== "page" },
})
