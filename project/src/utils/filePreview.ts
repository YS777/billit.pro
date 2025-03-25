import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Configure PDF.js worker
const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
GlobalWorkerOptions.workerSrc = workerSrc;

// Initialize worker
const workerPromise = new Promise<void>((resolve) => {
  const script = document.createElement('script');
  script.src = workerSrc;
  script.onload = () => resolve();
  document.head.appendChild(script);
});

interface PreviewResult {
  preview: string;
  pageCount?: number;
}

export async function generatePreview(file: File): Promise<PreviewResult> {
  // Wait for worker to load
  await workerPromise;

  if (file.type.startsWith('image/')) {
    return {
      preview: URL.createObjectURL(file)
    };
  }

  if (file.type === 'application/pdf') {
    try {
      // Convert PDF file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;
      
      // Get the first page
      const page = await pdf.getPage(1);
      
      // Set the scale for rendering
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Get total number of pages
      const pageCount = pdf.numPages;
      
      // Clean up
      pdf.destroy();
      
      return {
        preview: dataUrl,
        pageCount
      };
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      return {
        preview: 'https://placehold.co/600x800?text=PDF+Preview',
        pageCount: 1
      };
    }
  }

  throw new Error('Unsupported file type');
}

export async function getPdfPageCount(file: File): Promise<number> {
  // Wait for worker to load
  await workerPromise;

  if (file.type !== 'application/pdf') {
    return 1;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    pdf.destroy();
    return pageCount;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    return 1;
  }
}