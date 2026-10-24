import { redirect } from "next/navigation"

// Keep the URL in one place so the resume can be replaced without changing nav links.
// Primary UX Designer resume in Dhwani's Google Drive (verified existing document).
const RESUME_URL = "https://docs.google.com/document/d/1LDUTKiGNnezD-ohCboF0jwMtIXS2rCICqRKn0jpWEyU/edit?usp=drivesdk"

export default function Resume() {
  redirect(RESUME_URL)
}
