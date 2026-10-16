import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  build: {
    // Aggressive chunk splitting for scalability
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],
          
          // Page-specific chunks to prevent loading all pages upfront
          'page-home': ['./src/pages/HomePage.tsx'],
          'page-search': ['./src/pages/SearchPage.tsx'],
          'page-listings': ['./src/pages/ListingDetailPage.tsx', './src/pages/AddListingPage.tsx'],
          'page-account': ['./src/pages/AccountPage.tsx', './src/pages/SellerProfilePage.tsx'],
          'page-business': ['./src/pages/BusinessDashboard.tsx', './src/pages/JobsServicesBusiness.tsx'],
          'page-admin': ['./src/pages/AdminDashboard.tsx'],
          'page-auth': ['./src/pages/AuthPages.tsx'],
          'page-utils': ['./src/pages/FavoritesCompareMessages.tsx', './src/pages/HelpPage.tsx'],
          
          // Component chunks for shared UI
          'components-ui': ['./src/components/ui.tsx'],
          'components-marketplace': ['./src/components/marketplace'],
        },
      },
    },
    // Increase chunk size limits and warnings
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle only core dependencies that are used immediately
    include: ['react', 'react-dom'],
  },
});
