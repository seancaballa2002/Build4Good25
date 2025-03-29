import { NextRequest, NextResponse } from "next/server";
import { parseUserInput } from "@/utils/llmParser";

export async function POST(request: NextRequest) {
  try {
    const { rawInput } = await request.json();
    
    if (!rawInput) {
      return NextResponse.json(
        { error: "Raw input is required" },
        { status: 400 }
      );
    }
    
    const parsedData = await parseUserInput(rawInput);
    
    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("Error parsing input:", error);
    return NextResponse.json(
      { error: "Failed to parse input" },
      { status: 500 }
    );
  }
} 