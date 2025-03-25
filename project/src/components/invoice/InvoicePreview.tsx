import React from 'react';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Invoice } from '../../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoicePreview({ invoice, onClose }: InvoicePreviewProps) {
  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`invoice-${invoice.number}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-8" id="invoice-preview">
          <div className="max-w-3xl mx-auto bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">INVOICE</h1>
                <p className="mt-2 text-gray-600">#{invoice.number}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-gray-900">BillIt.pro</p>
                <p className="text-gray-600">Professional Invoicing</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Bill To:</h2>
                <div className="mt-2">
                  <p className="font-medium text-gray-800">{invoice.clientName}</p>
                  <p className="text-gray-600">{invoice.clientEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <p>
                    <span className="text-gray-600">Date: </span>
                    <span className="font-medium">{format(new Date(invoice.date), 'MMM d, yyyy')}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Due Date: </span>
                    <span className="font-medium">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-200">
                    <th className="py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="py-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                    <th className="py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                    <th className="py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="py-4 text-sm text-gray-800">{item.description}</td>
                      <td className="py-4 text-sm text-gray-800 text-right">{item.quantity}</td>
                      <td className="py-4 text-sm text-gray-800 text-right">
                        {invoice.currency} {Number(item.price).toFixed(2)}
                      </td>
                      <td className="py-4 text-sm text-gray-800 text-right">
                        {invoice.currency} {(Number(item.quantity) * Number(item.price)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <th scope="row" colSpan={3} className="pt-4 text-right font-semibold text-gray-900">
                      Total
                    </th>
                    <td className="pt-4 text-right font-semibold text-gray-900">
                      {invoice.currency} {Number(invoice.totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {(invoice.notes || invoice.terms) && (
              <div className="mt-10 space-y-6">
                {invoice.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notes</h3>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Terms</h3>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}