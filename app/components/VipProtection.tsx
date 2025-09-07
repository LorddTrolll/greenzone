'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Crown } from 'lucide-react'

interface VipProtectionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function VipProtection({ children, fallback }: VipProtectionProps) {
  const { isVip, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return
    
    if (!isAuthenticated()) {
      router.push('/login')
    } else if (!isVip()) {
      router.push('/vip?message=Esta funcionalidade é exclusiva para membros VIP')
    }
  }, [mounted, loading, isAuthenticated, isVip, router])

  // Evitar problemas de hidratação
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--green-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return null // Redirecionamento já foi feito
  }

  if (!isVip()) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-md mx-auto text-center">
          <Crown className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--green-primary)' }} />
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Acesso VIP Necessário
          </h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Esta funcionalidade é exclusiva para membros VIP. Faça upgrade da sua conta para ter acesso completo.
          </p>
          <button
            onClick={() => router.push('/vip')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--green-primary)',
              color: 'white'
            }}
          >
            Assinar VIP
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}