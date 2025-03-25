import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import TemplateEditor from './TemplateEditor';
import type { InvoiceTemplate } from '../../types';

export default function TemplateManager() {
  const { templates, deleteTemplate } = useInvoiceStore();
  const [editing, setEditing] = useState<InvoiceTemplate | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (template: InvoiceTemplate) => {
    if (template.is_default) {
      alert('Cannot delete default template');
      return;
    }
    
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(template.id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  if (editing || creating) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          {editing ? 'Edit Template' : 'Create New Template'}
        </h2>
        <TemplateEditor
          template={editing || undefined}
          onSave={() => {
            setEditing(null);
            setCreating(false);
          }}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Invoice Templates</h2>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                {template.is_default && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>

              <div className="aspect-[8.5/11] border rounded-md overflow-hidden">
                <div className="h-full p-4" style={{
                  backgroundColor: template.data.colors.accent,
                  color: template.data.colors.primary,
                }}>
                  <div className="h-1/4 border-b border-dashed border-current opacity-20" />
                  <div className="h-1/2 border-b border-dashed border-current opacity-20" />
                  <div className="h-1/4" />
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setEditing(template)}
                  className="p-2 text-gray-400 hover:text-indigo-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(template)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  disabled={template.is_default}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}