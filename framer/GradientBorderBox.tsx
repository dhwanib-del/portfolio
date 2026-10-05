// Gradient border box component with customizable border width, radius, gradient, and background
// Oct 5 (GM case study value cards: "this looks bad, rebuild again"):
//  • New default look "Card": theme-aware surface (near-white in light, --db-surface in dark, always opaque),
//    thin 1.5px gradient border from the vibe accent into a second hue (color-mix, so it follows the site accent),
//    small outlined number badge, 22px title, 15.5px body in --db-text-2, fills its cell (equal heights), subtle
//    hover lift (off under reduced motion). Text always uses the theme text tokens, so it can't go dark-on-dark.
//  • Fill it with Number / Title / Body in the right panel. Children (if any) still render instead.
//  • Look "Custom" keeps the old behaviour exactly: Gradient Stops, Gradient Angle, Border Width, Background.
//  • Backdrop mode (no Number/Title/Body, no children — how the GM page uses it: an absolute layer behind
//    native Framer text): "Restyle layers above" (default on) tags the host stack's own text layers with
//    data-gbb attributes and restyles them with theme tokens — title 22px semibold --db-text, body 15.5px
//    --db-text-2, the number circle becomes a small accent-outlined badge, cards share a row height.
//    Turn it off to leave the layers alone.
import { addPropertyControls, ControlType } from "framer"
import { type CSSProperties, useEffect, useMemo, useRef } from "react"

interface GradientStop {
    color: string
    position: number
}

interface GradientBorderBoxProps {
    children?: React.ReactNode
    borderWidth: number
    borderRadius: number
    gradientStops: GradientStop[]
    gradientAngle: number
    background: string
    look?: "card" | "custom"
    number?: string
    title?: string
    body?: string
    secondHue?: string
    align?: "left" | "center"
    restyleLayers?: boolean
    style?: CSSProperties
}

const RT = '[data-framer-component-type="RichTextContainer"]'

const FONT = "'Satoshi', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const CSS = `
.gbb { position: relative; box-sizing: border-box; width: 100%; height: 100%; padding: 1.5px; isolation: isolate;
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease; }
.gbb:hover { transform: translateY(-3px); box-shadow: var(--db-shadow, 0 18px 40px -22px rgba(0,0,0,.55)); }
.gbb-in { box-sizing: border-box; width: 100%; height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 28px 26px 30px;
  background: linear-gradient(var(--db-surface, rgba(255,255,255,.04)), var(--db-surface, rgba(255,255,255,.04))), var(--db-bg, #0B0B0B);
  color: var(--db-text, #F5F5F5); font-family: ${FONT}; overflow: hidden; }
.gbb-center .gbb-in { align-items: center; text-align: center; }
.gbb-num { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 30px; height: 30px; border-radius: 999px;
  border: 1.5px solid var(--db-accent, #F3500F); color: var(--db-accent, #F3500F); background: color-mix(in srgb, var(--db-accent, #F3500F) 8%, transparent);
  font-size: 13px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.gbb-title { margin: 4px 0 0; font-size: 22px; line-height: 1.2; font-weight: 600; letter-spacing: -.015em; color: var(--db-text, #F5F5F5); }
.gbb-body { margin: 0; font-size: 15.5px; line-height: 1.55; font-weight: 400; color: var(--db-text-2, rgba(245,245,245,.68)); max-width: 46ch; }
@media (min-width: 1100px) { .gbb-title { font-size: 23px; } }
@media (prefers-reduced-motion: reduce) { .gbb { transition: none; } .gbb:hover { transform: none; } }
[data-gbb="row"] { align-items: stretch !important; gap: 16px !important; }
[data-gbb="host"] { width: auto !important; flex: 1 1 240px !important; max-width: 380px !important; min-width: 220px !important; height: auto !important; align-self: stretch !important;
  justify-content: flex-start !important; padding: 28px 24px 30px !important; gap: 14px !important; box-sizing: border-box !important;
  transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease; }
[data-gbb="host"]:hover { transform: translateY(-3px); box-shadow: var(--db-shadow, 0 18px 40px -22px rgba(0,0,0,.55)); }
[data-gbb="host"] .gbb:hover { transform: none; box-shadow: none; }
[data-gbb="badge"] { width: 30px !important; height: 30px !important; border-radius: 999px !important; background: color-mix(in srgb, var(--db-accent, #F3500F) 8%, transparent) !important;
  box-shadow: inset 0 0 0 1.5px var(--db-accent, #F3500F) !important; }
[data-gbb="num"] .framer-text { --framer-text-color: var(--db-accent, #F3500F) !important; color: var(--db-accent, #F3500F) !important; --framer-font-size: 13px !important; font-size: 13px !important; line-height: 1 !important; }
[data-gbb="title"] .framer-text { --framer-text-color: var(--db-text, #F5F5F5) !important; color: var(--db-text, #F5F5F5) !important; --framer-font-size: 22px !important; font-size: 22px !important;
  --framer-line-height: 1.2em !important; line-height: 1.2 !important; --framer-letter-spacing: -0.015em !important; letter-spacing: -.015em !important; font-weight: 600 !important; }
[data-gbb="body"] .framer-text { --framer-text-color: var(--db-text-2, rgba(245,245,245,.68)) !important; color: var(--db-text-2, rgba(245,245,245,.68)) !important; --framer-font-size: 15.5px !important; font-size: 15.5px !important;
  --framer-line-height: 1.55em !important; line-height: 1.55 !important; --framer-letter-spacing: 0em !important; letter-spacing: 0 !important; }
@media (min-width: 1100px) { [data-gbb="title"] .framer-text { --framer-font-size: 23px !important; font-size: 23px !important; } }
@media (prefers-reduced-motion: reduce) { [data-gbb="host"] { transition: none; } [data-gbb="host"]:hover { transform: none; } }
`

// Backdrop mode: find the stack this box sits behind (nearest ancestor with other children) and tag its text layers.
function useRestyleHost(root: React.RefObject<HTMLDivElement>, on: boolean, radius: number) {
    useEffect(() => {
        const me = root.current
        if (!on || !me || typeof document === "undefined") return
        let host: HTMLElement | null = me.parentElement
        let steps = 0
        while (host && host.children.length < 2 && steps < 6) {
            host = host.parentElement
            steps++
        }
        if (!host || host === document.body) return
        const texts = Array.from(host.querySelectorAll<HTMLElement>(RT)).filter((t) => !me.contains(t))
        if (texts.length < 2) return
        const tagged: HTMLElement[] = []
        const tag = (el: HTMLElement | null, v: string) => {
            if (!el) return
            el.setAttribute("data-gbb", v)
            tagged.push(el)
        }
        let rest = texts
        if (texts.length >= 3) {
            const num = texts[0]
            tag(num, "num")
            const badge = num.parentElement
            if (badge && badge !== host) tag(badge, "badge")
            rest = texts.slice(1)
        }
        tag(rest[0], "title")
        tag(rest[1], "body")
        tag(host, "host")
        const prevRadius = host.style.borderRadius
        host.style.borderRadius = `${radius}px`
        const row = host.parentElement
        if (row && row !== document.body) tag(row, "row")
        return () => {
            tagged.forEach((el) => el.removeAttribute("data-gbb"))
            if (host) host.style.borderRadius = prevRadius
        }
    }, [on, radius])
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function GradientBorderBox(props: GradientBorderBoxProps) {
    const {
        children,
        borderWidth,
        borderRadius,
        gradientStops,
        gradientAngle,
        background,
        style
    } = props
    const look = props.look || "card"
    const rootRef = useRef<HTMLDivElement>(null)
    const hasContentProps = !!(props.number || props.title || props.body)
    const backdrop = look === "card" && !hasContentProps && !children && props.restyleLayers !== false
    useRestyleHost(rootRef, backdrop, borderRadius ?? 16)

    const gradient = useMemo(() => {
        const sortedStops = [...(gradientStops || [])].sort((a, b) => a.position - b.position)
        const colorStops = sortedStops.map(stop => `${stop.color} ${stop.position}%`)
        return `linear-gradient(${gradientAngle}deg, ${colorStops.join(", ")})`
    }, [gradientStops, gradientAngle])

    if (look === "card") {
        const hue = props.secondHue || "#2BB5A8"
        const accent = "var(--db-accent, #F3500F)"
        const line = "var(--db-line, rgba(127,127,127,.22))"
        // Accent → accent blended into the second hue, softened toward the theme line so it stays quiet on both modes.
        const cardGradient = `linear-gradient(${gradientAngle ?? 135}deg, color-mix(in srgb, ${accent} 72%, ${line}) 0%, color-mix(in srgb, color-mix(in srgb, ${accent} 30%, ${hue}) 62%, ${line}) 100%)`
        const r = borderRadius ?? 16
        const hasContent = hasContentProps
        return (
            <div
                ref={rootRef}
                className={`gbb${props.align === "center" ? " gbb-center" : ""}`}
                style={{ ...style, background: cardGradient, borderRadius: r, width: "100%", height: "100%" }}
            >
                <style>{CSS}</style>
                <div className="gbb-in" style={{ borderRadius: Math.max(0, r - 1.5) }}>
                    {children ? (
                        children
                    ) : hasContent ? (
                        <>
                            {props.number ? (
                                <span className="gbb-num" aria-hidden="true">{props.number}</span>
                            ) : null}
                            {props.title ? <h3 className="gbb-title">{props.title}</h3> : null}
                            {props.body ? <p className="gbb-body">{props.body}</p> : null}
                        </>
                    ) : null}
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                ...style,
                position: "relative",
                background: gradient,
                borderRadius: borderRadius,
                padding: borderWidth,
                width: "100%",
                height: "100%",
                boxSizing: "border-box"
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: background,
                    borderRadius: Math.max(0, borderRadius - borderWidth),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                }}
            >
                {children}
            </div>
        </div>
    )
}

addPropertyControls(GradientBorderBox, {
    look: {
        type: ControlType.Enum,
        title: "Look",
        options: ["card", "custom"],
        optionTitles: ["Card (theme)", "Custom"],
        displaySegmentedControl: true,
        defaultValue: "card",
    },
    number: {
        type: ControlType.String,
        title: "Number",
        defaultValue: "",
        hidden: (p: any) => p.look === "custom",
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "",
        hidden: (p: any) => p.look === "custom",
    },
    body: {
        type: ControlType.String,
        title: "Body",
        defaultValue: "",
        displayTextArea: true,
        hidden: (p: any) => p.look === "custom",
    },
    align: {
        type: ControlType.Enum,
        title: "Align",
        options: ["left", "center"],
        optionTitles: ["Left", "Center"],
        displaySegmentedControl: true,
        defaultValue: "left",
        hidden: (p: any) => p.look === "custom",
    },
    secondHue: {
        type: ControlType.Color,
        title: "Second Hue",
        defaultValue: "#2BB5A8",
        hidden: (p: any) => p.look === "custom",
    },
    restyleLayers: {
        type: ControlType.Boolean,
        title: "Restyle layers above",
        defaultValue: true,
        description: "When used as a backdrop behind text layers, restyle them with theme colors.",
        hidden: (p: any) => p.look === "custom",
    },
    borderWidth: {
        type: ControlType.Number,
        title: "Border Width",
        defaultValue: 4,
        min: 1,
        max: 20,
        step: 1,
        unit: "px",
        hidden: (p: any) => p.look !== "custom",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Border Radius",
        defaultValue: 12,
        min: 0,
        max: 9999,
        step: 1,
        unit: "px"
    },
    gradientStops: {
        type: ControlType.Array,
        title: "Gradient Stops",
        hidden: (p: any) => p.look !== "custom",
        control: {
            type: ControlType.Object,
            controls: {
                color: {
                    type: ControlType.Color,
                    title: "Color",
                    defaultValue: "#ff6b6b"
                },
                position: {
                    type: ControlType.Number,
                    title: "Position",
                    defaultValue: 0,
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: "%"
                }
            }
        },
        defaultValue: [
            { color: "#ff6b6b", position: 0 },
            { color: "#4ecdc4", position: 50 },
            { color: "#45b7d1", position: 100 }
        ]
    },
    gradientAngle: {
        type: ControlType.Number,
        title: "Gradient Angle",
        defaultValue: 45,
        min: 0,
        max: 360,
        step: 1,
        unit: "deg"
    },
    background: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
        hidden: (p: any) => p.look !== "custom",
    }
})
