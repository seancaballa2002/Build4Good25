"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Mic, Search } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import styles from "./page.module.css"

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const router = useRouter()

  const SpeechRecognition =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  // 🧠 Handle mic recognition events
  useEffect(() => {
    if (!recognition) return

    recognition.continuous = false
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Transcript:", transcript)
      setSearchQuery(transcript)
      setRecognizing(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      alert("Mic error: " + event.error)
      setRecognizing(false)
    }

    recognition.onend = () => {
      setRecognizing(false)
    }
  }, [recognition])

  // 📝 Submit typed or transcribed text
  const handleTextSubmit = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)

    const { error } = await supabase.from("requests").insert([
      {
        issue: searchQuery,
        // add user_id or other fields as needed
      },
    ])

    setLoading(false)

    if (error) {
      console.error("❌ Error saving text input:", error)
      alert(`Error submitting request: ${error.message}`)
    } else {
      alert("✅ Issue submitted!")
      setSearchQuery("")
    }
  }

  const handleCameraClick = () => {
    router.push("/landing/camera")
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image
            src="/placeholder.svg?height=80&width=80"
            alt="Handyman Logo"
            width={80}
            height={80}
            className={styles.logo}
          />
          <h1 className={styles.title}>Bobby the Handyman</h1>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={24} />
            <input
              type="text"
              placeholder="What's the Issue?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchActions}>
              <button
                className={styles.actionButton}
                onClick={handleTextSubmit}
                disabled={loading}
              >
                {loading ? "..." : "→"}
              </button>

              <button
                className={styles.actionButton}
                onClick={() => {
                  if (recognition && !recognizing) {
                    recognition.start()
                    setRecognizing(true)
                  } else if (recognition && recognizing) {
                    recognition.stop()
                    setRecognizing(false)
                  }
                }}
              >
                <Mic size={20} />
              </button>

              <button className={styles.actionButton} onClick={handleCameraClick}>
                <Camera size={20} />
              </button>
            </div>
          </div>

          {recognizing && (
            <div className={styles.recordingIndicator}>
              <span className={styles.recordingDot} />
              Recording...
            </div>
          )}
        </div>

        <p className={styles.tagline}>We can fix it :)</p>
      </main>
    </div>
  )
}
