'use client';

import React, { useState } from 'react';

interface SearchResult {
  id: number;
  similarity: number;
  content: string;
}

interface AnkiResultsPanelProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export function AnkiResultsPanel({ results, isLoading = false }: AnkiResultsPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  const handleExport = async () => {
    // Format the IDs as "nid:1557751693832 OR nid:1472139199092"
    const formattedIds = results
      .map(result => `nid:${result.id}`)
      .join(' OR ');

    try {
      await navigator.clipboard.writeText(formattedIds);
      setCopySuccess(true);
      // Reset success message after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with chevron */}
      <div 
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="text-lg font-semibold text-black">Relevant Anki Cards</h2>
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <svg
            className={`w-5 h-5 transform transition-transform text-black ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      
      {/* Export Button - Always visible */}
      <div className="space-y-2 mb-4">
        <button 
          className={`w-full py-2 px-4 rounded-lg ${
            results.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-black cursor-not-allowed'
          }`}
          disabled={results.length === 0}
          onClick={handleExport}
        >
          {copySuccess ? 'Copied to Clipboard!' : 'Copy Card IDs for Anki Search'}
        </button>
        {results.length > 0 && (
          <p className="text-xs text-center text-black">
            Click to copy formatted IDs for Anki search bar
          </p>
        )}
      </div>

      {/* Collapsible content */}
      <div className={`space-y-6 transition-all duration-200 ease-in-out ${
        isCollapsed ? 'hidden' : 'block'
      }`}>
        {/* Results Section */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-black">Loading results...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div key={result.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-black">Card ID: {result.id}</span>
                  <span className="text-xs text-black">
                    Similarity: {(result.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-black">{result.content}</p>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-black">No results yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
