import { FormData, QuoteResponse } from "../src/types";
import axios from "axios";

// Mock handyman profiles for demo
const MOCK_HANDYMEN = [
  {
    name: "Joe's Plumbing",
    specialty: "Plumbing",
    rating: 4.8,
    responseTime: "fast",
    phoneNumber: "+15551234567"
  },
  {
    name: "A-1 Repairs",
    specialty: "General Repairs",
    rating: 4.5,
    responseTime: "medium",
    phoneNumber: "+15552345678"
  },
  {
    name: "Elite Handyman Services",
    specialty: "Electrical, Plumbing",
    rating: 4.9,
    responseTime: "slow",
    phoneNumber: "+15553456789"
  }
];

export async function getQuotesFromHandymen(formData: FormData): Promise<QuoteResponse[]> {
  console.log("Getting quotes for:", formData);
  
  // Try to use actual Retell API if configured
  const RETELL_API_KEY = process.env.RETELL_API_KEY;
  
  if (RETELL_API_KEY) {
    try {
      return await getQuotesViaRetell(formData);
    } catch (error) {
      console.error("Error using Retell API, falling back to mock data:", error);
    }
  } else {
    console.warn("RETELL_API_KEY not set, using mock handyman data");
  }
  
  // Fall back to mock data if API call fails or key not provided
  return getMockQuotes(formData);
}

async function getQuotesViaRetell(formData: FormData): Promise<QuoteResponse[]> {
  const RETELL_API_KEY = process.env.RETELL_API_KEY;
  
  if (!RETELL_API_KEY) {
    throw new Error("RETELL_API_KEY not set");
  }
  
  // Format available times as a comma-separated string
  const timesAvailableStr = Array.isArray(formData.timesAvailable) 
    ? formData.timesAvailable.join(", ") 
    : formData.timesAvailable;
  
  // Create dynamic variables according to the conversation flow
  const dynamicVariables = {
    problem: formData.issue,
    "leak_type": formData.description,
    "price range": formData.desiredPriceRange,
    location: formData.address,
    phone_number: "+15551234567" // Demo number for the user
  };
  
  try {
    // For MVP, we'll make parallel requests for each mock handyman
    // In a production environment, you'd integrate with your actual handyman database
    const promises = MOCK_HANDYMEN.map(async (handyman) => {
      try {
        // Create a phone call using the Retell API
        const response = await axios.post(
          "https://api.retellai.com/v2/create-phone-call",
          {
            from_number: "+15551234599", // Your Retell purchased number
            to_number: handyman.phoneNumber,
            agent_id: "conversation_flow_bcf8f699636c", // The agent ID from your conversation flow
            retell_llm_dynamic_variables: dynamicVariables,
            metadata: {
              handyman_name: handyman.name,
              handyman_specialty: handyman.specialty,
              user_request: formData.issue
            }
          },
          {
            headers: {
              "Authorization": `Bearer ${RETELL_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        console.log(`Call initiated to ${handyman.name} with response:`, response.data);
        
        // For MVP, we'll return a synthesized response with the call_id
        // In a production app, you'd set up webhooks to receive the actual call results
        const callId = response.data.call_id;
        
        // Store the call_id for later reference (could be used to query call status)
        return synthesizeQuoteResponse(handyman, formData, callId);
      } catch (error) {
        console.error(`Error calling ${handyman.name}:`, error);
        // Return a fallback response if the API call fails
        return getMockQuoteForHandyman(handyman, formData);
      }
    });
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error processing Retell requests:", error);
    throw error;
  }
}

// Synthesize a quote response based on the call initiation
function synthesizeQuoteResponse(handyman: any, formData: FormData, callId: string): QuoteResponse {
  const baseQuote = getMockQuoteForHandyman(handyman, formData);
  
  return {
    ...baseQuote,
    callId: callId, // Store the Retell call ID for reference
    status: "pending" // In a real app, you'd update this via webhooks
  } as QuoteResponse;
}

// Fallback to get mock quotes if Retell API is not available
function getMockQuotes(formData: FormData): Promise<QuoteResponse[]> {
  // Simulate API delay
  return new Promise(resolve => {
    setTimeout(() => {
      const quotes = MOCK_HANDYMEN.map(handyman => getMockQuoteForHandyman(handyman, formData));
      resolve(quotes);
    }, 2000);
  });
}

// Generate a mock quote for a specific handyman
function getMockQuoteForHandyman(handyman: any, formData: FormData): QuoteResponse {
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
} 