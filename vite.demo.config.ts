import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve(import.meta.dirname, 'example'),
  resolve: {
    alias: {
      '~/': `${resolve(import.meta.dirname, 'src')}/`,
    },
  },
  define: {
    'process.env': {},
  },
})
