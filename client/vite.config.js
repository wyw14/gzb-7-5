import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5105,
    proxy: {
      '/api': {
        target: 'http://localhost:3105',
        changeOrigin: true
      }
    }
  }
})

