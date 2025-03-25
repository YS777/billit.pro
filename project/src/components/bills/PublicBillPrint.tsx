import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Printer, Crop, Check, ArrowLeft, FileText, Copy } from 'lucide-react';
import ReactCrop, { type Crop as CropArea, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { initializeRazorpay, createRazorpayOrder } from '../../lib/razorpay';
import { useCurrency } from '../../hooks/useCurrency';
import { generatePreview, getPdfPageCount } from '../../utils/filePreview';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PRICE_PER_BILL_INR = 0.50; // INR

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf';
  pageCount: number;
  cropSettings?: CropArea;
  name: string;
}

export default function PublicBillPrint() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [totalBillCount, setTotalBillCount] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { userCurrency, convertPrice, loading: currencyLoading } = useCurrency();
  
  // Cropping state
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState<CropArea>();
  const [completedCrop, setCompletedCrop] = useState<CropArea>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    initializeRazorpay().then(setRazorpayLoaded);
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const type = file.type.startsWith('image/') ? 'image' : 'pdf';
        const pageCount = await getPdfPageCount(file);
        const { preview } = await generatePreview(file);
        return {
          id: crypto.randomUUID(),
          file,
          preview,
          type,
          pageCount,
          name: file.name
        };
      })
    );

    setFiles(prev => [...prev, ...newFiles]);
    
    // Update total bill count
    const newTotalCount = newFiles.reduce((sum, file) => sum + file.pageCount, 0);
    setTotalBillCount(prev => prev + newTotalCount);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: MAX_FILE_SIZE
  });

  const removeFile = (index: number) => {
    const file = files[index];
    setTotalBillCount(prev => prev - file.pageCount);
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFileIndex === index) {
      setSelectedFileIndex(null);
      setIsCropping(false);
    }
  };

  const startCropping = (index: number) => {
    setSelectedFileIndex(index);
    setIsCropping(true);

    // If this file already has crop settings, use them
    const existingCrop = files[index].cropSettings;
    if (existingCrop) {
      setCrop(existingCrop);
      setCompletedCrop(existingCrop);
    } else {
      // Set initial crop area in the center
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 50,
            },
            1,
            width,
            height
          ),
          width,
          height
        );
        setCrop(newCrop);
        setCompletedCrop(newCrop);
      }
    }
  };

  const applyCropToAll = async () => {
    if (!completedCrop || selectedFileIndex === null) return;
    
    // Apply the crop settings to all files
    setFiles(prevFiles => 
      prevFiles.map(file => ({
        ...file,
        cropSettings: completedCrop
      }))
    );

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
    successMessage.textContent = 'Crop settings applied to all bills';
    document.body.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 3000);

    setIsCropping(false);
    setSelectedFileIndex(null);
  };

  const handlePrint = async () => {
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    // Ensure all files have crop settings
    const allFilesHaveCrop = files.every(f => f.cropSettings);
    if (!allFilesHaveCrop) {
      alert('Please set crop area for your files first');
      return;
    }

    setPrinting(true);
    try {
      const orderId = 'dummy_order_id'; // Replace with actual order ID from backend

      await createRazorpayOrder({
        amount: totalBillCount * PRICE_PER_BILL_INR,
        currency: 'INR',
        name: 'BillIt.pro',
        description: `Print ${totalBillCount} bill${totalBillCount > 1 ? 's' : ''}`,
        orderId,
        theme: {
          color: '#4F46E5'
        }
      });

      setShowPayment(false);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  const totalCostINR = totalBillCount * PRICE_PER_BILL_INR;
  const [localizedPrice, setLocalizedPrice] = useState<string>('');

  useEffect(() => {
    if (totalBillCount > 0 && !currencyLoading) {
      convertPrice(totalCostINR).then(setLocalizedPrice);
    }
  }, [totalBillCount, currencyLoading, totalCostINR, convertPrice]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Print Bills</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your bills and get them printed instantly.
            Only ₹{PRICE_PER_BILL_INR.toFixed(2)} per bill
            {userCurrency !== 'INR' && !currencyLoading && (
              <span className="text-sm text-gray-500">
                {' '}(approximately {localizedPrice} per bill in your currency)
              </span>
            )}
          </p>
        </div>

        <div className="mt-10">
          {isCropping && selectedFileIndex !== null ? (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setIsCropping(false);
                    setSelectedFileIndex(null);
                  }}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to files
                </button>
                <div className="text-sm text-gray-600">
                  Select the area you want to crop from all your bills
                </div>
              </div>

              <div className="relative max-w-3xl mx-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={undefined}
                >
                  <img
                    ref={imgRef}
                    src={files[selectedFileIndex].preview}
                    alt="Bill preview"
                    className="max-w-full rounded-lg"
                  />
                </ReactCrop>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    if (!completedCrop) return;
                    setFiles(prevFiles => 
                      prevFiles.map((file, i) => 
                        i === selectedFileIndex 
                          ? { ...file, cropSettings: completedCrop }
                          : file
                      )
                    );
                    setIsCropping(false);
                    setSelectedFileIndex(null);
                  }}
                  disabled={!completedCrop}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply to this file
                </button>
                <button
                  onClick={applyCropToAll}
                  disabled={!completedCrop}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Apply to all files
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg">
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

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Selected Files</h3>
                    {files.length > 1 && (
                      <p className="text-sm text-gray-600">
                        {files.every(f => f.cropSettings) 
                          ? 'All files have crop settings applied'
                          : 'Click on any file to set the cropping area for all bills'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div
                        key={file.id}
                        className="relative group"
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          {file.cropSettings && (
                            <div
                              className="absolute border-2 border-indigo-500 pointer-events-none"
                              style={{
                                left: `${file.cropSettings.x}%`,
                                top: `${file.cropSettings.y}%`,
                                width: `${file.cropSettings.width}%`,
                                height: `${file.cropSettings.height}%`,
                              }}
                            />
                          )}
                          {file.type === 'pdf' && file.pageCount > 1 && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {file.pageCount} pages
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startCropping(index)}
                              className="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"
                              title={file.cropSettings ? "Edit crop area" : "Set crop area"}
                            >
                              <Crop className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => removeFile(index)}
                              className="p-2 bg-white rounded-full text-gray-900 hover:text-red-600"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {totalBillCount} {totalBillCount === 1 ? 'bill' : 'bills'} total
                          {files.some(f => f.type === 'pdf' && f.pageCount > 1) && (
                            <span className="text-xs text-gray-500 ml-2">
                              (including all PDF pages)
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          Total: ₹{totalCostINR.toFixed(2)}
                          {userCurrency !== 'INR' && !currencyLoading && (
                            <span className="text-sm text-gray-500 ml-2">
                              (≈ {localizedPrice})
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={handlePrint}
                        disabled={printing || !razorpayLoaded || !files.every(f => f.cropSettings)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        {printing ? 'Processing...' : 'Pay & Print'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}