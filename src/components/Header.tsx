
import React from 'react';
import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="glass-panel rounded-full px-6 py-3 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Box className="h-5 w-5 text-primary" />
        <Link to="/" className="font-medium text-lg">View3DCraft</Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
        <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
        <Link to="/documentation" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link>
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
