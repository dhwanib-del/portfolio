import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useRef, useCallback } from "react"

/**
 * BriefsFlowSection
 *
 * NOISE → PAUSE → FOCUS
 *
 * The three-phase interaction language for the BRIEFS case study.
 * Demonstrates the core design insight: information overload (NOISE) →
 * deliberate stillness (PAUSE) → clear hierarchy emerges (FOCUS).
 *
 * Use on the BRIEFS case study page as an interactive process section.
 * Scrolling into view auto-advances through phases; clicking manually steps.
 *
 * Design language: Tactile Warm Futurism
 * - Warm dark ground: #101114
 * - Cream text: #E8D5B0
 * - Orange accent: #F3500F
 * - Subdued: #9A8878
 * - Precision easing for UI: cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * - Spring for personal objects: spring with slight overshoot
 *
 * Oct 4 (light-mode sweep): this is a dark-in-both-modes panel with explicitly light (cream)
 * text, so the root is marked data-db-keep — the nav's light-mode flip used to turn the ground
 * light grey while the cream text stayed, which made it unreadable.
 */

type Phase = "noise" | "pause" | "focus"

const PHASES: Phase[] = ["noise", "pause", "focus"]

const PHASE_LABELS: Record<Phase, string> = {
    noise: "NOISE",
    pause: "PAUSE",
    focus: "FOCUS",
}

const PHASE_DESCRIPTIONS: Record<Phase, string> = {
    noise:
        "Users receive dozens of briefs a week. Each one demands attention. Nothing is prioritised — everything feels urgent.",
    pause:
        "The system pauses. Not by hiding information, but by creating stillness. The reader is given a moment to breathe.",
    focus:
        "Hierarchy emerges. The most important brief rises. Context collapses into glanceable metadata. Action becomes obvious.",
}

// Simulated "brief" cards that scatter/collect to illustrate each phase
interface BriefCard {
    id: number
    title: string
    tag: string
    urgency: "high" | "medium" | "low"
    daysLeft: number
}

const BRIEFS_DATA: BriefCard[] = [
    { id: 1, title: "Brand Identity Refresh", tag: "Brand", urgency: "high", daysLeft: 2 },
    { id: 2, title: "Q4 Campaign Visual", tag: "Campaign", urgency: "medium", daysLeft: 7 },
    { id: 3, title: "App Icon Variants", tag: "Digital", urgency: "low", daysLeft: 14 },
    { id: 4, title: "Print Collateral Suite", tag: "Print", urgency: "medium", daysLeft: 5 },
    { id: 5, title: "Social Content Pack", tag: "Social", urgency: "high", daysLeft: 1 },
    { id: 6, title: "Packaging Redesign", tag: "Product", urgency: "low", daysLeft: 21 },
]

const URGENCY_COLORS: Record<string, string> = {
    high: "#F3500F",
    medium: "#C4944A",
    low: "#9A8878",
}

// --- Per-phase card layout config ---
interface CardLayout {
    x: string // CSS left
    y: string // CSS top
    rotation: string
    opacity: number
    scale: number
    zIndex: number
    blur: number
}

function getNoiseLayout(index: number): CardLayout {
    const scattered = [
        { x: "2%", y: "8%", rotation: "-4deg", opacity: 0.9, scale: 1 },
        { x: "28%", y: "2%", rotation: "2.5deg", opacity: 0.85, scale: 0.96 },
        { x: "55%", y: "6%", rotation: "-1.5deg", opacity: 0.8, scale: 0.98 },
        { x: "10%", y: "44%", rotation: "3deg", opacity: 0.75, scale: 0.95 },
        { x: "38%", y: "48%", rotation: "-2deg", opacity: 0.88, scale: 0.97 },
        { x: "62%", y: "40%", rotation: "1deg", opacity: 0.7, scale: 0.94 },
    ]
    const s = scattered[index % scattered.length]
    return { ...s, zIndex: 6 - index, blur: 0 }
}

function getPauseLayout(index: number): CardLayout {
    // Still — same positions but slightly de-emphasized, a breath of air between them
    const base = getNoiseLayout(index)
    return {
        ...base,
        opacity: index === 0 ? 0.5 : 0.25,
        scale: index === 0 ? 0.98 : 0.95,
        blur: index === 0 ? 0 : 1,
        rotation: "0deg",
    }
}

function getFocusLayout(index: number): CardLayout {
    if (index === 0) {
        // Lead brief: rises and dominates
        return { x: "50%", y: "8%", rotation: "0deg", opacity: 1, scale: 1.02, zIndex: 10, blur: 0 }
    }
    // Remaining briefs: recede into a stacked list below
    const listTop = 60 + (index - 1) * 10
    return {
        x: "50%",
        y: `${listTop}%`,
        rotation: "0deg",
        opacity: Math.max(0.1, 0.45 - index * 0.06),
        scale: Math.max(0.88, 0.96 - index * 0.02),
        zIndex: 6 - index,
        blur: index > 2 ? 2 : 0,
    }
}

function getLayout(phase: Phase, index: number): CardLayout {
    if (phase === "noise") return getNoiseLayout(index)
    if (phase === "pause") return getPauseLayout(index)
    return getFocusLayout(index)
}

interface BriefCardProps {
    brief: BriefCard
    layout: CardLayout
    phase: Phase
    isLead: boolean
    duration: number
}

function BriefCardEl({ brief, layout, phase, isLead, duration }: BriefCardProps) {
    const isFocusLead = phase === "focus" && isLead

    // transform origin for focus lead: translate(-50%, 0) so it centers
    const translateX = phase === "focus" ? "calc(-50%)" : "0"

    return (
        <div
            style={{
                position: "absolute",
                left: layout.x,
                top: layout.y,
                width: isFocusLead ? "min(320px, 72%)" : "min(240px, 56%)",
                transform: `translateX(${translateX}) rotate(${layout.rotation}) scale(${layout.scale})`,
                opacity: layout.opacity,
                filter: layout.blur > 0 ? `blur(${layout.blur}px)` : "none",
                zIndex: layout.zIndex,
                transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                background: isFocusLead ? "#1A1813" : "#161410",
                border: `1px solid ${isFocusLead ? "rgba(243,80,15,0.25)" : "rgba(232,213,176,0.08)"}`,
                borderRadius: 6,
                padding: isFocusLead ? "20px 24px" : "14px 18px",
                boxShadow: isFocusLead
                    ? "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(243,80,15,0.1)"
                    : "0 2px 12px rgba(0,0,0,0.4)",
                willChange: "transform, opacity",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: isFocusLead ? 12 : 6,
                }}
            >
                <span
                    style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: isFocusLead ? "17px" : "13px",
                        fontWeight: 500,
                        color: "#E8D5B0",
                        lineHeight: 1.3,
                        flex: 1,
                    }}
                >
                    {brief.title}
                </span>
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: URGENCY_COLORS[brief.urgency],
                        flexShrink: 0,
                        marginTop: 4,
                        opacity: isFocusLead ? 1 : 0.6,
                    }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <span
                    style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        color: "#6B5E52",
                        textTransform: "uppercase",
                        background: "rgba(232,213,176,0.06)",
                        padding: "2px 6px",
                        borderRadius: 3,
                    }}
                >
                    {brief.tag}
                </span>
                {isFocusLead && (
                    <span
                        style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "10px",
                            color: URGENCY_COLORS[brief.urgency],
                            letterSpacing: "0.06em",
                        }}
                    >
                        {brief.daysLeft === 1 ? "due tomorrow" : `${brief.daysLeft}d left`}
                    </span>
                )}
            </div>
        </div>
    )
}

interface Props {
    /** Auto-advance through phases on scroll-into-view */
    autoPlay?: boolean
    /** Duration of each phase in ms */
    phaseDuration?: number
    /** Transition duration in ms */
    transitionDuration?: number
    /** Height of the component in px */
    height?: number
}

export default function BriefsFlowSection({
    autoPlay = true,
    phaseDuration = 2200,
    transitionDuration = 560,
    height = 520,
}: Props) {
    const [phase, setPhase] = useState<Phase>("noise")
    const [phaseIndex, setPhaseIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const hasEntered = useRef(false)

    const advancePhase = useCallback(() => {
        setPhaseIndex((prev) => {
            const next = (prev + 1) % PHASES.length
            setPhase(PHASES[next])
            return next
        })
    }, [])

    // Scroll-triggered autoplay
    useEffect(() => {
        if (!autoPlay) return
        const el = containerRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasEntered.current) {
                    hasEntered.current = true
                    // Slight delay before first auto-advance
                    autoTimer.current = setTimeout(() => {
                        autoTimer.current = setInterval(advancePhase, phaseDuration)
                    }, phaseDuration)
                } else if (!entry.isIntersecting && hasEntered.current) {
                    // Reset when scrolled away
                    if (autoTimer.current) clearInterval(autoTimer.current)
                    hasEntered.current = false
                    setPhase("noise")
                    setPhaseIndex(0)
                }
            },
            { threshold: 0.4 }
        )
        observer.observe(el)
        return () => {
            observer.disconnect()
            if (autoTimer.current) clearInterval(autoTimer.current)
        }
    }, [autoPlay, advancePhase, phaseDuration])

    const handleStepClick = (targetPhase: Phase) => {
        if (autoTimer.current) clearInterval(autoTimer.current)
        setPhase(targetPhase)
        setPhaseIndex(PHASES.indexOf(targetPhase))
    }

    return (
        <div
            ref={containerRef}
            data-db-keep=""
            style={{
                width: "100%",
                background: "#101114",
                fontFamily: "'Poppins', sans-serif",
                padding: "48px 0 56px",
            }}
        >
            {/* Section label */}
            <div
                style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    color: "#6B5E52",
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginBottom: 40,
                }}
            >
                process
            </div>

            {/* Phase stepper */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    marginBottom: 48,
                }}
            >
                {PHASES.map((p, i) => {
                    const isActive = p === phase
                    const isPast = PHASES.indexOf(phase) > i
                    return (
                        <div
                            key={p}
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <button
                                onClick={() => handleStepClick(p)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "6px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: "11px",
                                        letterSpacing: "0.2em",
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive
                                            ? "#E8D5B0"
                                            : isPast
                                            ? "#9A8878"
                                            : "#4A4038",
                                        transition: `color ${transitionDuration}ms ease`,
                                    }}
                                >
                                    {PHASE_LABELS[p]}
                                </span>
                                <span
                                    style={{
                                        display: "block",
                                        width: isActive ? 32 : 6,
                                        height: 1,
                                        background: isActive
                                            ? "#F3500F"
                                            : isPast
                                            ? "#9A8878"
                                            : "#2A2420",
                                        transition: `width ${transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), background ${transitionDuration}ms ease`,
                                    }}
                                />
                            </button>
                            {i < PHASES.length - 1 && (
                                <span
                                    style={{
                                        display: "block",
                                        width: 24,
                                        height: 1,
                                        background: "#2A2420",
                                        margin: "0 4px",
                                    }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Card stage */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height,
                    overflow: "hidden",
                }}
            >
                {BRIEFS_DATA.map((brief, index) => {
                    const layout = getLayout(phase, index)
                    return (
                        <BriefCardEl
                            key={brief.id}
                            brief={brief}
                            layout={layout}
                            phase={phase}
                            isLead={index === 0}
                            duration={transitionDuration}
                        />
                    )
                })}

                {/* Phase overlay descriptor */}
                {phase === "pause" && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 32,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 2,
                            height: 48,
                            background: "linear-gradient(to bottom, transparent, rgba(243,80,15,0.3))",
                            animation: "briefs-breathe 2s ease-in-out infinite",
                        }}
                    />
                )}
            </div>

            {/* Phase description */}
            <div
                style={{
                    maxWidth: 420,
                    margin: "40px auto 0",
                    padding: "0 24px",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "14px",
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: "#9A8878",
                        transition: `opacity ${transitionDuration}ms ease`,
                        margin: 0,
                    }}
                >
                    {PHASE_DESCRIPTIONS[phase]}
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Poppins:wght@300;400&family=JetBrains+Mono:wght@400;600&display=swap');

                @keyframes briefs-breathe {
                    0%, 100% { opacity: 0.3; transform: translateX(-50%) scaleY(1); }
                    50% { opacity: 0.8; transform: translateX(-50%) scaleY(1.15); }
                }
            `}</style>
        </div>
    )
}

BriefsFlowSection.defaultProps = {
    autoPlay: true,
    phaseDuration: 2200,
    transitionDuration: 560,
    height: 520,
}

addPropertyControls(BriefsFlowSection, {
    autoPlay: {
        type: ControlType.Boolean,
        title: "Auto Play",
        defaultValue: true,
        description: "Advance phases automatically on scroll-into-view",
    },
    phaseDuration: {
        type: ControlType.Number,
        title: "Phase Duration",
        defaultValue: 2200,
        min: 800,
        max: 6000,
        step: 200,
        unit: "ms",
        description: "How long each phase shows before advancing",
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Transition",
        defaultValue: 560,
        min: 200,
        max: 1200,
        step: 40,
        unit: "ms",
    },
    height: {
        type: ControlType.Number,
        title: "Stage Height",
        defaultValue: 520,
        min: 360,
        max: 800,
        step: 20,
        unit: "px",
    },
})
