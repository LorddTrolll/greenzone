import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { RealtimeSyncProvider } from './contexts/RealtimeSyncContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GreenZone - Dashboard de Apostas',
  description: 'Plataforma de gestão e análise de apostas esportivas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body className={`${inter.className} transition-colors duration-300`}>
        <SettingsProvider>
          <AuthProvider>
            <RealtimeSyncProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </RealtimeSyncProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}