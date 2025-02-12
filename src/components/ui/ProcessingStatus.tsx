'use client';

import React from 'react';

export function ProcessingStatus() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Processing Status</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="text-gray-900 font-medium">Waiting for file...</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full w-0"></div>
        </div>
      </div>
    </div>
  );
}
