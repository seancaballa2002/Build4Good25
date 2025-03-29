import { NextRequest, NextResponse } from "next/server";
import { updateQuoteByCallId } from "../../../lib/supabaseActions";

export async function POST(request: NextRequest) {
  try {
    const { callId, updateData } = await request.json();

    if (!callId) {
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    console.log(`Updating quote for call ID ${callId} with data:`, updateData);

    const result = await updateQuoteByCallId(callId, updateData);

    if (result.error) {
      console.error("Error updating quote:", result.error);
      return NextResponse.json(
        { error: "Failed to update quote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update-quote API:", error);
    return NextResponse.json(
      { error: "Failed to process quote update" },
      { status: 500 }
    );
  }
} 