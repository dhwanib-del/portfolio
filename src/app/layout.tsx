import type { Metadata } from "next"
import "@fontsource-variable/plus-jakarta-sans"
import "@fontsource/pinyon-script"
import "@fontsource/patrick-hand"
import "@fontsource/poppins/400.css"
import "@fontsource/poppins/500.css"
import "./globals.css"
import "./components.css"
import { Nav } from "@/components/Nav"
import { Intro } from "@/components/Intro"
import { Companion } from "@/components/Companion"
import { Chat } from "@/components/Chat"

export const metadata: Metadata = {
  title: "Dhwani Bagrecha · Product & UX Designer",
  description: "Product, UX and experience designer at the University of Michigan School of Information. Designing for people making decisions under pressure.",
}

// Runs before paint: applies a saved theme/vibe so there's no flash.
const boot = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);var v=localStorage.getItem("vibe");if(v)document.documentElement.setAttribute("data-vibe",v)}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <div aria-hidden className="aurora"><i /><i /><i /></div>
        <Intro />
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Companion />
        <Chat />
        <footer className="footer">
          <div className="footer-inner container">
            <p className="eyebrow">that’s the scroll</p>
            <h2>Thanks for <em>scrolling.</em></h2>
            <p className="footer-question">How can I help?</p>
            <p className="footer-note">Talk design, music, or the portfolio I’m probably editing again.</p>
            <div className="footer-actions">
              <a className="btn btn-primary" href="mailto:dhwanib@umich.edu">Get in touch ↗</a>
              <a className="btn" href="https://www.linkedin.com/in/dhwanibagrecha/" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
            <p className="footer-credit">© 2026 Dhwani Bagrecha · Made with Claude, edited by Dhwani.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
