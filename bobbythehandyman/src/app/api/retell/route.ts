import { NextRequest, NextResponse } from "next/server";
import { getQuotesFromHandymen } from "../../../utils/retellAgent";
import { insertUser, insertRequest, insertQuote } from "../../../lib/supabaseActions";

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
      email: formData.email || null,
      phone: formData.phone || null,
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
        ? formData.timesAvailable 
        : [formData.timesAvailable],
      desired_price_range: formData.desiredPriceRange,
      text_input: formData.description || ""
    });
    
    if (requestError) {
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }
    
    // 3. Get quotes from handymen
    console.log("Getting quotes from handymen...");
    const quotes = await getQuotesFromHandymen(requestData, userData);
    
    // 4. Insert quotes into database
    for (const quote of quotes) {
      try {
        // Prepare quote data for database - ensure provider_name is set
        const quoteData = {
          request_id: requestData.id,
          provider_name: quote.handyman_name || "Unknown Provider", // Ensure this is never null
          quote_price: quote.price || 0,
          available_time: "Flexible", // Default value
          duration: "1-2 hours", // Default value
          included_in_quote: "Labor and inspection", // Default value
          call_id: quote.call_id || "",
          call_status: quote.call_status || "pending",
          call_summary: quote.call_summary || null,
          user_sentiment: quote.user_sentiment || null,
          call_successful: quote.call_successful || false
        };

        const { error: quoteError } = await insertQuote(quoteData);
        
        if (quoteError) {
          console.error("Error inserting quote:", quoteError);
          // Continue with other quotes even if one fails
        } else {
          console.log("Successfully inserted quote for provider:", quoteData.provider_name);
        }
      } catch (error) {
        console.error("Error processing quote:", error);
        // Continue with other quotes
      }
    }

    // Return success with quotes data
    return NextResponse.json({ 
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error("Error in submit API:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
} 