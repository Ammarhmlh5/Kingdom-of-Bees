import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const extensions = [
  '.web.tsx',
  '.tsx',
  '.web.ts',
  '.ts',
  '.web.jsx',
  '.jsx',
  '.web.js',
  '.js',
  '.css',
  '.json',
  '.mjs',
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions,
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native': 'react-native-web',
      'react-native$': 'react-native-web',
      'react-native-vision-camera': path.resolve(__dirname, './src/lib/stubs/vision-camera-stub.ts'),
      'react-native-fast-tflite': path.resolve(__dirname, './src/lib/stubs/tflite-stub.ts'),
      'react-native-nitro-modules': path.resolve(__dirname, './src/lib/stubs/nitro-stub.ts'),
    },
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['react-native-vision-camera', 'react-native-fast-tflite', 'react-native-nitro-modules'],
  },
});
