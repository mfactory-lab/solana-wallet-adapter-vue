import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import SolanaWalletAdapter from '@solana/wallet-adapter-vue'
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { createApp } from 'vue'

import App from './App.vue'
import '@solana/wallet-adapter-vue/styles.css'

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({
      network: WalletAdapterNetwork.Mainnet,
    }),
    new CoinbaseWalletAdapter(),
    new TorusWalletAdapter(),
  ],
  autoConnect: true,
}

createApp(App).use(SolanaWalletAdapter, walletOptions).mount('#app')
