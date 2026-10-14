import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

/** WorldIntro / The Unfinished Edit.
 * A restrained editorial entry. Keep db_vibe, db-vibe and --vibe-* compatible with the
 * existing Framer AuroraBackground, PortfolioNav and FigmaCursorFollower components.
 * The visitors' typed words are local-only and never transmitted or stored.
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
type Vibe = {
    id: string
    name: string
    a: string
    b: string
    c: string
    accent: string
}
type Props = {
    showWhen?: "session" | "always" | "never"
    showSwitcher?: boolean
    switcherSide?: "left" | "right"
    defaultVibe?: string
}
const VIBES: Vibe[] = [
    { id:"ember", name:"Orange", accent:"#F3500F", a:"rgba(255,140,60,.38)", b:"rgba(243,80,15,.50)", c:"rgba(255,203,5,.16)" },
    { id:"goblue", name:"Sky Blue", accent:"#38BDF8", a:"rgba(125,211,252,.32)", b:"rgba(56,189,248,.50)", c:"rgba(2,132,199,.22)" },
    { id:"afterhours", name:"Pink", accent:"#FF4D8D", a:"rgba(255,177,153,.32)", b:"rgba(255,77,141,.46)", c:"rgba(123,92,255,.20)" },
    { id:"greenroom", name:"Yellow", accent:"#FACC15", a:"rgba(254,240,138,.35)", b:"rgba(250,204,21,.48)", c:"rgba(234,179,8,.22)" },
]
const DEFAULT_CUSTOM: [string,string] = ["#8B5CF6","#F3500F"]
const matchHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s)
function rgb(hex: string) {
    const n = parseInt(hex.slice(1),16)
    return [(n>>16)&255,(n>>8)&255,n&255]
}
function rgba(hex: string, alpha: number) {
    const [r,g,b] = rgb(hex)
    return "rgba("+r+","+g+","+b+","+alpha+")"
}
function luminance(hex: string) {
    const [r,g,b] = rgb(hex)
    const linear = (n:number) => { const x=n/255; return x<=.04045?x/12.92:((x+.055)/1.055)**2.4 }
    return .2126*linear(r)+.7152*linear(g)+.0722*linear(b)
}
function ink(hex: string) {
    const [r,g,b]=rgb(hex)
    for (let t=0;t<=100;t+=2) {
        const f=(100-t)/100, c=[r,g,b].map(x=>Math.round(x*f))
        const next="#"+c.map(x=>x.toString(16).padStart(2,"0")).join("")
        if (1.05/(luminance(next)+.05)>=4.5) return next
    }
    return "#000000"
}
function custom(colors:[string,string]):Vibe {
    return {id:"custom",name:"Custom",accent:colors[1],a:rgba(colors[0],.34),b:rgba(colors[1],.48),c:rgba(colors[0],.18)}
}
function readColors():[string,string] {
    try {
        const value=JSON.parse(localStorage.getItem("custom-vibe-colors")||"null")
        if(Array.isArray(value)&&matchHex(value[0])&&matchHex(value[1])) return [value[0],value[1]]
    } catch {}
    return [...DEFAULT_CUSTOM]
}
function readVibe(fallback: string, colors:[string,string]):Vibe {
    try {
        let id = JSON.parse(localStorage.getItem("db_vibe")||"null")?.id
        if (!id) id = localStorage.getItem("vibe")
        if (id==="custom") return custom(colors)
        if (id==="cherry") id="afterhours"
        if (id==="nightshift") id="goblue"
        return VIBES.find(v=>v.id===id)||VIBES.find(v=>v.id===fallback)||VIBES[2]
    } catch {return VIBES.find(v=>v.id===fallback)||VIBES[2]}
}
function paint(v:Vibe,persist:boolean) {
    if(typeof document==="undefined") return
    const root=document.documentElement
    root.style.setProperty("--vibe-a",v.a)
    root.style.setProperty("--vibe-b",v.b)
    root.style.setProperty("--vibe-c",v.c)
    root.style.setProperty("--vibe-accent",v.accent)
    root.style.setProperty("--vibe-accent-ink",ink(v.accent))
    root.setAttribute("data-vibe",v.id)
    if (persist) try {
        localStorage.setItem("vibe",v.id)
        localStorage.setItem("db_vibe",JSON.stringify(v))
    } catch {}
    try {
        window.dispatchEvent(new CustomEvent("db-vibe",{detail:{...v,preview:!persist}}))
    } catch {}
}
function passThrough(start:HTMLElement|null) {
    let el=start
    for(let i=0;el&&i<5;i++) {
        el.style.pointerEvents="none"
        if(window.getComputedStyle(el).position==="fixed") break
        const up=el.parentElement
        if(!up||up===document.body||up.id==="main")break
        const children=Array.from(up.children).filter(c=>!/^(STYLE|LINK|SCRIPT|TEMPLATE)$/.test(c.tagName))
        if(children.length!==1)break
        el=up
    }
}
const STYLES = [
  "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Pinyon+Script&family=Poppins:wght@400;500;600&display=swap');",
  ".wi-scene{position:fixed;inset:0;z-index:9999;background:#000;color:#fff;font-family:'Poppins',sans-serif;overflow-y:auto;overscroll-behavior:contain;isolation:isolate;}",
  ".wi-frame{width:min(100%,948px);min-height:100dvh;margin:auto;border-inline:1px solid rgba(255,255,255,.1);padding:clamp(72px,12vh,130px) clamp(22px,5vw,48px) clamp(45px,8vh,75px);display:flex;flex-direction:column;justify-content:center;position:relative;box-sizing:border-box;}",
  ".wi-chapter{font-size:11px;letter-spacing:.03em;color:rgba(255,255,255,.55);display:flex;gap:10px;align-items:center;}",
  ".wi-chapter:before{content:'';width:5px;height:5px;border-radius:50%;background:var(--wi-accent,#FF4D8D)}",
  ".wi-title{font:600 clamp(62px,9vw,111px)/.99 'Cormorant Garamond',Georgia,serif;letter-spacing:-.025em;margin:35px 0 5px;max-width:800px;}",
  ".wi-title em{font:400 clamp(80px,11vw,139px)/.76 'Pinyon Script',cursive;letter-spacing:0;color:inherit;display:inline-block;padding-right:.08em;}",
  ".wi-annotation{font:400 clamp(27px,3.5vw,41px)/1 'Pinyon Script',cursive;color:var(--wi-accent,#FF4D8D);transform:rotate(-4deg);align-self:flex-end;margin:4px 2vw 24px 0;}",
  ".wi-divider{height:1px;background:rgba(255,255,255,.16);width:100%;margin:22px 0;}",
  ".wi-edit{display:flex;flex-wrap:wrap;gap:4px 16px;align-items:baseline;font-size:clamp(17px,2.2vw,25px);font-family:'Cormorant Garamond',Georgia,serif;}",
  ".wi-word{position:relative;display:inline-block;min-width:4ch;max-width:100%;border-bottom:1px solid var(--wi-accent,#FF4D8D);}",
  ".wi-word input{background:transparent;border:0;border-radius:0;color:#fff;font:500 clamp(22px,3vw,34px)/1.1 'Cormorant Garamond',serif;width:clamp(100px,25vw,280px);max-width:100%;min-height:44px;padding:0 3px;outline-offset:5px;}",
  ".wi-palette{display:flex;flex-wrap:wrap;gap:22px;align-items:center;margin:28px 0 18px;}",
  ".wi-palette button{appearance:none;border:1px solid transparent;background:transparent;color:rgba(255,255,255,.72);padding:8px 3px;display:flex;align-items:center;gap:7px;font:400 12px 'Poppins',sans-serif;cursor:pointer;min-height:44px;}",
  ".wi-palette button:focus-visible,.wi-cta:focus-visible,.wi-skip:focus-visible,.wi-chip:focus-visible,.wi-custom input:focus-visible{outline:2px solid #fff;outline-offset:4px;}",
  ".wi-dot{display:block;width:18px;height:18px;border-radius:50%;border:1px solid rgba(255,255,255,.25);}",
  ".wi-palette button[aria-pressed=true]{color:white;text-decoration:underline;text-underline-offset:5px;}",
  ".wi-custom{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font:400 11px 'Poppins',sans-serif;color:rgba(255,255,255,.6);margin-bottom:24px;}",
  ".wi-custom label{display:flex;align-items:center;gap:5px}.wi-custom input{width:32px;height:32px;border:0;background:transparent;cursor:pointer}.wi-custom button{min-height:40px;padding:0 11px;color:#fff;background:transparent;border:1px solid #666;border-radius:3px;cursor:pointer;font:500 11px 'Poppins',sans-serif;}",
  ".wi-footer{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-top:16px;}",
  ".wi-cta{border:1px solid rgba(255,255,255,.7);background:#fff;color:#000;font:500 12px 'Poppins',sans-serif;min-height:46px;padding:0 22px;cursor:pointer;}",
  ".wi-note{font-size:11px;color:rgba(255,255,255,.52);line-height:1.65}",
  ".wi-skip{position:fixed;z-index:10001;top:18px;right:clamp(18px,4vw,48px);background:transparent;color:rgba(255,255,255,.8);border:0;border-bottom:1px solid rgba(255,255,255,.25);font:400 12px 'Poppins',sans-serif;min-height:42px;cursor:pointer}",
  ".wi-cursor{position:absolute;pointer-events:none;opacity:0;z-index:2;width:20px;height:24px;animation:wi-cursor 3.9s cubic-bezier(.22,1,.36,1) .5s both;}",
  ".wi-cursor.two{animation-delay:.95s;animation-name:wi-cursor-two}",
  ".wi-cursor svg{width:19px;height:23px;filter:drop-shadow(0 1px 1px #000)}",
  "@keyframes wi-cursor{0%,100%{opacity:0;transform:translate(40px,-30px)}18%,68%{opacity:1}45%,72%{transform:translate(0,0)}89%{opacity:0}}",
  "@keyframes wi-cursor-two{0%,100%{opacity:0;transform:translate(-32px,25px)}20%,66%{opacity:1}44%,69%{transform:translate(0,0)}89%{opacity:0}}",
  ".wi-switch{position:fixed;bottom:20px;z-index:9998;pointer-events:none;display:flex;flex-direction:column;gap:8px;align-items:flex-start;font-family:'Poppins',sans-serif;}",
  ".wi-menu{pointer-events:auto;background:var(--db-surface,#111);color:var(--db-text,#fff);border:1px solid var(--db-line,#555);border-radius:12px;padding:10px;display:flex;flex-wrap:wrap;gap:8px;width:min(310px,calc(100vw - 28px));}",
  ".wi-menu button{display:flex;gap:7px;align-items:center;min-height:44px;padding:0 8px;border:0;background:transparent;color:inherit;cursor:pointer;font:500 11px 'Poppins',sans-serif}",
  ".wi-chip{pointer-events:auto;display:flex;align-items:center;gap:9px;background:var(--db-glass,rgba(10,10,12,.8));color:var(--db-text,#fff);border:1px solid var(--db-line,#555);border-radius:999px;padding:0 13px;min-height:44px;cursor:pointer;font:500 12px 'Poppins',sans-serif;backdrop-filter:blur(18px)}",
  "@media(max-width:640px){.wi-frame{border:0;padding:78px 20px 55px}.wi-title{font-size:clamp(57px,13vw,78px);margin-top:22px}.wi-title em{font-size:clamp(72px,17vw,110px)}.wi-cursor{display:none}.wi-annotation{font-size:29px;margin-top:12px}.wi-palette{gap:12px 15px}.wi-skip{top:10px;right:14px}}",
  "@media(prefers-reduced-motion:reduce){.wi-cursor{display:none}.wi-scene *{animation:none!important;transition:none!important}}",
].join("\n")

export default function WorldIntro({showWhen="session",showSwitcher=true,switcherSide="left",defaultVibe="afterhours"}:Props) {
    const [mounted,setMounted] = useState(false)
    const [open,setOpen] = useState(false)
    const [current,setCurrent] = useState<Vibe>(VIBES[2])
    const [preview,setPreview] = useState<Vibe|null>(null)
    const [colors,setColors] = useState<[string,string]>(DEFAULT_CUSTOM)
    const [typing,setTyping] = useState("alive")
    const [menu,setMenu] = useState(false)
    const [reduced,setReduced] = useState(false)
    const host=useRef<HTMLSpanElement>(null)
    const scene=useRef<HTMLDivElement>(null)
    useEffect(()=>{
        if(typeof window==="undefined"||RenderTarget.current()===RenderTarget.canvas) return
        passThrough(host.current?.parentElement||null)
    },[mounted])
    useEffect(()=>{
        if(typeof window==="undefined") return
        const col=readColors()
        const v=readVibe(defaultVibe,col)
        paint(v,false)
        const media=window.matchMedia("(prefers-reduced-motion: reduce)")
        const onMedia=()=>setReduced(media.matches)
        media.addEventListener?.("change",onMedia)
        let seen=false
        try { seen=!!sessionStorage.getItem("db_intro_seen") } catch {}
        const frame=requestAnimationFrame(()=>{
            setReduced(media.matches)
            setColors(col)
            setCurrent(v)
            setOpen(showWhen==="always"||(showWhen==="session"&&!seen))
            setMounted(true)
        })
        return ()=>{cancelAnimationFrame(frame);media.removeEventListener?.("change",onMedia)}
    },[defaultVibe,showWhen])
    useEffect(()=>{
        if(!open)return
        const before=document.body.style.overflow
        document.body.style.overflow="hidden"
        document.documentElement.setAttribute("data-db-intro","open")
        return ()=>{document.body.style.overflow=before;document.documentElement.removeAttribute("data-db-intro")}
    },[open])
    const active=preview||current
    const revert=useCallback(()=>{setPreview(null);paint(current,false)},[current])
    const hover=useCallback((v:Vibe)=>{setPreview(v);paint(v,false)},[])
    const choose=useCallback((v:Vibe)=>{
        paint(v,true)
        setCurrent(v);setPreview(null);setMenu(false)
        try { if(v.id==="custom")localStorage.setItem("custom-vibe-colors",JSON.stringify(colors)) } catch {}
        if(open){
            try {sessionStorage.setItem("db_intro_seen","1")}catch{}
            if(scene.current)scene.current.style.pointerEvents="none"
            setOpen(false)
        }
    },[open,colors])
    useEffect(()=>{
        if(!open&&!menu)return
        const key=(e:KeyboardEvent)=>{
            if(e.key==="Escape"){
                e.preventDefault()
                if(menu){setMenu(false);revert()} else choose(current)
            }
        }
        window.addEventListener("keydown",key)
        return ()=>window.removeEventListener("keydown",key)
    },[open,menu,current,choose,revert])
    const updateColors=(index:0|1,value:string)=>{
        if(!matchHex(value))return
        const next:[string,string]=[...colors]
        next[index]=value;setColors(next);hover(custom(next))
    }
    if(!mounted) return null
    return <>
        <style>{STYLES}</style>
        <span ref={host} style={{display:"none"}} aria-hidden="true"/>
        <AnimatePresence>
            {open&&<motion.div
                ref={scene}
                className="wi-scene"
                role="dialog"
                aria-modal="true"
                aria-label="The unfinished edit. Choose a color for the portfolio"
                initial={{opacity:1}}
                exit={{opacity:0}}
                transition={{duration:reduced?0:.22}}
                style={{["--wi-accent" as string]:active.accent}}
            >
                <button type="button" className="wi-skip" onClick={()=>choose(current)}>skip intro</button>
                <main className="wi-frame">
                    <span className="wi-cursor" aria-hidden="true" style={{right:"21%",top:"24%",color:"#FF4D8D"}}>
                        <svg viewBox="0 0 20 25"><path d="M1 1v18l5-4 4 8 4-2-4-8h9z" fill="currentColor" stroke="#000"/></svg>
                    </span>
                    <span className="wi-cursor two" aria-hidden="true" style={{left:"23%",bottom:"30%",color:"#38BDF8"}}>
                        <svg viewBox="0 0 20 25"><path d="M1 1v18l5-4 4 8 4-2-4-8h9z" fill="currentColor" stroke="#000"/></svg>
                    </span>
                    <span className="wi-chapter">side a / an introduction</span>
                    <motion.h1 className="wi-title" initial={reduced?false:{opacity:0,y:9}} animate={{opacity:1,y:0}} transition={{duration:.45}}>
                        hi, i&apos;m <em>Dhwani.</em>
                    </motion.h1>
                    <span className="wi-annotation">some things are better unfinished.</span>
                    <div className="wi-divider"/>
                    <div className="wi-edit">
                        <label htmlFor="wi-typing">i make things that feel</label>
                        <span className="wi-word">
                            <input id="wi-typing" value={typing} maxLength={24} autoComplete="off" spellCheck={false} onChange={e=>setTyping(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();choose(active)}}}/>
                        </span>
                    </div>
                    <div className="wi-palette" role="group" aria-label="Choose the portfolio color">
                        {VIBES.map(v=><button key={v.id} type="button" aria-pressed={current.id===v.id} onMouseEnter={()=>hover(v)} onMouseLeave={revert} onFocus={()=>hover(v)} onBlur={revert} onClick={()=>choose(v)}>
                            <span className="wi-dot" aria-hidden="true" style={{background:v.accent}}/>{v.name}
                        </button>)}
                    </div>
                    <div className="wi-custom">
                        <span>or mix your own</span>
                        <label>from <input aria-label="First custom gradient color" type="color" value={colors[0]} onChange={e=>updateColors(0,e.target.value)}/></label>
                        <label>to <input aria-label="Second custom gradient color" type="color" value={colors[1]} onChange={e=>updateColors(1,e.target.value)}/></label>
                        <button type="button" onClick={()=>choose(custom(colors))}>use gradient</button>
                    </div>
                    <div className="wi-divider"/>
                    <div className="wi-footer">
                        <button className="wi-cta" type="button" onClick={()=>choose(active)}>enter the portfolio</button>
                        <span className="wi-note">type a word · pick a color · or just enter</span>
                    </div>
                </main>
            </motion.div>}
        </AnimatePresence>
        {showSwitcher&&!open&&<div className="wi-switch" style={{[switcherSide]:20}}>
            {menu&&<div className="wi-menu" role="group" aria-label="Change the portfolio color">
                {VIBES.map(v=><button key={v.id} type="button" onMouseEnter={()=>hover(v)} onMouseLeave={revert} onFocus={()=>hover(v)} onBlur={revert} onClick={()=>choose(v)}>
                    <span className="wi-dot" style={{background:v.accent}} aria-hidden="true"/>{v.name}
                </button>)}
                <label style={{fontSize:11}}>from <input type="color" aria-label="First custom color" value={colors[0]} onChange={e=>updateColors(0,e.target.value)}/></label>
                <label style={{fontSize:11}}>to <input type="color" aria-label="Second custom color" value={colors[1]} onChange={e=>updateColors(1,e.target.value)}/></label>
                <button type="button" onClick={()=>choose(custom(colors))}>apply custom</button>
            </div>}
            <button className="wi-chip" type="button" aria-label={"Change color vibe, current "+current.name} aria-expanded={menu} onClick={()=>{if(menu)revert();setMenu(v=>!v)}}>
                <span className="wi-dot" style={{width:14,height:14,background:current.accent}} aria-hidden="true"/>vibe · {current.name.toLowerCase()}
            </button>
        </div>}
    </>
}
addPropertyControls(WorldIntro,{
    showWhen:{type:ControlType.Enum,title:"Show intro",options:["session","always","never"],optionTitles:["Once per visit","Every load","Never"],defaultValue:"session"},
    defaultVibe:{type:ControlType.Enum,title:"Default vibe",options:VIBES.map(v=>v.id),optionTitles:VIBES.map(v=>v.name),defaultValue:"afterhours"},
    showSwitcher:{type:ControlType.Boolean,title:"Vibe chip",defaultValue:true},
    switcherSide:{type:ControlType.Enum,title:"Chip side",options:["left","right"],optionTitles:["Left","Right"],defaultValue:"left",displaySegmentedControl:true,hidden:(p:Props)=>!p.showSwitcher},
})
