import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: './src/extension_popup/popup.html',
        content: './src/content_scripts/content.ts',
        background: './src/service_worker/background.ts'
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
  publicDir: 'public'
})
