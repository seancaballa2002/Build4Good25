import { useState } from 'react';
import { QuoteResponse } from "@/types";
import { PhoneCall } from 'lucide-react';

interface QuoteCardProps extends QuoteResponse {
  id?: string;
  requestId?: string;
  onAccept?: () => void;
  onReject?: () => void;
  showButtons?: boolean;
  callId?: string;
  status?: string;
  callError?: string;
}

export default function QuoteCard({
  id,
  requestId,
  providerName,
  quotePrice,
  availableTime,
  duration,
  includedInQuote,
  contactInfo,
  callId,
  status: initialStatus,
  callError,
  onAccept,
  onReject,
  showButtons = false
}: QuoteCardProps) {
  const [quoteStatus, setQuoteStatus] = useState<'pending' | 'accepted' | 'rejected'>(initialStatus === 'pending' ? 'pending' : 'pending');
  
  // Format includedInQuote as bullet points if comma-separated
  const includedItems = includedInQuote.includes(',') 
    ? includedInQuote.split(',').map(item => item.trim()) 
    : [includedInQuote];

  const handleAccept = () => {
    setQuoteStatus('accepted');
    if (onAccept) onAccept();
  };

  const handleReject = () => {
    setQuoteStatus('rejected');
    if (onReject) onReject();
  };

  if (quoteStatus === 'rejected') {
    return null; // Don't show rejected quotes
  }

  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden border 
      ${quoteStatus === 'accepted' ? 'border-green-500' : 'border-gray-200'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{providerName}</h3>
          <div className="text-2xl font-bold text-green-600">{quotePrice}</div>
        </div>

        {/* Call Status Badge */}
        {initialStatus && (
          <div className={`mb-3 inline-block px-2 py-1 rounded text-xs font-semibold
            ${initialStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              initialStatus === 'completed' ? 'bg-green-100 text-green-800' : 
              initialStatus === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'}`}>
            {initialStatus === 'pending' ? 'Call in progress' : 
             initialStatus === 'completed' ? 'Call completed' : 
             initialStatus === 'failed' ? 'Call failed' :
             initialStatus}
          </div>
        )}
        
        {/* Error message if call failed */}
        {initialStatus === 'failed' && callError && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">
            <p><strong>Note:</strong> {callError}</p>
            <p className="mt-1">Using estimated quote instead.</p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Available</span>
            <span className="font-medium">{availableTime}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium">{duration}</span>
          </div>
          <div className="mt-3">
            <span className="text-gray-600 text-sm">Included in quote:</span>
            <p className="text-sm mt-1">{includedInQuote}</p>
          </div>
        </div>

        {contactInfo && (
          <div className="mt-4 flex items-center text-sm border-t pt-3 border-gray-200">
            <PhoneCall size={14} className="mr-1 text-blue-500" />
            <span>{contactInfo}</span>
          </div>
        )}

        {showButtons && quoteStatus !== 'accepted' && (
          <div className="flex mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-500 text-white py-2 rounded-md mr-2 text-sm font-medium hover:bg-green-600"
            >
              Accept Quote
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
            >
              Decline
            </button>
          </div>
        )}

        {quoteStatus === 'accepted' && (
          <div className="mt-4 py-2 text-center bg-green-50 rounded-md text-green-700 text-sm font-medium">
            Quote Accepted ✓
          </div>
        )}
      </div>
    </div>
  );
} 