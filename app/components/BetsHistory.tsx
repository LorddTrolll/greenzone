'use client'

import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, Clock, Filter, Download, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Componente de Tooltip personalizado
const CustomTooltip = ({ content, children }: { content: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
      {children}
      {isVisible && (
        <div 
          className="fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {content}
          <div className="tooltip-arrow" style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#1f2937 transparent transparent transparent'
          }}></div>
        </div>
      )}
    </div>
  )
}

interface Bet {
  id: number
  date: string
  time: string
  event: string
  market: string
  betType: 'simples' | 'multipla' | 'sistema'
  odd: number
  stake: number
  result: 'win' | 'loss' | 'pending'
  profit: number
}

interface FilterState {
  dateFrom: string
  dateTo: string
  betType: string
  result: string
}

const BetsHistory = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    betType: '',
    result: ''
  })

  // Dados de exemplo
  const sampleBets: Bet[] = [
    {
      id: 1,
      date: '15/12/2024',
      time: '14:30',
      event: 'Flamengo vs Palmeiras',
      market: 'Resultado Final',
      betType: 'simples',
      odd: 2.15,
      stake: 100,
      result: 'win',
      profit: 115
    },
    {
      id: 2,
      date: '14/12/2024',
      time: '16:00',
      event: 'São Paulo vs Corinthians',
      market: 'Ambas Marcam',
      betType: 'simples',
      odd: 1.85,
      stake: 150,
      result: 'loss',
      profit: -150
    },
    {
      id: 3,
      date: '13/12/2024',
      time: '20:00',
      event: 'Real Madrid vs Barcelona',
      market: 'Over 2.5 Gols',
      betType: 'multipla',
      odd: 3.20,
      stake: 75,
      result: 'pending',
      profit: 0
    },
    {
      id: 4,
      date: '12/12/2024',
      time: '15:45',
      event: 'Manchester City vs Liverpool',
      market: 'Resultado Final',
      betType: 'simples',
      odd: 2.80,
      stake: 200,
      result: 'win',
      profit: 360
    },
    {
      id: 5,
      date: '11/12/2024',
      time: '18:30',
      event: 'PSG vs Monaco',
      market: 'Handicap Asiático',
      betType: 'sistema',
      odd: 1.95,
      stake: 120,
      result: 'loss',
      profit: -120
    }
  ]

  // Filtrar apostas
  const filteredBets = useMemo(() => {
    return sampleBets.filter(bet => {
      const betDate = new Date(bet.date.split('/').reverse().join('-'))
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null

      if (fromDate && betDate < fromDate) return false
      if (toDate && betDate > toDate) return false
      if (filters.betType && bet.betType !== filters.betType) return false
      if (filters.result && bet.result !== filters.result) return false

      return true
    })
  }, [filters])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalBets = filteredBets.length
    const wins = filteredBets.filter(bet => bet.result === 'win').length
    const losses = filteredBets.filter(bet => bet.result === 'loss').length
    const pending = filteredBets.filter(bet => bet.result === 'pending').length
    const totalProfit = filteredBets.reduce((sum, bet) => sum + bet.profit, 0)
    const totalStake = filteredBets.reduce((sum, bet) => sum + bet.stake, 0)
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0

    return {
      totalBets,
      wins,
      losses,
      pending,
      totalProfit,
      totalStake,
      winRate
    }
  }, [filteredBets])

  // Dados para o gráfico de linha
  const lineData = useMemo(() => {
    if (filteredBets.length === 0) return []

    const sortedBets = [...filteredBets].sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'))
      const dateB = new Date(b.date.split('/').reverse().join('-'))
      return dateA.getTime() - dateB.getTime()
    })

    let cumulativeWins = 0
    let cumulativeLosses = 0
    let cumulativePending = 0
    let cumulativeProfit = 0

    const dataPoints = sortedBets.map((bet, index) => {
      if (bet.result === 'win') cumulativeWins++
      else if (bet.result === 'loss') cumulativeLosses++
      else cumulativePending++
      
      cumulativeProfit += bet.profit

      return {
        date: bet.date,
        dateFormatted: new Date(bet.date.split('/').reverse().join('-')).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        wins: cumulativeWins,
        losses: cumulativeLosses,
        pending: cumulativePending,
        profit: cumulativeProfit,
        winRate: cumulativeWins + cumulativeLosses > 0 ? (cumulativeWins / (cumulativeWins + cumulativeLosses)) * 100 : 0
      }
    })

    return dataPoints
  }, [filteredBets])

  // Função para exportar CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Hora', 'Evento', 'Mercado', 'Tipo', 'Odd', 'Valor Apostado', 'Resultado', 'Lucro/Prejuízo']
    const csvData = filteredBets.map(bet => [
      bet.date,
      bet.time,
      bet.event,
      bet.market,
      bet.betType,
      bet.odd.toFixed(2),
      `R$ ${bet.stake.toLocaleString('pt-BR')}`,
      bet.result === 'win' ? 'Vitória' : bet.result === 'loss' ? 'Derrota' : 'Pendente',
      bet.result === 'pending' ? '-' : `R$ ${bet.profit.toLocaleString('pt-BR')}`
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico-apostas-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win':
        return <CheckCircle className="text-green-primary" size={18} />
      case 'loss':
        return <XCircle className="text-red-400" size={18} />
      case 'pending':
        return <Clock className="text-yellow-400" size={18} />
      default:
        return null
    }
  }

  const getResultText = (result: string) => {
    switch (result) {
      case 'win':
        return 'Vitória'
      case 'loss':
        return 'Derrota'
      case 'pending':
        return 'Pendente'
      default:
        return ''
    }
  }

  const getProfitColor = (profit: number, result: string) => {
    if (result === 'pending') return 'text-yellow-400'
    return profit > 0 ? 'text-green-primary' : 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center space-x-2 mb-4">
          <Filter style={{ color: 'var(--green-primary)' }} size={20} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Data Inicial</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Data Final</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Tipo de Aposta</label>
            <select
              value={filters.betType}
              onChange={(e) => setFilters(prev => ({ ...prev, betType: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">Todos</option>
              <option value="simples">Simples</option>
              <option value="multipla">Múltipla</option>
              <option value="sistema">Sistema</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Resultado</label>
            <select
              value={filters.result}
              onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value }))}
              className="w-full p-2 rounded border"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">Todos</option>
              <option value="win">Vitória</option>
              <option value="loss">Derrota</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>
      </div>



      {/* Estatísticas */}
      <div className="rounded-lg p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Resumo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalBets}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total de Apostas</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              stats.totalProfit >= 0 ? 'text-green-primary' : 'text-red-400'
            }`}>
              {stats.totalProfit >= 0 ? '+' : ''}R$ {stats.totalProfit.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Saldo Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>R$ {stats.totalStake.toLocaleString('pt-BR')}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Apostado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{filteredBets.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Apostas Filtradas</div>
          </div>
        </div>
      </div>

      {/* Layout Grid: Gráfico e Histórico */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Gráfico */}
        <div>
          <div className="backdrop-blur-sm rounded-xl p-4 shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <div className="w-2 h-6 bg-green-primary rounded-full"></div>
                Evolução dos Resultados
              </h3>
              <div className="text-xs px-2 py-1 rounded-full" style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' }}>
                {stats.totalBets} apostas
              </div>
            </div>
            
            {lineData.length > 0 ? (
              <div className="space-y-3">
                <div className="w-full">
                  <div className="rounded-lg p-3 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)' }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={lineData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#374151" 
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="dateFormatted"
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f1f1f', 
                            border: '1px solid #00ff66', 
                            borderRadius: '16px',
                            color: '#fff',
                            boxShadow: '0 20px 40px rgba(0,255,102,0.1), 0 0 20px rgba(0,255,102,0.05)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                          labelFormatter={(label) => `Data: ${label}`}
                          formatter={(value, name) => {
                            if (name === 'profit') {
                              return [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Lucro Acumulado']
                            }
                            if (name === 'winRate') {
                              return [`${Number(value).toFixed(1)}%`, 'Taxa de Acerto']
                            }
                            return [value, name]
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ color: '#fff', fontSize: '14px' }}
                          formatter={(value) => {
                            const labels = {
                              wins: 'Vitórias',
                              losses: 'Derrotas', 
                              pending: 'Pendentes',
                              profit: 'Lucro Acumulado',
                              winRate: 'Taxa de Acerto (%)'
                            }
                            return labels[value] || value
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="wins" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="losses" 
                          stroke="#EF4444" 
                          strokeWidth={3}
                          dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#EF4444' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pending" 
                          stroke="#F59E0B" 
                          strokeWidth={3}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#F59E0B' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={24} />
                </div>
                <div className="text-lg font-medium mb-2">Nenhum dado disponível</div>
                <div className="text-sm text-center">
                  Ajuste os filtros ou adicione apostas para visualizar os resultados
                </div>
              </div>
            )}
          </div>
          
          {/* Mini Balões de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(16, 185, 129, 0.02) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Vitórias</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.wins}</p>
                </div>
                <div className="p-3 rounded-lg group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)' }}>
                  <CheckCircle size={26} style={{ color: 'var(--green-primary)' }} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-4 h-4 rounded-full" style={{ background: 'var(--green-primary)' }}></div>
                <span className="text-sm font-medium ml-2" style={{ color: 'var(--green-primary)' }}>Ganhas</span>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 50%, rgba(239, 68, 68, 0.02) 100%)', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Derrotas</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.losses}</p>
                </div>
                <div className="p-3 rounded-lg group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)', boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)' }}>
                  <XCircle size={26} style={{ color: '#ef4444' }} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-4 h-4 rounded-full" style={{ background: '#ef4444' }}></div>
                <span className="text-sm font-medium ml-2" style={{ color: '#ef4444' }}>Perdidas</span>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 50%, rgba(245, 158, 11, 0.02) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pendentes</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.pending}</p>
                </div>
                <div className="p-3 rounded-lg group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)' }}>
                  <Clock size={26} style={{ color: '#f59e0b' }} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-4 h-4 rounded-full" style={{ background: '#f59e0b' }}></div>
                <span className="text-sm font-medium ml-2" style={{ color: '#f59e0b' }}>Em andamento</span>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 50%, rgba(99, 102, 241, 0.02) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Taxa de Acerto</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.winRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 rounded-lg group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(129, 140, 248, 0.1) 100%)', boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#6366f1' }}>
                    <span className="text-white text-xs font-bold">%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="w-4 h-4 rounded-full" style={{ background: '#6366f1' }}></div>
                <span className="text-sm font-medium ml-2" style={{ color: '#6366f1' }}>Precisão</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabela de Histórico */}
        <div className="backdrop-blur-sm rounded-xl p-4 shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-2 h-6 bg-green-primary rounded-full"></div>
              Histórico Detalhado
            </h3>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, var(--green-primary) 0%, #059669 100%)', 
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--green-primary) transparent' }}>
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Data/Hora</th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Evento</th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Odd</th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Valor</th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Resultado</th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBets.map((bet) => (
                    <tr key={bet.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="p-3">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{bet.date}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bet.time}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{bet.event}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{bet.market}</div>
                      </td>
                      <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>{bet.odd.toFixed(2)}</td>
                      <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>R$ {bet.stake.toLocaleString('pt-BR')}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getResultIcon(bet.result)}
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{getResultText(bet.result)}</span>
                        </div>
                      </td>
                      <td className={`p-3 text-sm font-medium ${getProfitColor(bet.profit, bet.result)}`}>
                        {bet.result === 'pending' ? '-' : (
                          bet.profit >= 0 ? `+R$ ${bet.profit.toLocaleString('pt-BR')}` : `R$ ${bet.profit.toLocaleString('pt-BR')}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BetsHistory