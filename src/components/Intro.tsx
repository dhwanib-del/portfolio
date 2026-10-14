"use client"

// A quiet editorial entrance. The actual portfolio is always one click away.
// Existing palette IDs, storage keys, custom gradients, and theme tokens remain compatible.
import { useCallback, useEffect, useRef, useState } from "react"
import styles from "./Intro.module.css"

type Vibe = { id: string; name: string; accent: string; ambient: [string, string, string] }
const VIBES: Vibe[] = [
  { id: "ember", name: "Orange", accent: "#F3500F", ambient: ["rgba(255,140,60,.33)", "rgba(243,80,15,.44)", "rgba(255,203,5,.12)"] },
  { id: "goblue", name: "Blue", accent: "#38BDF8", ambient: ["rgba(125,211,252,.27)", "rgba(56,189,248,.45)", "rgba(2,132,199,.18)"] },
  { id: "afterhours", name: "Pink", accent: "#FF4D8D", ambient: ["rgba(255,177,153,.26)", "rgba(255,77,141,.36)", "rgba(123,92,255,.14)"] },
  { id: "greenroom", name: "Yellow", accent: "#FACC15", ambient: ["rgba(254,240,138,.27)", "rgba(250,204,21,.39)", "rgba(234,179,8,.18)"] },
]
const defaultColors: [string, string] = ["#8B5CF6", "#F3500F"]

function rgb(hex: string) {
  const raw = hex.slice(1)
  const normalized = raw.length === 3 ? raw.split("").map(c => c + c).join("") : raw
  const x = Number.parseInt(normalized, 16)
  return [(x >> 16) & 255, (x >> 8) & 255, x & 255] as const
}
function rgba(hex: string, a: number) {
  const [r,g,b] = rgb(hex)
  return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}
function luminance(r: number, g: number, b: number) {
  const channel = (n: number) => { const x = n / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 }
  return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b)
}
function inkForLight(hex: string) {
  const [r,g,b] = rgb(hex)
  const surface = luminance(224,224,224)
  for(let k=0; k<=100; k+=2) {
    const mult = (100-k)/100
    const rr = Math.round(r*mult),gg=Math.round(g*mult),bb=Math.round(b*mult)
    if((surface+.05)/(luminance(rr,gg,bb)+.05)>=4.5) return "#" + [rr,gg,bb].map(n=>n.toString(16).padStart(2,"0")).join("")
  }
  return "#000000"
}
function custom(first: string, second: string): Vibe {
  return { id: "custom", name: "Custom", accent: second, ambient: [rgba(first,.29),rgba(second,.42),rgba(first,.13)] }
}
function apply(v: Vibe, save = false) {
  const doc = document.documentElement
  doc.dataset.vibe = v.id
  doc.style.setProperty("--vibe-a", v.ambient[0])
  doc.style.setProperty("--vibe-b", v.ambient[1])
  doc.style.setProperty("--vibe-c", v.ambient[2])
  doc.style.setProperty("--vibe-accent", v.accent)
  doc.style.setProperty("--vibe-accent-ink", inkForLight(v.accent))
  doc.style.setProperty("--vibe-on-accent", luminance(...rgb(v.accent)) > .22 ? "#0a0a0a" : "#ffffff")
  doc.style.removeProperty("--accent")
  doc.style.removeProperty("--on-accent")
  if (save) {
    try { localStorage.setItem("vibe",v.id); localStorage.setItem("db_vibe",v.id) } catch {}
    window.dispatchEvent(new CustomEvent("db-vibe",{detail:{id:v.id,accent:v.accent}}))
  }
}
function restored() {
  let colors = defaultColors
  try {
    const savedColors = JSON.parse(localStorage.getItem("custom-vibe-colors") || "null")
    if (Array.isArray(savedColors) && savedColors.length === 2 && savedColors.every(v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v))) colors = [savedColors[0], savedColors[1]]
    const id = localStorage.getItem("vibe") || localStorage.getItem("db_vibe")
    const saved = id === "custom" ? custom(...colors) : VIBES.find(v=>v.id === (id === "cherry" ? "afterhours" : id)) || VIBES[2]
    return {saved, colors}
  } catch { return {saved: VIBES[2], colors} }
}

export function Intro() {
  const [mounted,setMounted] = useState(false)
  const [open,setOpen] = useState(false)
  const [current,setCurrent] = useState<Vibe>(VIBES[2])
  const [preview,setPreview] = useState<Vibe|null>(null)
  const [colors,setColors] = useState<[string,string]>(defaultColors)
  const [menu,setMenu] = useState(false)
  const [reduced,setReduced] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  const initialFocus = useRef<HTMLElement|null>(null)
  const skip = useRef<HTMLButtonElement>(null)

  useEffect(()=>{
    const {saved,colors:existing} = restored()
    setCurrent(saved);setColors(existing);apply(saved)
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update=()=>setReduced(mq.matches)
    update();mq.addEventListener("change",update)
    let seen=false
    try{seen=Boolean(sessionStorage.getItem("intro-seen"))}catch{}
    const forced = new URLSearchParams(location.search).has("intro")
    if (!seen || forced) {initialFocus.current=document.activeElement as HTMLElement;setOpen(true)}
    setMounted(true)
    return ()=>mq.removeEventListener("change",update)
  },[])

  useEffect(()=>{
    if(!open)return
    const old=document.body.style.overflow
    document.body.style.overflow="hidden"
    skip.current?.focus({preventScroll:true})
    return ()=>{document.body.style.overflow=old}
  },[open])

  const leave=useCallback((work = false)=>{
    setPreview(null);apply(current)
    setOpen(false);setMenu(false)
    try{sessionStorage.setItem("intro-seen","1")}catch{}
    requestAnimationFrame(()=>{
      const focus = initialFocus.current?.isConnected ? initialFocus.current : document.getElementById("main")
      focus?.focus({preventScroll:true})
      if(work) document.getElementById("work")?.scrollIntoView({behavior:reduced?"instant":"smooth",block:"start"})
    })
  },[current,reduced])

  useEffect(()=>{
    if(!open)return
    const handle=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){e.preventDefault();leave();return}
      if(e.key!=="Tab")return
      const nodes=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),summary')||[])
      if(!nodes.length)return
      const first=nodes[0],last=nodes[nodes.length-1]
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
    window.addEventListener("keydown",handle)
    return ()=>window.removeEventListener("keydown",handle)
  },[open,leave])

  function select(v:Vibe) {
    setCurrent(v);setPreview(null);apply(v,true);setMenu(false)
    if(v.id==="custom")try{localStorage.setItem("custom-vibe-colors",JSON.stringify(colors))}catch{}
  }
  function display(v:Vibe|null) {setPreview(v);apply(v||current)}
  function edit(index:0|1,hex:string) {
    const next:[string,string]=[...colors];next[index]=hex;setColors(next)
    display(custom(...next))
  }
  const chosen=preview||current
  const swatches = (isIntro:boolean)=><div className={isIntro?styles.swatches:styles.menuSwatches} role="group" aria-label="Choose a color">
    {VIBES.map(v=><button type="button" key={v.id} aria-label={v.name} aria-pressed={current.id===v.id}
      className={styles.swatch} data-active={current.id===v.id} title={v.name}
      onMouseEnter={()=>display(v)} onMouseLeave={()=>display(null)}
      onFocus={()=>display(v)} onBlur={()=>display(null)} onClick={()=>select(v)}>
      <span style={{background:v.accent}} aria-hidden="true"/><span>{v.name}</span>
    </button>)}
  </div>

  if(!mounted)return null
  return <>
    {open&&<div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="intro-heading" ref={dialog} data-reduced={reduced}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <span className={styles.edition}>a little introduction <span>— 01 / 01</span></span>
          <button ref={skip} type="button" className={styles.skip} onClick={()=>leave()}>Skip <span aria-hidden="true">↗</span></button>
        </header>
        <div className={styles.center}>
          <p className={styles.overline}>01 / THE INTRODUCTION</p>
          <div className={styles.nameLockup}>
            <span className={styles.signature}>hi, i&apos;m</span>
            <h1 id="intro-heading">Dhwani<span>.</span></h1>
          </div>
          <p className={styles.descriptor}>AI-native product designer, finding the interesting bits between people, technology, and everyday life.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={()=>leave(true)}>See my work <span aria-hidden="true">↗</span></button>
            <button type="button" className={styles.secondary} onClick={()=>leave()}>Explore the site <span aria-hidden="true">→</span></button>
          </div>
        </div>
        <footer className={styles.bottom}>
          <div className={styles.colors}>
            <span>Set the tone <span className={styles.colorsHint}>/ optional</span></span>
            {swatches(true)}
            <details className={styles.customIntro}>
              <summary>mix a color ↗</summary>
              <div className={styles.customIntroFields}>
                <label>From<input type="color" aria-label="First custom gradient color" value={colors[0]} onChange={e=>edit(0,e.target.value)}/></label>
                <label>To<input type="color" aria-label="Second custom gradient color" value={colors[1]} onChange={e=>edit(1,e.target.value)}/></label>
                <button type="button" onClick={()=>select(custom(...colors))}>Use blend</button>
              </div>
            </details>
          </div>
          <div className={styles.finePrint}>Designed with a little personality.<br/>The interesting stuff is inside.</div>
        </footer>
      </div>
    </div>}
    {!open&&<div className={styles.switcher}>
      {menu&&<div className={styles.popover}>
        <div className={styles.popTitle}>Change the mood</div>
        {swatches(false)}
        <div className={styles.custom}>
          <label>From <input type="color" aria-label="Gradient first color" value={colors[0]} onChange={e=>edit(0,e.target.value)}/></label>
          <label>To <input type="color" aria-label="Gradient second color" value={colors[1]} onChange={e=>edit(1,e.target.value)}/></label>
          <button type="button" onClick={()=>select(custom(...colors))}>Use blend</button>
        </div>
      </div>}
      <button type="button" className={styles.chip} onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-label={"Change color vibe. Current: "+current.name}>
        <span style={{background:chosen.accent}} aria-hidden="true"/> vibe · {current.name.toLowerCase()}
      </button>
    </div>}
  </>
}
