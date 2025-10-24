import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContextProvider from '../src/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EcoChain - Finanzas Regenerativas para un Futuro Sostenible',
  description: 'Transforma residuos en valor con EcoChain. Gana $EC0 tokens por reciclar y canjéalos por recompensas. ReFi en Base Network.',
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ContextProvider cookies={null}>{children}</ContextProvider>
      </body>
    </html>
  )
}