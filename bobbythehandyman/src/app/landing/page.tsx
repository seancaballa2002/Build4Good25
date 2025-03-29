"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Mic, Search, ArrowRight } from "lucide-react"
import styles from "./page.module.css"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCameraClick = () => {
    router.push("/landing/camera")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call the parse API endpoint to process the input
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawInput: searchQuery }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to parse input')
      }
      
      const result = await response.json()
      
      // Use try-catch when accessing sessionStorage to handle SSR contexts
      try {
        // Store the parsed data in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('parsedFormData', JSON.stringify(result.data || {}))
          
          // Store price estimate if available
          if (result.priceEstimate) {
            sessionStorage.setItem('priceEstimate', JSON.stringify(result.priceEstimate))
          }
        }
      } catch (storageError) {
        console.error('Error storing data:', storageError)
      }
      
      // Navigate to the confirmation page
      router.push('/confirmation')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
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
              <button type="button" className={styles.actionButton}>
                <Mic size={20} />
              </button>
              <button type="button" className={styles.actionButton} onClick={handleCameraClick}>
                <Camera size={20} />
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className={styles.submitButton || "mt-4 w-full"}
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? 'Processing...' : 'Get Quotes'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className={styles.tagline}>We can fix it :)</p>
      </main>
    </div>
  )
}

