import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import TemplateSelector from './TemplateSelector';
import { useInvoiceStore } from '../../store/invoiceStore';
import type { Invoice, InvoiceTemplate } from '../../types';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { createInvoice, fetchTemplates, getNextInvoiceNumber } = useInvoiceStore();
  const [previewData, setPreviewData] = useState<Invoice | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [nextNumber, setNextNumber] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
    getNextInvoiceNumber().then(setNextNumber);
  }, [fetchTemplates, getNextInvoiceNumber]);

  const handleCreateInvoice = async (data: any) => {
    try {
      const totalAmount = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
      await createInvoice({
        ...data,
        status: 'draft',
        totalAmount,
        template_id: selectedTemplate?.id
      });
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handlePreview = (data: any) => {
    setPreviewData({
      ...data,
      id: 'preview',
      status: 'draft',
      totalAmount: data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invoices
        </button>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details below to create a new invoice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <InvoiceForm 
                onSubmit={handleCreateInvoice}
                onPreview={handlePreview}
                template={selectedTemplate}
                initialNumber={nextNumber}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Template</h2>
            <TemplateSelector
              selectedId={selectedTemplate?.id}
              onSelect={setSelectedTemplate}
            />
          </div>
        </div>
      </div>

      {previewData && (
        <InvoicePreview 
          invoice={previewData}
          template={selectedTemplate} 
          onClose={() => setPreviewData(null)} 
        />
      )}
    </div>
  );
}