import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState, CSSProperties } from "react"

/**
 * AuroraBackground — drifting orbs, heavy blur, low opacity.
 * Layout "Hero" (default): orbs cluster at the top, for sitting behind a hero.
 * Layout "Full page": orbs spread over the whole viewport and breathe
 * (slow scale + opacity pulse) so there is no dead black below the fold.
 * Follow vibe: takes its colors from the visitor's "pick your vibe" choice
 * (WorldIntro), and cross-fades live when they switch.
 * Light mode (Oct 2): dims to --db-aurora-opacity (set by PortfolioNav) so text on white stays crisp.
 * Never catches the mouse (clicks and hovers pass through to the page).
 * Respects reduced-motion.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function AuroraBackground(props: any) {
    const { colorA, colorB, colorC, intensity, speed, layout, breathe, followVibe } = props
    const [reduced, setReduced] = useState(false)
    const [vibe, setVibe] = useState<{ a: string; b: string; c: string } | null>(null)
    const rootRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduced(mq.matches)
        const on = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [])

    useEffect(() => {
        if (typeof window === "undefined" || !followVibe) return
        try {
            const raw = localStorage.getItem("db_vibe")
            if (raw) setVibe(JSON.parse(raw))
        } catch {}
        const on = (e: Event) => {
            const d = (e as CustomEvent).detail
            if (d && d.a) setVibe({ a: d.a, b: d.b, c: d.c })
        }
        window.addEventListener("db-vibe", on)
        return () => window.removeEventListener("db-vibe", on)
    }, [followVibe])

    useEffect(() => {
        if (typeof window === "undefined") return
        let el: HTMLElement | null = rootRef.current
        for (let i = 0; el && i < 5; i++) {
            el.style.pointerEvents = "none"
            if (window.getComputedStyle(el).position === "fixed") break
            const parent = el.parentElement
            if (!parent || parent.childElementCount !== 1) break
            el = parent
        }
    }, [])

    const A = followVibe && vibe ? vibe.a : colorA
    const B = followVibe && vibe ? vibe.b : colorB
    const C = followVibe && vibe ? vibe.c : colorC

    const dur = `${speed}s`
    const breatheDur = `${Math.max(6, speed * 0.45)}s`
    const full = layout === "full"

    const orb = (color: string, size: string, top: string, left: string, delay: string): CSSProperties => ({
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
        opacity: intensity,
        filter: "blur(80px)",
        transition: "background 0.9s ease",
        animation: reduced
            ? "none"
            : full && breathe
              ? `auroraDrift ${dur} ease-in-out ${delay} infinite alternate, auroraBreathe ${breatheDur} ease-in-out ${delay} infinite`
              : `auroraDrift ${dur} ease-in-out ${delay} infinite alternate`,
        willChange: reduced ? "auto" : "transform, opacity",
    })

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 0, opacity: "var(--db-aurora-opacity, 1)" as any }}
        >
            <style>{`
                @keyframes auroraDrift {
                    0%   { transform: translate(0px, 0px) scale(1); }
                    50%  { transform: translate(40px, -30px) scale(1.15); }
                    100% { transform: translate(-30px, 20px) scale(0.95); }
                }
                @keyframes auroraBreathe {
                    0%, 100% { opacity: ${intensity * 0.55}; }
                    50%      { opacity: ${intensity}; }
                }
            `}</style>
            {full ? (
                <>
                    <div style={orb(B, "70vmax", "-20vmax", "-10%", "0s")} />
                    <div style={orb(C, "46vmax", "30%", "38%", "-7s")} />
                    <div style={orb(A, "40vmax", "55%", "-6%", "-12s")} />
                    <div style={orb(B, "60vmax", "45%", "55%", "-4s")} />
                    <div style={orb(C, "34vmax", "-8%", "62%", "-15s")} />
                </>
            ) : (
                <>
                    <div style={orb(A, "520px", "-140px", "8%", "0s")} />
                    <div style={orb(B, "460px", "-80px", "58%", "-6s")} />
                    <div style={orb(C, "360px", "40px", "34%", "-11s")} />
                </>
            )}
        </div>
    )
}

AuroraBackground.defaultProps = {
    colorA: "rgba(243,80,15,0.45)",
    colorB: "rgba(123,92,255,0.35)",
    colorC: "rgba(0,229,255,0.22)",
    intensity: 1,
    speed: 24,
    layout: "hero",
    breathe: true,
    followVibe: false,
}

addPropertyControls(AuroraBackground, {
    layout: { type: ControlType.Enum, title: "Layout", options: ["hero", "full"], optionTitles: ["Hero", "Full page"], defaultValue: "hero", displaySegmentedControl: true },
    breathe: { type: ControlType.Boolean, title: "Breathe", defaultValue: true, hidden: ({ layout }: any) => layout !== "full" },
    followVibe: { type: ControlType.Boolean, title: "Follow vibe", defaultValue: false, description: "Use the colors the visitor picked in the intro." },
    colorA: { type: ControlType.Color, defaultValue: "rgba(243,80,15,0.45)" },
    colorB: { type: ControlType.Color, defaultValue: "rgba(123,92,255,0.35)" },
    colorC: { type: ControlType.Color, defaultValue: "rgba(0,229,255,0.22)" },
    intensity: { type: ControlType.Number, min: 0, max: 1, step: 0.05, defaultValue: 1 },
    speed: { type: ControlType.Number, min: 10, max: 60, step: 1, defaultValue: 24 },
})
