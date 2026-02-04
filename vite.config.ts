import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // GitHub Pagesの場合、リポジトリ名をベースパスに設定
  // 例: base: '/your-repo-name/'
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
});
