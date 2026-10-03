// Dhwani: "give me media player placeholders for my videos that play automatically"
// CaseStudyVideo — drop-in autoplaying clip for case studies.
// Pick the file in the right panel (Video). Plays muted + looped + inline, pauses when
// scrolled out of view, and respects "reduce motion" (shows controls instead of autoplay).
// Until a file is picked it renders a clearly visible 16:9 glass frame with the label.
import * as React from "react"
import { startTransition } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

type Props = {
    video: string
    label: string
    caption: string
    radius: number
    accent: string
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function CaseStudyVideo(props: Props) {
    const { video, label, caption, radius, accent, style } = props
    const ref = React.useRef<HTMLVideoElement | null>(null)
    const isStatic = useIsStaticRenderer()
    const [reduced, setReduced] = React.useState(false)

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        startTransition(() => setReduced(mq.matches))
    }, [])

    React.useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined" || reduced) return
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.play().catch(() => {})
                } else {
                    el.pause()
                }
            },
            { threshold: 0.25 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [video, reduced])

    const frame: React.CSSProperties = {
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        borderRadius: radius,
        overflow: "hidden",
        background: video
            ? "#0A0A0A"
            : "linear-gradient(160deg, rgba(0,39,76,0.85) 0%, rgba(12,14,20,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
        zIndex: 1,
    }

    return (
        <figure style={{ ...style, position: "relative", width: "100%", margin: 0, zIndex: 1 }}>
            <div style={frame}>
                {video ? (
                    <video
                        ref={ref}
                        src={video}
                        muted
                        loop
                        playsInline
                        autoPlay={!reduced && !isStatic}
                        controls={reduced}
                        preload="metadata"
                        aria-label={caption || label}
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 14,
                            background: `radial-gradient(circle at 50% 42%, ${accent}22 0%, rgba(0,0,0,0) 55%)`,
                        }}
                    >
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                background: accent,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 0 0 8px ${accent}26, 0 10px 30px rgba(0,0,0,0.5)`,
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
                                <path d="M6 3.5 L15 9 L6 14.5 Z" fill="#0A0A0A" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "#FAFAFA",
                                textAlign: "center",
                                padding: "0 16px",
                            }}
                        >
                            {label}
                        </span>
                    </div>
                )}
            </div>
            {caption ? (
                <figcaption
                    style={{
                        marginTop: 12,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "#D4D4D4",
                    }}
                >
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    )
}

CaseStudyVideo.defaultProps = {
    video: "",
    label: "Pick a video in the right panel",
    caption: "",
    radius: 16,
    accent: "#FFCB05",
}

addPropertyControls(CaseStudyVideo, {
    video: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mp4", "webm", "mov"],
    },
    label: { type: ControlType.String, title: "Placeholder", defaultValue: "Pick a video in the right panel" },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "", displayTextArea: true },
    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 40, step: 1, defaultValue: 16 },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#FFCB05" },
})
