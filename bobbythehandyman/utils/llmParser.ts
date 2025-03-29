import { FormData } from "@/types";

// This is a mock implementation for now
// In a real implementation, you would call OpenAI or another LLM provider
export async function parseUserInput(rawInput: string): Promise<FormData> {
  // For demo purposes, we'll use a simple mock that extracts some patterns
  // In a real implementation, this would call an LLM API
  
  console.log("Parsing raw input:", rawInput);
  
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
  
  // Extract price range with better pattern matching
  let desiredPriceRange = "$50-100"; // Default
  const pricePatterns = [
    { regex: /budget\s+(?:is\s+)?(?:around\s+)?\$?(\d+)(?:-(\d+))?/i, groups: [1, 2] },
    { regex: /(?:willing|able)\s+to\s+(?:pay|spend)\s+(?:around\s+)?\$?(\d+)(?:-(\d+))?/i, groups: [1, 2] },
    { regex: /\$(\d+)(?:-(\d+))?/i, groups: [1, 2] }
  ];
  
  for (const pattern of pricePatterns) {
    const match = rawInput.match(pattern.regex);
    if (match) {
      if (match[pattern.groups[1]]) {
        desiredPriceRange = `$${match[pattern.groups[0]]}-${match[pattern.groups[1]]}`;
      } else {
        desiredPriceRange = `$${match[pattern.groups[0]]}`;
      }
      break;
    }
  }
  
  // Extract description - use the full input as description
  const description = rawInput;
  
  return {
    issue,
    description,
    name,
    address,
    timesAvailable: timesAvailable.length ? timesAvailable : ["Weekday evenings"],
    desiredPriceRange
  };
} 