import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CreditCard } from 'lucide-react';
import { initializeRazorpay, createRazorpayOrder } from '../../lib/razorpay';
import { useCurrency } from '../../hooks/useCurrency';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PRICE_PER_BILL_INR = 0.50; // INR

export default function PublicBillProcess() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { userCurrency, convertPrice, loading: currencyLoading } = useCurrency();

  useEffect(() => {
    initializeRazorpay().then(setRazorpayLoaded);
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: MAX_FILE_SIZE
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setProcessing(true);
    try {
      // In a real implementation, you would:
      // 1. Call your backend to create a Razorpay order
      // 2. Get the order ID from the response
      const orderId = 'dummy_order_id'; // Replace with actual order ID from backend

      await createRazorpayOrder({
        amount: files.length * PRICE_PER_BILL_INR,
        currency: 'INR',
        name: 'BillIt.pro',
        description: `Process ${files.length} bill${files.length > 1 ? 's' : ''}`,
        orderId,
        theme: {
          color: '#4F46E5'
        }
      });

      // Handle successful payment
      setShowPayment(false);
      // Process the files...

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const totalCostINR = files.length * PRICE_PER_BILL_INR;
  const [localizedPrice, setLocalizedPrice] = useState<string>('');

  useEffect(() => {
    if (files.length > 0 && !currencyLoading) {
      convertPrice(totalCostINR).then(setLocalizedPrice);
    }
  }, [files.length, currencyLoading, totalCostINR, convertPrice]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Process Bills</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your bills and get them processed instantly.
            Only ₹{PRICE_PER_BILL_INR.toFixed(2)} per bill
            {userCurrency !== 'INR' && !currencyLoading && (
              <span className="text-sm text-gray-500">
                {' '}(approximately {localizedPrice} per bill in your currency)
              </span>
            )}
          </p>
        </div>

        <div className="mt-10">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag 'n' drop some files here, or click to select files
              </p>
              <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB each</p>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Selected Files</h3>
                <ul className="mt-4 divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {files.length} {files.length === 1 ? 'bill' : 'bills'} selected
                      </p>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        Total: ₹{totalCostINR.toFixed(2)}
                        {userCurrency !== 'INR' && !currencyLoading && (
                          <span className="text-sm text-gray-500 ml-2">
                            (≈ {localizedPrice})
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleProcess}
                      disabled={processing || !razorpayLoaded}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {processing ? 'Processing...' : 'Pay & Process'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}