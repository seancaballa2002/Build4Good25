"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Mic, Search, ArrowRight } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import styles from "./page.module.css"

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const router = useRouter()

  const SpeechRecognition =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const recognition = SpeechRecognition ? new SpeechRecognition() : null

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

  const handleCameraClick = () => {
    router.push("/landing/camera")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return
    setIsLoading(true)

    try {
      // 1. Send to /api/parse
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: searchQuery }),
      })

      if (!response.ok) throw new Error("Failed to parse input")
      const result = await response.json()

      // 2. Store in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("parsedFormData", JSON.stringify(result.data || {}))
        if (result.priceEstimate) {
          sessionStorage.setItem("priceEstimate", JSON.stringify(result.priceEstimate))
        }
      }

      // 3. Insert raw text into Supabase
      const { error } = await supabase.from("requests").insert([{ issue: searchQuery }])
      if (error) throw new Error(`Supabase error: ${error.message}`)

      // 4. Navigate to confirmation
      router.push("/confirmation")
    } catch (err) {
      console.error("Error:", err)
      alert("Something went wrong while submitting.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicClick = () => {
    if (recognition && !recognizing) {
      recognition.start()
      setRecognizing(true)
    } else if (recognition && recognizing) {
      recognition.stop()
      setRecognizing(false)
    }
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
        <form onSubmit={handleSubmit} className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={24} />
            <input
              type="text"
              placeholder="Describe your problem (e.g., leaking faucet in kitchen)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleMicClick}
              >
                <Mic size={20} />
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleCameraClick}
              >
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

          <Button
            type="submit"
            className={styles.submitButton || "mt-4 w-full"}
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? "Processing..." : "Get Quotes"}{" "}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className={styles.tagline}>We can fix it :)</p>
      </main>
    </div>
  )
}
