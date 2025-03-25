import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Enable chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@supabase/auth-ui-react'],
          'data-vendor': ['@supabase/supabase-js', 'date-fns'],
          'pdf-vendor': ['jspdf', 'html2canvas', 'pdfjs-dist']
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize asset loading
    assetsInlineLimit: 4096,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Write manifest file
    manifest: true,
    // Enable reporting
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Enable compression
    compress: true,
    // Configure headers
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  }
});