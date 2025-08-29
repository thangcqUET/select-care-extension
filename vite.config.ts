import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to copy dashboard.html to root
const copyDashboardPlugin = () => {
  return {
    name: 'copy-dashboard',
    writeBundle() {
      const srcPath = path.resolve('./dist/src/dashboard/dashboard.html')
      const destPath = path.resolve('./dist/dashboard.html')
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath)
        console.log('✓ Copied dashboard.html to root')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyDashboardPlugin()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: './src/extension_popup/popup.html',
        content: './src/content_scripts/content.ts',
        background: './src/service_worker/background.ts',
        dashboard: './src/dashboard/dashboard.html'
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
