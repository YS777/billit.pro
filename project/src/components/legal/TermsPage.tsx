import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1>Terms and Conditions</h1>
          <p className="lead">
            Welcome to BillIt.pro. By accessing or using our service, you agree to these terms.
            Please read them carefully.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using BillIt.pro, you agree to be bound by these Terms and Conditions
            and our Privacy Policy. If you disagree with any part of the terms, you may not
            access the service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            BillIt.pro provides invoice generation and bill management services, including:
          </p>
          <ul>
            <li>Professional invoice generation</li>
            <li>Bulk bill processing and printing</li>
            <li>Digital document management</li>
            <li>Payment processing integration</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information.
            You are responsible for maintaining the security of your account and password.
          </p>

          <h2>4. Billing and Payments</h2>
          <p>
            Our billing system operates on a pay-per-use basis for certain features:
          </p>
          <ul>
            <li>Basic invoice generation is free</li>
            <li>Bill printing costs ₹0.50 per page</li>
            <li>All payments are processed securely through Razorpay</li>
            <li>Refunds are processed according to our refund policy</li>
          </ul>

          <h2>5. User Responsibilities</h2>
          <p>
            You agree to:
          </p>
          <ul>
            <li>Provide accurate billing and account information</li>
            <li>Use the service in compliance with applicable laws</li>
            <li>Not misuse or attempt to manipulate the service</li>
            <li>Maintain the confidentiality of your account</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by
            BillIt.pro and are protected by international copyright, trademark, patent, trade
            secret, and other intellectual property laws.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            BillIt.pro shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages resulting from your use or inability to use the service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any
            material changes via email or through the service.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service immediately,
            without prior notice, for conduct that we believe violates these Terms or is
            harmful to other users of the service, us, or third parties, or for any other
            reason.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India,
            without regard to its conflict of law provisions.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            For any questions about these Terms, please contact us at{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              our contact page
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