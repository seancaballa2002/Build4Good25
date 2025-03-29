import { FormData } from "../src/types";
import axios from "axios";

interface LLMParseResponse {
  issue: string;
  description: string;
  name: string;
  address: string;
  timesAvailable: string[];
  desiredPriceRange: string;
  clarifyingQuestions?: string[];
}

// Actual implementation using Groq API
export async function parseUserInput(rawInput: string): Promise<FormData> {
  console.log("Parsing raw input:", rawInput);
  
  try {
    // Try to use Groq API for structured parsing
    const parsedData = await parseWithGroq(rawInput);
    return parsedData;
  } catch (error) {
    console.error("Error parsing with Groq, falling back to regex:", error);
    // Fall back to regex parsing if API fails
    return parseWithRegex(rawInput);
  }
}

// Parse user input using Groq API for more accurate extraction
async function parseWithGroq(rawInput: string): Promise<FormData> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set in environment variables");
  }
  
  const prompt = `
    You are an AI assistant helping to extract structured information from a user's home repair request. 
    Parse the following text into a structured JSON object with these fields:
    - issue: A short title describing the main problem (e.g., "Leaking faucet")
    - description: Detailed description of the problem
    - name: The user's name (if provided, otherwise "Guest")
    - address: Location or ZIP code (default to "75025" for Plano if not provided)
    - timesAvailable: Array of available time slots mentioned (e.g., ["Saturday morning"])
    - desiredPriceRange: Budget mentioned (e.g., "$50-100" or "$65")
    - clarifyingQuestions: Array of 1-3 important questions to ask if information is missing

    User input: "${rawInput}"

    Return only the JSON object with no additional text.
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const responseData = response.data.choices[0]?.message?.content;
    
    if (!responseData) {
      throw new Error("Empty response from Groq API");
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseData) as LLMParseResponse;
    
    // Store clarifying questions in session storage for retrieval by the frontend
    if (typeof window !== 'undefined' && parsedResponse.clarifyingQuestions?.length) {
      try {
        sessionStorage.setItem('clarifyingQuestions', JSON.stringify(parsedResponse.clarifyingQuestions));
      } catch (e) {
        console.error("Failed to store clarifying questions:", e);
      }
    }
    
    // Remove clarifying questions from the return object since FormData doesn't include it
    const { clarifyingQuestions, ...formData } = parsedResponse;
    
    return formData as FormData;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}

// Fallback parser using regex patterns (existing implementation)
function parseWithRegex(rawInput: string): FormData {
  // Extract issue - first sentence or up to first period
  const issue = rawInput.split('.')[0].trim();
  
  // Extract name - default to "Guest" if not found
  let name = "Guest";
  const nameMatch = rawInput.match(/my name is ([^,.]+)/i) || rawInput.match(/([^,.]+) here/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim();
  }
  
  // Extract address - look for location indicators
  let address = "75025"; // Default to Plano
  if (rawInput.includes("in ")) {
    const locationMatch = rawInput.match(/in ([^,.]+)/i);
    if (locationMatch && locationMatch[1]) {
      address = locationMatch[1].trim();
    }
  }
  
  // Extract time availability with more patterns
  let timesAvailable: string[] = [];
  const timePatterns = [
    { regex: /available\s+([^,.]+)/i, group: 1 },
    { regex: /can do\s+([^,.]+)/i, group: 1 },
    { regex: /free\s+([^,.]+)/i, group: 1 }
  ];
  
  for (const pattern of timePatterns) {
    const match = rawInput.match(pattern.regex);
    if (match && match[pattern.group]) {
      timesAvailable.push(match[pattern.group].trim());
    }
  }
  
  // Fallback time extraction
  if (timesAvailable.length === 0) {
    if (rawInput.toLowerCase().includes("morning")) {
      timesAvailable.push("Morning");
    }
    if (rawInput.toLowerCase().includes("afternoon")) {
      timesAvailable.push("Afternoon");
    }
    if (rawInput.toLowerCase().includes("evening")) {
      timesAvailable.push("Evening");
    }
    if (rawInput.toLowerCase().includes("weekend")) {
      timesAvailable = timesAvailable.map(time => `Weekend ${time}`);
    } else if (rawInput.toLowerCase().includes("saturday")) {
      timesAvailable = timesAvailable.map(time => `Saturday ${time}`);
    } else if (rawInput.toLowerCase().includes("sunday")) {
      timesAvailable = timesAvailable.map(time => `Sunday ${time}`);
    }
  }
  
  // Extract price range with more robust pattern matching
  let desiredPriceRange = "$50-100"; // Default
  
  // Try to find price patterns in the text
  const priceRegex = /(?:budget|price|cost|pay|spend|around|\$)\s*\$?(\d+)(?:\s*-\s*\$?(\d+))?/i;
  const priceMatch = rawInput.match(priceRegex);
  
  if (priceMatch) {
    const minPrice = priceMatch[1];
    const maxPrice = priceMatch[2];
    
    if (maxPrice) {
      desiredPriceRange = `$${minPrice}-${maxPrice}`;
    } else {
      // If only one price is mentioned, create a range around it
      const price = parseInt(minPrice, 10);
      const min = Math.max(10, price - 20);
      const max = price + 30;
      desiredPriceRange = `$${price}`;
    }
  }
  
  // Extract description - use the full input as description
  const description = rawInput;
  
  // Generate some clarifying questions based on what might be missing
  const clarifyingQuestions = [];
  
  if (name === "Guest") {
    clarifyingQuestions.push("What's your name?");
  }
  if (timesAvailable.length === 0) {
    clarifyingQuestions.push("When would you be available for a handyman to visit?");
  }
  if (address === "75025" && !rawInput.includes("Plano")) {
    clarifyingQuestions.push("What's your address or ZIP code?");
  }
  
  // Store clarifying questions in session storage for retrieval by the frontend
  if (typeof window !== 'undefined' && clarifyingQuestions.length) {
    try {
      sessionStorage.setItem('clarifyingQuestions', JSON.stringify(clarifyingQuestions));
    } catch (e) {
      console.error("Failed to store clarifying questions:", e);
    }
  }
  
  return {
    issue,
    description,
    name,
    address,
    timesAvailable: timesAvailable.length ? timesAvailable : ["Weekday evenings"],
    desiredPriceRange
  };
} 