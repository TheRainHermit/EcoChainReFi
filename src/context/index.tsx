'use client'

import { wagmiAdapter } from '../config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { base } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "3b69598adac8ead28c7db2c257101e89";

const metadata = {
  name: 'EcoChain', 
  description: 'EcoChain ReFi',
  url: 'http://localhost:3000',
  icons: ['https://tusitio.com/icon.png']
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base],
  defaultNetwork: base,
  metadata,
  features: {
    analytics: true
  }
})

function ContextProvider({ children }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider