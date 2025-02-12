'use client';

import React, { useCallback, useState } from 'react';

interface UploadBoxProps {
  onSearchResults?: (results: any[]) => void;
}

export function UploadBox({ onSearchResults }: UploadBoxProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      console.log('Upload successful:', data);
      
      // Pass search results to parent component
      if (onSearchResults && data.results) {
        onSearchResults(data.results);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onSearchResults]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isUploading ? 'border-blue-300 bg-blue-50' :
          error ? 'border-red-300 bg-red-50' :
          success ? 'border-green-300 bg-green-50' :
          'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        } transition-colors duration-200`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-4">
          {isUploading ? (
            <div className="text-blue-600">
              <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Uploading and processing PDF...</p>
            </div>
          ) : (
            <>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block"
              >
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                  </svg>
                  <div className="text-black">
                    <span className="text-blue-600 hover:text-blue-500">Upload a PDF file</span>
                    {' '}or drag and drop
                  </div>
                  <p className="text-sm text-black">PDF files only</p>
                </div>
              </label>
            </>
          )}

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm mt-2">
              PDF uploaded and processed successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}