import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Footer from './shared/Footer';
import { useAuthStore } from '../store/authStore';
import Logo from './shared/Logo';

export default function LandingPage() {
  const { user } = useAuthStore();
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm fixed w-full z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer"
              >
                Pricing
              </button>
              <Link
                to="/contact"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Contact
              </Link>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        <Hero />
        <div ref={featuresRef}>
          <Features />
        </div>
        <div ref={pricingRef}>
          <Pricing />
        </div>
      </main>

      <Footer />
    </div>
  );
}