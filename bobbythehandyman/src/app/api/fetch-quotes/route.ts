import { NextRequest, NextResponse } from "next/server";
import { getRequestWithQuotes, updateQuoteByCallId } from "../../../lib/supabaseActions";
import { getRetellCallDetails } from "../../../utils/retellAgent";

export async function POST(request: NextRequest) {
  try {
    const { requestId, refreshFromRetell = false } = await request.json();
    
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }
    
    // Get the request and associated quotes
    const result = await getRequestWithQuotes(requestId);
    
    if (result.error) {
      console.error("Error fetching request with quotes:", result.error);
      return NextResponse.json(
        { error: "Failed to fetch quotes" },
        { status: 500 }
      );
    }
    
    // If we should refresh from Retell, check each quote's call_id and update
    if (refreshFromRetell) {
      for (const quote of result.quotes) {
        // Skip quotes without call_id or with mock/failed calls
        if (!quote.call_id || 
            quote.call_id.startsWith('mock-') || 
            quote.call_id.startsWith('failed-') ||
            quote.call_id.startsWith('error-')) {
          continue;
        }
        
        // Skip already completed or failed calls
        if (quote.call_status === 'completed' || quote.call_status === 'failed') {
          continue;
        }
        
        try {
          // Get call details from Retell API
          const callDetails = await getRetellCallDetails(quote.call_id);
          
          if (callDetails.success) {
            // Update the quote status based on call details
            const { callData } = callDetails;
            
            console.log(`Updating quote ${quote.id} with call_id ${quote.call_id}, status: ${callData.call_status}`);
            
            // Update the database
            await updateQuoteByCallId(quote.call_id, {
              call_status: callData.call_status === 'error' ? 'failed' : 
                    (callData.call_status === 'ended' ? 'completed' : quote.call_status),
              callSummary: callDetails.callSummary || 'No summary available',
              userSentiment: callDetails.userSentiment || 'neutral',
              callSuccessful: callDetails.callSuccessful || false
            });
            
            // Update quote in memory for response
            quote.call_status = callData.call_status === 'error' ? 'failed' : 
                              (callData.call_status === 'ended' ? 'completed' : quote.call_status);
            quote.call_summary = callDetails.callSummary || 'No summary available';
            quote.user_sentiment = callDetails.userSentiment || 'neutral';
            quote.call_successful = callDetails.callSuccessful || false;
          }
        } catch (error) {
          console.error(`Error refreshing quote ${quote.id}:`, error);
          // Continue with next quote
        }
      }
    }
    
    return NextResponse.json({
      request: result.request,
      quotes: result.quotes
    });
  } catch (error) {
    console.error("Error in fetch-quotes API:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
} 