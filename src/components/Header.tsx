
import React, { useState } from 'react';
import { Box, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  const handleFeatureNotImplemented = () => {
    toast({
      title: "Feature Coming Soon",
      description: "This feature is under development and will be available soon.",
    });
  };

  return (
    <header className="glass-panel rounded-full px-6 py-3 mb-6 flex items-center justify-between relative z-30">
      <div className="flex items-center space-x-2">
        <Box className="h-5 w-5 text-primary" />
        <Link to="/" className="font-medium text-lg">View3DCraft</Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <Link 
          to="/" 
          className={`text-sm transition-colors ${isActiveRoute('/') 
            ? 'text-primary font-medium' 
            : 'text-gray-600 hover:text-gray-900'}`}
        >
          Home
        </Link>
        <Link 
          to="/features" 
          className={`text-sm transition-colors ${isActiveRoute('/features') 
            ? 'text-primary font-medium' 
            : 'text-gray-600 hover:text-gray-900'}`}
        >
          Features
        </Link>
        <Link 
          to="/documentation" 
          className={`text-sm transition-colors ${isActiveRoute('/documentation') 
            ? 'text-primary font-medium' 
            : 'text-gray-600 hover:text-gray-900'}`}
        >
          Documentation
        </Link>
      </nav>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={handleFeatureNotImplemented}
          className="hidden md:block button-glass-secondary text-sm"
        >
          Sign In
        </button>
        
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="button-glass text-sm"
        >
          GitHub
        </a>
        
        <button 
          className="md:hidden text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl p-4 md:hidden animate-scale-in z-50">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`text-sm py-2 px-4 rounded-lg transition-colors ${isActiveRoute('/') 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className={`text-sm py-2 px-4 rounded-lg transition-colors ${isActiveRoute('/features') 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/documentation" 
              className={`text-sm py-2 px-4 rounded-lg transition-colors ${isActiveRoute('/documentation') 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Documentation
            </Link>
            <button 
              onClick={() => {
                handleFeatureNotImplemented();
                setIsMobileMenuOpen(false);
              }}
              className="text-sm py-2 px-4 rounded-lg text-left text-gray-600 hover:bg-gray-100"
            >
              Sign In
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
