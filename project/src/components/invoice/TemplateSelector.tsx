import React from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import type { InvoiceTemplate } from '../../types';
import { Layout, Palette } from 'lucide-react';

interface TemplateSelectorProps {
  selectedId?: string;
  onSelect: (template: InvoiceTemplate) => void;
}

export default function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const { templates, loading } = useInvoiceStore();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-gray-200 rounded-lg"></div>
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={`relative group p-4 rounded-lg border-2 transition-all ${
            selectedId === template.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layout className={`h-5 w-5 ${
                selectedId === template.id ? 'text-indigo-500' : 'text-gray-400'
              }`} />
              <h3 className="font-medium text-gray-900">{template.name}</h3>
            </div>
            {template.is_default && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                Default
              </span>
            )}
          </div>

          <div className="aspect-[8.5/11] border rounded-md overflow-hidden bg-white">
            <div className="h-full p-4" style={{
              backgroundColor: template.data.colors.accent,
              color: template.data.colors.primary,
            }}>
              <div className="h-1/4 border-b border-dashed border-current opacity-20" />
              <div className="h-1/2 border-b border-dashed border-current opacity-20" />
              <div className="h-1/4" />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <Palette className="h-4 w-4 text-gray-400" />
            <div className="flex space-x-1">
              {Object.values(template.data.colors).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}