import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

export default defineConfig({
  root: rootDir,
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(rootDir, 'assets'),
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@components': path.resolve(rootDir, 'src/components'),
      '@features': path.resolve(rootDir, 'src/features'),
      '@hooks': path.resolve(rootDir, 'src/hooks'),
      '@services': path.resolve(rootDir, 'src/services'),
      '@store': path.resolve(rootDir, 'src/store'),
      '@types': path.resolve(rootDir, 'src/types'),
      '@utils': path.resolve(rootDir, 'src/utils'),
      '@styles': path.resolve(rootDir, 'src/styles'),
      '@assets': path.resolve(rootDir, 'src/assets'),
      '@pages': path.resolve(rootDir, 'src/pages'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/signalr': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['react-redux', 'redux', 'redux-thunk'],
        },
        assetFileNames: 'images/[name][extname]',
      },
    },
  },
});
