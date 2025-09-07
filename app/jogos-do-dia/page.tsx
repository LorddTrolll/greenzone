'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, TrendingUp, Target, Globe, Trophy, BarChart3, Home, Zap, Users, Timer, MapPin, Plus, Edit, Trash2, Shield, Lock, Crown, X, Save, ChevronDown, Filter, Grid, List } from 'lucide-react'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useAuth } from '../contexts/AuthContext'
import { useRealtimeSync } from '../contexts/RealtimeSyncContext'

// Custom styles for better scrolling
const customStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .smooth-scroll {
    scroll-behavior: smooth;
  }
`

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (game: Omit<any, 'id'>) => void
  editingGame?: any | null
}

const GameModal = ({ isOpen, onClose, onSave, editingGame }: GameModalProps) => {
  const [formData, setFormData] = useState({
    time: '',
    teams: '',
    league: '',
    market: '',
    odd: 0,
    confidence: 'média' as 'alta' | 'média' | 'baixa',
    status: 'disponível' as 'disponível' | 'finalizado',
    entryValue: 0,
    successRate: 0,
    result: 'pendente' as 'green' | 'red' | 'anulado' | 'pendente',
    category: 'melhores-entradas'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (editingGame) {
      setFormData({
        time: editingGame.time,
        teams: editingGame.teams,
        league: editingGame.league,
        market: editingGame.market,
        odd: editingGame.odd,
        confidence: editingGame.confidence,
        status: editingGame.status,
        entryValue: editingGame.entryValue,
        successRate: editingGame.successRate,
        result: editingGame.result || 'pendente',
        category: editingGame.category
      })
    } else {
      setFormData({
        time: '',
        teams: '',
        league: '',
        market: '',
        odd: 0,
        confidence: 'média',
        status: 'disponível',
        entryValue: 0,
        successRate: 0,
        result: 'pendente',
        category: 'melhores-entradas'
      })
    }
  }, [editingGame, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!mounted || !isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {editingGame ? 'Editar Jogo' : 'Adicionar Jogo'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Horário *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                >
                  <option value="melhores-entradas">Melhores Entradas</option>
                  <option value="apostas-do-dia">Apostas do Dia</option>
                  <option value="alavancagem">Alavancagem</option>
                  <option value="ambas-marcam">Ambas Marcam</option>
                  <option value="brasileirao">Brasileirão</option>
                  <option value="ligas-asiaticas">Ligas Asiáticas</option>
                  <option value="over-15">Over 1.5</option>
                  <option value="casa-vence">Casa Vence</option>
                  <option value="escanteios">Escanteios</option>
                  <option value="chance-dupla">Chance Dupla</option>
                  <option value="gol-ht">Gol HT</option>
                  <option value="gol-st">Gol ST</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nome dos Times *</label>
              <input
                type="text"
                value={formData.teams}
                onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
                placeholder="Ex: Flamengo vs Palmeiras"
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Liga *</label>
                <input
                  type="text"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  placeholder="Ex: Brasileirão, La Liga"
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Mercado *</label>
                <input
                  type="text"
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  placeholder="Ex: Ambas Marcam, Over 2.5"
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Odd *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.odd}
                  onChange={(e) => setFormData({ ...formData, odd: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Valor Entrada (R$) *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.entryValue}
                  onChange={(e) => setFormData({ ...formData, entryValue: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Taxa de Acerto (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.successRate}
                  onChange={(e) => setFormData({ ...formData, successRate: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confiança</label>
                <select
                  value={formData.confidence}
                  onChange={(e) => setFormData({ ...formData, confidence: e.target.value as 'alta' | 'média' | 'baixa' })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="alta">Alta</option>
                  <option value="média">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'disponível' | 'finalizado' })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="disponível">Disponível</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Resultado</label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value as 'green' | 'red' | 'anulado' | 'pendente' })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="pendente">Pendente</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="anulado">Anulado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--green-primary)',
                  color: 'var(--bg-primary)'
                }}
              >
                <Save className="w-4 h-4" />
                {editingGame ? 'Salvar Alterações' : 'Adicionar Jogo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default function JogosDodia() {
  const [activeTab, setActiveTab] = useState('melhores-entradas')
  const [showAddGameModal, setShowAddGameModal] = useState(false)
  const [editingGame, setEditingGame] = useState<any | null>(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [viewMode, setViewMode] = useState<'tabs' | 'dropdown'>('tabs')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['melhores-entradas'])
  
  // Usar contexto de sincronização em tempo real
  const { games, addGame, updateGame, deleteGame, isConnected, lastUpdate } = useRealtimeSync()
  const handleSaveGame = (gameData: Omit<any, 'id'>) => {
    if (editingGame) {
      updateGame(editingGame.id, gameData)
      setEditingGame(null)
    } else {
      addGame(gameData)
    }
  }

  const handleEditGame = (game: any) => {
    setEditingGame(game)
    setShowAddGameModal(true)
  }

  const handleDeleteGame = (gameId: number, category: string) => {
    if (confirm('Tem certeza que deseja excluir este jogo?')) {
      deleteGame(gameId, category)
    }
  }
  const { isAdmin, isVip, isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Categorias disponíveis para usuários não-VIP
  const freeCategories = ['melhores-entradas', 'apostas-do-dia', 'alavancagem']

  // Função para lidar com clique nas abas
  const handleTabClick = (tabId: string) => {
    // Se é admin, tem acesso total
    if (user?.email === 'admin@greenzone.com' || isAdmin()) {
      setActiveTab(tabId)
      return
    }
    
    // Se não é VIP e está tentando acessar categoria restrita
    if (!isVip() && !freeCategories.includes(tabId)) {
      router.push('/vip')
      return
    }
    setActiveTab(tabId)
  }

  const tabs = [
    { id: 'melhores-entradas', label: 'Melhores Entradas', icon: TrendingUp },
    { id: 'apostas-do-dia', label: 'Apostas do Dia', icon: Calendar },
    { id: 'alavancagem', label: 'Alavancagem', icon: BarChart3 },
    { id: 'ambas-marcam', label: '🔒Ambas Marcam', icon: Target },
    { id: 'brasileirao', label: '🔒Brasileirão', icon: Globe },
    { id: 'ligas-asiaticas', label: '🔒Ligas Asiáticas', icon: MapPin },
    { id: 'over-15', label: '🔒Over 1.5', icon: TrendingUp },
    { id: 'casa-vence', label: '🔒Casa Vence', icon: Home },
    { id: 'escanteios', label: '🔒Escanteios', icon: Zap },
    { id: 'chance-dupla', label: '🔒Chance Dupla', icon: Users },
    { id: 'gol-ht', label: '🔒Gol HT', icon: Timer },
    { id: 'gol-st', label: '🔒Gol ST', icon: Clock }
  ]

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'alta': return 'text-green-400'
      case 'média': return 'text-yellow-400'
      case 'baixa': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceBg = (confidence: string) => {
    switch (confidence) {
      case 'alta': return 'bg-green-500/20 border-green-500/30'
      case 'média': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'baixa': return 'bg-red-500/20 border-red-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <ResponsiveLayout>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Jogos do Dia</h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {isConnected ? 'Sincronizado' : 'Desconectado'}
                  </span>
                </div>
              </div>
              <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Análises e oportunidades para hoje</p>
              {lastUpdate && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Última atualização: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
            {isAdmin() && isAuthenticated() && (
              <button 
                onClick={() => setShowAddGameModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto" 
                style={{
                  backgroundColor: 'var(--green-primary)',
                  color: 'var(--bg-primary)'
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap">Adicionar Jogo</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Filtrar Categorias</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('tabs')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'tabs' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700/50'
                }`}
                style={viewMode !== 'tabs' ? { color: 'var(--text-secondary)' } : {}}
                title="Visualização em abas"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('dropdown')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'dropdown' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700/50'
                }`}
                style={viewMode !== 'dropdown' ? { color: 'var(--text-secondary)' } : {}}
                title="Visualização em lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs View */}
          {viewMode === 'tabs' && (
            <div className="w-full">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-md transition-all text-xs sm:text-sm min-h-[40px] ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'hover:bg-gray-700/50'
                      }`}
                      style={activeTab !== tab.id ? { color: 'var(--text-secondary)' } : {}}
                      title={tab.label}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <div className="flex flex-col items-center gap-0.5 min-w-0">
                        <span className="truncate text-center leading-tight">
                          {tab.label.length > 8 ? tab.label.split(' ')[0] : tab.label}
                        </span>
                        {games[tab.id] && games[tab.id].length > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 leading-none ${
                            activeTab === tab.id ? 'bg-white/20' : 'bg-blue-600 text-white'
                          }`}>
                            {games[tab.id].length}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
                </div>
              </div>
            </div>
          )}

          {/* Dropdown View */}
          {viewMode === 'dropdown' && (
            <div className="space-y-3">
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedCategories.length === 1 
                        ? tabs.find(t => t.id === selectedCategories[0])?.label 
                        : `${selectedCategories.length} categorias selecionadas`
                      }
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    showCategoryDropdown ? 'rotate-180' : ''
                  }`} style={{ color: 'var(--text-secondary)' }} />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 p-2 rounded-lg border shadow-lg z-10 max-h-64 overflow-y-auto"
                       style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <div className="space-y-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isSelected = selectedCategories.includes(tab.id)
                        return (
                          <label
                            key={tab.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/30 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories(prev => [...prev, tab.id])
                                } else {
                                  setSelectedCategories(prev => prev.filter(id => id !== tab.id))
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                            <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{tab.label}</span>
                            {games[tab.id] && games[tab.id].length > 0 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                                {games[tab.id].length}
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {selectedCategories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(categoryId => {
                    const tab = tabs.find(t => t.id === categoryId)
                    if (!tab) return null
                    const Icon = tab.icon
                    return (
                      <button
                        key={categoryId}
                        onClick={() => handleTabClick(categoryId)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === categoryId
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-700/50'
                        }`}
                        style={activeTab !== categoryId ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {games[categoryId] && games[categoryId].length > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activeTab === categoryId ? 'bg-white/20' : 'bg-blue-600 text-white'
                          }`}>
                            {games[categoryId].length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 w-full overflow-hidden">
          {(() => {
            // Filter games based on view mode
            let filteredGames = []
            if (viewMode === 'tabs') {
              filteredGames = games[activeTab] || []
            } else {
              // Dropdown mode: show games from selected categories
              filteredGames = selectedCategories.flatMap(categoryId => games[categoryId] || [])
            }
            return filteredGames
          })().length === 0 ? (
            <div className="col-span-full text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum jogo encontrado</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Não há jogos disponíveis nesta categoria no momento.</p>
            </div>
          ) : (
            (() => {
              // Filter games based on view mode
              let filteredGames = []
              if (viewMode === 'tabs') {
                filteredGames = games[activeTab] || []
              } else {
                // Dropdown mode: show games from selected categories
                filteredGames = selectedCategories.flatMap(categoryId => games[categoryId] || [])
              }
              return filteredGames
            })().map((game) => (
              <div
                key={game.id}
                className="p-3 sm:p-4 rounded-xl border transition-all hover:shadow-lg hover:scale-[1.02] duration-200"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{game.time}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs border w-fit ${getConfidenceBg(game.confidence)}`}>
                      <span className={getConfidenceColor(game.confidence)}>Confiança {game.confidence}</span>
                    </div>
                  </div>
                  {isAdmin() && isAuthenticated() && (
                    <div className="flex gap-2 self-end sm:self-start">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Editar jogo"
                      >
                        <Edit className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <button 
                        onClick={() => handleDeleteGame(game.id, game.category)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Excluir jogo"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 break-words" style={{ color: 'var(--text-primary)' }}>{game.teams}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{game.league}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs mb-1 truncate" style={{ color: 'var(--text-secondary)' }}>Mercado</p>
                      <p className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>{game.market}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Odd</p>
                      <p className="font-bold text-green-400 text-sm sm:text-base">{game.odd}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Valor Entrada</p>
                      <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>R$ {game.entryValue}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Taxa Sucesso</p>
                      <p className="font-medium text-blue-400 text-sm sm:text-base">{game.successRate}%</p>
                    </div>
                  </div>

                  {!isVip && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>Upgrade para VIP para ver detalhes completos</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Game Modal */}
        <GameModal
          isOpen={showAddGameModal}
          onClose={() => {
            setShowAddGameModal(false)
            setEditingGame(null)
          }}
          onSave={handleSaveGame}
          editingGame={editingGame}
        />
      </div>
    </ResponsiveLayout>
  )
}