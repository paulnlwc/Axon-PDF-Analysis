'use client';

import { useState } from 'react';

interface SearchResult {
  id: number;
  similarity: number;
  content: string;
}

interface SimilaritySearchProps {
  onSearchResults: (results: SearchResult[]) => void;
}

export function SimilaritySearch({ onSearchResults }: SimilaritySearchProps) {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      onSearchResults([]); // Clear previous results
      
      const response = await fetch('/api/search/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: searchText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Search failed');
      }

      const data = await response.json();
      onSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      onSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter search text..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchText.trim()}
          className={`px-6 py-2 rounded-lg ${
            isLoading || !searchText.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
