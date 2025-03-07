
import React from 'react';
import { Cube } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="glass-panel rounded-full px-6 py-3 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Cube className="h-5 w-5 text-primary" />
        <span className="font-medium text-lg">View3DCraft</span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Home</a>
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Documentation</a>
      </nav>
      
      <div className="flex items-center space-x-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="button-glass text-sm"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;
