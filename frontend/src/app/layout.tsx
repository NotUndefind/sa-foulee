import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import AuthProvider from '@/components/layouts/AuthProvider'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'sa Foulée — Association de running de La Neuville',
    template: '%s | sa Foulée',
  },
  description:
    "L'application de l'association de running sa Foulée — La Neuville. Événements, sessions d'entraînement, performances et communauté.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
