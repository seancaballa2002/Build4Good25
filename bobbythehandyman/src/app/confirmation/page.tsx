"use client"

import type React from "react"

import { useState } from "react"
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

export default function ConfirmationPage() {
  const router = useRouter()

  // Mock data that would come from LLM parsing
  const [formData, setFormData] = useState({
    issue: "Leaking faucet in kitchen sink",
    description:
      "Water is dripping constantly from the kitchen faucet, even when turned off completely. The drip is slow but consistent.",
    name: "",
    address: "",
    date: undefined as Date | undefined,
    priceRange: [50, 150] as [number, number],
  })

  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Submitting form data:", formData)
    setSubmitted(true)

    // Redirect after a short delay to show the success message
    setTimeout(() => {
      router.push("/search-providers")
    }, 2000)
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
      )}
    </div>
  )
}

