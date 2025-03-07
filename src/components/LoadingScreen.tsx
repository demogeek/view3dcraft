
import React from 'react';
import { CubeIcon } from 'lucide-react';

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <div 
      className={`loading-screen ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isLoading}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <CubeIcon size={48} className="text-primary animate-float" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-rotate-loader"></div>
          </div>
        </div>
        <h2 className="text-xl font-medium text-gray-800 mb-2 animate-pulse-subtle">Loading Model</h2>
        <p className="text-sm text-gray-500">Please wait while we process your file</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
