import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Configuration pour GitHub Pages
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimisations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Retire les console.log en production
      }
    }
  }
})
