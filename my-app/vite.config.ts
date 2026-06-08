import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ include: /\.(js|jsx|ts|tsx)$/ })],
  base: '/ChrisSu/',
  build: { outDir: 'dist' },
  server: { port: 3000, open: true },
});
