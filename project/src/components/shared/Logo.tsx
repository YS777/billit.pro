import React from 'react';
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = '', showTagline = true }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform rotate-3 transition-transform hover:rotate-6">
          <Calculator className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -inset-0.5 bg-indigo-600/20 rounded-xl blur" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-indigo-600 leading-none tracking-tight">
          billit.pro
        </h1>
        {showTagline && (
          <p className="text-sm text-gray-600 font-medium">
            bill smarter, not harder
          </p>
        )}
      </div>
    </Link>
  );
}