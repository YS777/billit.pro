import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Save, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Bill } from '../../types';

interface BillResultsProps {
  bill: Bill;
  onUpdate: (bill: Bill) => void;
}

export default function BillResults({ bill, onUpdate }: BillResultsProps) {
  const [crop, setCrop] = useState<Crop>();
  const [crops, setCrops] = useState(bill.crops);
  const [label, setLabel] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSaveCrop = () => {
    if (!crop || !imgRef.current) return;

    const newCrop = {
      id: crypto.randomUUID(),
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
      label
    };

    const updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    setLabel('');
    setCrop(undefined);

    // Update bill in database
    supabase
      .from('bills')
      .update({ crops: updatedCrops })
      .eq('id', bill.id)
      .then(({ error }) => {
        if (error) console.error('Error updating crops:', error);
        else onUpdate({ ...bill, crops: updatedCrops });
      });
  };

  const handleDeleteCrop = (cropId: string) => {
    const updatedCrops = crops.filter(c => c.id !== cropId);
    setCrops(updatedCrops);

    // Update bill in database
    supabase
      .from('bills')
      .update({ crops: updatedCrops })
      .eq('id', bill.id)
      .then(({ error }) => {
        if (error) console.error('Error updating crops:', error);
        else onUpdate({ ...bill, crops: updatedCrops });
      });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">{bill.file_name}</h3>
          <span className="text-sm text-gray-500">
            {(bill.file_size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>

        <div className="relative">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={supabase.storage.from('bills').getPublicUrl(bill.file_path).data.publicUrl}
              alt={bill.file_name}
              className="max-w-full rounded-lg"
            />
          </ReactCrop>

          {crops.map((c) => (
            <div
              key={c.id}
              className="absolute border-2 border-indigo-500"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.width}%`,
                height: `${c.height}%`
              }}
            >
              <div className="absolute -top-6 left-0 bg-indigo-500 text-white px-2 py-1 text-xs rounded">
                {c.label}
                <button
                  onClick={() => handleDeleteCrop(c.id)}
                  className="ml-2 text-white hover:text-red-200"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {crop && (
          <div className="mt-4 flex items-center space-x-4">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter label for selection"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <button
              onClick={handleSaveCrop}
              disabled={!label}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Selection
            </button>
          </div>
        )}

        {!crop && (
          <button
            onClick={() => setCrop({ unit: '%', width: 30, height: 30, x: 35, y: 35 })}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Selection
          </button>
        )}
      </div>
    </div>
  );
}