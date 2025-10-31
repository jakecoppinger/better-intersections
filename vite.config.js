import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ['jakes-dev-server'],
  },
  // Ensure Vite serves index.html for all routes (needed for React Router)
  // This is handled automatically in dev mode, but explicit config helps
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream',
    },
  },
})
