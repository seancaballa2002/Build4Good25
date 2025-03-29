"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Phone, User, MapPin, Clock, DollarSign, Star, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from '@supabase/supabase-js'
import { QuoteResponse, FormData } from "@/types"
// Mock data for service providers
const mockProviders = [
  {
    id: 1,
    name: "Mike's Plumbing",
    rating: 4.8,
    reviews: 124,
    price: "$75",
    availability: "Today",
    distance: "1.2 miles",
    specialties: ["Plumbing", "Faucets", "Sinks"],
  },
  {
    id: 2,
    name: "HandyPro Services",
    rating: 4.6,
    reviews: 89,
    price: "$85",
    availability: "Tomorrow",
    distance: "2.5 miles",
    specialties: ["General Repairs", "Plumbing", "Electrical"],
  },
  {
    id: 3,
    name: "Quick Fix Solutions",
    rating: 4.9,
    reviews: 203,
    price: "$95",
    availability: "Today",
    distance: "3.1 miles",
    specialties: ["Emergency Repairs", "Plumbing", "Installations"],
  },
  {
    id: 4,
    name: "Local Handyman Co.",
    rating: 4.7,
    reviews: 156,
    price: "$65",
    availability: "Mar 31",
    distance: "1.8 miles",
    specialties: ["Home Repairs", "Plumbing", "Carpentry"],
  },
  {
    id: 5,
    name: "Expert Home Services",
    rating: 4.5,
    reviews: 78,
    price: "$90",
    availability: "Apr 1",
    distance: "4.2 miles",
    specialties: ["Plumbing", "Electrical", "HVAC"],
  },
]
import { QuoteResponse, FormData } from "@/types"

// Create a single supabase client for interacting with your database
const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')

export default function SearchProvidersPage() {
  const [progress, setProgress] = useState(0)
  const [providersFound, setProvidersFound] = useState(0)
  const [providers, setProviders] = useState<QuoteResponse[]>([])
  const [searching, setSearching] = useState(true)
  const [userData, setUserData] = useState<FormData | null>(null)

  useEffect(() => {
    const loadUserData = () => {
      try {
        // Check if window is defined (client-side only)
        if (typeof window === 'undefined') return;
        
        const savedData = sessionStorage.getItem('parsedFormData')
        if (!savedData) return;
        
        try {
          const userData = JSON.parse(savedData);
          if (userData && typeof userData === 'object') {
            setUserData(userData);
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    const loadQuoteData = () => {
      try {
        // Check if window is defined (client-side only)
        if (typeof window === 'undefined') return false;
        
        const savedQuotes = sessionStorage.getItem('quoteResponses')
        if (!savedQuotes) return false;
        
        try {
          const quotes = JSON.parse(savedQuotes);
          
          // Make sure quotes is an array
          if (Array.isArray(quotes) && quotes.length > 0) {
            setProviders(quotes)
            setProvidersFound(quotes.length)
            setProgress(100)
            setSearching(false)
            return true
          }
        } catch (parseError) {
          console.error('Error parsing quote data:', parseError);
        }
        
        return false
      } catch (error) {
        console.error('Error loading quote data:', error)
        return false
      }
    }
    
    // Load user data for the summary section
    loadUserData()
    
    // Try to load saved quotes
    const hasQuotes = loadQuoteData()
    
    // If we don't have saved quotes, simulate the search process
    if (!hasQuotes) {
      // Simulate finding providers gradually
      const providerInterval = setInterval(() => {
        setProvidersFound((prev) => {
          if (prev >= 5) {
            clearInterval(providerInterval)
            return 5
          }

          return prev + 1
        })
      }, 1500)

      // Simulate progress bar
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(progressInterval)
            setSearching(false)
            return 100
          }
          return prevProgress + 2
        })
      }, 150)

      return () => {
        clearInterval(providerInterval)
        clearInterval(progressInterval)
      }
    }
  }, [])

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Finding Handymen</CardTitle>
          <CardDescription>We're contacting local providers to get quotes for your job.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{searching ? "Searching..." : "Search complete"}</span>
              <span>{providersFound} providers found</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Your Request Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Issue</p>
                  <p className="text-sm text-muted-foreground">{userData?.issue || "Unknown issue"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{userData?.name || "Guest"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{userData?.address || "No address provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Available</p>
                  <p className="text-sm text-muted-foreground">
                    {userData?.timesAvailable?.join(", ") || "Flexible"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 md:col-span-2">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Price Range</p>
                  <p className="text-sm text-muted-foreground">{userData?.desiredPriceRange || "$50-$150"}</p>
                </div>
              </div>
            </div>
          </div>

          {searching && (
            <p className="text-sm text-center text-muted-foreground">
              This process typically takes 1-2 minutes. Please don't close this page.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Provider Cards Section */}
      {providers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Service Providers</h2>

          {providers.map((provider, index) => (
            <Card key={index} className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{provider.providerName}</h3>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({Math.floor(50 + Math.random() * 200)} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {provider.includedInQuote.split(',').map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item.trim()}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{provider.availableTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{provider.quotePrice}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{provider.duration}</span>
                      </div>
                      {provider.contactInfo && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{provider.contactInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button className="w-full md:w-auto">Book Now</Button>
                    <Button variant="outline" className="w-full md:w-auto flex items-center gap-1">
                      Details <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


