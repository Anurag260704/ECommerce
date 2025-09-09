import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Server configuration
  server: {
    host: true, // Allow external connections
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Build optimizations for SEO and performance
  build: {
    // Generate source maps for better debugging
    sourcemap: false,
    
    // Optimize chunks for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', 'lucide-react'],
          utils: ['axios', 'clsx']
        },
        // Clean filenames for better SEO
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Minify for production
    minify: 'esbuild',
    
    // Target modern browsers for better performance
    target: 'es2020'
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@context': resolve(__dirname, 'src/context')
    }
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ]
  },
  
  // Define global constants
  define: {
    __SITE_NAME__: JSON.stringify('ShopEasy'),
    __SITE_URL__: JSON.stringify('https://shopeasy.com'),
    __SITE_DESCRIPTION__: JSON.stringify('ShopEasy - Your ultimate destination for online shopping')
  }
})
