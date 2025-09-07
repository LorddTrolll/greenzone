'use client'

import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Crown, Calendar, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'
import BankChart from './BankChart'
import BetsHistory from './BetsHistory'

const Dashboard = () => {
  const { user, isVip, vipPlan, vipExpiresAt } = useAuth()
  const isUserVip = isVip()

  // Função para formatar a data de expiração
  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Função para verificar se a assinatura está expirando em breve (próximos 7 dias)
  const isExpiringSoon = () => {
    if (!vipExpiresAt) return false
    const expirationDate = new Date(vipExpiresAt)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const stats = [
    {
      title: 'Banca Atual',
      value: 'R$ 2.450,00',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Lucro/Prejuízo',
      value: 'R$ +340,00',
      change: '+8.2%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: 'ROI (%)',
      value: '16.1%',
      change: '+2.1%',
      isPositive: true,
      icon: BarChart3,
    },
    {
      title: 'Win Rate (%)',
      value: '68.4%',
      change: '-1.2%',
      isPositive: false,
      icon: Target,
    },
  ]

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visão geral das suas apostas e performance</p>
      </div>

      {/* Status da Assinatura - Para todos os usuários */}
      <div 
        className="rounded-xl p-3 mb-3 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" 
        style={{ 
          background: isUserVip 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(34, 197, 94, 0.1) 50%, rgba(16, 185, 129, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(156, 163, 175, 0.1) 50%, rgba(107, 114, 128, 0.05) 100%)',
          border: isUserVip 
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid rgba(107, 114, 128, 0.3)',
          boxShadow: isUserVip 
            ? '0 10px 25px -5px rgba(16, 185, 129, 0.2), 0 8px 10px -6px rgba(16, 185, 129, 0.1)'
            : '0 10px 25px -5px rgba(107, 114, 128, 0.1), 0 8px 10px -6px rgba(107, 114, 128, 0.05)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
          {/* Efeito shimmer animado */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
              animation: 'shimmer 3s ease-in-out infinite'
            }}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg" style={{ 
                backgroundColor: isUserVip ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'
              }}>
                <Crown 
                  size={24} 
                  style={{ color: isUserVip ? 'var(--green-primary)' : 'var(--text-secondary)' }} 
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {isUserVip ? 'Membro VIP Ativo' : 'Membro Padrão'}
                </h3>
                <div className="space-y-1">
                  {isUserVip ? (
                    <>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Plano: {vipPlan === 'MONTHLY' ? 'Mensal' : 'Anual'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                        <p className="text-sm" style={{ 
                          color: isExpiringSoon() ? '#f59e0b' : 'var(--text-secondary)' 
                        }}>
                          Expira em: {formatExpirationDate(vipExpiresAt)}
                          {isExpiringSoon() && ' (Renovar em breve!)'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Faça upgrade para acessar recursos exclusivos
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {isUserVip ? (
              isExpiringSoon() ? (
                <Link href="/vip">
                  <button className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors" style={{
                    backgroundColor: '#f59e0b',
                    color: 'white'
                  }}>
                    <Crown size={16} />
                    <span>Renovar</span>
                  </button>
                </Link>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <Crown size={16} style={{ color: 'var(--green-primary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--green-primary)' }}>Ativo</span>
                </div>
              )
            ) : (
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  border: '1px solid rgba(107, 114, 128, 0.3)'
                }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Inativo</span>
                </div>
                <Link href="/vip">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105" style={{
                    backgroundColor: 'var(--green-primary)',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    <Zap size={14} />
                    <span>Tornar-se VIP</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Recursos */}
          <div className="mt-4 pt-4" style={{ 
            borderTop: isUserVip 
              ? '1px solid rgba(16, 185, 129, 0.2)' 
              : '1px solid rgba(107, 114, 128, 0.2)' 
          }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {isUserVip ? 'Recursos VIP Disponíveis:' : 'Recursos Disponíveis com VIP:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {isUserVip ? (
                <>
                  <Link href="/jogos-do-dia">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105" style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--green-primary)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      🎯 Jogos do Dia
                    </span>
                  </Link>
                  <Link href="/relatorios">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105" style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--green-primary)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                      📊 Relatórios Avançados
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium opacity-60" style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(107, 114, 128, 0.3)'
                  }}>
                    🔒 Jogos do Dia
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium opacity-60" style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(107, 114, 128, 0.3)'
                  }}>
                    🔒 Relatórios Avançados
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium opacity-60" style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(107, 114, 128, 0.3)'
                  }}>
                    🔒 Análises Exclusivas
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium opacity-60" style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(107, 114, 128, 0.3)'
                  }}>
                    🔒 Suporte Prioritário
                  </span>
                </>
              )}
            </div>
          </div>
        </div>



      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div
              key={index}
              className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer"
              style={{ 
                background: stat.isPositive 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(16, 185, 129, 0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 50%, rgba(239, 68, 68, 0.02) 100%)',
                border: stat.isPositive 
                  ? '1px solid rgba(16, 185, 129, 0.2)'
                  : '1px solid rgba(239, 68, 68, 0.2)',
                boxShadow: stat.isPositive 
                  ? '0 8px 32px rgba(16, 185, 129, 0.1)'
                  : '0 8px 32px rgba(239, 68, 68, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 rounded-lg group-hover:scale-110 transition-all duration-300" style={{
                  background: stat.isPositive 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  boxShadow: stat.isPositive 
                    ? '0 4px 16px rgba(16, 185, 129, 0.2)'
                    : '0 4px 16px rgba(239, 68, 68, 0.2)'
                }}>
                  <IconComponent 
                    size={26} 
                    style={{ color: stat.isPositive ? 'var(--green-primary)' : '#ef4444' }} 
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.isPositive ? (
                  <TrendingUp size={16} style={{ color: 'var(--green-primary)' }} />
                ) : (
                  <TrendingDown size={16} style={{ color: '#ef4444' }} />
                )}
                <span 
                  className="text-sm font-medium ml-1"
                  style={{ color: stat.isPositive ? 'var(--green-primary)' : '#ef4444' }}
                >
                  {stat.change}
                </span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                  vs mês anterior
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráfico de Evolução da Banca */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Evolução da Banca</h2>
        <BankChart />
      </div>

      {/* Histórico de Apostas */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Histórico de Apostas Recentes</h2>
        <BetsHistory />
      </div>
    </div>
  )
}

export default Dashboard