import React from 'react';
import { Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { PricingTier } from '../types';

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started with basic invoicing needs.',
    features: [
      '100 invoices per month',
      'Basic invoice templates',
      'Email invoice sharing',
      'PDF downloads',
      'No credit card required'
    ],
    cta: 'Start Free'
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'Enhanced features for growing businesses.',
    features: [
      'Unlimited invoices',
      'Custom branding',
      'Invoice history',
      'Bulk bill processing',
      'Premium templates',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large organizations.',
    features: [
      'All Pro features',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Volume discounts',
      'SLA guarantee'
    ],
    cta: 'Contact Sales'
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handlePlanClick = (tier: PricingTier) => {
    if (tier.name === 'Free') {
      if (!user) {
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    } else if (tier.name === 'Pro') {
      navigate('/signup');
    } else {
      navigate('/contact');
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that works best for you. All plans include our core invoice generation features.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`rounded-lg shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary-500 ${
                tier.popular ? 'border-2 border-primary-500' : 'border border-gray-200 hover:border-2'
              }`}
            >
              <div className="p-6">
                {tier.popular && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4">
                    Most Popular
                  </span>
                )}
                <h2 className="text-2xl leading-6 font-semibold text-gray-900">{tier.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.name !== 'Enterprise' && <span className="text-base font-medium text-gray-500">/month</span>}
                </p>
                <button
                  onClick={() => handlePlanClick(tier)}
                  className={`mt-8 block w-full text-center rounded-md py-3 px-6 text-sm font-semibold transition-colors duration-200 ${
                    tier.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                      : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}