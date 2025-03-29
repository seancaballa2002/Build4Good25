import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { issue, location = "DFW" } = await request.json();
    
    if (!issue) {
      return NextResponse.json(
        { error: "Issue is required" },
        { status: 400 }
      );
    }
    
    const priceEstimate = await getEstimatedPrice(issue, location);
    
    return NextResponse.json({ data: priceEstimate });
  } catch (error) {
    console.error("Error getting price estimate:", error);
    return NextResponse.json(
      { error: "Failed to get price estimate" },
      { status: 500 }
    );
  }
}

async function getEstimatedPrice(issue: string, location: string): Promise<{ priceRange: string; explanation: string }> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not set, using mock price data");
    return getMockPriceEstimate(issue);
  }
  
  try {
    const prompt = `
      As a handyman pricing expert, provide the average price range for the following home repair task in ${location}:
      
      "${issue}"
      
      Return a JSON object with these fields:
      - priceRange: A dollar range (e.g., "$50-100" or "$65-90")
      - explanation: A brief 1-2 sentence explanation of what factors influence this price
      
      Base your answer on typical market rates for handyman services in ${location}.
    `;
    
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent",
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        params: {
          key: GEMINI_API_KEY
        }
      }
    );
    
    // Extract the response text
    const textResponse = response.data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error("Empty response from Gemini API");
    }
    
    // Try to extract JSON from the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : null;
    
    if (jsonString) {
      try {
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", parseError);
      }
    }
    
    // If JSON parsing fails, fallback to extracting information manually
    const priceMatch = textResponse.match(/\$(\d+)(?:-|\s+to\s+)(\d+)/);
    if (priceMatch) {
      return {
        priceRange: `$${priceMatch[1]}-${priceMatch[2]}`,
        explanation: textResponse.replace(/\{[\s\S]*\}/, "").trim()
      };
    }
    
    // If all else fails, return a mock response
    return getMockPriceEstimate(issue);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return getMockPriceEstimate(issue);
  }
}

function getMockPriceEstimate(issue: string): { priceRange: string; explanation: string } {
  const lowerIssue = issue.toLowerCase();
  
  if (lowerIssue.includes("leak") || lowerIssue.includes("faucet") || lowerIssue.includes("sink")) {
    return {
      priceRange: "$70-120",
      explanation: "Plumbing repairs typically cost between $70-120 in the DFW area, depending on the complexity of the leak and parts needed."
    };
  } else if (lowerIssue.includes("electrical") || lowerIssue.includes("outlet") || lowerIssue.includes("light")) {
    return {
      priceRange: "$85-150",
      explanation: "Electrical repairs usually range from $85-150, varying based on the complexity of the wiring and any parts that need replacement."
    };
  } else if (lowerIssue.includes("door") || lowerIssue.includes("window")) {
    return {
      priceRange: "$65-110",
      explanation: "Door and window repairs typically cost $65-110, depending on the type of repair and materials required."
    };
  } else {
    return {
      priceRange: "$60-100",
      explanation: "General handyman services in the DFW area typically cost between $60-100 per hour, with most small jobs taking 1-2 hours to complete."
    };
  }
} 