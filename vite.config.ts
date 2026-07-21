import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'motion-vendor': ['framer-motion'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // Default is 500kb; the vendor chunks above are intentionally larger
    // (e.g. framer-motion), so this just silences the noisy warning rather
    // than changing actual behavior.
    chunkSizeWarningLimit: 700,
  },
});
