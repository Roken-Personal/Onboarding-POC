import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: [
      'onboarding-frontend-poc.up.railway.app',
      '.railway.app',
      'localhost',
    ],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'solid-vendor': ['solid-js', '@solidjs/router'],
          'axios-vendor': ['axios'],
        },
      },
    },
    minify: 'esbuild', // esbuild is faster and already available
    chunkSizeWarningLimit: 1000,
  },
});

