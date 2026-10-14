"use client"

// Lightweight sitewide vibe switcher. No splash screen or blocked navigation.
import { useEffect, useRef, useState } from "react"
import styles from "./Intro.module.css"

type Vibe = { id: string; name: string; accent: string; a: string; b: string; c: string }
const VIBES: Vibe[] = [
  { id: "ember", name: "Orange", accent: "#F3500F", a:"rgba(255,140,60,.38)", b:"rgba(243,80,15,.50)", c:"rgba(255,203,5,.16)" },
  { id: "goblue", name: "Blue", accent: "#38BDF8", a:"rgba(125,211,252,.32)", b:"rgba(56,189,248,.50)", c:"rgba(2,132,199,.22)" },
  { id: "afterhours", name: "Pink", accent: "#FF4D8D", a:"rgba(255,177,153,.32)", b:"rgba(255,77,141,.46)", c:"rgba(123,92,255,.20)" },
  { id: "greenroom", name: "Yellow", accent: "#FACC15", a:"rgba(254,240,138,.35)", b:"rgba(250,204,21,.48)", c:"rgba(234,179,8,.22)" },
]
const DEFAULT_COLORS: [string,string] = ["#8B5CF6","#F3500F"]
function rgb(hex:string) {
  const h = hex.slice(1), n = parseInt(h.length===3?h.split("").map(c=>c+c).join(""):h,16)
  return [(n>>16)&255,(n>>8)&255,n&255] as const
}
function rgba(hex:string,opacity:number) {
  const [r,g,b] = rgb(hex)
  return "rgba("+r+","+g+","+b+","+opacity+")"
}
function luminance(r:number,g:number,b:number) {
  const cv=(n:number)=>{const x=n/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}
  return .2126*cv(r)+.7152*cv(g)+.0722*cv(b)
}
function accentOnLight(hex:string) {
  const [r,g,b] = rgb(hex), surface=luminance(224,224,224)
  for(let t=0;t<=100;t+=2) {
    const m=(100-t)/100, rr=Math.round(r*m),gg=Math.round(g*m),bb=Math.round(b*m)
    if((surface+.05)/(luminance(rr,gg,bb)+.05)>=4.5) return "#"+[rr,gg,bb].map(v=>v.toString(16).padStart(2,"0")).join("")
  }
  return "#000000"
}
function custom(first:string,second:string):Vibe {
  return {id:"custom",name:"Custom",accent:second,a:rgba(first,.34),b:rgba(second,.48),c:rgba(first,.18)}
}
function apply(v:Vibe,save:boolean) {
  const el=document.documentElement
  el.dataset.vibe=v.id
  el.style.setProperty("--vibe-a",v.a)
  el.style.setProperty("--vibe-b",v.b)
  el.style.setProperty("--vibe-c",v.c)
  el.style.setProperty("--vibe-accent",v.accent)
  el.style.setProperty("--vibe-accent-ink",accentOnLight(v.accent))
  el.style.setProperty("--vibe-on-accent",luminance(...rgb(v.accent))>.22?"#0a0a0a":"#ffffff")
  el.style.removeProperty("--accent")
  el.style.removeProperty("--on-accent")
  if(save) {
    try{
      localStorage.setItem("vibe",v.id)
      localStorage.setItem("db_vibe",JSON.stringify({id:v.id,a:v.a,b:v.b,c:v.c,accent:v.accent}))
    }catch{}
    window.dispatchEvent(new CustomEvent("db-vibe",{detail:{id:v.id,a:v.a,b:v.b,c:v.c,accent:v.accent}}))
  }
}
function restore() {
  let colors:[string,string]=[...DEFAULT_COLORS]
  try {
    const raw=JSON.parse(localStorage.getItem("custom-vibe-colors")||"null")
    if(Array.isArray(raw)&&raw.length===2&&raw.every(x=>typeof x==="string"&&/^#[0-9a-f]{6}$/i.test(x)))colors=[raw[0],raw[1]]
    let id=localStorage.getItem("vibe")
    if(!id) {
      const legacy=JSON.parse(localStorage.getItem("db_vibe")||"null")
      id=typeof legacy==="string"?legacy:legacy?.id
    }
    if(id==="custom")return {vibe:custom(...colors),colors}
    return {vibe:VIBES.find(v=>v.id===(id==="cherry"?"afterhours":id))||VIBES[2],colors}
  }catch{return {vibe:VIBES[2],colors}}
}

export function Intro() {
  const [ready,setReady]=useState(false)
  const [selected,setSelected]=useState<Vibe>(VIBES[2])
  const [preview,setPreview]=useState<Vibe|null>(null)
  const [colors,setColors]=useState<[string,string]>(DEFAULT_COLORS)
  const [open,setOpen]=useState(false)
  const panel=useRef<HTMLDivElement>(null)
  const trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    const result=restore()
    setSelected(result.vibe);setColors(result.colors);apply(result.vibe,false)
    setReady(true)
  },[])
  useEffect(()=>{
    if(!open)return
    const dismiss=(e:PointerEvent)=>{if(e.target instanceof Node&&!panel.current?.contains(e.target)&&!trigger.current?.contains(e.target))setOpen(false)}
    const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);trigger.current?.focus()}}
    document.addEventListener("pointerdown",dismiss)
    document.addEventListener("keydown",key)
    return ()=>{document.removeEventListener("pointerdown",dismiss);document.removeEventListener("keydown",key)}
  },[open])
  function choose(v:Vibe) {
    apply(v,true);setSelected(v);setPreview(null);setOpen(false)
    if(v.id==="custom")try{localStorage.setItem("custom-vibe-colors",JSON.stringify(colors))}catch{}
  }
  function show(v:Vibe|null){setPreview(v);apply(v||selected,false)}
  function change(index:0|1,value:string) {
    const next:[string,string]=[...colors];next[index]=value;setColors(next);show(custom(...next))
  }
  if(!ready)return null
  return <div className={styles.switcher}>
    {open&&<div className={styles.popover} ref={panel} role="group" aria-label="Choose a color vibe">
      <div className={styles.popTitle}>Make it your color</div>
      <div className={styles.menuSwatches}>
        {VIBES.map(v=><button key={v.id} type="button" className={styles.swatch} data-active={selected.id===v.id} aria-pressed={selected.id===v.id} onMouseEnter={()=>show(v)} onMouseLeave={()=>show(null)} onFocus={()=>show(v)} onBlur={()=>show(null)} onClick={()=>choose(v)}>
          <span style={{background:v.accent}} aria-hidden="true"/>{v.name}
        </button>)}
      </div>
      <div className={styles.custom}>
        <label>From <input type="color" aria-label="First gradient color" value={colors[0]} onChange={e=>change(0,e.target.value)}/></label>
        <label>To <input type="color" aria-label="Second gradient color" value={colors[1]} onChange={e=>change(1,e.target.value)}/></label>
        <button type="button" onClick={()=>choose(custom(...colors))}>Apply</button>
      </div>
    </div>}
    <button ref={trigger} type="button" className={styles.chip} aria-expanded={open} aria-label={"Change site accent color. Current: "+selected.name} onClick={()=>setOpen(x=>!x)}>
      <span aria-hidden="true" style={{background:(preview||selected).accent}}/> vibe · {selected.name.toLowerCase()}
    </button>
  </div>
}
