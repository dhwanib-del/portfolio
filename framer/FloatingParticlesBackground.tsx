// Floating dust particles background with mouse interaction
// Never catches the mouse: clicks/hovers pass through to the page (mouse is read from window).
// Oct 2: colors follow the site theme tokens (--db-*) for light/dark.
import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    baseOpacity: number
    mass: number
    id: number
    glowMultiplier?: number
    glowVelocity?: number
}

interface FloatingParticlesBackgroundProps {
    particleCount: number
    particleSize: number
    particleOpacity: number
    glowIntensity: number
    movementSpeed: number
    mouseInfluence: number
    backgroundColor: string
    particleColor: string
    mouseGravity: "none" | "attract" | "repel"
    gravityStrength: number
    glowAnimation: "instant" | "ease" | "spring"
    particleInteraction: boolean
    interactionType: "bounce" | "merge"
    style?: CSSProperties
}

// Theme helpers: pure white particles / pure black background follow the site tokens
const normColor = (c: string) => String(c || "").replace(/\s+/g, "").toLowerCase()
const isPureWhite = (c: string) => ["#fff", "#ffffff", "#ffffffff", "rgb(255,255,255)", "rgba(255,255,255,1)", "white"].includes(normColor(c))
const isPureBlack = (c: string) => ["#000", "#000000", "#000000ff", "rgb(0,0,0)", "rgba(0,0,0,1)", "black"].includes(normColor(c))

function useThemeInk(enabled: boolean): string | null {
    const [ink, setInk] = useState<string | null>(null)
    useEffect(() => {
        if (!enabled || typeof window === "undefined") return
        const read = () => {
            const v = window.getComputedStyle(document.documentElement).getPropertyValue("--db-text").trim()
            setInk(v || null)
        }
        read()
        window.addEventListener("db-theme", read)
        return () => window.removeEventListener("db-theme", read)
    }, [enabled])
    return enabled ? ink : null
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function FloatingParticlesBackground(props: FloatingParticlesBackgroundProps) {
    const {
        particleCount = 50,
        particleSize = 2,
        particleOpacity = 0.6,
        glowIntensity = 10,
        movementSpeed = 0.5,
        mouseInfluence = 100,
        backgroundColor = "#000000",
        particleColor = "#FFFFFF",
        mouseGravity = "none",
        gravityStrength = 50,
        glowAnimation = "ease",
        particleInteraction = false,
        interactionType = "bounce",
    } = props

    const themeInk = useThemeInk(isPureWhite(particleColor))
    const inkColor = themeInk || particleColor
    const bgColor = isPureBlack(backgroundColor) ? "var(--db-bg, #000000)" : backgroundColor

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>()
    const mouseRef = useRef({ x: 0, y: 0 })
    const particlesRef = useRef<Particle[]>([])
    const isStatic = useIsStaticRenderer()
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Let the mouse pass through Framer's wrapper layers (only single-child wrappers,
    // so real page content is never touched).
    useEffect(() => {
        if (typeof window === "undefined") return
        let el: HTMLElement | null = containerRef.current
        for (let i = 0; el && i < 5; i++) {
            el.style.pointerEvents = "none"
            if (window.getComputedStyle(el).position === "fixed") break
            const parent = el.parentElement
            if (!parent || parent.childElementCount !== 1) break
            el = parent
        }
    }, [isStatic])

    const initializeParticles = useCallback((width: number, height: number) => {
        return Array.from({ length: particleCount }, (_, index) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * movementSpeed,
            vy: (Math.random() - 0.5) * movementSpeed,
            size: Math.random() * particleSize + 1,
            opacity: particleOpacity,
            baseOpacity: particleOpacity,
            mass: Math.random() * 0.5 + 0.5,
            id: index,
        }))
    }, [particleCount, particleSize, particleOpacity, movementSpeed])

    const redistributeParticles = useCallback((width: number, height: number) => {
        particlesRef.current.forEach((particle) => {
            particle.x = Math.random() * width
            particle.y = Math.random() * height
        })
    }, [])

    const updateParticles = useCallback((canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        const mouse = mouseRef.current

        particlesRef.current.forEach((particle, index) => {
            const dx = mouse.x - particle.x
            const dy = mouse.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < mouseInfluence && distance > 0) {
                const force = (mouseInfluence - distance) / mouseInfluence
                const normalizedDx = dx / distance
                const normalizedDy = dy / distance
                const gravityForce = force * (gravityStrength * 0.001)

                if (mouseGravity === "attract") {
                    particle.vx += normalizedDx * gravityForce
                    particle.vy += normalizedDy * gravityForce
                } else if (mouseGravity === "repel") {
                    particle.vx -= normalizedDx * gravityForce
                    particle.vy -= normalizedDy * gravityForce
                }

                particle.opacity = Math.min(1, particle.baseOpacity + force * 0.4)

                const targetGlow = 1 + force * 2
                const currentGlow = particle.glowMultiplier || 1

                if (glowAnimation === "instant") {
                    particle.glowMultiplier = targetGlow
                } else if (glowAnimation === "ease") {
                    const easeSpeed = 0.15
                    particle.glowMultiplier = currentGlow + (targetGlow - currentGlow) * easeSpeed
                } else if (glowAnimation === "spring") {
                    const springForce = (targetGlow - currentGlow) * 0.2
                    const damping = 0.85
                    particle.glowVelocity = (particle.glowVelocity || 0) * damping + springForce
                    particle.glowMultiplier = currentGlow + particle.glowVelocity
                }
            } else {
                particle.opacity = Math.max(particle.baseOpacity * 0.3, particle.opacity - 0.02)

                const targetGlow = 1
                const currentGlow = particle.glowMultiplier || 1

                if (glowAnimation === "instant") {
                    particle.glowMultiplier = targetGlow
                } else if (glowAnimation === "ease") {
                    const easeSpeed = 0.08
                    particle.glowMultiplier = Math.max(1, currentGlow + (targetGlow - currentGlow) * easeSpeed)
                } else if (glowAnimation === "spring") {
                    const springForce = (targetGlow - currentGlow) * 0.15
                    const damping = 0.9
                    particle.glowVelocity = (particle.glowVelocity || 0) * damping + springForce
                    particle.glowMultiplier = Math.max(1, currentGlow + particle.glowVelocity)
                }
            }

            if (particleInteraction) {
                for (let j = index + 1; j < particlesRef.current.length; j++) {
                    const other = particlesRef.current[j]
                    const dx = other.x - particle.x
                    const dy = other.y - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    const minDistance = particle.size + other.size + 5

                    if (distance < minDistance && distance > 0) {
                        if (interactionType === "bounce") {
                            const normalX = dx / distance
                            const normalY = dy / distance
                            const relativeVx = particle.vx - other.vx
                            const relativeVy = particle.vy - other.vy
                            const speed = relativeVx * normalX + relativeVy * normalY
                            if (speed < 0) return
                            const impulse = 2 * speed / (particle.mass + other.mass)
                            particle.vx -= impulse * other.mass * normalX
                            particle.vy -= impulse * other.mass * normalY
                            other.vx += impulse * particle.mass * normalX
                            other.vy += impulse * particle.mass * normalY
                            const overlap = minDistance - distance
                            const separationX = normalX * overlap * 0.5
                            const separationY = normalY * overlap * 0.5
                            particle.x -= separationX
                            particle.y -= separationY
                            other.x += separationX
                            other.y += separationY
                        } else if (interactionType === "merge") {
                            const mergeForce = (minDistance - distance) / minDistance
                            particle.glowMultiplier = (particle.glowMultiplier || 1) + mergeForce * 0.5
                            other.glowMultiplier = (other.glowMultiplier || 1) + mergeForce * 0.5
                            const attractForce = mergeForce * 0.01
                            particle.vx += dx * attractForce
                            particle.vy += dy * attractForce
                            other.vx -= dx * attractForce
                            other.vy -= dy * attractForce
                        }
                    }
                }
            }

            particle.x += particle.vx
            particle.y += particle.vy

            particle.vx += (Math.random() - 0.5) * 0.001
            particle.vy += (Math.random() - 0.5) * 0.001

            particle.vx *= 0.999
            particle.vy *= 0.999

            if (particle.x < 0) particle.x = rect.width
            if (particle.x > rect.width) particle.x = 0
            if (particle.y < 0) particle.y = rect.height
            if (particle.y > rect.height) particle.y = 0
        })
    }, [mouseInfluence, mouseGravity, gravityStrength, glowAnimation, particleInteraction, interactionType])

    const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        particlesRef.current.forEach((particle) => {
            ctx.save()
            const currentGlowMultiplier = particle.glowMultiplier || 1
            ctx.shadowColor = inkColor
            ctx.shadowBlur = glowIntensity * currentGlowMultiplier * 2
            ctx.globalAlpha = particle.opacity
            ctx.fillStyle = inkColor
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        })
    }, [inkColor, glowIntensity])

    const animate = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        updateParticles(canvas)
        drawParticles(ctx)

        animationRef.current = requestAnimationFrame(animate)
    }, [updateParticles, drawParticles])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }, [])

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        const newWidth = rect.width
        const newHeight = rect.height

        canvas.width = newWidth
        canvas.height = newHeight

        setCanvasSize({ width: newWidth, height: newHeight })

        if (particlesRef.current.length > 0) {
            redistributeParticles(newWidth, newHeight)
        }
    }, [redistributeParticles])

    useEffect(() => {
        if (isStatic) return

        const canvas = canvasRef.current
        if (!canvas) return

        particlesRef.current = initializeParticles(canvas.width || canvasSize.width, canvas.height || canvasSize.height)
    }, [particleCount, initializeParticles, isStatic, canvasSize])

    useEffect(() => {
        if (isStatic) return

        particlesRef.current.forEach((particle) => {
            particle.baseOpacity = particleOpacity
            particle.opacity = particleOpacity
            const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
            if (currentSpeed > 0) {
                const ratio = movementSpeed / currentSpeed
                particle.vx *= ratio
                particle.vy *= ratio
            }
        })
    }, [particleOpacity, movementSpeed, isStatic])

    useEffect(() => {
        if (isStatic) return

        resizeCanvas()

        if (typeof window !== "undefined") {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("resize", resizeCanvas)
        }

        if (containerRef.current && typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(() => {
                resizeCanvas()
            })
            resizeObserver.observe(containerRef.current)

            return () => {
                resizeObserver.disconnect()
                if (typeof window !== "undefined") {
                    window.removeEventListener("mousemove", handleMouseMove)
                    window.removeEventListener("resize", resizeCanvas)
                }
            }
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("mousemove", handleMouseMove)
                window.removeEventListener("resize", resizeCanvas)
            }
        }
    }, [handleMouseMove, resizeCanvas, isStatic])

    useEffect(() => {
        if (isStatic) return

        animate()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [animate, isStatic])

    if (isStatic) {
        const staticInk = isPureWhite(particleColor) ? "var(--db-text, #FFFFFF)" : particleColor
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: bgColor,
                    position: "relative",
                    overflow: "hidden",
                    pointerEvents: "none",
                }}
            >
                {Array.from({ length: Math.min(particleCount, 20) }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${particleSize}px`,
                            height: `${particleSize}px`,
                            backgroundColor: staticInk,
                            borderRadius: "50%",
                            opacity: particleOpacity,
                            boxShadow: `0 0 ${glowIntensity}px ${staticInk}`,
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: bgColor,
                position: "relative",
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    pointerEvents: "none",
                }}
            />
        </div>
    )
}

addPropertyControls(FloatingParticlesBackground, {
    particleCount: {
        type: ControlType.Number,
        title: "Particle Count",
        defaultValue: 50,
        min: 10,
        max: 1000,
        step: 1,
    },
    particleSize: {
        type: ControlType.Number,
        title: "Particle Size",
        defaultValue: 2,
        min: 1,
        max: 10,
        step: 0.5,
        unit: "px",
    },
    particleOpacity: {
        type: ControlType.Number,
        title: "Particle Opacity",
        defaultValue: 0.6,
        min: 0.1,
        max: 1,
        step: 0.1,
    },
    glowIntensity: {
        type: ControlType.Number,
        title: "Glow Intensity",
        defaultValue: 10,
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
    },
    glowAnimation: {
        type: ControlType.Enum,
        title: "Glow Animation",
        options: ["instant", "ease", "spring"],
        optionTitles: ["Instant", "Ease In-Out", "Spring"],
        defaultValue: "ease",
        displaySegmentedControl: true,
    },
    movementSpeed: {
        type: ControlType.Number,
        title: "Movement Speed",
        defaultValue: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
    },
    mouseInfluence: {
        type: ControlType.Number,
        title: "Mouse Influence",
        defaultValue: 100,
        min: 50,
        max: 300,
        step: 10,
        unit: "px",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background Color",
        defaultValue: "#000000",
    },
    particleColor: {
        type: ControlType.Color,
        title: "Particle Color",
        defaultValue: "#FFFFFF",
    },
    mouseGravity: {
        type: ControlType.Enum,
        title: "Mouse Gravity",
        options: ["none", "attract", "repel"],
        optionTitles: ["None", "Attract", "Repel"],
        defaultValue: "none",
        displaySegmentedControl: true,
    },
    gravityStrength: {
        type: ControlType.Number,
        title: "Gravity Strength",
        defaultValue: 50,
        min: 10,
        max: 200,
        step: 10,
        hidden: ({ mouseGravity }) => mouseGravity === "none",
    },
    particleInteraction: {
        type: ControlType.Boolean,
        title: "Particle Interaction",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    interactionType: {
        type: ControlType.Enum,
        title: "Interaction Type",
        options: ["bounce", "merge"],
        optionTitles: ["Bounce", "Merge"],
        defaultValue: "bounce",
        displaySegmentedControl: true,
        hidden: ({ particleInteraction }) => !particleInteraction,
    },
})
