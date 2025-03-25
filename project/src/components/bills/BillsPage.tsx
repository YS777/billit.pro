import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import BillUploader from './BillUploader';
import BillResults from './BillResults';
import type { Bill } from '../../types';

export default function BillsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBills = async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
      } else {
        setBills(data || []);
      }
      setLoading(false);
    };

    fetchBills();
  }, [user]);

  const handleBillUpdate = (updatedBill: Bill) => {
    setBills(bills.map(bill => 
      bill.id === updatedBill.id ? updatedBill : bill
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">Process Bills</h1>
            <p className="mt-2 text-sm text-gray-600">
              Upload and process your bills. Each bill requires one credit.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <BillUploader />
        </div>

        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : bills.length > 0 ? (
          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Processed Bills</h2>
            {bills.map((bill) => (
              <BillResults
                key={bill.id}
                bill={bill}
                onUpdate={handleBillUpdate}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}