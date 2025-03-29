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
    const data = await request.json();

    console.log("Received Retell webhook:", JSON.stringify(data, null, 2));

    // Handle different types of events
    if (data.event === "call.completed") {
      // Call completed successfully
      await updateQuoteByCallId(data.call_id, {
        status: "completed",
        callSummary: data.summary || "Call completed successfully",
        userSentiment: data.sentiment || "neutral",
        callSuccessful: true
      });
    } else if (data.event === "call.ended") {
      // Call ended (could be normal or abnormal termination)
      // Check if there's an error in the call
      if (data.error) {
        await updateQuoteByCallId(data.call_id, {
          status: "failed",
          callSummary: `Call ended with error: ${data.error}`,
          callSuccessful: false
        });
      } else {
        // Normal end of call
        await updateQuoteByCallId(data.call_id, {
          status: "completed",
          callSummary: data.summary || "Call ended normally",
          userSentiment: data.sentiment || "neutral",
          callSuccessful: true
        });
      }
    } else if (data.event === "call.failed") {
      // Call failed to connect or had an error
      await updateQuoteByCallId(data.call_id, {
        status: "failed",
        callSummary: `Call failed: ${data.error || "Unknown error"}`,
        callSuccessful: false
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Retell webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
} 