// Define the form data structure
export interface FormData {
    issue: string;
    description: string;
    name: string;
    address: string;
    timesAvailable: string[];
    desiredPriceRange: string;
  }
  
  // Define the quote response structure used by the old version of the API
  export interface QuoteResponse {
    id?: string;
    providerName: string;
    quotePrice: string;
    availableTime: string;
    duration: string;
    includedInQuote: string;
    contactInfo?: string;
    callId?: string;      // Retell API call ID for reference
    status?: string;      // Status of the Retell call (pending, completed, failed)
    callError?: string;   // Error message if the call failed
  }
  
  // Database types that match our Supabase schema
  export interface User {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    created_at: string;
  }
  
  export interface Request {
    id: string;
    user_id: string;
    issue: string;
    description?: string;
    address: string;
    times_available: string;
    desired_price_range: string;
    text_input?: string;
    image_url?: string;
    voice_url?: string;
    created_at: string;
    updated_at?: string;
    quotes?: Quote[];
  }
  
  export interface Quote {
    id: string;
    request_id: string;
    handyman_name: string;
    handyman_company?: string;
    handyman_phone?: string;
    handyman_rating?: number;
    price: string | number;
    call_id?: string;      // Reference to the Retell call ID
    call_status?: string;  // Status of the call (in-progress, completed, failed)
    call_summary?: string; // Summary of the call from the AI
    user_sentiment?: string; // Sentiment analysis of the user during the call
    call_successful?: boolean; // Whether the call was successful
    created_at: string;
  } 