"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Mic, Search } from "lucide-react"
import styles from "./page.module.css"

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

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
              placeholder="Problem?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchActions}>
              <button className={styles.actionButton}>
                <Mic size={20} />
              </button>
              <button className={styles.actionButton} onClick={handleCameraClick}>
                <Camera size={20} />
              </button>
            </div>
          </div>
        </div>

        <p className={styles.tagline}>We can fix it :)</p>
      </main>
    </div>
  )
}

