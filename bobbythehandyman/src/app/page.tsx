import Image from "next/image";
import { useState } from "react";

import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the landing page
  redirect("/landing")

  // Add this state
  const [showComparison, setShowComparison] = useState(false);

  // Add this button above the quote cards
  {quotes.length > 1 && (
    <div className="text-center mb-6">
      <button
        onClick={() => setShowComparison(true)}
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-6 rounded-md"
      >
        Compare All Quotes
      </button>
    </div>
  )}

  // Add this component at the end of your JSX
  {showComparison && quotes.length > 0 && (
    <QuoteComparison 
      quotes={quotes} 
      onClose={() => setShowComparison(false)} 
    />
  )}
}