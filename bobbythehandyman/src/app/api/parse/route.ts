import { NextRequest, NextResponse } from "next/server";
import { parseUserInput } from "../../../../utils/llmParser";
import axios from "axios";

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
    
    // Get price estimate if we have an issue
    let priceEstimate = null;
    if (parsedData.issue) {
      try {
        // Determine if we need to use a relative or absolute URL based on environment
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000'
            : '';
        
        // Get price estimate from our own API endpoint
        const estimateResponse = await axios.post(
          `${baseUrl}/api/price-estimate`,
          {
            issue: parsedData.issue,
            location: parsedData.address || "DFW"
          }
        );
        
        priceEstimate = estimateResponse.data.data;
      } catch (estimateError) {
        console.error("Error getting price estimate:", estimateError);
        // Continue without price estimate if there's an error
      }
    }
    
    return NextResponse.json({ 
      data: parsedData,
      priceEstimate: priceEstimate
    });
  } catch (error) {
    console.error("Error parsing input:", error);
    return NextResponse.json(
      { error: "Failed to parse input" },
      { status: 500 }
    );
  }
} 