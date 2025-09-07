'use client'

import { useState, useMemo } from 'react'
import { Filter, Calendar, BarChart3, PieChart, TrendingUp, Download, RefreshCw, Target, Globe, Trophy, Home, Zap, Users, Timer, MapPin, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts'
import ResponsiveLayout from '../components/ResponsiveLayout'

interface FilterState {
  categoria: string
  periodo: string
  dataInicio: string
  dataFim: string
  resultado: string
}

interface GameHistoryData {
  id: number
  data: string
  time: string
  teams: string
  league: string
  market: string
  odd: number
  confidence: 'alta' | 'média' | 'baixa'
  status: 'disponível' | 'finalizado'
  entryValue: number
  successRate: number
  result?: 'green' | 'red' | 'anulado'
  categoria: string
}

interface CategoryStats {
  categoria: string
  label: string
  icon: any
  totalJogos: number
  greens: number
  reds: number
  anulados: number
  greenPercentage: number
  redPercentage: number
  totalValue: number
  profit: number
  roi: number
}

const RelatoriosPage = () => {
  const [filters, setFilters] = useState<FilterState>({
    categoria: 'todas',
    periodo: '30-dias',
    dataInicio: '',
    dataFim: '',
    resultado: 'todos'
  })

  const [activeView, setActiveView] = useState<'resumo' | 'categorias' | 'historico'>('resumo')

  // Categorias disponíveis
  const categories = [
    { id: 'melhores-entradas', label: 'Melhores Entradas', icon: TrendingUp },
    { id: 'apostas-do-dia', label: 'Apostas do Dia', icon: Calendar },
    { id: 'alavancagem', label: 'Alavancagem', icon: Zap },
    { id: 'ambas-marcam', label: 'Ambas Marcam', icon: Target },
    { id: 'brasileirao', label: 'Brasileirão', icon: Trophy },
    { id: 'ligas-asiaticas', label: 'Ligas Asiáticas', icon: Globe },
    { id: 'over-15', label: 'Over 1.5', icon: BarChart3 },
    { id: 'casa-vence', label: 'Casa Vence', icon: Home },
    { id: 'escanteios', label: 'Escanteios', icon: MapPin },
    { id: 'chance-dupla', label: 'Chance Dupla', icon: Users },
    { id: 'gol-ht', label: 'Gol HT', icon: Timer },
    { id: 'gol-st', label: 'Gol ST', icon: Clock },
  ]

  // Dados históricos simulados dos Jogos do Dia
  const gameHistoryData: GameHistoryData[] = [
    // Melhores Entradas
    { id: 1, data: '2024-01-30', time: '20:00', teams: 'Flamengo vs Palmeiras', league: 'Brasileirão', market: 'Mais de 2.5 gols', odd: 1.85, confidence: 'alta', status: 'finalizado', entryValue: 150, successRate: 85, result: 'green', categoria: 'melhores-entradas' },
    { id: 2, data: '2024-01-29', time: '18:30', teams: 'São Paulo vs Santos', league: 'Brasileirão', market: 'Ambas marcam', odd: 1.75, confidence: 'alta', status: 'finalizado', entryValue: 100, successRate: 78, result: 'green', categoria: 'melhores-entradas' },
    { id: 3, data: '2024-01-28', time: '16:00', teams: 'Corinthians vs Grêmio', league: 'Brasileirão', market: 'Vitória do Corinthians', odd: 2.20, confidence: 'média', status: 'finalizado', entryValue: 75, successRate: 65, result: 'red', categoria: 'melhores-entradas' },
    
    // Apostas do Dia
    { id: 4, data: '2024-01-27', time: '15:00', teams: 'Real Madrid vs Barcelona', league: 'La Liga', market: 'Over 2.5 gols', odd: 1.90, confidence: 'alta', status: 'finalizado', entryValue: 200, successRate: 82, result: 'green', categoria: 'apostas-do-dia' },
    { id: 5, data: '2024-01-26', time: '17:30', teams: 'Manchester City vs Liverpool', league: 'Premier League', market: 'Ambas marcam', odd: 1.65, confidence: 'alta', status: 'finalizado', entryValue: 180, successRate: 88, result: 'red', categoria: 'apostas-do-dia' },
    
    // Alavancagem
    { id: 6, data: '2024-01-25', time: '21:00', teams: 'PSG vs Marseille', league: 'Ligue 1', market: 'Vitória do PSG', odd: 3.50, confidence: 'média', status: 'finalizado', entryValue: 50, successRate: 55, result: 'green', categoria: 'alavancagem' },
    { id: 7, data: '2024-01-24', time: '19:00', teams: 'Bayern vs Dortmund', league: 'Bundesliga', market: 'Vitória do Bayern', odd: 2.80, confidence: 'baixa', status: 'finalizado', entryValue: 60, successRate: 45, result: 'red', categoria: 'alavancagem' },
    
    // Ambas Marcam
    { id: 8, data: '2024-01-23', time: '19:00', teams: 'Atletico Madrid vs Valencia', league: 'La Liga', market: 'Ambas marcam', odd: 1.80, confidence: 'alta', status: 'finalizado', entryValue: 120, successRate: 80, result: 'green', categoria: 'ambas-marcam' },
    { id: 9, data: '2024-01-22', time: '16:30', teams: 'Roma vs Lazio', league: 'Serie A', market: 'Ambas marcam', odd: 1.70, confidence: 'média', status: 'finalizado', entryValue: 110, successRate: 72, result: 'green', categoria: 'ambas-marcam' },
    
    // Brasileirão
    { id: 10, data: '2024-01-21', time: '19:00', teams: 'Vasco vs Botafogo', league: 'Brasileirão', market: 'Mais de 1.5 gols', odd: 1.45, confidence: 'alta', status: 'finalizado', entryValue: 250, successRate: 92, result: 'green', categoria: 'brasileirao' },
    { id: 11, data: '2024-01-20', time: '20:30', teams: 'Internacional vs Atlético-MG', league: 'Brasileirão', market: 'Over 2.5', odd: 1.85, confidence: 'alta', status: 'finalizado', entryValue: 180, successRate: 85, result: 'red', categoria: 'brasileirao' },
    
    // Over 1.5
    { id: 12, data: '2024-01-19', time: '16:30', teams: 'Bayern Munich vs Dortmund', league: 'Bundesliga', market: 'Over 1.5 gols', odd: 1.25, confidence: 'alta', status: 'finalizado', entryValue: 300, successRate: 95, result: 'green', categoria: 'over-15' },
    { id: 13, data: '2024-01-18', time: '18:00', teams: 'Arsenal vs Chelsea', league: 'Premier League', market: 'Over 1.5 gols', odd: 1.30, confidence: 'alta', status: 'finalizado', entryValue: 280, successRate: 90, result: 'green', categoria: 'over-15' },
    
    // Casa Vence
    { id: 14, data: '2024-01-17', time: '20:30', teams: 'Juventus vs AC Milan', league: 'Serie A', market: 'Vitória da Juventus', odd: 2.05, confidence: 'média', status: 'finalizado', entryValue: 110, successRate: 68, result: 'red', categoria: 'casa-vence' },
    
    // Escanteios
    { id: 15, data: '2024-01-16', time: '18:00', teams: 'Chelsea vs Arsenal', league: 'Premier League', market: 'Mais de 9.5 escanteios', odd: 1.95, confidence: 'alta', status: 'finalizado', entryValue: 85, successRate: 75, result: 'green', categoria: 'escanteios' },
    { id: 16, data: '2024-01-15', time: '21:00', teams: 'Barcelona vs Real Madrid', league: 'La Liga', market: 'Mais de 10.5 escanteios', odd: 2.10, confidence: 'média', status: 'finalizado', entryValue: 90, successRate: 70, result: 'anulado', categoria: 'escanteios' }
  ]

  // Dados para gráfico de evolução (baseado nos jogos históricos)
  const evolutionData = useMemo(() => {
    const sortedGames = [...gameHistoryData].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    let runningBalance = 1000 // Banca inicial
    
    return sortedGames.map(game => {
      const profit = game.result === 'green' ? game.entryValue * (game.odd - 1) : 
                    game.result === 'red' ? -game.entryValue : 0
      runningBalance += profit
      
      return {
        data: new Date(game.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        banca: runningBalance
      }
    })
  }, [gameHistoryData])



  // Dados filtrados
  const filteredGames = gameHistoryData.filter(game => {
    if (filters.periodo !== 'todos') {
      const gameDate = new Date(game.data)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - gameDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (filters.periodo === '7d' && diffDays > 7) return false
      if (filters.periodo === '30d' && diffDays > 30) return false
      if (filters.periodo === '90d' && diffDays > 90) return false
    }
    
    if (filters.categoria !== 'todas' && game.categoria !== filters.categoria) return false
    if (filters.resultado !== 'todos' && game.result !== filters.resultado) return false
    
    return true
  })

  // Cálculos estatísticos baseados nos dados filtrados
  const totalApostas = filteredGames.length
  const apostasGreen = filteredGames.filter(game => game.result === 'green').length
  const apostasRed = filteredGames.filter(game => game.result === 'red').length
  const apostasAnuladas = filteredGames.filter(game => game.result === 'anulado').length
  const winRate = totalApostas > 0 ? (apostasGreen / (totalApostas - apostasAnuladas)) * 100 : 0
  const totalStake = filteredGames.reduce((sum, game) => sum + game.entryValue, 0)
  const totalLucro = filteredGames.reduce((sum, game) => {
    if (game.result === 'green') return sum + (game.entryValue * (game.odd - 1))
    if (game.result === 'red') return sum - game.entryValue
    return sum
  }, 0)
  const roi = totalStake > 0 ? (totalLucro / totalStake) * 100 : 0
  const oddMedia = filteredGames.length > 0 ? filteredGames.reduce((sum, game) => sum + game.odd, 0) / filteredGames.length : 0

  // Estatísticas por categoria
  const categoryStats: CategoryStats[] = categories.map(category => {
    const categoryGames = gameHistoryData.filter(game => game.categoria === category.id)
    const greens = categoryGames.filter(game => game.result === 'green').length
    const reds = categoryGames.filter(game => game.result === 'red').length
    const anulados = categoryGames.filter(game => game.result === 'anulado').length
    const totalValue = categoryGames.reduce((sum, game) => sum + game.entryValue, 0)
    const profit = categoryGames.reduce((sum, game) => {
      if (game.result === 'green') return sum + (game.entryValue * (game.odd - 1))
      if (game.result === 'red') return sum - game.entryValue
      return sum
    }, 0)
    
    return {
      categoria: category.id,
      label: category.label,
      icon: category.icon,
      totalJogos: categoryGames.length,
      greens,
      reds,
      anulados,
      greenPercentage: categoryGames.length > 0 ? (greens / (categoryGames.length - anulados)) * 100 : 0,
      redPercentage: categoryGames.length > 0 ? (reds / (categoryGames.length - anulados)) * 100 : 0,
      totalValue,
      profit,
      roi: totalValue > 0 ? (profit / totalValue) * 100 : 0
    }
  })

  // Dados para gráfico de distribuição por categoria
  const categoryDistributionData = useMemo(() => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
    return categoryStats.map((stat, index) => ({
      name: stat.label,
      value: stat.totalJogos,
      color: colors[index % colors.length]
    })).filter(item => item.value > 0)
  }, [categoryStats])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const exportData = () => {
    // Implementar exportação de dados
    console.log('Exportando dados...')
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Relatórios Estatísticos</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Análise detalhada do seu desempenho</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{ background: 'var(--green-primary)', color: 'var(--bg-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 102, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--green-primary)'}
              >
                <Download size={16} />
                <span>Exportar</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <RefreshCw size={16} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center space-x-2 mb-4">
              <Filter size={20} style={{ color: 'var(--green-primary)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Filtros</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                <select
                  value={filters.categoria}
                  onChange={(e) => handleFilterChange('categoria', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  <option value="todas">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Período</label>
                <select
                  value={filters.periodo}
                  onChange={(e) => handleFilterChange('periodo', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  <option value="7-dias">Últimos 7 dias</option>
                  <option value="30-dias">Últimos 30 dias</option>
                  <option value="90-dias">Últimos 90 dias</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Data Início</label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Data Fim</label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>
          </div>

          {/* Navegação de Visualizações */}
          <div className="flex space-x-1 rounded-xl p-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'resumo', label: 'Resumo', icon: BarChart3 },
              { id: 'categorias', label: 'Por Categoria', icon: Target },
              { id: 'historico', label: 'Histórico', icon: PieChart }
            ].map((view) => {
              const Icon = view.icon
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors flex-1 justify-center"
                  style={{
                    backgroundColor: activeView === view.id ? 'var(--green-primary)' : 'transparent',
                    color: activeView === view.id ? 'var(--bg-primary)' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== view.id) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== view.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span className="font-medium">{view.label}</span>
                </button>
              )
            })}
          </div>

          {/* Conteúdo baseado na visualização ativa */}
          {activeView === 'resumo' && (
            <div className="space-y-6">
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Total de Apostas</h3>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalApostas}</p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <span className="text-green-primary">{apostasGreen} Green</span>
                    <span className="text-red-400">{apostasRed} Red</span>
                    <span className="text-yellow-400">{apostasAnuladas} Anuladas</span>
                  </div>
                </div>
                
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Win Rate</h3>
                  <p className="text-3xl font-bold text-green-primary">{winRate.toFixed(1)}%</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Taxa de acerto</p>
                </div>
                
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>ROI</h3>
                  <p className={`text-3xl font-bold ${roi >= 0 ? 'text-green-primary' : 'text-red-400'}`}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Retorno sobre investimento</p>
                </div>
                
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Lucro/Prejuízo</h3>
                  <p className={`text-3xl font-bold ${totalLucro >= 0 ? 'text-green-primary' : 'text-red-400'}`}>
                    {totalLucro >= 0 ? '+' : ''}R$ {totalLucro.toFixed(2)}
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Resultado total</p>
                </div>
              </div>

              {/* Estatísticas Adicionais */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Estatísticas Gerais</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Odd Média:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{oddMedia.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Total Investido:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>R$ {totalStake.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Stake Médio:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>R$ {(totalStake / totalApostas).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Maior Lucro:</span>
                      <span className="text-green-primary font-medium">R$ {filteredGames.length > 0 ? Math.max(...filteredGames.map(g => g.result === 'green' ? g.entryValue * (g.odd - 1) : g.result === 'red' ? -g.entryValue : 0)).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Maior Prejuízo:</span>
                      <span className="text-red-400 font-medium">R$ {filteredGames.length > 0 ? Math.min(...filteredGames.map(g => g.result === 'green' ? g.entryValue * (g.odd - 1) : g.result === 'red' ? -g.entryValue : 0)).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Distribuição por Esporte</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                 </div>
               </div>
               
               {/* Gráfico de Evolução da Banca */}
               <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                 <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Evolução da Banca</h3>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={evolutionData}>
                       <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                       <XAxis dataKey="data" stroke="var(--text-secondary)" />
                       <YAxis stroke="var(--text-secondary)" />
                       <Tooltip
                         contentStyle={{
                           backgroundColor: 'var(--bg-tertiary)',
                           border: '1px solid var(--border-color)',
                           borderRadius: '8px',
                           color: 'var(--text-primary)'
                         }}
                       />
                       <Line
                         type="monotone"
                         dataKey="banca"
                         stroke="#10B981"
                         strokeWidth={3}
                         dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>
               
               {/* Gráfico de Distribuição por Categoria */}
               <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                 <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Distribuição por Categoria</h3>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                     <RechartsPieChart>
                       <Pie
                         data={categoryDistributionData}
                         cx="50%"
                         cy="50%"
                         outerRadius={100}
                         fill="#8884d8"
                         dataKey="value"
                         label={({ name, value }) => `${name}: ${value}`}
                       >
                         {categoryDistributionData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip
                         contentStyle={{
                           backgroundColor: 'var(--bg-tertiary)',
                           border: '1px solid var(--border-color)',
                           borderRadius: '8px',
                           color: 'var(--text-primary)'
                         }}
                       />
                     </RechartsPieChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             </div>
           )}

          {activeView === 'categorias' && (
            <div className="space-y-6">
              {/* Grid de Categorias */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.categoria} className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-green-primary/10 rounded-lg">
                          <Icon size={20} className="text-green-primary" />
                        </div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.label}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Total de Jogos:</span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{stat.totalJogos}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Win Rate:</span>
                          <span className="text-green-primary font-medium">{stat.greenPercentage.toFixed(1)}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>ROI:</span>
                          <span className={`font-medium ${stat.roi >= 0 ? 'text-green-primary' : 'text-red-400'}`}>
                            {stat.roi >= 0 ? '+' : ''}{stat.roi.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Lucro/Prejuízo:</span>
                          <span className={`font-medium ${stat.profit >= 0 ? 'text-green-primary' : 'text-red-400'}`}>
                            {stat.profit >= 0 ? '+' : ''}R$ {stat.profit.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-primary">{stat.greens} Green</span>
                          <span className="text-red-400">{stat.reds} Red</span>
                          {stat.anulados > 0 && <span className="text-yellow-400">{stat.anulados} Anuladas</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeView === 'historico' && (
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Histórico Detalhado</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Data</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Jogo</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Liga</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Mercado</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Odd</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Valor</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Resultado</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>Lucro/Prejuízo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.map((game) => {
                      const profit = game.result === 'green' ? game.entryValue * (game.odd - 1) : 
                                   game.result === 'red' ? -game.entryValue : 0
                      return (
                        <tr 
                          key={game.id} 
                          className="transition-colors duration-200" 
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{new Date(game.data).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{game.teams}</td>
                          <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{game.league}</td>
                          <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{game.market}</td>
                          <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{game.odd.toFixed(2)}</td>
                          <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>R$ {game.entryValue.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              game.result === 'green' ? 'bg-green-primary/10 text-green-primary' :
                              game.result === 'red' ? 'bg-red-400/10 text-red-400' :
                              'bg-yellow-400/10 text-yellow-400'
                            }`}>
                              {game.result?.toUpperCase() || 'PENDENTE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium" style={{
                            color: profit > 0 ? 'var(--green-primary)' :
                                   profit < 0 ? '#EF4444' : 'var(--text-secondary)'
                          }}>
                            {profit > 0 ? '+' : ''}R$ {profit.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </ResponsiveLayout>
  )
}

export default RelatoriosPage