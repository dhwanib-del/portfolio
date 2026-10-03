import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"

const defaultSections = [
    { label: "Overview", id: "overview" },
    { label: "Persona", id: "persona" },
    { label: "Problem", id: "problem" },
    { label: "Process", id: "process" },
    { label: "Story", id: "story" },
    { label: "Design", id: "design" },
    { label: "Prototype", id: "prototype" },
    { label: "Outcomes", id: "outcomes" },
]

const css = `
    .cs-sidebar {
        position: sticky;
        top: 40%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        padding: 12px 8px;
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 400px;
        box-shadow: 0 2px 24px rgba(0,0,0,0.3);
        margin-left: 32px;
        width: fit-content;
    }
    .cs-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 400px;
        font-size: 12px;
        font-family: inherit;
        font-weight: 400;
        color: rgba(255,255,255,0.38);
        text-decoration: none;
        transition: all 0.2s ease;
        white-space: nowrap;
        letter-spacing: 0.01em;
        border: 1px solid transparent;
        cursor: pointer;
        background: transparent;
    }
    .cs-link:hover {
        color: rgba(255,255,255,0.75);
        background: rgba(255,255,255,0.06);
    }
    .cs-link.active {
        color: #fff;
        font-weight: 500;
        background: rgba(255,255,255,0.15);
        border: 1px solid rgba(255,255,255,0.1);
    }
    .cs-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        flex-shrink: 0;
        transition: background 0.2s ease;
    }
    .cs-link.active .cs-dot {
        background: #fff;
    }
`

export default function CaseStudySidebar(props) {
    const { sections } = props
    const [active, setActive] = useState("")

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id)
                    }
                })
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
        )
        sections.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [sections])

    const handleClick = (e, id) => {
        // Framer's SPA page-transition router intercepts plain <a href="#id">
        // clicks and can swallow the browser's native hash-scroll, so we
        // scroll explicitly instead of relying on default anchor behavior.
        e.preventDefault()
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" })
            // Keep the URL hash in sync without triggering a router navigation
            if (typeof window !== "undefined" && window.history?.replaceState) {
                window.history.replaceState(null, "", `#${id}`)
            }
        }
        setActive(id)
    }

    return (
        <>
            <style>{css}</style>
            <nav className="cs-sidebar">
                {sections.map((s, i) => (
                    <a
                        key={i}
                        href={`#${s.id}`}
                        className={`cs-link${active === s.id ? " active" : ""}`}
                        onClick={(e) => handleClick(e, s.id)}
                    >
                        <span className="cs-dot" />
                        {s.label}
                    </a>
                ))}
            </nav>
        </>
    )
}

addPropertyControls(CaseStudySidebar, {
    sections: {
        type: ControlType.Array,
        title: "Sections",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, title: "Label" },
                id: { type: ControlType.String, title: "Section ID" },
            },
        },
        defaultValue: defaultSections,
    },
})
