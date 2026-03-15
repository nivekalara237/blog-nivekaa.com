// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';


import tailwindcss from '@tailwindcss/vite';


// https://astro.build/config
export default defineConfig({
  // Active le mode statique (SSG)
  output: 'static',
  site: 'https://cloud.nivekaa.com',

  build: {
    format: 'directory'
  },

  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      // 'Content-Security-Policy': "default-src 'self'; script-src 'self';"
    }
  }
});