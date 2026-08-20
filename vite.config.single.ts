import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Build "un solo file": HTML + JS + CSS + sprite in base64.
 * Serve per far provare il prototipo senza toolchain — si apre col doppio clic.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
