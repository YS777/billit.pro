import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileInput as FileInvoice, Printer, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      heroRef.current.style.setProperty('--x', `${x * 100}%`);
      heroRef.current.style.setProperty('--y', `${y * 100}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCreateInvoice = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/dashboard/invoices/new');
    }
  };

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left page-enter">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block transition-medium hover:text-indigo-600">Professional Invoicing &</span>
                <span className="block text-indigo-600 transition-medium hover:text-indigo-700">Bill Management</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Generate professional invoices instantly and print bulk bills efficiently. Perfect for freelancers, small businesses, and online sellers.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={handleCreateInvoice}
                    className="btn-primary w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10"
                  >
                    <FileInvoice className="w-5 h-5 mr-2 transition-transform group-hover:rotate-6" />
                    Create Free Invoice
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/bills/print"
                    className="btn-secondary w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10 group"
                  >
                    <Printer className="w-5 h-5 mr-2 transition-transform group-hover:-translate-y-1" />
                    Print Bills
                    <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded-full transition-colors group-hover:bg-indigo-700">
                      ₹0.50/bill
                    </span>
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                No credit card required for free version. 
                <Link to="/signup" className="ml-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                  Create account for more features →
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
      <div ref={heroRef} className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 overflow-hidden">
        <div className="h-56 w-full sm:h-72 md:h-96 lg:h-full hero-float">
          <img
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            style={{
              transform: 'perspective(1000px) rotateY(calc(var(--x) * 5deg)) rotateX(calc(var(--y) * -5deg))'
            }}
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
            alt="Professional invoice and bill management"
          />
        </div>
      </div>
    </div>
  );
}