"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, CheckCircle, PhoneCall } from "lucide-react"
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
import { FormData, QuoteResponse } from "@/types"
import { getRequestWithQuotes } from "@/lib/supabaseActions"
import QuoteCard from "@/app/components/QuoteCard"
import Link from "next/link"

interface PriceEstimate {
  priceRange: string;
  explanation: string;
}

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('requestId')
  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)
  const [quotes, setQuotes] = useState<QuoteResponse[]>([])
  const [error, setError] = useState<string | null>(null)

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
    const loadFormData = async () => {
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

  useEffect(() => {
    async function fetchRequestData() {
      if (!requestId) {
        // If there's no request ID but we have parsed data in sessionStorage,
        // show the form view instead of an error
        const savedData = sessionStorage.getItem('parsedFormData');
        if (savedData) {
          setLoading(false); // We'll show the form instead
          return;
        }
        
        // Otherwise show the error
        setError('No request ID provided');
        setLoading(false);
        return;
      }

      try {
        const result = await getRequestWithQuotes(requestId);
        
        if (result.error) {
          setError('Error fetching request data');
          console.error(result.error);
        } else {
          setRequest(result.request);
          setQuotes(result.quotes || []);
        }
      } catch (err) {
        console.error('Error fetching request:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRequestData();
  }, [requestId]);

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
        [formData.date instanceof Date ? format(formData.date, 'EEEE, MMMM do') : 'Flexible'],
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg">Loading your handyman quotes...</p>
        </div>
      </div>
    );
  }

  // Show the form if we have parsed data but no request ID yet
  if (!requestId && typeof window !== 'undefined' && sessionStorage.getItem('parsedFormData')) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {submitted ? (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
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
                          {formData.date instanceof Date ? format(formData.date, "PPP") : "Select a date"}
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

  if (error || !request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error || 'Request not found'}</p>
          <Link href="/" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const getStatusSummary = () => {
    const pending = quotes.filter(q => q.status === 'pending').length;
    const completed = quotes.filter(q => q.status === 'completed').length; 
    const failed = quotes.filter(q => q.status === 'failed').length;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Call Status:</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <PhoneCall size={16} className="mr-1" />
            <span>{pending} {pending === 1 ? 'call' : 'calls'} in progress</span>
          </div>
          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
            <CheckCircle size={16} className="mr-1" />
            <span>{completed} {completed === 1 ? 'call' : 'calls'} completed</span>
          </div>
          {failed > 0 && (
            <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
              <span>{failed} {failed === 1 ? 'call' : 'calls'} failed</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Your Handyman Quotes</h1>
        <p className="text-gray-600">
          We've contacted local handymen for your {request.issue.toLowerCase()} issue
        </p>
      </div>

      {quotes.length > 0 ? (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Request Details</h2>
            <p className="mb-1"><strong>Issue:</strong> {request.issue}</p>
            <p className="mb-1"><strong>Description:</strong> {request.description}</p>
            <p className="mb-3"><strong>Address:</strong> {request.address}</p>
            
            <div className="flex items-start mb-1">
              <Calendar size={18} className="mr-2 mt-1 text-blue-500" />
              <div>
                <strong>Available Times:</strong>
                <ul className="list-disc list-inside ml-4">
                  {(() => {
                    // Parse times_available which might be a JSON string
                    let times = [];
                    try {
                      if (typeof request.times_available === 'string') {
                        const parsed = JSON.parse(request.times_available);
                        times = Array.isArray(parsed) ? parsed : [request.times_available];
                      } else if (Array.isArray(request.times_available)) {
                        times = request.times_available;
                      } else {
                        times = ["[]"];
                      }
                    } catch (e) {
                      // If parsing fails, use as-is
                      times = [String(request.times_available)];
                    }

                    return times.map((time: string, i: number) => (
                      <li key={i}>{time}</li>
                    ));
                  })()}
                </ul>
              </div>
            </div>
            
            <p><strong>Desired Price Range:</strong> {request.desired_price_range}</p>
          </div>

          {getStatusSummary()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((quote, index) => (
              <QuoteCard
                key={index}
                {...quote}
                showButtons={true}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">No Quotes Yet</h2>
          <p>We're still contacting local handymen. Please check back soon!</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
          Submit Another Request
        </Link>
      </div>
    </div>
  )
}

