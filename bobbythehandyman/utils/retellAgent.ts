import { FormData, QuoteResponse } from "../src/types";
import axios from "axios";

// Mock handyman profiles for demo
const MOCK_HANDYMEN = [
  // {
  //   name: "Joe's Plumbing",
  //   specialty: "Plumbing",
  //   rating: 4.8,
  //   responseTime: "fast",
  //   phoneNumber: "+19729035634"
  // },
  // {
  //   name: "A-1 Repairs",
  //   specialty: "General Repairs",
  //   rating: 4.5,
  //   responseTime: "medium",
  //   phoneNumber: "+14693445871"
  // },
  {
    name: "Elite Handyman Services",
    specialty: "Electrical, Plumbing",
    rating: 4.9,
    responseTime: "slow",
    phoneNumber: "+18322486814"
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
    phone_number: "+19729035634" // Callback number for the customer
  };
  
  try {
    // For MVP, we'll make parallel requests for each mock handyman
    // In a production environment, you'd integrate with your actual handyman database
    const promises = MOCK_HANDYMEN.map(async (handyman) => {
      try {
        console.log(`Attempting to call ${handyman.name} at ${handyman.phoneNumber}`);
        
        // Create a phone call using the Retell API
        const response = await axios.post(
          "https://api.retellai.com/v2/create-phone-call",
          {
            from_number: process.env.RETELL_PHONE_NUMBER || "+19729035634", // Use configured number or default to first number
            to_number: handyman.phoneNumber,
            agent_id: process.env.RETELL_AGENT_ID || "conversation_flow_bcf8f699636c", // Get agent ID from config
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
      } catch (error: any) {
        // Extract more detailed error information if available
        let errorMessage = `Error calling ${handyman.name}`;
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const status = error.response.status;
          const responseData = error.response.data;
          
          if (status === 402) {
            errorMessage = `Payment required error (402) when calling ${handyman.name}. Please check your Retell account billing status or credits.`;
            console.error(errorMessage, responseData);
          } else if (status === 422) {
            errorMessage = `Validation error (422) when calling ${handyman.name}. Please check your phone numbers and agent configuration.`;
            console.error(errorMessage, responseData);
          } else {
            errorMessage = `API error (${status}) when calling ${handyman.name}: ${JSON.stringify(responseData)}`;
            console.error(errorMessage);
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = `No response received when calling ${handyman.name}. Network issue or timeout.`;
          console.error(errorMessage, error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = `Error setting up request for ${handyman.name}: ${error.message}`;
          console.error(errorMessage);
        }
        
        // Log the original error for debugging, but provide a cleaner message
        console.error(error);
        
        // Return a fallback response if the API call fails
        const fallbackResponse = getMockQuoteForHandyman(handyman, formData);
        
        // Add error information to the fallback response
        return {
          ...fallbackResponse,
          callError: errorMessage,
          status: "failed" // Mark this quote as failed due to call error
        };
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