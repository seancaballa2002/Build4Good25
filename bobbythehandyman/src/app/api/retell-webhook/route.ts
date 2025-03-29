import { NextRequest, NextResponse } from "next/server";
import { updateQuoteByCallId } from "../../../../lib/supabaseActions";

/**
 * Webhook endpoint for Retell to call after a phone call is completed
 * This endpoint should be registered in your Retell dashboard settings
 * 
 * For security, this should have authorization in production
 */
export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload from Retell
    const webhookData = await request.json();
    
    // Verify this is a call-related event
    if (!webhookData.event || !webhookData.event.startsWith('call_')) {
      return NextResponse.json(
        { error: "Not a call event" },
        { status: 400 }
      );
    }
    
    // Extract the call data
    const callData = webhookData.data;
    if (!callData || !callData.call_id) {
      return NextResponse.json(
        { error: "Invalid call data" },
        { status: 400 }
      );
    }
    
    console.log(`Received webhook for call ${callData.call_id} with event ${webhookData.event}`);
    
    // Process based on event type
    let status = "unknown";
    let quoteData = {};
    
    switch (webhookData.event) {
      case 'call_ended':
        status = "completed";
        // Calls that end normally are completed
        break;
        
      case 'call_failed':
        status = "failed";
        // Call failed to connect or had an error
        break;
        
      case 'call_analyzed':
        // Call has been analyzed, extract the quote details from the transcript
        status = "analyzed";
        
        if (callData.call_analysis) {
          const { call_summary, user_sentiment, call_successful } = callData.call_analysis;
          
          // Extract data from the transcript if available
          let availableTime = "";
          let quotePrice = "";
          
          // Simple extraction for demo purposes - in production you'd use more robust parsing
          if (callData.transcript) {
            // Extract quoted price from transcript
            const priceMatch = callData.transcript.match(/(\$\d+(?:-\d+)?)/);
            if (priceMatch) {
              quotePrice = priceMatch[1];
            }
            
            // Extract availability from transcript
            const availMatch = callData.transcript.match(/available\s+([^,.]+)/i);
            if (availMatch) {
              availableTime = availMatch[1];
            }
          }
          
          quoteData = {
            quote_price: quotePrice || "",
            available_time: availableTime || "",
            call_summary: call_summary || "",
            user_sentiment: user_sentiment || "",
            call_successful: call_successful || false
          };
        }
        break;
        
      default:
        // Other events like call_registered, call_started, etc.
        status = webhookData.event.replace('call_', '');
    }
    
    // Update the quote in the database with the new status and data
    const { error } = await updateQuoteByCallId(callData.call_id, {
      call_status: status,
      ...quoteData
    });
    
    if (error) {
      console.error("Error updating quote:", error);
      return NextResponse.json(
        { error: "Failed to update quote" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
} 