import { QuoteResponse } from "@/types";

interface QuoteComparisonProps {
  quotes: QuoteResponse[];
  onClose: () => void;
}

export default function QuoteComparison({ quotes, onClose }: QuoteComparisonProps) {
  if (!quotes.length) return null;
  
  // Find the lowest price quote
  const lowestPrice = Math.min(...quotes.map(q => {
    const price = q.quotePrice.replace('$', '');
    return parseInt(price, 10);
  }));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Compare Quotes</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left">Provider</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Availability</th>
                  <th className="p-3 text-left">Duration</th>
                  <th className="p-3 text-left">Included</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, index) => {
                  const price = parseInt(quote.quotePrice.replace('$', ''), 10);
                  const isLowestPrice = price === lowestPrice;
                  
                  return (
                    <tr key={index} className={`border-b ${isLowestPrice ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                      <td className="p-3">{quote.providerName}</td>
                      <td className="p-3 font-medium">
                        {quote.quotePrice}
                        {isLowestPrice && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Best Price
                          </span>
                        )}
                      </td>
                      <td className="p-3">{quote.availableTime}</td>
                      <td className="p-3">{quote.duration}</td>
                      <td className="p-3">{quote.includedInQuote}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 