import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: './index.html',
        content: './src/content.ts',
        background: './src/background.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep content and background scripts in root for easier manifest reference
          if (chunkInfo.name === 'content' || chunkInfo.name === 'background') {
            return '[name].js'
          }
          return 'assets/[name].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Prevent code splitting
        manualChunks: undefined
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [react(), tailwindcss()],
  publicDir: 'public'
})
