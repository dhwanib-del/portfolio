// Rotating vinyl record player with customizable album cover
import { useState, useEffect, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion } from "framer-motion"

interface VinylPlayerProps {
    albumCover: {
        src: string
        alt: string
    }
    isPlaying: boolean
    vinylColor: string
    labelColor: string
    turntableColor: string
    armColor: string
    showArm: boolean
    rotationSpeed: number
    style?: CSSProperties
}

/**
 * Vinyl Record Player
 * 
 * A rotating vinyl record player with customizable album cover
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 400
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function VinylPlayer(props: VinylPlayerProps) {
    const {
        albumCover = {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Album Cover"
        },
        isPlaying = true,
        vinylColor = "#1a1a1a",
        labelColor = "#8B0000",
        turntableColor = "#2a2a2a",
        armColor = "#C0C0C0",
        showArm = true,
        rotationSpeed = 3,
        style
    } = props

    const [rotation, setRotation] = useState(0)
    const [playing, setPlaying] = useState(isPlaying)
    const isStatic = useIsStaticRenderer()

    useEffect(() => {
        startTransition(() => {
            setPlaying(isPlaying)
        })
    }, [isPlaying])

    useEffect(() => {
        if (isStatic || !playing) return

        const interval = setInterval(() => {
            startTransition(() => {
                setRotation(prev => (prev + 1) % 360)
            })
        }, 1000 / (rotationSpeed * 10))

        return () => clearInterval(interval)
    }, [playing, rotationSpeed, isStatic])

    const handleClick = () => {
        if (!isStatic) {
            startTransition(() => {
                setPlaying(prev => !prev)
            })
        }
    }

    const size = Math.min(
        typeof style?.width === 'number' ? style.width : 400,
        typeof style?.height === 'number' ? style.height : 400
    )

    const vinylSize = size * 0.7
    const labelSize = vinylSize * 0.35
    const albumCoverSize = labelSize * 0.85

    return (
        <div
            style={{
                ...style,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: turntableColor,
                borderRadius: "50%",
                overflow: "visible",
                cursor: isStatic ? "default" : "pointer",
            }}
            onClick={handleClick}
        >
            {/* Turntable base */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at center, ${turntableColor} 0%, #1a1a1a 100%)`,
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
                }}
            />

            {/* Vinyl Record */}
            <motion.div
                animate={{ rotate: isStatic ? 0 : rotation }}
                transition={{ duration: 0, ease: "linear" }}
                style={{
                    position: "relative",
                    width: vinylSize,
                    height: vinylSize,
                    borderRadius: "50%",
                    backgroundColor: vinylColor,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    zIndex: 1,
                }}
            >
                {/* Vinyl grooves effect */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: `${95 - i * 5}%`,
                            height: `${95 - i * 5}%`,
                            transform: "translate(-50%, -50%)",
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.03)",
                        }}
                    />
                ))}

                {/* Center label */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: labelSize,
                        height: labelSize,
                        transform: "translate(-50%, -50%)",
                        borderRadius: "50%",
                        backgroundColor: labelColor,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* Album cover */}
                    <div
                        style={{
                            width: albumCoverSize,
                            height: albumCoverSize,
                            borderRadius: "50%",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                    >
                        <img
                            src={albumCover.src}
                            alt={albumCover.alt}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>

                    {/* Center hole */}
                    <div
                        style={{
                            position: "absolute",
                            width: labelSize * 0.15,
                            height: labelSize * 0.15,
                            borderRadius: "50%",
                            backgroundColor: "#000",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
                        }}
                    />
                </div>
            </motion.div>

            {/* Tone arm */}
            {showArm && (
                <motion.div
                    animate={{ rotate: isStatic ? -25 : (playing ? 0 : -25) }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        top: "15%",
                        right: "10%",
                        width: size * 0.35,
                        height: size * 0.05,
                        transformOrigin: "right center",
                        zIndex: 2,
                    }}
                >
                    {/* Arm base */}
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: size * 0.08,
                            height: size * 0.08,
                            borderRadius: "50%",
                            backgroundColor: armColor,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                    />

                    {/* Arm */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "85%",
                            height: "40%",
                            backgroundColor: armColor,
                            borderRadius: "4px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                    />

                    {/* Cartridge */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: size * 0.04,
                            height: size * 0.06,
                            backgroundColor: "#333",
                            borderRadius: "2px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                    />
                </motion.div>
            )}
        </div>
    )
}

addPropertyControls(VinylPlayer, {
    albumCover: {
        type: ControlType.ResponsiveImage,
        title: "Album Cover",
    },
    isPlaying: {
        type: ControlType.Boolean,
        title: "Playing",
        defaultValue: true,
        enabledTitle: "Play",
        disabledTitle: "Stop",
    },
    rotationSpeed: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 0.5,
        displayStepper: true,
    },
    vinylColor: {
        type: ControlType.Color,
        title: "Vinyl Color",
        defaultValue: "#1a1a1a",
    },
    labelColor: {
        type: ControlType.Color,
        title: "Label Color",
        defaultValue: "#8B0000",
    },
    turntableColor: {
        type: ControlType.Color,
        title: "Turntable",
        defaultValue: "#2a2a2a",
    },
    showArm: {
        type: ControlType.Boolean,
        title: "Show Arm",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    armColor: {
        type: ControlType.Color,
        title: "Arm Color",
        defaultValue: "#C0C0C0",
        hidden: ({ showArm }) => !showArm,
    },
})
