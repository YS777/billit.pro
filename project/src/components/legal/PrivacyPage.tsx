import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>

        <article className="prose prose-indigo max-w-none bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h1 className="m-0">Privacy Policy</h1>
          </div>

          <p className="lead">
            At BillIt.pro, we take your privacy seriously. This policy describes how we collect,
            use, and protect your personal information.
          </p>

          <h2>1. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name and email address</li>
            <li>Billing information</li>
            <li>Company details (if provided)</li>
            <li>Usage data and preferences</li>
          </ul>

          <h3>Technical Information</h3>
          <ul>
            <li>IP address and browser information</li>
            <li>Device information</li>
            <li>Cookies and similar technologies</li>
            <li>Usage patterns and preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process payments and transactions</li>
            <li>Send service updates and notifications</li>
            <li>Analyze usage patterns and optimize performance</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>
            We implement robust security measures to protect your data:
          </p>
          <ul>
            <li>End-to-end encryption for sensitive data</li>
            <li>Secure HTTPS connections</li>
            <li>Regular security audits and updates</li>
            <li>Strict access controls and authentication</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We share your data only with trusted partners necessary for service operation:
          </p>
          <ul>
            <li>Payment processors (Razorpay)</li>
            <li>Cloud storage providers</li>
            <li>Analytics services</li>
          </ul>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request data deletion</li>
            <li>Object to data processing</li>
            <li>Export your data</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>
            We use cookies to enhance your experience and analyze service usage. You can
            control cookie preferences through your browser settings.
          </p>

          <h2>7. Third-Party Services</h2>
          <p>
            Our service integrates with third-party services. Their use of your information
            is governed by their respective privacy policies.
          </p>

          <h2>8. Data Retention</h2>
          <p>
            We retain your data as long as necessary to provide our services or comply with
            legal obligations. You can request data deletion at any time.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect
            data from children under 13.
          </p>

          <h2>10. Changes to Privacy Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes
            via email or service notifications.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            For privacy-related inquiries, please contact us through our{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              contact page
            </Link>
            .
          </p>

          <div className="mt-8 text-sm text-gray-500">
            <p>Last updated: March 24, 2025</p>
          </div>
        </article>
      </div>
    </div>
  );
}