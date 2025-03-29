'use client';

import { useState } from 'react';
import { QuoteResponse } from "@/types";

interface QuoteCardProps extends QuoteResponse {}

export default function QuoteCard({
  providerName,
  quotePrice,
  availableTime,
  duration,
  includedInQuote,
  contactInfo
}: QuoteCardProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  
  // Format includedInQuote as bullet points if comma-separated
  const includedItems = includedInQuote.includes(',') 
    ? includedInQuote.split(',').map(item => item.trim()) 
    : [includedInQuote];

  const handleAccept = () => {
    setStatus('accepted');
    // In a real app, you would make an API call here to update the database
  };

  const handleReject = () => {
    setStatus('rejected');
    // In a real app, you would make an API call here to update the database
  };

  if (status === 'accepted') {
    return (
      <div className="border rounded-lg overflow-hidden shadow-md bg-green-50 dark:bg-green-900 max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{providerName}</h3>
            <span className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {quotePrice.startsWith('$') ? quotePrice : `$${quotePrice}`}
            </span>
          </div>
          
          <div className="mb-6 text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">
                Quote Accepted!
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {providerName} will contact you shortly to confirm your appointment for {availableTime}.
              </p>
            </div>
            
            {contactInfo && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Contact: <span className="font-bold">{contactInfo}</span>
              </p>
            )}
          </div>
          
          <button 
            onClick={() => setStatus('pending')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Change Selection
          </button>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="border rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800 max-w-md w-full opacity-60">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-500">{providerName}</h3>
            <span className="text-xl font-semibold text-gray-500">
              {quotePrice.startsWith('$') ? quotePrice : `$${quotePrice}`}
            </span>
          </div>
          
          <p className="text-center text-gray-500 my-4">Quote declined</p>
          
          <button 
            onClick={() => setStatus('pending')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Reconsider
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 max-w-md w-full">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{providerName}</h3>
          <span className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {quotePrice.startsWith('$') ? quotePrice : `$${quotePrice}`}
          </span>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Available:</span> {availableTime}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Duration:</span> {duration}
          </p>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium mb-2">Included in quote:</h4>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">
            {includedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        {contactInfo && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Contact: {contactInfo}
          </p>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Accept
          </button>
          <button 
            onClick={handleReject}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
} 