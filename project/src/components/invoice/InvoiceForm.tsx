import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import type { Invoice } from '../../types';

type InvoiceFormData = Omit<Invoice, 'id' | 'status' | 'totalAmount'>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  onPreview: (data: InvoiceFormData) => void;
}

export default function InvoiceForm({ onSubmit, onPreview }: InvoiceFormProps) {
  const user = useAuthStore((state) => state.user);
  const { register, control, handleSubmit, watch } = useForm<InvoiceFormData>({
    defaultValues: {
      currency: user?.preferences.currency.code || 'USD',
      items: [{ id: crypto.randomUUID(), description: '', quantity: 1, price: 0, total: 0 }],
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const items = watch('items');
  const total = items?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            {...register('number')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            {...register('currency')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            {...register('date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            {...register('dueDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            {...register('clientName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Client Email</label>
          <input
            type="email"
            {...register('clientEmail')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          <button
            type="button"
            onClick={() => append({ id: crypto.randomUUID(), description: '', quantity: 1, price: 0, total: 0 })}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-200">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-center p-4">
                <div className="col-span-6">
                  <input
                    type="text"
                    {...register(`items.${index}.description`)}
                    placeholder="Item description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="Qty"
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-right"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-right"
                    required
                  />
                </div>
                <div className="col-span-1 text-right font-medium text-gray-900">
                  {(Number(items[index]?.quantity || 0) * Number(items[index]?.price || 0)).toFixed(2)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex justify-end items-center">
              <div className="text-right">
                <span className="text-sm text-gray-500">Total Amount</span>
                <p className="text-xl font-bold text-gray-900">{total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            {...register('notes')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Additional notes for the client..."
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Terms</label>
          <textarea
            {...register('terms')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Payment terms and conditions..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleSubmit(onPreview)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
}