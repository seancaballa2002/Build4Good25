import { FormData, QuoteResponse } from "@/types";

// Mock handyman profiles for demo
const MOCK_HANDYMEN = [
  {
    name: "Joe's Plumbing",
    specialty: "Plumbing",
    rating: 4.8,
    responseTime: "fast"
  },
  {
    name: "A-1 Repairs",
    specialty: "General Repairs",
    rating: 4.5,
    responseTime: "medium"
  },
  {
    name: "Elite Handyman Services",
    specialty: "Electrical, Plumbing",
    rating: 4.9,
    responseTime: "slow"
  }
];

// This is a mock implementation for now
// In a real implementation, you would call Retell AI API
export async function getQuotesFromHandymen(formData: FormData): Promise<QuoteResponse[]> {
  console.log("Getting quotes for:", formData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock quotes based on the issue type
  return MOCK_HANDYMEN.map(handyman => {
    // Randomize price based on issue and handyman
    const basePrice = formData.issue.toLowerCase().includes("leak") ? 70 : 
                     formData.issue.toLowerCase().includes("electrical") ? 90 : 60;
    
    // Adjust price based on handyman rating
    const adjustedPrice = Math.round(basePrice * (1 + (handyman.rating - 4.5) / 10));
    
    // Generate random availability
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const times = ["morning", "afternoon", "evening"];
    const randomDay = days[Math.floor(Math.random() * days.length)];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    
    // Generate random duration
    const durations = ["30 minutes", "1 hour", "1.5 hours", "2 hours"];
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];
    
    // Generate included items based on issue
    let includedItems = "Labor, inspection";
    if (formData.issue.toLowerCase().includes("leak")) {
      includedItems += ", basic parts, water testing";
    } else if (formData.issue.toLowerCase().includes("electrical")) {
      includedItems += ", wiring check, safety inspection";
    } else {
      includedItems += ", minor repairs";
    }
    
    return {
      providerName: handyman.name,
      quotePrice: `$${adjustedPrice}`,
      availableTime: `${randomDay} ${randomTime}`,
      duration: randomDuration,
      includedInQuote: includedItems,
      contactInfo: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
    };
  });
} 