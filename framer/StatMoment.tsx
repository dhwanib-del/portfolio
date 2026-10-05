import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState, CSSProperties } from "react"

/**
 * StatMoment — one or more big numbers that count up when scrolled into view.
 * "Stat Moment" scene. Fill width, fit height. Respects reduced-motion.
 * "Stats (text)" lets a page set its numbers as plain text: "4|weeks cut; $38%|share"
 * (value can carry a prefix/suffix like $ or %). When filled it overrides the list.
 * Oct 4 (light-mode sweep): cells, numbers and captions follow the site theme tokens (--db-*);
 * warm accents (orange/maize) follow the visitor's vibe accent, other hues get a darker ink in
 * light mode so the prefix/suffix stays readable.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function StatMoment(props) {
    const { stats, statsText, accent, duration } = props
    const ref = useRef<HTMLDivElement | null>(null)
    const [inView, setInView] = useState(false)
    const [reduced, setReduced] = useState(false)
    const light = useDbLight()

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduced(mq.matches)
        const on = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [])

    useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined") {
            setInView(true)
            return
        }
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setInView(true)
                    obs.disconnect()
                }
            },
            { threshold: 0.4 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    // Two-font system: Poppins only. Label feel = uppercase + tracking.
    const label = "'Poppins', sans-serif"
    const sans = "'Poppins', sans-serif"

    const wrap: CSSProperties = {
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        width: "100%",
        justifyContent: "flex-start",
    }

    const list = parseStats(statsText) || stats || []
    const ink = accentInk(accent, light)

    return (
        <div ref={ref} style={wrap} data-db-keep="">
            {list.map((s, i) => (
                <StatCell
                    key={i}
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    label={s.label}
                    accent={ink}
                    duration={duration}
                    animate={inView && !reduced}
                    label_font={label}
                    sans={sans}
                />
            ))}
        </div>
    )
}

// Is this a yellow / maize / orange accent?
function isWarm(c: string): boolean {
    const s = String(c || "").trim().toLowerCase()
    let r = 0
    let g = 0
    let b = 0
    const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
    if (m) {
        r = +m[1]
        g = +m[2]
        b = +m[3]
    } else {
        const h = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/)
        if (!h) return false
        const x = h[1].length === 3 ? h[1].split("").map((ch) => ch + ch).join("") : h[1]
        const n = parseInt(x, 16)
        r = (n >> 16) & 255
        g = (n >> 8) & 255
        b = n & 255
    }
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    if (max < 120 || d < 90) return false
    let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    hue *= 60
    if (hue < 0) hue += 360
    return hue >= 8 && hue <= 62
}

// Accent used as TEXT
function accentInk(c: string, light: boolean): string {
    if (!c || isWarm(c)) return `var(--db-accent, ${c || "#F3500F"})`
    return light ? `color-mix(in srgb, ${c} 52%, #000)` : c
}

function useDbLight(): boolean {
    const [light, setLight] = useState(false)
    useEffect(() => {
        if (typeof document === "undefined") return
        const html = document.documentElement
        const read = () => setLight(html.getAttribute("data-db-theme") === "light")
        read()
        window.addEventListener("db-theme", read)
        let mo: MutationObserver | null = null
        if (typeof MutationObserver !== "undefined") {
            mo = new MutationObserver(read)
            mo.observe(html, { attributes: true, attributeFilter: ["data-db-theme"] })
        }
        return () => {
            window.removeEventListener("db-theme", read)
            if (mo) mo.disconnect()
        }
    }, [])
    return light
}

function parseStats(text?: string) {
    if (!text || !text.trim()) return null
    const out = text
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [raw = "", ...rest] = part.split("|")
            const m = raw.trim().match(/^([^\d]*)([\d,.]+)(.*)$/)
            if (!m) return null
            return {
                prefix: m[1].trim(),
                value: Number(m[2].replace(/,/g, "")) || 0,
                suffix: m[3].trim(),
                label: rest.join("|").trim(),
            }
        })
        .filter(Boolean)
    return out.length ? out : null
}

function StatCell(props) {
    const { value, prefix, suffix, label, accent, duration, animate, label_font, sans } = props
    const [display, setDisplay] = useState(animate ? 0 : value)

    useEffect(() => {
        if (!animate) {
            setDisplay(value)
            return
        }
        let raf = 0
        const start = performance.now()
        const from = 0
        const tick = (now: number) => {
            const t = Math.min((now - start) / (duration * 1000), 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.round(from + (value - from) * eased))
            if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [animate, value, duration])

    const cell: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: "1 1 200px",
        minWidth: 180,
        padding: "24px 28px",
        background: "var(--db-surface, #111111)",
        border: "1px solid var(--db-line, #2A2A2A)",
        borderRadius: 16,
    }

    const number: CSSProperties = {
        fontFamily: sans,
        fontWeight: 600,
        fontSize: "clamp(44px, 7vw, 72px)",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: "var(--db-text, #FAFAFA)",
        display: "flex",
        alignItems: "baseline",
        gap: 2,
    }

    const affix: CSSProperties = {
        color: accent,
        fontSize: "0.5em",
        fontWeight: 600,
    }

    const cap: CSSProperties = {
        fontFamily: label_font,
        fontWeight: 500,
        fontSize: 12,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "color-mix(in srgb, var(--db-text, #FAFAFA) 64%, transparent)",
    }

    return (
        <div style={cell}>
            <span style={number}>
                {prefix ? <span style={affix}>{prefix}</span> : null}
                {display.toLocaleString()}
                {suffix ? <span style={affix}>{suffix}</span> : null}
            </span>
            <span style={cap}>{label}</span>
        </div>
    )
}

StatMoment.defaultProps = {
    accent: "#F3500F",
    duration: 1.6,
    statsText: "",
    stats: [
        { value: 123, prefix: "", suffix: "", label: "functional requirements" },
        { value: 76, prefix: "", suffix: "", label: "user stories" },
    ],
}

addPropertyControls(StatMoment, {
    accent: { type: ControlType.Color, defaultValue: "#F3500F" },
    duration: {
        type: ControlType.Number,
        min: 0.5,
        max: 4,
        step: 0.1,
        defaultValue: 1.6,
    },
    statsText: {
        type: ControlType.String,
        title: "Stats (text)",
        displayTextArea: true,
        defaultValue: "",
        description: "value|label; value|label — overrides the list below when filled. e.g. 4|weeks cut; 38%|truck share",
    },
    stats: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                value: { type: ControlType.Number, defaultValue: 100 },
                prefix: { type: ControlType.String, defaultValue: "" },
                suffix: { type: ControlType.String, defaultValue: "" },
                label: { type: ControlType.String, defaultValue: "label" },
            },
        },
        defaultValue: [
            { value: 123, prefix: "", suffix: "", label: "functional requirements" },
            { value: 76, prefix: "", suffix: "", label: "user stories" },
        ],
    },
})
