import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { createApp } from 'vue'
import SolanaWallets from '../src/index'
import App from './App.vue'

import '../styles.css'

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({
      network: 'devnet',
    }),
    new TorusWalletAdapter(),
  ],
  autoConnect: true,
}

createApp(App).use(SolanaWallets, walletOptions).mount('#app')
