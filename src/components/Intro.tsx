"use client"

// The Unfinished Edit — a compact, accessible opening with genuine text input.
// Existing palette IDs, saved choices, session behavior and theme CSS variables are preserved.
import { useCallback, useEffect, useRef, useState } from "react"
import styles from "./Intro.module.css"

type Vibe = { id: string; name: string; accent: string; swatch: [string,string]; ambient: [string,string,string] }
export const VIBES: Vibe[] = [
  { id: "ember", name: "Orange", accent: "#F3500F", swatch: ["#FFB36B","#F3500F"], ambient: ["rgba(255,140,60,.33)","rgba(243,80,15,.44)","rgba(255,203,5,.12)"] },
  { id: "goblue", name: "Sky blue", accent: "#38BDF8", swatch: ["#BAE6FD","#38BDF8"], ambient: ["rgba(125,211,252,.27)","rgba(56,189,248,.45)","rgba(2,132,199,.18)"] },
  { id: "afterhours", name: "Pink", accent: "#FF4D8D", swatch: ["#FFC2A8","#FF4D8D"], ambient: ["rgba(255,177,153,.26)","rgba(255,77,141,.36)","rgba(123,92,255,.14)"] },
  { id: "greenroom", name: "Yellow", accent: "#FACC15", swatch: ["#FEF08A","#FACC15"], ambient: ["rgba(254,240,138,.27)","rgba(250,204,21,.39)","rgba(234,179,8,.18)"] },
]

function fromHex(hex: string) {
  const h = hex.replace("#", "")
  const value = parseInt(h.length === 3 ? h.split("").map(c => c+c).join("") : h,16)
  return [(value>>16)&255,(value>>8)&255,value&255] as const
}
function rgba(hex: string, a:number) {
  const [r,g,b]=fromHex(hex);return "rgba("+r+","+g+","+b+","+a+")"
}
function luminance(r:number,g:number,b:number) {
  const cv=(n:number)=>{const x=n/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}
  return .2126*cv(r)+.7152*cv(g)+.0722*cv(b)
}
function lightInk(hex:string) {
  const [r,g,b]=fromHex(hex)
  const surface=luminance(224,224,224)
  for(let i=0;i<=100;i+=2) {
    const m=(100-i)/100,rr=Math.round(r*m),gg=Math.round(g*m),bb=Math.round(b*m)
    if((surface+.05)/(luminance(rr,gg,bb)+.05)>=4.5) return "#"+[rr,gg,bb].map(v=>v.toString(16).padStart(2,"0")).join("")
  }
  return "#000000"
}
function customVibe(a:string,b:string):Vibe {
  return {id:"custom",name:"Custom",accent:b,swatch:[a,b],ambient:[rgba(a,.27),rgba(b,.42),rgba(a,.13)]}
}
function applyVibe(v:Vibe,persist:boolean) {
  const root=document.documentElement
  root.setAttribute("data-vibe",v.id)
  root.style.setProperty("--vibe-a",v.ambient[0])
  root.style.setProperty("--vibe-b",v.ambient[1])
  root.style.setProperty("--vibe-c",v.ambient[2])
  root.style.setProperty("--vibe-accent",v.accent)
  root.style.setProperty("--vibe-accent-ink",lightInk(v.accent))
  root.style.setProperty("--vibe-on-accent",luminance(...fromHex(v.accent))>.22?"#0a0a0a":"#ffffff")
  root.style.removeProperty("--accent")
  root.style.removeProperty("--on-accent")
  if(persist) {
    try {localStorage.setItem("vibe",v.id);localStorage.setItem("db_vibe",v.id)} catch {}
    window.dispatchEvent(new CustomEvent("db-vibe",{detail:{id:v.id,accent:v.accent}}))
  }
}
function chooseSaved():{vibe:Vibe,colors:[string,string]} {
  let colors:[string,string]=["#8B5CF6","#F3500F"]
  try {
    const from=JSON.parse(localStorage.getItem("custom-vibe-colors")||"null")
    if(Array.isArray(from)&&from.length===2&&from.every(c=>typeof c==="string"&&/^#[0-9a-fA-F]{6}$/.test(c)))colors=[from[0],from[1]]
    const id=localStorage.getItem("vibe")||localStorage.getItem("db_vibe")
    if(id==="custom")return {vibe:customVibe(...colors),colors}
    const found=VIBES.find(v=>v.id===(id==="cherry"?"afterhours":id))
    return {vibe:found||VIBES[2],colors}
  } catch {return {vibe:VIBES[2],colors}}
}

export function Intro() {
  const [mounted,setMounted]=useState(false)
  const [open,setOpen]=useState(false)
  const [phase,setPhase]=useState(0)
  const [current,setCurrent]=useState<Vibe>(VIBES[2])
  const [preview,setPreview]=useState<Vibe|null>(null)
  const [colors,setColors]=useState<[string,string]>(["#8B5CF6","#F3500F"])
  const [word,setWord]=useState("")
  const [menu,setMenu]=useState(false)
  const [reduce,setReduce]=useState(false)
  const inputRef=useRef<HTMLInputElement>(null)
  const dialogRef=useRef<HTMLDivElement>(null)
  const previousFocus=useRef<HTMLElement|null>(null)
  const shown=preview||current

  useEffect(()=>{
    const {vibe,colors:stored}=chooseSaved()
    setCurrent(vibe);setColors(stored);applyVibe(vibe,false)
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduce(motion.matches)
    const change=()=>setReduce(motion.matches)
    motion.addEventListener("change",change)
    let seen=false
    try {seen=!!sessionStorage.getItem("intro-seen")}catch{}
    const forced=new URLSearchParams(window.location.search).has("intro")
    if(!seen||forced){previousFocus.current=document.activeElement as HTMLElement;setOpen(true)}
    setMounted(true)
    return ()=>motion.removeEventListener("change",change)
  },[])

  useEffect(()=>{
    if(!open)return
    const original=document.body.style.overflow
    document.body.style.overflow="hidden"
    setPhase(reduce?2:0)
    const one=window.setTimeout(()=>setPhase(1),reduce?0:550)
    const two=window.setTimeout(()=>setPhase(2),reduce?0:1250)
    const focus=window.setTimeout(()=>inputRef.current?.focus(),reduce?80:1350)
    return ()=>{document.body.style.overflow=original;clearTimeout(one);clearTimeout(two);clearTimeout(focus)}
  },[open,reduce])

  const close=useCallback(()=>{
    applyVibe(current,false)
    setPreview(null)
    setOpen(false)
    setMenu(false)
    try{sessionStorage.setItem("intro-seen","1")}catch{}
    window.setTimeout(()=>{(previousFocus.current&&previousFocus.current.isConnected?previousFocus.current:document.getElementById("main"))?.focus?.()},0)
  },[current])

  useEffect(()=>{
    if(!open)return
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){e.preventDefault();close()}
      if(e.key!=="Tab")return
      const candidates=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])')||[])
      if(!candidates.length)return
      const first=candidates[0],last=candidates[candidates.length-1]
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
    window.addEventListener("keydown",onKey)
    return ()=>window.removeEventListener("keydown",onKey)
  },[open,close])

  function pick(v:Vibe) {
    applyVibe(v,true);setCurrent(v);setPreview(null);setMenu(false)
    if(v.id==="custom")try{localStorage.setItem("custom-vibe-colors",JSON.stringify(colors))}catch{}
  }
  function show(v:Vibe|null) {setPreview(v);applyVibe(v||current,false)}
  function changeColor(index:0|1,value:string) {
    const next:[string,string]=[...colors];next[index]=value;setColors(next)
    show(customVibe(...next))
  }
  function palette(inIntro:boolean) {
    return <div className={inIntro?styles.palette:styles.popPalette} role="group" aria-label="Choose your frequency">
      {VIBES.map(v=><button type="button" key={v.id} className={styles.swatch} data-active={current.id===v.id} aria-pressed={current.id===v.id} title={v.name} onMouseEnter={()=>show(v)} onMouseLeave={()=>show(null)} onFocus={()=>show(v)} onBlur={()=>show(null)} onClick={()=>pick(v)}>
        <span className={styles.swatchColor} style={{background:v.accent}} aria-hidden="true"/><span>{v.name}</span>
      </button>)}
      {inIntro&&<div className={styles.customLine}><span>Or mix your own</span><label>From<input aria-label="First custom color" type="color" value={colors[0]} onChange={e=>changeColor(0,e.target.value)}/></label><label>To<input aria-label="Second custom color" type="color" value={colors[1]} onChange={e=>changeColor(1,e.target.value)}/></label><button type="button" onClick={()=>pick(customVibe(...colors))}>Apply ↗</button></div>}
    </div>
  }

  if(!mounted)return null
  return <>
    {open&&<div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Make the opening your own" ref={dialogRef}>
      <div className={styles.grid} aria-hidden="true"/>
      <button className={styles.skip} onClick={close} type="button">Skip intro <span aria-hidden="true">↗</span></button>
      <div className={styles.frame}>
        <div className={styles.topline}><span>an unfinished edit</span><span>db. / 2026</span></div>
        <div className={styles.hero}>
          <div className={styles.brow}><span className={styles.marker}/> little introductions, big ideas</div>
          <h1><span>hi, i'm</span><strong>Dhwani</strong><em>nice to meet you.</em></h1>
          <p className={styles.context}>Designer by day. Collector of little side quests everywhere else.</p>
          {phase>=1&&<div className={styles.cursors} aria-hidden="true">
            <span className={styles.cursorOne}><i>↖</i>art direction</span>
            <span className={styles.cursorTwo}><i>↖</i>a little chaos</span>
            <span className={styles.cursorThree}><i>↖</i>on aux</span>
          </div>}
        </div>
        <div className={styles.promptArea}>
          <div className={styles.promptLabel}><span>your turn</span><span>01 / 02</span></div>
          <div className={styles.sentence}>make it feel <span className={styles.response}><span>{word||"a little different"}</span><i className={styles.caret} aria-hidden="true"/></span></div>
          <label htmlFor="intro-word" className={styles.entryLabel}>What's the feeling?</label>
          <input id="intro-word" ref={inputRef} className={styles.entry} autoComplete="off" spellCheck={false} maxLength={26} placeholder="a little different…" value={word} onChange={e=>setWord(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.nativeEvent.isComposing)close()}}/>
        </div>
        <div className={styles.footerArea}>
          <div className={styles.paletteHead}><span>choose your frequency</span><span>02 / 02</span></div>
          {palette(true)}
          <button type="button" className={styles.enter} onClick={close}>Enter portfolio <span aria-hidden="true">↗</span></button>
        </div>
        <div className={styles.footnote}>A little collaborative mischief. The work comes next.</div>
      </div>
    </div>}
    {!open&&<div className={styles.switcher}>
      {menu&&<div className={styles.popover}>
        <div className={styles.popHeading}>Pick a color</div>
        {palette(false)}
        <div className={styles.popCustom}><label>From<input type="color" aria-label="First gradient color" value={colors[0]} onChange={e=>changeColor(0,e.target.value)}/></label><label>To<input type="color" aria-label="Second gradient color" value={colors[1]} onChange={e=>changeColor(1,e.target.value)}/></label><button type="button" onClick={()=>pick(customVibe(...colors))}>Use blend</button></div>
      </div>}
      <button className={styles.vibeChip} aria-expanded={menu} aria-label={"Change vibe. Current: "+current.name} type="button" onClick={()=>setMenu(v=>!v)}><span style={{background:shown.accent}}/> vibe · {current.name.toLowerCase()}</button>
    </div>}
  </>
}
