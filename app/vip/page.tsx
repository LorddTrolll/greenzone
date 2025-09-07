'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { getStripe } from '../../lib/stripe-client'
import { Check, Crown, Zap, TrendingUp, BarChart3, Calendar, AlertCircle } from 'lucide-react'

const plans = [
  {
    id: 'MONTHLY',
    name: 'VIP Mensal',
    price: 'R$ 30',
    period: '/mês',
    description: 'Acesso completo por 1 mês',
    features: [
      'Acesso aos Jogos do Dia',
      'Relatórios Avançados',
      'Análises Detalhadas',
      'Suporte Prioritário',
      'Estatísticas Exclusivas'
    ],
    popular: false
  },
  {
    id: 'ANNUAL',
    name: 'VIP Anual',
    price: 'R$ 300',
    period: '/ano',
    originalPrice: 'R$ 360',
    description: 'Acesso completo por 1 ano com desconto',
    features: [
      'Acesso aos Jogos do Dia',
      'Relatórios Avançados',
      'Análises Detalhadas',
      'Suporte Prioritário',
      'Estatísticas Exclusivas',
      '2 meses grátis',
      'Desconto de 17%'
    ],
    popular: true
  }
]

const vipFeatures = [
  {
    icon: TrendingUp,
    title: 'Jogos do Dia',
    description: 'Acesso exclusivo às melhores oportunidades de apostas selecionadas diariamente'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Avançados',
    description: 'Análises detalhadas do seu desempenho com métricas profissionais'
  },
  {
    icon: Zap,
    title: 'Insights Exclusivos',
    description: 'Dados e estatísticas que só membros VIP têm acesso'
  },
  {
    icon: Calendar,
    title: 'Suporte Prioritário',
    description: 'Atendimento preferencial e suporte técnico especializado'
  }
]

export default function VipPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { user, isAuthenticated, isVip, vipPlan } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlMessage = searchParams.get('message')
    if (urlMessage) {
      setMessage(urlMessage)
    }
  }, [searchParams])

  const handleSubscribe = async (planType: string) => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    setLoading(planType)
    setError('')

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Erro ao carregar Stripe')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(null)
    }
  }

  if (isVip()) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Crown className="w-8 h-8" style={{ color: 'var(--green-primary)' }} />
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Você já é VIP!
              </h1>
            </div>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Aproveite todos os recursos exclusivos da plataforma
            </p>
          </div>

          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <Crown className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--green-primary)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Status: VIP Ativo
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Plano: {vipPlan === 'MONTHLY' ? 'Mensal' : 'Anual'}
            </p>
            {user?.vipExpiresAt && (
              <p style={{ color: 'var(--text-secondary)' }}>
                Válido até: {new Date(user.vipExpiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Crown className="w-8 h-8" style={{ color: 'var(--green-primary)' }} />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Torne-se VIP
            </h1>
          </div>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Desbloqueie recursos exclusivos e maximize seus resultados
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-8 p-4 rounded-lg border" style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderColor: 'rgba(59, 130, 246, 0.3)' 
          }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" style={{ color: 'rgba(59, 130, 246, 0.8)' }} />
              <p style={{ color: 'var(--text-primary)' }}>{message}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {vipFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="p-6 rounded-lg text-center"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <IconComponent className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--green-primary)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-8 rounded-lg ${plan.popular ? 'ring-2' : ''}`}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--green-primary)' }}
                >
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {plan.price}
                  </span>
                  <span className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                    {plan.period}
                  </span>
                </div>
                {plan.originalPrice && (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="line-through">{plan.originalPrice}</span>
                    <span className="ml-2 font-semibold" style={{ color: 'var(--green-primary)' }}>
                      Economize R$ 60
                    </span>
                  </p>
                )}
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green-primary)' }} />
                    <span style={{ color: 'var(--text-primary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                  plan.popular ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: plan.popular ? 'var(--green-primary)' : 'var(--bg-tertiary)',
                  color: plan.popular ? 'white' : 'var(--text-primary)',
                  border: plan.popular ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {loading === plan.id ? 'Processando...' : 'Assinar Agora'}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Pagamento seguro processado pelo Stripe • Cancele a qualquer momento
          </p>
        </div>
      </div>
    </div>
  )
}