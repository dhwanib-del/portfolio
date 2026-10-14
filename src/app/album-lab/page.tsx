import type { Metadata } from "next"
import { AlbumLab } from "./AlbumLab"

export const metadata: Metadata = {
  title: "Album Intro · Design Explorations | Dhwani",
  description: "Visual directions for a compact music-inspired portfolio introduction.",
  robots: { index: false, follow: false },
}

export default function AlbumLabPage() {
  return <AlbumLab />
}
