import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts({
    rollupTypes: true,
  })],
  resolve: {
    dedupe: ['vue'],
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@solana-mobile/wallet-adapter-mobile',
        'vue',
      ],
      output: {
        exports: 'named',
        globals: {
          '@solana/web3.js': 'SolanaWeb3',
          '@solana/wallet-adapter-base': 'SolanaWalletAdapterBase',
          '@solana-mobile/wallet-adapter-mobile': 'SolanaWalletAdapterMobile',
          'vue': 'Vue',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
})
