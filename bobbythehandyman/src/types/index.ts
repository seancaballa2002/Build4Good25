// Define the form data structure
export interface FormData {
    issue: string;
    description: string;
    name: string;
    address: string;
    timesAvailable: string[];
    desiredPriceRange: string;
  }
  
  // Define the quote response structure
  export interface QuoteResponse {
    id?: string;
    providerName: string;
    quotePrice: string;
    availableTime: string;
    duration: string;
    includedInQuote: string;
    contactInfo?: string;
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
    created_at: string;
    quotes?: Quote[];
  }
  
  export interface Quote {
    id: string;
    request_id: string;
    provider_name: string;
    quote_price: string;
    available_time: string;
    duration: string;
    included_in_quote: string;
    contact_info?: string;
    created_at: string;
  } 