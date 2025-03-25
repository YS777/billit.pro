import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useBillStore } from '../../store/billStore';
import { useAuthStore } from '../../store/authStore';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function BillUploader() {
  const { uploads, addUpload, removeUpload, processUploads } = useBillStore();
  const user = useAuthStore((state) => state.user);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!user || user.billCredits < acceptedFiles.length) {
      alert(`You don't have enough bill credits. You need ${acceptedFiles.length} credits but have ${user?.billCredits || 0}.`);
      return;
    }
    acceptedFiles.forEach(addUpload);
  }, [addUpload, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: MAX_FILE_SIZE,
    validator: (file) => {
      if (file.size > MAX_FILE_SIZE) {
        return {
          code: 'file-too-large',
          message: `File is larger than ${MAX_FILE_SIZE / 1024 / 1024}MB`
        };
      }
      return null;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'ready':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Bills</h2>
          <div className="text-sm text-gray-600">
            Credits remaining: <span className="font-semibold">{user?.billCredits || 0}</span>
          </div>
        </div>

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

        {uploads.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="border rounded-md divide-y">
              {uploads.map((upload) => (
                <div key={upload.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className={`text-sm ${getStatusColor(upload.status)} capitalize`}>
                        {upload.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {upload.status === 'uploading' && (
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => processUploads()}
                disabled={uploads.some(u => u.status === 'processing')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Process Bills
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}