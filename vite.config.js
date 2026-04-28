import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
