import { supabase } from '../utils/supabase'; // Import the supabase client

/**
 * Insert a User
 */
export async function insertUser(userData: { name: string; email?: string | null; phone?: string }) {
  try {
    // If no email is provided, generate a random ID for guest users
    if (!userData.email) {
      // For guest users, use a timestamped unique ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      userData.email = guestId;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select() // Optionally return the inserted data
      .single(); // Assuming you insert one user and want it back

    if (error) {
      console.error('Error inserting user:', error);
      
      // If it's a duplicate email error, try to fetch the existing user
      if (error.code === '23505' && userData.email) {
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .single();
          
        if (!fetchError && existingUser) {
          console.log('Found existing user:', existingUser);
          return { data: existingUser, error: null };
        }
      }
      
      return { data: null, error };
    }
    
    console.log('Inserted user:', data);
    return { data, error: null };
  } catch (e) {
    console.error('Exception in insertUser:', e);
    return { data: null, error: e instanceof Error ? e : new Error('Unknown error in insertUser') };
  }
}

/**
 * Insert a Request
 */
export async function insertRequest(requestData: {
  user_id: string; // Should be the UUID of an existing user
  issue: string;
  description?: string;
  address?: string;
  times_available?: string[] | string; // Array or stringified JSON
  desired_price_range?: string;
  text_input?: string;
}) {
  // Convert times_available to JSON string if it's an array
  const formattedData = {
    ...requestData,
    times_available: Array.isArray(requestData.times_available) 
      ? JSON.stringify(requestData.times_available) 
      : requestData.times_available
  };

  const { data, error } = await supabase
    .from('requests')
    .insert([formattedData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting request:', error);
    return { data: null, error };
  }
  console.log('Inserted request:', data);
  return { data, error: null };
}

/**
 * Insert a Quote
 */
export async function insertQuote(quoteData: {
  request_id: string; // Should be the UUID of an existing request
  provider_name: string;
  quote_price: string | number;
  available_time?: string;
  duration?: string;
  included_in_quote?: string;
  contact_info?: string;
  call_id?: string;
  call_status?: string;
  call_summary?: string | null;
  user_sentiment?: string | null;
  call_successful?: boolean;
}) {
  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting quote:', error);
    return { data: null, error };
  }
  console.log('Inserted quote:', data);
  return { data, error: null };
}

/**
 * Update a quote by its Retell call ID
 */
export async function updateQuoteByCallId(
  callId: string,
  data: {
    call_status?: string;
    status?: string;
    callSummary?: string;
    userSentiment?: string;
    callSuccessful?: boolean;
    [key: string]: any;
  }
) {
  try {
    console.log(`Looking for quote with call_id: ${callId}`);
    
    const { data: quotes, error: queryError } = await supabase
      .from("quotes")
      .select("*")
      .eq("call_id", callId);

    if (queryError) {
      console.error("Error finding quote by call_id:", queryError);
      return { error: queryError };
    }

    if (!quotes || quotes.length === 0) {
      console.error(`No quote found with call_id: ${callId}`);
      return { error: new Error(`No quote found with call_id: ${callId}`) };
    }

    const quoteId = quotes[0].id;
    console.log(`Found quote ID: ${quoteId} for call_id: ${callId}`);
    
    // Map the data object to match the database column names
    const dbData: any = {};
    
    // Handle both status and call_status
    if (data.call_status) dbData.call_status = data.call_status;
    else if (data.status) dbData.call_status = data.status;
    
    if (data.callSummary) dbData.call_summary = data.callSummary;
    if (data.userSentiment) dbData.user_sentiment = data.userSentiment;
    if (data.callSuccessful !== undefined) dbData.call_successful = data.callSuccessful;
    
    // Map any other fields that need conversion
    Object.keys(data).forEach(key => {
      if (!['status', 'call_status', 'callSummary', 'userSentiment', 'callSuccessful'].includes(key)) {
        // Convert camelCase to snake_case for database columns
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        dbData[dbKey] = data[key];
      }
    });

    console.log(`Updating quote ${quoteId} with data:`, dbData);

    const { data: updatedData, error: updateError } = await supabase
      .from("quotes")
      .update(dbData)
      .eq("id", quoteId)
      .select();

    if (updateError) {
      console.error("Error updating quote:", updateError);
      return { error: updateError };
    }

    console.log("Quote updated successfully:", updatedData);
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Error in updateQuoteByCallId:", error);
    return { error };
  }
}

/**
 * Get a request by ID including its associated quotes
 */
export async function getRequestWithQuotes(requestId: string) {
  try {
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError) {
      console.error("Error fetching request:", requestError);
      return { error: requestError };
    }

    // Get the quotes for this request
    const { data: quotes, error: quotesError } = await supabase
      .from("quotes")
      .select("*")
      .eq("request_id", requestId);

    if (quotesError) {
      console.error("Error fetching quotes:", quotesError);
      return { error: quotesError };
    }

    // Transform the quotes to match our frontend types
    const transformedQuotes = quotes.map((quote) => ({
      id: quote.id,
      requestId: quote.request_id,
      handyman_name: quote.provider_name,
      price: quote.quote_price,
      handyman_company: quote.provider_name, // Using provider_name as company name if not specified
      handyman_phone: quote.contact_info || 'Unknown',
      handyman_rating: 4.5, // Default rating if not stored
      call_id: quote.call_id,
      call_status: quote.call_status,
      call_summary: quote.call_summary,
      user_sentiment: quote.user_sentiment,
      call_successful: quote.call_successful,
      created_at: quote.created_at
    }));

    return {
      request,
      quotes: transformedQuotes
    };
  } catch (error) {
    console.error("Error in getRequestWithQuotes:", error);
    return { error };
  }
} 