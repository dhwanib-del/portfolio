// Responsive elliptical orbit component with project images around centered text
// Images arranged in orbit, clickable to switch projects, scroll rotates orbit
// Oct 2: colors follow the site theme tokens (--db-*) for light/dark.
import {
    useEffect,
    useRef,
    useState,
    startTransition,
    type CSSProperties,
} from "react"
import { addPropertyControls, ControlType } from "framer"

interface ProjectImage {
    image: {
        src: string
        alt: string
    }
    title: string
    link?: string
    spotifyLink?: string
}

interface EllipticalOrbitProps {
    projects: ProjectImage[]
    centerText: string
    centerLogo?: {
        src: string
        alt: string
    }
    useLogo: boolean
    imageSize: number
    ellipseWidth: number
    ellipseHeight: number
    ellipseTilt: number
    ellipseRotation: number
    rotationSpeed: number
    snapAngle: number
    backgroundColor: string
    textColor: string
    imageBackgroundColor: string
    centerFont: any
    selectedIndex: number
    showShadow: boolean
    shadowColor: string
    shadowBlur: number
    shadowOffsetX: number
    shadowOffsetY: number
    showInstruction: boolean
    instructionText: string
    instructionColor: string
    instructionFont: any
    instructionFontSize: number
    instructionLetterSpacing: number
    instructionUppercase: boolean
    instructionAccentColor: string
    instructionPanelColor: string
    instructionBorderColor: string
    instructionShowEqualizer: boolean
    spotifyButtonText: string
    style?: CSSProperties
}

/**
 * Elliptical Orbit Component
 *
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
function EllipticalOrbit(props: EllipticalOrbitProps) {
    const {
        projects = [],
        centerText = "AI-native studio building brands and web experiences for high-growth startups",
        centerLogo = {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Logo",
        },
        useLogo = false,
        imageSize = 140,
        ellipseWidth = 350,
        ellipseHeight = 280,
        ellipseTilt = 60,
        ellipseRotation = 0,
        rotationSpeed = 0.5,
        snapAngle = 180,
        backgroundColor = "#FFFFFF",
        textColor = "#000000",
        imageBackgroundColor = "#FFFFFF",
        centerFont,
        selectedIndex = 0,
        showShadow = true,
        shadowColor = "rgba(0,0,0,0.1)",
        shadowBlur = 12,
        shadowOffsetX = 0,
        shadowOffsetY = 4,
        showInstruction = true,
        instructionText = "Hover + scroll to move",
        instructionColor = "rgba(0,0,0,0.55)",
        instructionFont,
        instructionFontSize = 11,
        instructionLetterSpacing = 0.12,
        instructionUppercase = true,
        instructionAccentColor = "#1ED760",
        instructionPanelColor = "rgba(10,10,10,0.76)",
        instructionBorderColor = "rgba(255,255,255,0.18)",
        instructionShowEqualizer = true,
        spotifyButtonText = "Open in Spotify",
    } = props

    const [rotation, setRotation] = useState(0)
    const [activeIndex, setActiveIndex] = useState(selectedIndex)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [snappedIndex, setSnappedIndex] = useState<number | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const isScrolling = useRef(false)

    const totalProjects = projects.length

    // Handle wheel event for orbit rotation
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setHasInteracted(true)

            const delta = e.deltaY * rotationSpeed * 0.5
            startTransition(() => {
                setRotation((prev) => prev + delta)
            })

            isScrolling.current = true
            const timeoutId = setTimeout(() => {
                isScrolling.current = false
            }, 150)

            return () => clearTimeout(timeoutId)
        }

        container.addEventListener("wheel", handleWheel, { passive: false })

        return () => {
            container.removeEventListener("wheel", handleWheel)
        }
    }, [rotationSpeed])

    // Calculate which image is at the snap position (left side, ~180 degrees)
    useEffect(() => {
        if (totalProjects === 0) return

        const snapAngleRad = (snapAngle * Math.PI) / 180
        let closestIndex = 0
        let minDiff = Infinity

        for (let i = 0; i < totalProjects; i++) {
            const angle =
                (i / totalProjects) * Math.PI * 2 + (rotation * Math.PI) / 180
            const normalizedAngle =
                ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
            const diff = Math.abs(normalizedAngle - snapAngleRad)
            const altDiff = Math.abs(
                normalizedAngle - snapAngleRad - Math.PI * 2
            )
            const minAngleDiff = Math.min(diff, altDiff)

            if (minAngleDiff < minDiff) {
                minDiff = minAngleDiff
                closestIndex = i
            }
        }

        // Snap threshold: if within ~20 degrees, consider it snapped
        const snapThreshold = 0.35 // radians (~20 degrees)
        if (minDiff < snapThreshold) {
            startTransition(() => {
                setSnappedIndex(closestIndex)
            })
        } else {
            startTransition(() => {
                setSnappedIndex(null)
            })
        }
    }, [rotation, totalProjects, snapAngle])

    // Handle image click
    const handleImageClick = (index: number) => {
        if (!isScrolling.current) {
            startTransition(() => {
                setActiveIndex(index)
            })
        }
    }

    // Calculate positions for images on ellipse
    const getImagePosition = (index: number, total: number) => {
        const angle = (index / total) * Math.PI * 2 + (rotation * Math.PI) / 180
        const x = Math.cos(angle) * ellipseWidth
        const y = Math.sin(angle) * ellipseHeight
        return { x, y }
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: `var(--db-bg, ${backgroundColor})`,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
            }}
        >
            {/* Center content */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                    maxWidth: "400px",
                    textAlign: "center",
                    padding: "20px",
                }}
            >
                {useLogo && centerLogo ? (
                    <img
                        src={centerLogo.src}
                        alt={centerLogo.alt}
                        style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            objectFit: "contain",
                        }}
                    />
                ) : (
                    <p
                        style={{
                            margin: 0,
                            ...centerFont,
                            color: `var(--db-text, ${textColor})`,
                        }}
                    >
                        {centerText}
                    </p>
                )}
            </div>

            {/* Orbiting images */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "100%",
                    height: "100%",
                    transform: `translate(-50%, -50%) rotateX(${ellipseTilt}deg) rotateZ(${ellipseRotation}deg)`,
                    transformStyle: "preserve-3d",
                }}
            >
                {projects.map((project, index) => {
                    const { x, y } = getImagePosition(index, totalProjects)
                    const isActive = index === activeIndex
                    const isHovered = index === hoveredIndex
                    const isSnapped = index === snappedIndex

                    // Provide default image if project.image is undefined
                    const projectImage = project.image || {
                        src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
                        alt: "Default project image",
                    }

                    const imageContent = (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                overflow: "hidden",
                                backgroundColor: imageBackgroundColor,
                                boxShadow: showShadow
                                    ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
                                    : "none",
                                transform: isSnapped
                                    ? "scale(1.25)"
                                    : isHovered
                                      ? "scale(1.1)"
                                      : "scale(1)",
                                transition: "transform 0.3s ease",
                            }}
                        >
                            <img
                                src={projectImage.src}
                                alt={projectImage.alt || project.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    )

                    const containerElement = project.link ? (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: `${imageSize}px`,
                                height: `${imageSize}px`,
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotateZ(-${ellipseRotation}deg) rotateX(-${ellipseTilt}deg)`,
                                cursor: "pointer",
                                zIndex: isActive ? 5 : 1,
                                textDecoration: "none",
                            }}
                            onClick={(e) => {
                                if (!project.link) {
                                    e.preventDefault()
                                    handleImageClick(index)
                                }
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {imageContent}
                        </a>
                    ) : (
                        <div
                            onClick={() => handleImageClick(index)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: `${imageSize}px`,
                                height: `${imageSize}px`,
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotateZ(-${ellipseRotation}deg) rotateX(-${ellipseTilt}deg)`,
                                cursor: "pointer",
                                zIndex: isActive ? 5 : 1,
                            }}
                        >
                            {imageContent}
                        </div>
                    )

                    return (
                        <div key={index}>
                            {containerElement}

                            {isSnapped && project.spotifyLink && (
                                <a
                                    href={project.spotifyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open ${project.title} in Spotify`}
                                    onClick={(event) => event.stopPropagation()}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + imageSize / 2 + 24}px)) rotateZ(-${ellipseRotation}deg) rotateX(-${ellipseTilt}deg)`,
                                        zIndex: 20,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "7px",
                                        minHeight: "34px",
                                        padding: "0 14px",
                                        borderRadius: "999px",
                                        background: "#1ED760",
                                        color: "#07110A",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        textDecoration: "none",
                                        whiteSpace: "nowrap",
                                        boxShadow:
                                            "0 8px 24px rgba(0,0,0,0.16)",
                                        transition:
                                            "transform 0.2s ease, opacity 0.2s ease",
                                    }}
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="11"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M6.4 9.15C10.05 7.95 15.15 8.2 18.5 10.05"
                                            stroke="#07110A"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M6.9 12.25C10.15 11.25 14.4 11.4 17.55 13.05"
                                            stroke="#07110A"
                                            strokeWidth="1.65"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M7.4 15.1C10.1 14.35 13.55 14.45 16.7 15.95"
                                            stroke="#07110A"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <span>{spotifyButtonText}</span>
                                </a>
                            )}
                        </div>
                    )
                })}
            </div>

            {showInstruction && !hasInteracted && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "22px",
                        transform: "translateX(-50%)",
                        zIndex: 30,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "48px",
                        padding: "7px 15px 7px 8px",
                        border: `1px solid var(--db-glass-line, ${instructionBorderColor})`,
                        borderRadius: "999px",
                        background: `var(--db-glass, ${instructionPanelColor})`,
                        color: `var(--db-text, ${instructionColor})`,
                        boxShadow:
                            "var(--db-shadow, 0 18px 50px rgba(0,0,0,0.24)), inset 0 1px 0 rgba(255,255,255,0.08)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            display: "grid",
                            placeItems: "center",
                            width: "34px",
                            height: "34px",
                            flexShrink: 0,
                            borderRadius: "50%",
                            background: instructionAccentColor,
                            color: "#061008",
                            boxShadow: `0 0 24px ${instructionAccentColor}55`,
                        }}
                    >
                        {instructionShowEqualizer ? (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "2px",
                                    height: "14px",
                                }}
                            >
                                {[0, 1, 2, 3].map((bar) => (
                                    <span
                                        key={bar}
                                        style={{
                                            width: "2px",
                                            height: `${7 + bar * 2}px`,
                                            borderRadius: "99px",
                                            background: "currentColor",
                                            transformOrigin: "bottom",
                                            animation: `orbitEqualizer ${0.65 + bar * 0.12}s ease-in-out ${bar * 0.08}s infinite alternate`,
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <span
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 800,
                                    animation:
                                        "orbitRotateCue 2.4s linear infinite",
                                }}
                            >
                                ↻
                            </span>
                        )}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: `${Math.max(8, instructionFontSize - 3)}px`,
                                letterSpacing: "0.18em",
                                lineHeight: 1,
                                textTransform: "uppercase",
                                ...instructionFont,
                                color: "var(--db-text-2, rgba(255,255,255,0.6))",
                            }}
                        >
                            Interactive rotation
                        </span>

                        <span
                            style={{
                                fontSize: `${instructionFontSize}px`,
                                letterSpacing: `${instructionLetterSpacing}em`,
                                lineHeight: 1,
                                textTransform: instructionUppercase
                                    ? "uppercase"
                                    : "none",
                                ...instructionFont,
                            }}
                        >
                            {instructionText}
                        </span>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            placeItems: "center",
                            width: "26px",
                            height: "26px",
                            marginLeft: "2px",
                            borderRadius: "50%",
                            border: `1px dashed ${instructionAccentColor}`,
                            color: instructionAccentColor,
                            fontSize: "13px",
                            animation: "orbitRotateCue 5s linear infinite",
                        }}
                    >
                        ↻
                    </div>

                    <style>{`
                        @keyframes orbitEqualizer {
                            from { transform: scaleY(0.45); }
                            to { transform: scaleY(1.15); }
                        }

                        @keyframes orbitRotateCue {
                            to { transform: rotate(360deg); }
                        }

                        @media (prefers-reduced-motion: reduce) {
                            .orbit-instruction-motion {
                                animation: none !important;
                            }
                        }
                    `}</style>
                </div>
            )}
        </div>
    )
}

addPropertyControls(EllipticalOrbit, {
    projects: {
        type: ControlType.Array,
        title: "Projects",
        control: {
            type: ControlType.Object,
            controls: {
                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Image",
                },
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Project",
                },
                link: {
                    type: ControlType.Link,
                    title: "Link",
                },
                spotifyLink: {
                    type: ControlType.Link,
                    title: "Spotify",
                },
            },
        },
        defaultValue: [
            {
                image: {
                    src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
                    alt: "Project 1",
                },
                title: "Project 1",
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
                    alt: "Project 2",
                },
                title: "Project 2",
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
                    alt: "Project 3",
                },
                title: "Project 3",
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg",
                    alt: "Project 4",
                },
                title: "Project 4",
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
                    alt: "Project 5",
                },
                title: "Project 5",
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
                    alt: "Project 6",
                },
                title: "Project 6",
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg",
                    alt: "Project 7",
                },
                title: "Project 7",
            },
        ],
    },
    useLogo: {
        type: ControlType.Boolean,
        title: "Center Type",
        defaultValue: false,
        enabledTitle: "Logo",
        disabledTitle: "Text",
    },
    centerText: {
        type: ControlType.String,
        title: "Center Text",
        defaultValue: "Objects for everyday rituals",
        displayTextArea: true,
        hidden: ({ useLogo }) => useLogo,
    },
    centerLogo: {
        type: ControlType.ResponsiveImage,
        title: "Center Logo",
        hidden: ({ useLogo }) => !useLogo,
    },
    centerFont: {
        type: ControlType.Font,
        title: "Center Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "22px",
            variant: "Semibold",
            letterSpacing: "-0.01em",
            lineHeight: "1.3em",
        },
        hidden: ({ useLogo }) => useLogo,
    },
    imageSize: {
        type: ControlType.Number,
        title: "Image Size",
        defaultValue: 140,
        min: 10,
        max: 300,
        step: 10,
        unit: "px",
    },
    ellipseWidth: {
        type: ControlType.Number,
        title: "Orbit Width",
        defaultValue: 360,
        min: 10,
        max: 600,
        step: 10,
        unit: "px",
    },
    ellipseHeight: {
        type: ControlType.Number,
        title: "Orbit Height",
        defaultValue: 270,
        min: 10,
        max: 500,
        step: 10,
        unit: "px",
    },
    ellipseTilt: {
        type: ControlType.Number,
        title: "Orbit Tilt",
        defaultValue: 0,
        min: 0,
        max: 90,
        step: 5,
        unit: "deg",
    },
    ellipseRotation: {
        type: ControlType.Number,
        title: "Orbit Rotation",
        defaultValue: 30,
        min: 0,
        max: 360,
        step: 5,
        unit: "deg",
    },
    rotationSpeed: {
        type: ControlType.Number,
        title: "Rotation Speed",
        defaultValue: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
    },
    snapAngle: {
        type: ControlType.Number,
        title: "Scale Position",
        defaultValue: 180,
        min: 0,
        max: 360,
        step: 5,
        unit: "deg",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#000000",
    },
    imageBackgroundColor: {
        type: ControlType.Color,
        title: "Image BG",
        defaultValue: "#FFFFFF",
    },
    showShadow: {
        type: ControlType.Boolean,
        title: "Shadow",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    shadowColor: {
        type: ControlType.Color,
        title: "Shadow Color",
        defaultValue: "rgba(0,0,0,0.1)",
        hidden: ({ showShadow }) => !showShadow,
    },
    shadowBlur: {
        type: ControlType.Number,
        title: "Shadow Blur",
        defaultValue: 12,
        min: 0,
        max: 50,
        step: 1,
        unit: "px",
        hidden: ({ showShadow }) => !showShadow,
    },
    shadowOffsetX: {
        type: ControlType.Number,
        title: "Shadow X",
        defaultValue: 0,
        min: -50,
        max: 50,
        step: 1,
        unit: "px",
        hidden: ({ showShadow }) => !showShadow,
    },
    shadowOffsetY: {
        type: ControlType.Number,
        title: "Shadow Y",
        defaultValue: 4,
        min: -50,
        max: 50,
        step: 1,
        unit: "px",
        hidden: ({ showShadow }) => !showShadow,
    },
    showInstruction: {
        type: ControlType.Boolean,
        title: "Instruction",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    instructionText: {
        type: ControlType.String,
        title: "Instruction Text",
        defaultValue: "Hover + scroll to move",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionColor: {
        type: ControlType.Color,
        title: "Instruction Color",
        defaultValue: "rgba(0,0,0,0.55)",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionFont: {
        type: ControlType.Font,
        title: "Instruction Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionFontSize: {
        type: ControlType.Number,
        title: "Instruction Size",
        defaultValue: 11,
        min: 8,
        max: 40,
        step: 1,
        unit: "px",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionLetterSpacing: {
        type: ControlType.Number,
        title: "Instruction Spacing",
        defaultValue: 0.12,
        min: -0.1,
        max: 0.5,
        step: 0.01,
        unit: "em",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionUppercase: {
        type: ControlType.Boolean,
        title: "Instruction Case",
        defaultValue: true,
        enabledTitle: "Uppercase",
        disabledTitle: "Original",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionAccentColor: {
        type: ControlType.Color,
        title: "Instruction Accent",
        defaultValue: "#1ED760",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionPanelColor: {
        type: ControlType.Color,
        title: "Instruction Panel",
        defaultValue: "rgba(10,10,10,0.76)",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionBorderColor: {
        type: ControlType.Color,
        title: "Instruction Border",
        defaultValue: "rgba(255,255,255,0.18)",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    instructionShowEqualizer: {
        type: ControlType.Boolean,
        title: "Instruction Icon",
        defaultValue: true,
        enabledTitle: "Equalizer",
        disabledTitle: "Orbit",
        hidden: ({ showInstruction }) => !showInstruction,
    },
    spotifyButtonText: {
        type: ControlType.String,
        title: "Spotify Label",
        defaultValue: "Open in Spotify",
    },
    selectedIndex: {
        type: ControlType.Number,
        title: "Selected",
        defaultValue: 0,
        min: 0,
        step: 1,
        displayStepper: true,
    },
})

export default EllipticalOrbit
