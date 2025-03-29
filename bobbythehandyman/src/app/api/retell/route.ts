import { NextRequest, NextResponse } from "next/server";
import { getQuotesFromHandymen } from "../../../../utils/retellAgent";
import { insertUser, insertRequest, insertQuote } from "../../../../lib/supabaseActions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    if (!formData.issue || !formData.name) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }
    
    // 1. Insert user
    const { data: userData, error: userError } = await insertUser({
      name: formData.name,
      // Add email/phone if available
    });
    
    if (userError) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
    
    // 2. Insert request
    const { data: requestData, error: requestError } = await insertRequest({
      user_id: userData.id,
      issue: formData.issue,
      description: formData.description || "",
      address: formData.address,
      times_available: Array.isArray(formData.timesAvailable) 
        ? JSON.stringify(formData.timesAvailable) 
        : formData.timesAvailable,
      desired_price_range: formData.desiredPriceRange
    });
    
    if (requestError) {
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }
    
    // 3. Get quotes from handymen (now using Retell API if configured)
    const quotes = await getQuotesFromHandymen(formData);
    
    // 4. Insert quotes into database
    for (const quote of quotes) {
      await insertQuote({
        request_id: requestData.id,
        provider_name: quote.providerName,
        quote_price: quote.quotePrice,
        available_time: quote.availableTime,
        duration: quote.duration,
        included_in_quote: quote.includedInQuote,
        contact_info: quote.contactInfo,
        call_id: quote.callId, // Store the Retell call ID if available
        call_status: quote.status // Store the call status
      });
    }
    
    return NextResponse.json({ data: quotes });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 