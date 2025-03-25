import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileInput, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { format } from 'date-fns';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800'
};

const statusIcons = {
  draft: FileInput,
  sent: Clock,
  paid: CheckCircle,
  overdue: AlertCircle
};

export default function InvoiceList() {
  const { invoices, loading, fetchInvoices } = useInvoiceStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track all your invoices in one place.
            </p>
          </div>
          <Link
            to="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </div>

        <div className="mt-6">
          {invoices.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-6 text-center">
              <FileInput className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new invoice.
              </p>
              <div className="mt-6">
                <Link
                  to="/invoices/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg">
              <ul className="divide-y divide-gray-200">
                {invoices.map((invoice) => {
                  const StatusIcon = statusIcons[invoice.status];
                  return (
                    <li key={invoice.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <StatusIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.clientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Invoice #{invoice.number}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            {format(new Date(invoice.date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.currency} {invoice.totalAmount.toFixed(2)}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}