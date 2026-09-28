import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill Buffer for browser
    'global': 'globalThis',
  },
  optimizeDeps: {
    // Exclude pdfjs-dist from pre-bundling — it uses new URL() worker references
    // that must be resolved at build time, not pre-bundle time.
    exclude: ['pdfjs-dist'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI primitives
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-progress',
          ],
          // Charts
          'vendor-charts': ['recharts'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // NOTE: pdfjs-dist is intentionally NOT in manualChunks.
          // It uses new URL() worker references that Rollup must handle inline.
        },
      },
    },
  },
}));
