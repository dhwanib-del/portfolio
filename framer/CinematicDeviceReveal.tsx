import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// Cinematic Device Reveal — scroll-controlled hardware + real Figma prototype.
// Preview image is user-supplied; no fictional product screens are generated.
type Props = {
    device: "ipad" | "macbook"
    prototypeURL: string
    previewImage: string
    title: string
    accentWord: string
    intro: string
    eyebrow: string
    accent: string
    background: string
    scrollLength: number
    showTimeline: boolean
    style?: React.CSSProperties
}
const FONT = "'Poppins', Inter, system-ui, sans-serif"
const ease = (x: number) => { const v = Math.max(0, Math.min(1, x)); return v * v * (3 - 2 * v) }
function figmaLink(value: string) {
    try {
        const u = new URL(value)
        if (u.protocol !== "https:" || !["figma.com", "www.figma.com", "embed.figma.com"].includes(u.hostname) || !["proto", "design", "file"].includes(u.pathname.split("/")[1])) return null
        const source = new URL(u.toString()); source.hostname = "www.figma.com"
        const embedded = new URL(u.toString()); embedded.hostname = "embed.figma.com"
        embedded.searchParams.set("embed-host", "portfolio")
        if (embedded.pathname.startsWith("/proto/") && !embedded.searchParams.has("scaling")) embedded.searchParams.set("scaling", "scale-down")
        return { original: source.toString(), embed: embedded.toString() }
    } catch { return null }
}
export default function CinematicDeviceReveal(p: Props) {
    const { device = "ipad", prototypeURL = "", previewImage = "", title = "In-vehicle experience,", accentWord = "reimagined.", intro = "Explore how Convoy brings people and vehicles together, from planning on mobile to the in-truck display.", eyebrow = "GM · CONVOY", accent = "#F3500F", background = "#050506", scrollLength = 250, showTimeline = true, style } = p
    const root = React.useRef<HTMLDivElement>(null)
    const [progress, setProgress] = React.useState(0)
    const [mobile, setMobile] = React.useState(false)
    const [reduced, setReduced] = React.useState(false)
    const [playing, setPlaying] = React.useState(false)
    const [modal, setModal] = React.useState(false)
    const preview = RenderTarget.current() === RenderTarget.canvas
    const figma = React.useMemo(() => figmaLink(prototypeURL), [prototypeURL])

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(rm.matches)
        sync(); rm.addEventListener?.("change", sync)
        return () => rm.removeEventListener?.("change", sync)
    }, [])
    React.useEffect(() => {
        if (typeof window === "undefined" || preview) return
        let frame = 0
        const update = () => {
            frame = 0
            const el = root.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const dist = Math.max(1, rect.height - window.innerHeight)
            setProgress(Math.max(0, Math.min(1, -rect.top / dist)))
            setMobile(rect.width < 720)
        }
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
        update(); window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule)
        return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); cancelAnimationFrame(frame) }
    }, [preview, scrollLength])
    React.useEffect(() => {
        if (!modal) return
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(false) }
        document.addEventListener("keydown", esc)
        return () => document.removeEventListener("keydown", esc)
    }, [modal])
    React.useEffect(() => { setPlaying(false); setModal(false) }, [prototypeURL, device])
    const t = preview || reduced || playing ? 1 : ease((progress - .08) / .77)
    const isPad = device === "ipad"
    const open = t > .87
    const stages = isPad ? ["SCROLL", "ROTATE", "REVEAL", "INTERACT"] : ["SCROLL", "REVEAL", "OPEN", "INTERACT"]
    const buttonStyle: React.CSSProperties = { border: "1px solid rgba(255,255,255,.38)", borderRadius: 999, background: "rgba(9,9,11,.84)", color: "#fff", padding: "12px 20px", minHeight: 46, font: `500 12px ${FONT}`, cursor: "pointer" }
    const content = playing && figma && !preview ?
        <iframe src={figma.embed} title="Interactive Figma prototype" style={{ width:"100%", height:"100%", border:0, display:"block", background:"#111" }} allowFullScreen /> :
        previewImage ? <img src={previewImage} alt="Prototype screen preview" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }} /> :
        <div style={{ width:"100%",height:"100%",display:"grid",placeItems:"center",background:"radial-gradient(circle at 50% 70%,#27272e,#101014 65%)",textAlign:"center",color:"#9f9fa9",padding:24,boxSizing:"border-box",font:`500 clamp(11px,1.5vw,16px) ${FONT}` }}>Add your approved screen image in Framer</div>
    return <section ref={root} style={{ ...style, width:"100%", position:"relative",background,color:"#f7f6f5",fontFamily:FONT,height: preview || playing ? "auto" : `${Math.max(150,scrollLength)}vh`,minHeight:preview||playing?560:undefined,isolation:"isolate" }}>
      <div style={{ height:preview||playing?"auto":"100vh",minHeight:560,position:preview||playing?"relative":"sticky",top:0,overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:mobile?"64px 18px 36px":"clamp(50px,6vw,90px) clamp(25px,6vw,110px) 30px",boxSizing:"border-box",background:`radial-gradient(ellipse at 74% 72%,${accent}17,transparent 53%),${background}` }}>
       <div style={{ zIndex:2,maxWidth:mobile?"100%":"33%",pointerEvents:"none" }}>
         <p style={{ fontSize:11,fontWeight:600,letterSpacing:".22em",margin:"0 0 24px",color:"#b2aeb4" }}>{eyebrow}</p>
         <h2 style={{ fontSize:"clamp(30px,4.15vw,68px)",lineHeight:1.08,letterSpacing:"-.053em",fontWeight:600,margin:0 }}>{title}<br/><span style={{ color:accent }}>{accentWord}</span></h2>
         <p style={{ maxWidth:360,color:"#c2c0c6",fontSize:"clamp(13px,1.15vw,17px)",lineHeight:1.6,marginTop:22 }}>{intro}</p>
       </div>
       <div style={{ position:"absolute",zIndex:1,width:mobile?"92%":"66%",maxWidth:1150,right:mobile?"4%":"2%",top:mobile?"49%":"47%",transform:`translateY(-50%) translateY(${(1-t)*50}px) scale(${.91+t*.09})`,perspective:"1500px",pointerEvents:playing?"auto":"none" }}>
         <div style={{ position:"relative",width:"100%",transform:isPad?`rotateY(${(1-t)*-43}deg) rotateX(${(1-t)*20}deg) rotateZ(${(1-t)*-5}deg)`:`rotateX(${(1-t)*-73}deg)`,transformOrigin:isPad?"50% 50%":"50% 100%",transformStyle:"preserve-3d",filter:`drop-shadow(0 ${16+24*t}px ${20+28*t}px rgba(0,0,0,.75))` }}>
           <div style={{ width:isPad?"87%":"93%",margin:"0 auto",aspectRatio:isPad?"4 / 3":"16 / 10",padding:isPad?"1.7%":"1.25%",boxSizing:"border-box",borderRadius:isPad?"clamp(18px,3vw,36px)":"16px 16px 6px 6px",background:"linear-gradient(135deg,#85848c 0%,#24232a 4%,#101116 94%,#64636b 100%)",border:"1px solid #585861",boxShadow:"inset 0 1px 1px rgba(255,255,255,.3)",position:"relative" }}>
             <div style={{ width:"100%",height:"100%",overflow:"hidden",borderRadius:isPad?24:6,background:"#080809" }}>{content}</div>
             <span aria-hidden style={{position:"absolute",width:5,height:5,top:isPad?"50%":"0.65%",left:isPad?"1%":"49.8%",borderRadius:"50%",background:"#4e4e58"}}/>
           </div>
           {!isPad&&<div aria-hidden style={{height:"clamp(8px,1.5vw,22px)",width:"100%",marginTop:-1,background:"linear-gradient(180deg,#a9a9ae,#5b5c64 65%,#313139)",borderRadius:"3px 3px 40% 40% / 2px 2px 80% 80%",border:"1px solid #66666a",boxSizing:"border-box",position:"relative" }}><span style={{position:"absolute",left:"43%",width:"14%",top:0,height:"45%",borderRadius:"0 0 12px 12px",background:"#888991"}}/></div>}
         </div>
         <div style={{height:35,width:"75%",margin:"5px auto 0",borderRadius:"50%",background:"rgba(0,0,0,.7)",filter:"blur(22px)",transform:`scale(${.75+.25*t})`}}/>
       </div>
       <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,zIndex:3,flexWrap:"wrap",position:"relative" }}>
         <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
           {!playing&&<button onClick={()=>{if(open&&figma)setPlaying(true)}} disabled={!open||!figma||preview} style={{...buttonStyle,opacity:!open||!figma?.7:1,cursor:open&&figma?"pointer":"default"}}><span style={{color:accent,marginRight:8}}>◉</span>{!figma?"Add Figma prototype URL":open?"Explore prototype ↗":"Scroll to reveal ↓"}</button>}
           {playing&&<button onClick={()=>setModal(true)} style={buttonStyle}>Full screen ↗</button>}
           {figma&&<a href={figma.original} target="_blank" rel="noopener noreferrer" style={{color:"#d2d0d5",fontSize:12}}>Open in Figma ↗</a>}
         </div>
         <span style={{fontSize:11,color:"#aaa7ae",letterSpacing:".16em"}}>{isPad?"IPAD / LANDSCAPE":"MACBOOK / INTERACTIVE"}</span>
       </div>
       {showTimeline&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:mobile?9:28,paddingTop:mobile?18:34,zIndex:3 }}>
         {stages.map((stage,i)=><div key={stage} style={{minWidth:0}}>
           <div style={{height:2,background:"rgba(255,255,255,.27)",marginBottom:13,position:"relative"}}><span style={{position:"absolute",left:0,top:0,height:2,width:`${Math.max(0,Math.min(1,t*4-i))*100}%`,background:accent}}/><span style={{position:"absolute",left:0,top:-2,width:6,height:6,borderRadius:"50%",background:i/4<=t?accent:"#a8a7ad"}}/></div>
           <span style={{fontSize:mobile?9:11,letterSpacing:".15em",color:i/4<=t?"#f3f1f2":"#99989f"}}>{String(i+1).padStart(2,"0")} &nbsp;{stage}</span>
         </div>)}
       </div>}
      </div>
      {modal&&figma&&<div role="dialog" aria-modal="true" aria-label="Expanded Figma prototype" style={{position:"fixed",inset:10,zIndex:9999,background:"#0e0e11",border:"1px solid #444",borderRadius:16,display:"flex",flexDirection:"column",boxShadow:"0 0 0 100vmax rgba(0,0,0,.83)",overflow:"hidden"}}>
        <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px"}}><span style={{fontSize:12,letterSpacing:".12em"}}>CONVOY / LIVE PROTOTYPE</span><button onClick={()=>setModal(false)} style={buttonStyle}>Close ✕</button></header>
        <iframe src={figma.embed} title="Expanded Figma prototype" allowFullScreen style={{flex:1,width:"100%",border:0}} />
      </div>}
    </section>
}
addPropertyControls(CinematicDeviceReveal, {
  device:{type:ControlType.Enum,title:"Device",options:["ipad","macbook"],optionTitles:["iPad Landscape","MacBook"],defaultValue:"ipad"},
  prototypeURL:{type:ControlType.String,title:"Figma Prototype",placeholder:"https://www.figma.com/proto/..."},
  previewImage:{type:ControlType.Image,title:"Screen Preview"},
  title:{type:ControlType.String,title:"Title",defaultValue:"In-vehicle experience,"},
  accentWord:{type:ControlType.String,title:"Accent title",defaultValue:"reimagined."},
  intro:{type:ControlType.String,title:"Description",defaultValue:"Explore how Convoy brings people and vehicles together, from planning on mobile to the in-truck display."},
  eyebrow:{type:ControlType.String,title:"Eyebrow",defaultValue:"GM · CONVOY"},
  accent:{type:ControlType.Color,title:"Accent",defaultValue:"#F3500F"},
  background:{type:ControlType.Color,title:"Background",defaultValue:"#050506"},
  scrollLength:{type:ControlType.Number,title:"Scroll length",min:150,max:360,step:10,defaultValue:250},
  showTimeline:{type:ControlType.Boolean,title:"Stages",defaultValue:true},
})
