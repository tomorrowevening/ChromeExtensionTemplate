import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        devtools: 'src/devtools/devtools.html',
        panel:    'src/devtools/panel.html'
      }
    }
  }
});