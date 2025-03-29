"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CheckCircle2 } from "lucide-react"
import { FormData } from "@/types"

interface PriceEstimate {
  priceRange: string;
  explanation: string;
}

export default function ConfirmationPage() {
  const router = useRouter()

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    issue: "",
    description: "",
    name: "",
    address: "",
    date: undefined as Date | undefined,
    priceRange: [50, 150] as [number, number],
    timesAvailable: [] as string[],
    desiredPriceRange: ""
  })

  const [submitted, setSubmitted] = useState(false)
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([])
  const [showQuestions, setShowQuestions] = useState(false)

  // Load parsed data from sessionStorage when component mounts
  useEffect(() => {
    const loadFormData = () => {
      try {
        // Check if window is defined (client-side only)
        if (typeof window === 'undefined') return;
        
        // Load the parsed form data
        const savedData = sessionStorage.getItem('parsedFormData')
        if (!savedData) return;
        
        let parsedData: Partial<FormData> = {};
        
        try {
          parsedData = JSON.parse(savedData);
        } catch (parseError) {
          console.error('Error parsing saved data:', parseError);
          return;
        }
        
        // Safely update the form with data from the parser
        setFormData(prevData => ({
          ...prevData,
          issue: parsedData.issue || prevData.issue,
          description: parsedData.description || prevData.description,
          name: parsedData.name || prevData.name,
          address: parsedData.address || prevData.address,
          timesAvailable: Array.isArray(parsedData.timesAvailable) ? 
            parsedData.timesAvailable : prevData.timesAvailable,
          desiredPriceRange: parsedData.desiredPriceRange || prevData.desiredPriceRange
        }))
        
        // Extract price range for the slider if it exists
        if (typeof parsedData.desiredPriceRange === 'string' && parsedData.desiredPriceRange) {
          const priceMatch = parsedData.desiredPriceRange.match(/\$(\d+)(?:-(\d+))?/)
          if (priceMatch && priceMatch[1]) {
            const minPrice = parseInt(priceMatch[1], 10) || 50
            const maxPrice = priceMatch[2] ? parseInt(priceMatch[2], 10) : minPrice + 100
            setFormData(prev => ({
              ...prev,
              priceRange: [minPrice, maxPrice] as [number, number]
            }))
          }
        }
        
        // Load price estimate if available
        try {
          const priceEstimateData = sessionStorage.getItem('priceEstimate')
          if (priceEstimateData) {
            setPriceEstimate(JSON.parse(priceEstimateData))
          }
        } catch (error) {
          console.error('Error loading price estimate:', error)
        }
        
        // Load clarifying questions if available
        try {
          const questionsData = sessionStorage.getItem('clarifyingQuestions')
          if (questionsData) {
            const questions = JSON.parse(questionsData)
            if (Array.isArray(questions) && questions.length > 0) {
              setClarifyingQuestions(questions)
              // Only show questions if important data is missing
              const hasImportantData = parsedData.name && 
                                       parsedData.issue && 
                                       (parsedData.address !== "75025" || parsedData.address.toLowerCase().includes("plano")) &&
                                       Array.isArray(parsedData.timesAvailable) && 
                                       parsedData.timesAvailable.length > 0
              
              setShowQuestions(!hasImportantData)
            }
          }
        } catch (error) {
          console.error('Error loading clarifying questions:', error)
        }
      } catch (error) {
        console.error('Error loading form data:', error)
        // Don't let errors break the page
      }
    }
    
    loadFormData()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    
    // Hide questions when user starts filling in data
    if (showQuestions) {
      setShowQuestions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare data for submission to Retell API
    const formattedData: FormData = {
      issue: formData.issue || "Home repair needed",
      description: formData.description || formData.issue || "Requires handyman assistance",
      name: formData.name || "Guest",
      address: formData.address || "75025", // Default to Plano, TX
      timesAvailable: Array.isArray(formData.timesAvailable) && formData.timesAvailable.length > 0 ? 
        formData.timesAvailable : 
        [formData.date ? format(formData.date, 'EEEE, MMMM do') : 'Flexible'],
      desiredPriceRange: formData.desiredPriceRange || `$${formData.priceRange[0]}-${formData.priceRange[1]}`
    }
    
    try {
      // Call the Retell API endpoint
      const response = await fetch('/api/retell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit request')
      }
      
      const result = await response.json()
      
      // Store the response data for the search-providers page
      try {
        if (typeof window !== 'undefined') {
          const quoteData = Array.isArray(result.data) ? result.data : [];
          sessionStorage.setItem('quoteResponses', JSON.stringify(quoteData))
        }
      } catch (storageError) {
        console.error('Error storing quotes:', storageError)
      }
      
      setSubmitted(true)
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/search-providers")
      }, 2000)
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('There was an error submitting your request. Please try again.')
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      {submitted ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-2xl font-bold">Information Confirmed!</h2>
              <p className="text-muted-foreground">We're now searching for the best handymen in your area.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Clarifying Questions Card */}
          {showQuestions && clarifyingQuestions.length > 0 && (
            <Card className="w-full mb-6 border-amber-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-amber-700">Please Clarify</CardTitle>
                <CardDescription>We need a few more details to better understand your request</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {clarifyingQuestions.map((question, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Price Estimate Card */}
          {priceEstimate && (
            <Card className="w-full mb-6 border-green-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-green-700">Price Estimate</CardTitle>
                <CardDescription>Based on similar jobs in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{priceEstimate.priceRange}</span>
                  <span className="text-sm text-muted-foreground">Typical market rate</span>
                </div>
                <p className="text-sm mt-2">{priceEstimate.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Main Form Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Confirm Your Request</CardTitle>
              <CardDescription>We've analyzed your problem. Please confirm or edit the details below.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="issue">Issue</Label>
                  <Input
                    id="issue"
                    value={formData.issue}
                    onChange={(e) => handleInputChange("issue", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Your Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>When are you available?</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleInputChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      ${formData.priceRange[0]} - ${formData.priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    defaultValue={formData.priceRange}
                    max={500}
                    step={10}
                    onValueChange={(value) => handleInputChange("priceRange", value)}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$250</span>
                    <span>$500</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Back
                </Button>
                <Button type="submit">Confirm & Find Handymen</Button>
              </CardFooter>
            </form>
          </Card>
        </>
      )}
    </div>
  )
}

