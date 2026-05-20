import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets are loaded with relative paths, supporting GitHub Pages subdirectories
});
