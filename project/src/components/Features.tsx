import React from 'react';
import { FileInput as FileInvoice, Printer, Globe, CreditCard, History, Palette, Crop, Zap } from 'lucide-react';
import type { Feature } from '../types';

const features: Feature[] = [
  {
    title: 'Professional Invoice Generator',
    description: 'Create beautiful, customizable invoices in seconds with our easy-to-use generator.',
    icon: FileInvoice
  },
  {
    title: 'Smart Bill Cropping',
    description: 'Automatically detect and crop important sections from your bills using our intelligent cropping technology. Save time by applying the same crop settings to multiple bills instantly.',
    icon: Crop,
    highlight: true
  },
  {
    title: 'Bulk Processing',
    description: 'Upload and process multiple bills simultaneously. Perfect for businesses handling large volumes of documents.',
    icon: Zap
  },
  {
    title: 'Multi-Currency Support',
    description: 'Automatic currency conversion and formatting based on your location.',
    icon: Globe
  },
  {
    title: 'Secure Payments',
    description: 'Integrated payment processing for microtransactions and premium features.',
    icon: CreditCard
  },
  {
    title: 'Custom Branding',
    description: 'Add your logo, colors, and custom fields to make your invoices truly yours.',
    icon: Palette
  }
];

export default function Features() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage invoices and bills
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Streamline your billing process with our comprehensive suite of tools and features.
          </p>
        </div>

        <div className="mt-16">
          {/* Featured Item */}
          <div className="lg:text-center mb-16">
            <div className="relative">
              <div className="absolute inset-0 h-1/2 bg-gray-100"></div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <div className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <div className="py-6 px-4 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Crop className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Intelligent Bill Cropping</h3>
                          <p className="mt-2 text-base text-gray-500">
                            Our smart cropping technology helps you extract important information from bills automatically.
                            Select an area once and apply it to multiple bills instantly.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-6 px-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-white">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-base text-gray-700">One-click crop application</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-base text-gray-700">Bulk processing support</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-base text-gray-700">Smart area detection</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Features */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.filter(f => !f.highlight).map((feature) => (
              <div key={feature.title} className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white transform transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}