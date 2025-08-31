import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin to copy built HTML files to desired locations in dist
const copyBuiltHtmlPlugin = () => {
  return {
    name: 'copy-built-html',
    writeBundle() {
      const mappings = [
        { src: './dist/src/dashboard/dashboard.html', dest: './dist/dashboard.html' },
        { src: './dist/src/option_page/option.html', dest: './dist/option_page/option.html' },
      ];

      for (const m of mappings) {
        const srcPath = path.resolve(m.src);
        const destPath = path.resolve(m.dest);
        const destDir = path.dirname(destPath);

        try {
          if (fs.existsSync(srcPath)) {
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(srcPath, destPath);
            console.log(`✓ Copied ${srcPath} to ${destPath}`);
          }
        } catch (err) {
          console.warn('Copy failed for', srcPath, err);
        }
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyBuiltHtmlPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: './src/extension_popup/popup.html',
        content: './src/content_scripts/content.ts',
        background: './src/service_worker/background.ts',
        dashboard: './src/dashboard/dashboard.html',
        option: './src/option_page/option.html'
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
