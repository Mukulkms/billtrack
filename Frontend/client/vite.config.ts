import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Split third-party libs into their own vendor chunk so they're
        // cached independently of app code — app updates won't force a
        // re-download of react/react-dom/router on every deploy.
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
