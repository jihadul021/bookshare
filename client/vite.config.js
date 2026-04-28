import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? 'https://bookshare-xbj2.onrender.com' : 'http://localhost:3000', 
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/uploads': {
        target: process.env.NODE_ENV === 'production' ? 'https://bookshare-xbj2.onrender.com' : 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
