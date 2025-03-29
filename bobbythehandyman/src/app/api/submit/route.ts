import { NextRequest, NextResponse } from "next/server";
import { insertUser, insertRequest, insertQuote } from "@/lib/supabaseActions";
import { getQuotesFromHandymen } from "@/utils/retellAgent";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const {
      issue,
      description,
      name,
      email,
      phone,
      address,
      date,
      priceRange,
      times_available,
      text_input
    } = await request.json();

    // 1. Insert the user (or get existing user)
    const { data: userData, error: userError } = await insertUser({
      name,
      email: email || null,
      phone,
    });

    if (userError) {
      console.error("Error inserting user:", userError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // 2. Insert the request
    const { data: requestData, error: requestError } = await insertRequest({
      user_id: userData.id,
      issue,
      description,
      address,
      times_available: Array.isArray(times_available) ? times_available : [times_available],
      desired_price_range: `$${priceRange[0]}-$${priceRange[1]}`,
      text_input: text_input || description  // Use description as text_input if not provided
    });

    if (requestError) {
      console.error("Error inserting request:", requestError);
      return NextResponse.json(
        { error: "Failed to create request" },
        { status: 500 }
      );
    }

    // Add user_name to requestData for the Retell agent
    requestData.user_name = userData.name;
    requestData.phone_number = phone;

    // 3. Get quotes from handymen via Retell API
    console.log("Getting quotes from handymen...");
    const handymenQuotes = await getQuotesFromHandymen(
      requestData,
      process.env.MOCK_API_CALLS === 'true'
    );

    // 4. Insert each quote into the database
    for (const quote of handymenQuotes) {
      try {
        // Prepare quote data for database
        const quoteData = {
          request_id: requestData.id,
          provider_name: quote.handyman_name,
          quote_price: quote.price,
          call_id: quote.call_id,
          call_status: quote.call_status || "pending",
          call_summary: quote.call_summary || null,
          user_sentiment: quote.user_sentiment || null,
          call_successful: quote.call_successful || false
        };

        const { error: quoteError } = await insertQuote(quoteData);
        
        if (quoteError) {
          console.error("Error inserting quote:", quoteError);
          // Continue with other quotes even if one fails
        }
      } catch (error) {
        console.error("Error processing quote:", error);
        // Continue with other quotes
      }
    }

    // Return success with request ID (for redirect)
    return NextResponse.json({ 
      success: true, 
      requestId: requestData.id 
    });
  } catch (error) {
    console.error("Error in submit API:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
} 