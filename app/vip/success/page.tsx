'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { CheckCircle, Crown, ArrowRight } from 'lucide-react'

export default function SuccessPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, vipPlan } = useAuth()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('Sessão de pagamento não encontrada')
      setLoading(false)
      return
    }

    // Aguardar um pouco para o webhook processar
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--green-primary)' }}></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Processando seu pagamento...
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Aguarde enquanto confirmamos sua assinatura
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Erro no Pagamento
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/vip')}
              className="px-6 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--green-primary)',
                color: 'white'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full p-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--green-primary)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Pagamento Confirmado!
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Parabéns! Sua assinatura VIP foi ativada com sucesso.
          </p>

          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5" style={{ color: 'var(--green-primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Status VIP Ativo
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Plano: {vipPlan === 'MONTHLY' ? 'Mensal' : 'Anual'}
            </p>
            {user?.vipExpiresAt && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Válido até: {new Date(user.vipExpiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/jogos-do-dia')}
              className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--green-primary)',
                color: 'white'
              }}
            >
              Acessar Jogos do Dia
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}