import React from 'react';

export default function LoadingQuotes() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
        Contacting local handymen...
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
        We're reaching out to qualified professionals in your area to get you the best quotes.
      </p>
    </div>
  );
} 