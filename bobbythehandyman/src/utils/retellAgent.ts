import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { Quote, Request, User, QuoteResponse } from '../types';

// Mock handyman profiles for testing
const mockHandymenProfiles = [
  {
    id: "h1",
    name: "Joe",
    company: "Joe's Plumbing",
    phone: "+19729035634", // Real phone number for testing
    specialties: ["Plumbing", "Leaks", "Bathroom Fixtures"],
    rating: 4.8,
    services: ["Plumbing", "Leaks", "Bathroom Fixtures"]
  },
  {
    id: "h2",
    name: "Mike",
    company: "A-1 Repairs",
    phone: "+14693445871", // Real phone number for testing
    specialties: ["General Repairs", "Carpentry", "Electrical"],
    rating: 4.5,
    services: ["General Repairs", "Carpentry", "Electrical"]
  },
  {
    id: "h3",
    name: "Sarah",
    company: "Elite Handyman Services",
    phone: "+18322486814", // Real phone number for testing
    specialties: ["Electrical", "HVAC", "Appliance Repair"],
    rating: 4.9,
    services: ["Electrical", "HVAC", "Appliance Repair"]
  }
];

// Helper function to generate random price based on issue type
function getRandomPrice(issueType: string): string {
  let basePrice = 75;
  
  // Adjust base price based on issue type
  if (issueType.toLowerCase().includes("plumbing") || 
      issueType.toLowerCase().includes("leak")) {
    basePrice = 85;
  } else if (issueType.toLowerCase().includes("electrical") ||
             issueType.toLowerCase().includes("light")) {
    basePrice = 95;
  } else if (issueType.toLowerCase().includes("hvac") ||
             issueType.toLowerCase().includes("ac") ||
             issueType.toLowerCase().includes("heat")) {
    basePrice = 120;
  }
  
  // Add some randomness
  const variation = Math.floor(Math.random() * 40) - 15; // -15 to +25
  const finalPrice = basePrice + variation;
  
  return `$${finalPrice}`;
}

// Helper function to generate random availability
function getRandomAvailability(): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = ["morning", "afternoon", "at 10am", "at 2pm", "at 4pm"];
  
  const day = days[Math.floor(Math.random() * days.length)];
  const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
  
  return `${day} ${timeSlot}`;
}

// Helper function to generate random service duration
function getRandomDuration(issueType: string): string {
  let baseDuration = 1;
  
  // Adjust duration based on issue type
  if (issueType.toLowerCase().includes("hvac") ||
      issueType.toLowerCase().includes("ac")) {
    baseDuration = 2;
  }
  
  // Add some randomness
  const options = [
    `${baseDuration} hour`,
    `${baseDuration}-${baseDuration + 1} hours`,
    `30-45 minutes`,
    `1-2 hours`
  ];
  
  return options[Math.floor(Math.random() * options.length)];
}

// Helper function to generate service description
function getServiceDescription(issueType: string): string {
  const baseServices = [
    "Initial diagnostic and assessment",
    "Labor costs",
    "Standard parts"
  ];
  
  let additionalServices: string[] = [];
  
  // Add specific services based on issue type
  if (issueType.toLowerCase().includes("plumbing") || 
      issueType.toLowerCase().includes("leak")) {
    additionalServices = ["Pipe inspection", "Basic fixture repair", "Leak detection"];
  } else if (issueType.toLowerCase().includes("electrical")) {
    additionalServices = ["Circuit testing", "Switch/outlet replacement", "Wiring inspection"];
  } else if (issueType.toLowerCase().includes("hvac") ||
             issueType.toLowerCase().includes("ac")) {
    additionalServices = ["System diagnostic", "Filter replacement", "Coolant check"];
  }
  
  // Combine base and additional services
  const allServices = [...baseServices, ...additionalServices.slice(0, 2)];
  return allServices.join(". ") + ". Additional parts may cost extra.";
}

// Simple function to calculate a quote price based on issue type and handyman
function calculateQuotePrice(issue: string, handyman: any): number {
  // Base price depends on issue type
  let basePrice = 75;
  issue = issue.toLowerCase();
  
  if (issue.includes('leak') || issue.includes('plumbing')) {
    basePrice = 85;
  } else if (issue.includes('electrical')) {
    basePrice = 95;
  } else if (issue.includes('hvac') || issue.includes('cooling')) {
    basePrice = 120;
  }
  
  // Add variation based on handyman rating
  const variation = handyman.rating ? (handyman.rating - 4.5) * 10 : 0;
  return Math.round(basePrice + variation);
}

/**
 * Create a call via Retell API
 */
export async function createRetellCall(conversationData: {
  fromNumber: string;
  handymanPhone: string;
  agentId: string;
  dynamicVariables: Record<string, string>;
}) {
  try {
    console.log('Creating Retell call with params:', {
      fromNumber: conversationData.fromNumber,
      handymanPhone: conversationData.handymanPhone,
      agentId: conversationData.agentId
    });
    
    // Check if API key is set
    if (!process.env.RETELL_API_KEY) {
      console.warn('RETELL_API_KEY is not set, calls will not work correctly');
    }

    // Prepare data for Retell API
    const retell_llm_dynamic_variables = {
      ...conversationData.dynamicVariables,
      // Ensure critical variables are always present
      phone_number: conversationData.dynamicVariables.phone_number || "+15551234567",
      price_range: conversationData.dynamicVariables.price_range || "$100 to $200",
      problem: conversationData.dynamicVariables.problem || "home repair",
      location: conversationData.dynamicVariables.location || "home",
    };

    const requestBody = {
      from_number: conversationData.fromNumber,
      to_number: conversationData.handymanPhone,
      agent_id: conversationData.agentId,
      retell_llm_dynamic_variables: retell_llm_dynamic_variables,
      metadata: {
        request_type: "handyman_quote",
        customer_name: conversationData.dynamicVariables.customer_name || "Customer",
        handyman_name: conversationData.dynamicVariables.handyman_name || "Provider"
      }
    };

    console.log('Retell request body:', JSON.stringify(requestBody, null, 2));

    // Make the API call
    const response = await axios.post(
      'https://api.retellai.com/v2/create-phone-call',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RETELL_API_KEY}`
        }
      }
    );

    console.log('Retell API response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error creating Retell call:', error);
    
    // Try to extract error message from response if possible
    let errorMessage = 'Unknown error';
    if (axios.isAxiosError(error) && error.response) {
      try {
        // Try to parse response as JSON
        if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        } else if (typeof error.response.data === 'string') {
          // Check if it's HTML (usually means wrong URL or auth issue)
          if (error.response.data.startsWith('<!DOCTYPE') || error.response.data.startsWith('<html')) {
            errorMessage = `Received HTML response. Status: ${error.response.status}. Check API URL and auth credentials.`;
          } else {
            errorMessage = error.response.data;
          }
        }
      } catch (parseError) {
        errorMessage = `Error parsing response: ${String(parseError)}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

/**
 * Get quotes from a list of handymen via Retell API calls
 */
export async function getQuotesFromHandymen(request: Request, user: User): Promise<Quote[]> {
  console.log('Getting quotes from handymen for user:', user.id);
  
  // Check if we're using mock mode
  const useMockMode = process.env.USE_MOCK_API === "true";
  console.log('Using mock mode:', useMockMode);

  try {
    // Filter handymen based on issue type, location, etc.
    // In a real implementation, this would query your database of service providers
    const filteredHandymen = mockHandymenProfiles;
    console.log(`Found ${filteredHandymen.length} matching handymen`);

    // For each handyman, create mock quote or get real quote via Retell call
    const quotes: Quote[] = [];
    
    for (const handyman of filteredHandymen) {
      // Calculate mock price in case we need it
      const quotePrice = calculateQuotePrice(request.issue || "", handyman);
      
      // Base quote object
      const quoteId = uuidv4();
      let quote: Quote = {
        id: quoteId,
        request_id: request.id,
        handyman_name: handyman.name || "Unknown Provider",
        handyman_company: handyman.company || "Unknown Company",
        handyman_phone: handyman.phone,
        handyman_rating: handyman.rating,
        price: quotePrice,
        call_id: "",
        call_status: 'pending',
        call_summary: "",
        user_sentiment: "",
        call_successful: false,
        created_at: new Date().toISOString()
      };

      try {
        // Use Retell if enabled, otherwise mock
        if (!useMockMode) {
          // Call Retell API
          const callResult = await setupRetellCall(handyman, request, user);
          console.log('Call result:', callResult);
          
          if (callResult.success && callResult.data) {
            quote.call_id = callResult.data.call_id || "";
            quote.call_status = 'in-progress';
          } else {
            console.error('Error creating Retell call:', callResult.error);
            quote.call_status = 'failed';
          }
        } else {
          // Create mock quote data with a fake call_id so it can be referenced later
          console.log('Using mock data for handyman:', handyman.name);
          quote.call_id = `mock_${Date.now()}_${handyman.id}`;
          quote.call_status = 'completed';
          quote.call_summary = `Quote for ${handyman.name} from ${handyman.company}: The ${request.issue || "issue"} will be fixed for $${quotePrice}. They can start work next week.`;
          quote.user_sentiment = "positive";
          quote.call_successful = true;
        }
      } catch (error) {
        console.error('Error during Retell call:', error);
        quote.call_status = 'failed';
      }

      quotes.push(quote);
    }

    return quotes;
  } catch (error) {
    console.error('Error in getQuotesFromHandymen:', error);
    throw error;
  }
}

/**
 * Get mock quotes for testing without API calls
 */
function getMockQuotes(request: any): Promise<any[]> {
  console.log('Generating mock quotes for request:', request.issue || "general repair");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const quotes = mockHandymenProfiles.map(handyman => {
        const baseQuote = getMockQuoteForHandyman(handyman, request);
        
        return {
          ...baseQuote,
          callId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          status: 'completed', // For mock mode, pretend all calls succeeded
          callError: null
        };
      });
      
      console.log(`Generated ${quotes.length} mock quotes successfully`);
      resolve(quotes);
    }, 1500); // Add a small delay to simulate API calls
  });
}

// Synthesize a quote response based on the call initiation
function synthesizeQuoteResponse(handyman: any, request: any, callId: string): QuoteResponse {
  // Use the actual request object that has the issue property
  const baseQuote = getMockQuoteForHandyman(handyman, request);
  
  return {
    ...baseQuote,
    callId: callId, // Store the Retell call ID for reference
    status: "pending" // In a real app, you'd update this via webhooks
  } as QuoteResponse;
}

// Generate a mock quote for a specific handyman
function getMockQuoteForHandyman(handyman: any, request: any): QuoteResponse {
  // Safely get the issue string with fallbacks
  const issueText = request && request.issue ? request.issue.toLowerCase() : "general repair";
  
  // Randomize price based on issue and handyman
  const basePrice = issueText.includes("leak") || issueText.includes("faucet") || issueText.includes("plumbing") ? 70 : 
                   issueText.includes("electrical") || issueText.includes("light") ? 90 : 60;
  
  // Adjust price based on handyman rating
  const adjustedPrice = Math.round(basePrice * (1 + (handyman.rating - 4.5 || 0) / 10));
  
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
  if (issueText.includes("leak") || issueText.includes("plumbing") || issueText.includes("faucet")) {
    includedItems += ", basic parts, water testing";
  } else if (issueText.includes("electrical")) {
    includedItems += ", wiring check, safety inspection";
  } else {
    includedItems += ", minor repairs";
  }
  
  return {
    providerName: handyman.company || handyman.name,
    quotePrice: `$${adjustedPrice}`,
    availableTime: `${randomDay} ${randomTime}`,
    duration: randomDuration,
    includedInQuote: includedItems,
    contactInfo: handyman.phone || `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
  };
}

async function getQuotesViaRetell(user: any, request: any, description: string): Promise<QuoteResponse[]> {
  const RETELL_API_KEY = process.env.RETELL_API_KEY;
  
  if (!RETELL_API_KEY) {
    throw new Error("RETELL_API_KEY not set");
  }
  
  try {
    // For MVP, we'll make parallel requests for each mock handyman
    // In a production environment, you'd integrate with your actual handyman database
    const promises = mockHandymenProfiles.map(async (handyman) => {
      try {
        console.log(`Attempting to call ${handyman.company} at ${handyman.phone}`);
        
        // Create the conversation data for this handyman
        const conversationData = {
          conversationFlowId: '8a5c8e24-9c5b-4d92-ae55-6c9b766e1e65', 
          dynamicVariables: {
            // Core customer and handyman details
            customer_name: user.name || "Guest",
            handyman_name: handyman.name,
            handyman_company: handyman.company,
            
            // Issue details (the specific variables expected by the script)
            problem: request.issue || "leaking faucet",
            leak_type: description || request.description || "in the kitchen",
            location: request.address || "75025",
            price_range: request.desired_price_range || "$50-150",
            
            // Additional helpful variables
            callback_number: '+19729035634',
            time_available: Array.isArray(request.times_available) 
              ? request.times_available.join(", ") 
              : typeof request.times_available === 'string' 
                ? request.times_available 
                : "Flexible",
            phone_number: '+19729035634', // This is specifically needed for the agent script
            service_type: handyman.specialties ? handyman.specialties.join(", ") : "General Repairs"
          }
        };
        
        // Use the setupRetellCall function for consistency
        const callResult = await setupRetellCall(handyman, request, user);
        
        if (callResult.success) {
          // Call succeeded, return a synthesized quote response
          console.log(`Call initiated to ${handyman.company} with response:`, callResult);
          return synthesizeQuoteResponse(handyman, request, callResult.data.call_id);
        } else {
          // Call failed, return a quote with error information
          console.error(`Error setting up request for ${handyman.company}:`, callResult.error);
          const fallbackQuote = getMockQuoteForHandyman(handyman, request);
          return {
            ...fallbackQuote,
            callId: `mock_${Date.now()}`,
            status: 'failed',
            callError: callResult.error
          };
        }
      } catch (error) {
        console.error(`Error creating quote for ${handyman.company}:`, error);
        
        // Return a fallback quote with error information
        const fallbackQuote = getMockQuoteForHandyman(handyman, request);
        return {
          ...fallbackQuote,
          callId: `mock_${Date.now()}`,
          status: 'failed',
          callError: error instanceof Error ? error.message : 'Unknown error'
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

/**
 * Get call details from Retell API
 * @param callId The call ID to retrieve
 * @returns Call details from Retell API
 */
export async function getRetellCallDetails(callId: string) {
  try {
    // Check if API key is set
    if (!process.env.RETELL_API_KEY) {
      console.warn("RETELL_API_KEY not set, cannot retrieve call details");
      return { success: false, error: "Retell API key not configured" };
    }
    
    console.log(`Getting call details for ID: ${callId}`);
    
    // Make the API request to get call details
    const response = await axios.get(`https://api.retellai.com/v2/get-call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Received call details:', JSON.stringify(response.data, null, 2));
    
    return { 
      success: true,
      callData: response.data,
      callStatus: response.data.status,
      callSummary: response.data.analysis?.call_summary || "",
      userSentiment: response.data.analysis?.user_sentiment || "",
      callSuccessful: response.data.analysis?.call_successful || false,
      callEnded: response.data.status === 'ended' || response.data.status === 'error',
      transcript: response.data.transcript || []
    };
  } catch (error) {
    console.error('Error getting call details:', error);
    
    // Try to extract error message from response if possible
    let errorMessage = 'Unknown error';
    if (axios.isAxiosError(error) && error.response) {
      try {
        // Try to parse response as JSON
        if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        } else if (typeof error.response.data === 'string') {
          // Check if it's HTML (usually means wrong URL or auth issue)
          if (error.response.data.startsWith('<!DOCTYPE') || error.response.data.startsWith('<html')) {
            errorMessage = `Received HTML response. Status: ${error.response.status}. Check API URL and auth credentials.`;
          } else {
            errorMessage = error.response.data;
          }
        }
      } catch (parseError) {
        errorMessage = `Error parsing response: ${String(parseError)}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Update quote information by polling the Retell API for call status
 * @param callId The call ID to check
 * @returns Updated quote data or error
 */
export async function refreshQuoteFromRetell(callId: string) {
  // Skip for mock calls
  if (callId.startsWith('mock-') || callId.startsWith('failed-') || callId.startsWith('error-')) {
    return { success: false, error: 'Cannot refresh mock or failed call' };
  }
  
  try {
    const callDetails = await getRetellCallDetails(callId);
    
    if (!callDetails.success) {
      return { success: false, error: callDetails.error };
    }
    
    // Check if call has ended and update the quote in the database
    if (callDetails.callEnded) {
      const { callData } = callDetails;
      
      // Use updateQuoteByCallId to update the database
      const updateData = {
        call_status: callData.status === 'error' ? 'failed' : 'completed',
        call_summary: callDetails.callSummary || 'No summary available',
        user_sentiment: callDetails.userSentiment || 'neutral',
        call_successful: callDetails.callSuccessful || false
      };
      
      // Update quote in database via API
      await axios.post('/api/update-quote', { 
        callId,
        updateData
      });
    }
    
    return { success: true, callDetails };
  } catch (error) {
    console.error('Error refreshing quote from Retell:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to get service type based on handyman services and issue
function getServiceType(services: string[], issue: string): string {
  if (!services || services.length === 0) {
    return issue || "General Repair";
  }
  
  // Try to find a matching service
  const lowerIssue = issue?.toLowerCase() || "";
  const matchingService = services.find(s => 
    lowerIssue.includes(s.toLowerCase())
  );
  
  return matchingService || services[0] || "General Repair";
}

// Set up Retell API call to create a phone call to a handyman
export async function setupRetellCall(handyman: any, request: Request, user: User) {
  try {
    // Format price range for readability
    let priceRange = request.desired_price_range || "$50-200";
    if (priceRange && priceRange.includes("-")) {
      const [min, max] = priceRange.replace(/\$/g, '').split("-");
      priceRange = `$${min} to $${max}`;
    }

    // Prepare conversation data
    const conversationData = {
      fromNumber: process.env.RETELL_PHONE_NUMBER || "",
      handymanPhone: handyman.phone,
      agentId: process.env.RETELL_AGENT_ID || "",
      dynamicVariables: {
        handyman_name: handyman.name,
        handyman_company: handyman.company,
        customer_name: user.name || "Customer",
        phone_number: user.phone || "",
        callback_number: user.phone || "",
        problem: request.issue || "home repair",
        description: request.description || "",
        location: request.address || "your home",
        price_range: priceRange,
        time_available: typeof request.times_available === 'string' 
          ? request.times_available 
          : "flexible",
        service_type: getServiceType(handyman.services || [], request.issue)
      }
    };

    // Make the API call
    return await createRetellCall(conversationData);
  } catch (error) {
    console.error('Error setting up Retell call:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 