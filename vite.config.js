import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import glsl from 'vite-plugin-glsl';
import { ViteEjsPlugin as ejs } from 'vite-plugin-ejs';

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    glsl({
      watch: false,
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    ejs({}),
  ],
});