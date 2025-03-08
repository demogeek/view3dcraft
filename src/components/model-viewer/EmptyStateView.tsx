
import React from 'react';

const EmptyStateView = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 backdrop-blur-sm rounded-2xl">
      <div className="text-center max-w-md px-6 py-10 animate-pulse-subtle">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary"
          >
            <path d="M2 12h10" />
            <path d="m9 7 5 5-5 5" />
            <path d="M22 17v-1a4 4 0 0 0-4-4h-2" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-gray-800 mb-2">Upload a Model to Begin</h2>
        <p className="text-gray-600 mb-0">
          Drag and drop a 3D file or use the upload panel to visualize your model
        </p>
      </div>
    </div>
  );
};

export default EmptyStateView;
