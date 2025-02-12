'use client';

import { UploadBox } from '../components/ui/UploadBox';
import { AnkiResultsPanel } from '../components/ui/AnkiResultsPanel';
import { AxonResultsPanel } from '../components/ui/AxonResultsPanel';
import { useState } from 'react';
import Image from 'next/image';

console.log('🏠 Home page component rendered');

interface SearchResult {
  id: number;
  similarity: number;
  content: string;
}

interface ProcessResults {
  ankiResults: SearchResult[];
  axonResults: SearchResult[];
}

export default function Home() {
  console.log('🏠 Home page component executing');
  
  const [ankiResults, setAnkiResults] = useState<SearchResult[]>([]);
  const [axonResults, setAxonResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchResults = (results: ProcessResults) => {
    setAnkiResults(results.ankiResults);
    setAxonResults(results.axonResults);
    setIsLoading(false);
  };
  
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://d1bg5u8k1zhews.cloudfront.net/background.jpeg"
          alt="Background"
          fill
          priority
          className="object-cover"
          quality={100}
        />
      </div>
      
      {/* Content with semi-transparent overlay */}
      <div className="relative min-h-screen p-8 bg-white/80">
        <main className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-black">
              Axon PDF Analysis
            </h1>
            <p className="text-lg text-black">
              Upload your medical lecture PDF to find relevant Anki cards and Axon questions
            </p>
          </div>
          
          <div className="space-y-8">
            <UploadBox onSearchResults={handleSearchResults} />
            <AnkiResultsPanel results={ankiResults} isLoading={isLoading} />
            <AxonResultsPanel results={axonResults} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}