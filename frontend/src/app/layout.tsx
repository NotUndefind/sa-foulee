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
    default: 'La Neuville TAF sa Foulée — Association de running',
    template: '%s | La Neuville TAF sa Foulée',
  },
  description:
    "L'application de La Neuville TAF sa Foulée, l'association de running de La Neuville. Événements, sessions d'entraînement, performances et communauté.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'La Neuville TAF sa Foulée',
    description:
      "L'association de running de La Neuville — Événements, sessions d'entraînement, performances et communauté.",
    siteName: 'La Neuville TAF sa Foulée',
    locale: 'fr_FR',
    type: 'website',
  },
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
