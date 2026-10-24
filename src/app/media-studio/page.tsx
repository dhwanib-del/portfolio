import type { Metadata } from "next"
import { MediaStudio } from "./MediaStudio"

export const metadata: Metadata = {
  title: "Project Media Studio · Dhwani",
  description: "Preview and prepare project photos, screens and video for the portfolio.",
  robots: { index: false, follow: false, noarchive: true },
}

export default function MediaStudioPage() {
  return <MediaStudio />
}
