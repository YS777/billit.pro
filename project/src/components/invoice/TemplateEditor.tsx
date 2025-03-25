import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Layout, Palette, Save } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import type { InvoiceTemplate } from '../../types';

interface TemplateEditorProps {
  template?: InvoiceTemplate;
  onSave: () => void;
  onCancel: () => void;
}

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const { createTemplate, updateTemplate } = useInvoiceStore();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: template || {
      name: '',
      data: {
        layout: 'classic',
        sections: {
          header: { enabled: true, position: 'top' },
          items: { enabled: true, position: 'middle' },
          footer: { enabled: true, position: 'bottom' }
        },
        colors: {
          primary: '#4F46E5',
          secondary: '#6B7280',
          accent: '#F3F4F6'
        }
      }
    }
  });

  const colors = watch('data.colors');

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (template) {
        await updateTemplate(template.id, data);
      } else {
        await createTemplate(data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="e.g., Professional Classic"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Layout</label>
        <select
          {...register('data.layout')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
        </select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sections</h3>
        <div className="space-y-4">
          {['header', 'items', 'footer'].map((section) => (
            <div key={section} className="flex items-center space-x-4">
              <input
                type="checkbox"
                {...register(`data.sections.${section}.enabled`)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-700 capitalize">{section}</label>
              <select
                {...register(`data.sections.${section}.position`)}
                className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm text-gray-700 capitalize mb-1">
                {key}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  {...register(`data.colors.${key}`)}
                  className="h-8 w-8 rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  {...register(`data.colors.${key}`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </>
          )}
        </button>
      </div>
    </form>
  );
}