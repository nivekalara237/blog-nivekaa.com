// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';


import tailwindcss from '@tailwindcss/vite';


// https://astro.build/config
export default defineConfig({
  // Active le rendu côté serveur (SSR)
  output: 'static',
  site: 'https://cloud.nivekaa.com',

  build: {
    format: 'directory'
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});