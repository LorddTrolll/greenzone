'use client'

import { useState } from 'react'
import { Plus, Trash2, Calculator, Save } from 'lucide-react'
import ResponsiveLayout from '../components/ResponsiveLayout'

interface Bet {
  id: number
  teams: string
  market: string
  stake: number
  unit: number
  odd: number | string
  result: 'green' | 'red' | 'anulado' | 'pendente'
}

interface MultipleBetSelection {
  id: number
  teams: string
  market: string
  odd: number | string
}

interface MultipleBet {
  id: number
  selections: MultipleBetSelection[]
  stake: number
  unit: number
  totalOdd: number
  result: 'green' | 'red' | 'anulado' | 'pendente'
}

const RegistroPage = () => {
  const [bets, setBets] = useState<Bet[]>([])
  const [multipleBets, setMultipleBets] = useState<MultipleBet[]>([])
  const [currentBet, setCurrentBet] = useState<Partial<Bet>>({
    teams: '',
    market: '',
    stake: 0,
    unit: 1,
    odd: 0,
    result: 'pendente'
  })
  
  const [currentMultipleBet, setCurrentMultipleBet] = useState<{
    selections: MultipleBetSelection[]
    stake: number
    unit: number
  }>({
    selections: [],
    stake: 0,
    unit: 1
  })
  
  const [currentSelection, setCurrentSelection] = useState<Omit<MultipleBetSelection, 'id'>>({
    teams: '',
    market: '',
    odd: 0
  })
  
  const [showMultipleBet, setShowMultipleBet] = useState(false)
  const [useUnits, setUseUnits] = useState(false)
  const [bankroll, setBankroll] = useState(2000)
  const [unitValue, setUnitValue] = useState(1) // % da banca

  const calculateStakeFromUnit = (unit: number) => {
    return (bankroll * unitValue * unit) / 100
  }

  const calculateProfit = (bet: Bet) => {
    if (bet.result === 'green') {
      const oddValue = typeof bet.odd === 'string' ? parseFloat(bet.odd) : bet.odd
      return bet.stake * (oddValue - 1)
    } else if (bet.result === 'red') {
      return -bet.stake
    }
    return 0
  }

  const addBet = () => {
    if (currentBet.teams && currentBet.market && currentBet.odd) {
      const stake = useUnits ? calculateStakeFromUnit(currentBet.unit || 1) : currentBet.stake || 0
      const newBet: Bet = {
        id: Date.now(),
        teams: currentBet.teams || '',
        market: currentBet.market || '',
        stake,
        unit: currentBet.unit || 1,
        odd: currentBet.odd || 0,
        result: currentBet.result || 'pendente'
      }
      setBets([...bets, newBet])
      setCurrentBet({
        teams: '',
        market: '',
        stake: 0,
        unit: 1,
        odd: 0,
        result: 'pendente'
      })
    }
  }
  
  const addSelectionToMultiple = () => {
    if (currentSelection.teams && currentSelection.market && (typeof currentSelection.odd === 'string' ? parseFloat(currentSelection.odd) : currentSelection.odd) > 0) {
      const newSelection: MultipleBetSelection = {
        ...currentSelection,
        id: Date.now()
      }
      setCurrentMultipleBet({
        ...currentMultipleBet,
        selections: [...currentMultipleBet.selections, newSelection]
      })
      setCurrentSelection({
        teams: '',
        market: '',
        odd: 0
      })
    }
  }
  
  const removeSelectionFromMultiple = (id: number) => {
    setCurrentMultipleBet({
      ...currentMultipleBet,
      selections: currentMultipleBet.selections.filter(s => s.id !== id)
    })
  }
  
  const calculateTotalOdd = (selections: MultipleBetSelection[]) => {
    return selections.reduce((total, selection) => {
      const oddValue = typeof selection.odd === 'string' ? parseFloat(selection.odd) : selection.odd
      return total * oddValue
    }, 1)
  }

  const getCurrentSelectionOddValue = () => {
    return typeof currentSelection.odd === 'string' ? parseFloat(currentSelection.odd) : currentSelection.odd
  }
  
  const addMultipleBet = () => {
    if (currentMultipleBet.selections.length >= 2) {
      const stake = useUnits ? calculateStakeFromUnit(currentMultipleBet.unit) : currentMultipleBet.stake
      const totalOdd = calculateTotalOdd(currentMultipleBet.selections)
      const newMultipleBet: MultipleBet = {
        id: Date.now(),
        selections: currentMultipleBet.selections,
        stake,
        unit: currentMultipleBet.unit,
        totalOdd,
        result: 'pendente'
      }
      setMultipleBets([...multipleBets, newMultipleBet])
      setCurrentMultipleBet({
        selections: [],
        stake: 0,
        unit: 1
      })
      setShowMultipleBet(false)
    }
  }
  
  const removeMultipleBet = (id: number) => {
    setMultipleBets(multipleBets.filter(bet => bet.id !== id))
  }
  
  const updateMultipleBetResult = (id: number, result: MultipleBet['result']) => {
    setMultipleBets(multipleBets.map(bet => 
      bet.id === id ? { ...bet, result } : bet
    ))
  }
  
  const calculateMultipleBetProfit = (bet: MultipleBet) => {
    switch (bet.result) {
      case 'green':
        return (bet.stake * bet.totalOdd) - bet.stake
      case 'red':
        return -bet.stake
      case 'anulado':
        return 0
      default:
        return 0
    }
  }

  const removeBet = (id: number) => {
    setBets(bets.filter(bet => bet.id !== id))
  }

  const updateBetResult = (id: number, result: 'green' | 'red' | 'anulado') => {
    setBets(bets.map(bet => bet.id === id ? { ...bet, result } : bet))
  }

  const totalProfit = bets.reduce((sum, bet) => sum + calculateProfit(bet), 0) + 
                     multipleBets.reduce((sum, bet) => sum + calculateMultipleBetProfit(bet), 0)
  const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0) + 
                     multipleBets.reduce((sum, bet) => sum + bet.stake, 0)
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0

  return (
    <ResponsiveLayout>
      <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Registro de Apostas</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Adicione e gerencie suas apostas</p>
          </div>

          {/* Configurações de Banca */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Configurações de Banca</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Banca Inicial</label>
                <input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Number(e.target.value))}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)' 
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Valor da Unidade (%)</label>
                <input
                  type="number"
                  value={unitValue}
                  onChange={(e) => setUnitValue(Number(e.target.value))}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)' 
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  step="0.1"
                  min="0.1"
                  max="10"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={useUnits}
                    onChange={(e) => setUseUnits(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--green-primary)' }}
                  />
                  <span>Usar Unidades</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tipo de Aposta */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Tipo de Aposta</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowMultipleBet(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: !showMultipleBet ? 'var(--green-primary)' : 'var(--bg-tertiary)',
                  color: !showMultipleBet ? 'var(--bg-primary)' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (showMultipleBet) {
                    e.currentTarget.style.backgroundColor = 'var(--border-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (showMultipleBet) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }
                }}
              >
                Aposta Simples
              </button>
              <button
                onClick={() => setShowMultipleBet(true)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: showMultipleBet ? 'var(--green-primary)' : 'var(--bg-tertiary)',
                  color: showMultipleBet ? 'var(--bg-primary)' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!showMultipleBet) {
                    e.currentTarget.style.backgroundColor = 'var(--border-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showMultipleBet) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }
                }}
              >
                Aposta Múltipla
              </button>
            </div>
          </div>

          {/* Formulário de Nova Aposta */}
          {!showMultipleBet ? (
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Nova Aposta Simples</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Times/Evento</label>
                  <input
                    type="text"
                    value={currentBet.teams}
                    onChange={(e) => setCurrentBet({ ...currentBet, teams: e.target.value })}
                    placeholder="Ex: Flamengo vs Palmeiras"
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
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Mercado</label>
                  <select
                    value={currentBet.market}
                    onChange={(e) => setCurrentBet({ ...currentBet, market: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  >
                    <option value="">Selecione o mercado</option>
                    
                    {/* Mercados de Resultado */}
                    <optgroup label="🏆 Resultado da Partida">
                      <option value="Vitória Casa">Vitória Casa (1)</option>
                      <option value="Empate">Empate (X)</option>
                      <option value="Vitória Visitante">Vitória Visitante (2)</option>
                      <option value="Dupla Chance 1X">Dupla Chance 1X</option>
                      <option value="Dupla Chance 12">Dupla Chance 12</option>
                      <option value="Dupla Chance X2">Dupla Chance X2</option>
                    </optgroup>
                    
                    {/* Mercados de Gols */}
                    <optgroup label="⚽ Mercados de Gols">
                      <option value="Over 0.5">Over 0.5 gols</option>
                      <option value="Under 0.5">Under 0.5 gols</option>
                      <option value="Over 1.5">Over 1.5 gols</option>
                      <option value="Under 1.5">Under 1.5 gols</option>
                      <option value="Over 2.5">Over 2.5 gols</option>
                      <option value="Under 2.5">Under 2.5 gols</option>
                      <option value="Over 3.5">Over 3.5 gols</option>
                      <option value="Under 3.5">Under 3.5 gols</option>
                      <option value="Over 4.5">Over 4.5 gols</option>
                      <option value="Under 4.5">Under 4.5 gols</option>
                    </optgroup>
                    
                    {/* Ambas Marcam */}
                    <optgroup label="🥅 Ambas as Equipes Marcam">
                      <option value="Ambas marcam - Sim">Ambas marcam - Sim</option>
                      <option value="Ambas marcam - Não">Ambas marcam - Não</option>
                    </optgroup>
                    
                    {/* Primeiro Tempo */}
                    <optgroup label="⏰ Primeiro Tempo">
                      <option value="1T - Vitória Casa">1T - Vitória Casa</option>
                      <option value="1T - Empate">1T - Empate</option>
                      <option value="1T - Vitória Visitante">1T - Vitória Visitante</option>
                      <option value="1T - Over 0.5">1T - Over 0.5 gols</option>
                      <option value="1T - Under 0.5">1T - Under 0.5 gols</option>
                      <option value="1T - Over 1.5">1T - Over 1.5 gols</option>
                      <option value="1T - Under 1.5">1T - Under 1.5 gols</option>
                      <option value="1T - Ambas marcam">1T - Ambas marcam</option>
                    </optgroup>
                    
                    {/* Segundo Tempo */}
                    <optgroup label="⏱️ Segundo Tempo">
                      <option value="2T - Vitória Casa">2T - Vitória Casa</option>
                      <option value="2T - Empate">2T - Empate</option>
                      <option value="2T - Vitória Visitante">2T - Vitória Visitante</option>
                      <option value="2T - Over 0.5">2T - Over 0.5 gols</option>
                      <option value="2T - Under 0.5">2T - Under 0.5 gols</option>
                      <option value="2T - Over 1.5">2T - Over 1.5 gols</option>
                      <option value="2T - Under 1.5">2T - Under 1.5 gols</option>
                      <option value="2T - Ambas marcam">2T - Ambas marcam</option>
                    </optgroup>
                    
                    {/* Escanteios */}
                    <optgroup label="🚩 Escanteios">
                      <option value="Escanteios Over 8.5">Escanteios Over 8.5</option>
                      <option value="Escanteios Under 8.5">Escanteios Under 8.5</option>
                      <option value="Escanteios Over 9.5">Escanteios Over 9.5</option>
                      <option value="Escanteios Under 9.5">Escanteios Under 9.5</option>
                      <option value="Escanteios Over 10.5">Escanteios Over 10.5</option>
                      <option value="Escanteios Under 10.5">Escanteios Under 10.5</option>
                      <option value="Escanteios Over 11.5">Escanteios Over 11.5</option>
                      <option value="Escanteios Under 11.5">Escanteios Under 11.5</option>
                      <option value="Escanteios 1T Over 4.5">Escanteios 1T Over 4.5</option>
                      <option value="Escanteios 1T Under 4.5">Escanteios 1T Under 4.5</option>
                    </optgroup>
                    
                    {/* Cartões */}
                    <optgroup label="🟨 Cartões">
                      <option value="Cartões Over 2.5">Cartões Over 2.5</option>
                      <option value="Cartões Under 2.5">Cartões Under 2.5</option>
                      <option value="Cartões Over 3.5">Cartões Over 3.5</option>
                      <option value="Cartões Under 3.5">Cartões Under 3.5</option>
                      <option value="Cartões Over 4.5">Cartões Over 4.5</option>
                      <option value="Cartões Under 4.5">Cartões Under 4.5</option>
                    </optgroup>
                    
                    {/* Handicap Asiático */}
                    <optgroup label="⚖️ Handicap Asiático">
                      <option value="Handicap Casa -0.5">Handicap Casa -0.5</option>
                      <option value="Handicap Casa -1.0">Handicap Casa -1.0</option>
                      <option value="Handicap Casa -1.5">Handicap Casa -1.5</option>
                      <option value="Handicap Visitante -0.5">Handicap Visitante -0.5</option>
                      <option value="Handicap Visitante -1.0">Handicap Visitante -1.0</option>
                      <option value="Handicap Visitante -1.5">Handicap Visitante -1.5</option>
                    </optgroup>
                    
                    {/* Outros Mercados */}
                    <optgroup label="🎯 Outros Mercados">
                      <option value="Primeiro Gol Casa">Primeiro Gol - Casa</option>
                      <option value="Primeiro Gol Visitante">Primeiro Gol - Visitante</option>
                      <option value="Último Gol Casa">Último Gol - Casa</option>
                      <option value="Último Gol Visitante">Último Gol - Visitante</option>
                      <option value="Gol Ímpar/Par">Total de Gols Ímpar/Par</option>
                      <option value="Casa marca primeiro">Casa marca primeiro</option>
                      <option value="Visitante marca primeiro">Visitante marca primeiro</option>
                      <option value="Casa vence sem sofrer">Casa vence sem sofrer gol</option>
                      <option value="Visitante vence sem sofrer">Visitante vence sem sofrer gol</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Odd <span className="text-xs opacity-75">(Cotação)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={currentBet.odd || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          setCurrentBet({ ...currentBet, odd: '' })
                        } else {
                          const numValue = Number(value)
                          if (numValue >= 1) {
                            setCurrentBet({ ...currentBet, odd: numValue })
                          }
                        }
                      }}
                      placeholder="Ex: 2.15"
                      step="0.01"
                      min="1.01"
                      className="w-full rounded-lg px-3 py-2 focus:outline-none transition-all duration-200 font-mono"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '2px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--green-primary)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)'
                        e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    />

                    {currentBet.odd && (typeof currentBet.odd === 'string' ? parseFloat(currentBet.odd) : currentBet.odd) < 1.01 && (
                      <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                        Odd deve ser maior que 1.00
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {useUnits ? (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Unidades</label>
                    <input
                      type="number"
                      value={currentBet.unit}
                      onChange={(e) => setCurrentBet({ ...currentBet, unit: Number(e.target.value) })}
                      placeholder="Ex: 2"
                      min="0.5"
                      step="0.5"
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Stake: R$ {calculateStakeFromUnit(currentBet.unit || 1).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Stake (R$)</label>
                    <input
                      type="number"
                      value={currentBet.stake}
                      onChange={(e) => setCurrentBet({ ...currentBet, stake: Number(e.target.value) })}
                      placeholder="Ex: 100"
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
                )}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Resultado</label>
                  <select
                    value={currentBet.result}
                    onChange={(e) => setCurrentBet({ ...currentBet, result: e.target.value as any })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                    <option value="anulado">Anulado</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addBet}
                    className="w-full bg-green-primary text-dark-bg font-semibold py-2 px-4 rounded-lg hover:bg-green-primary/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Adicionar Aposta</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
             <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
               <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Nova Aposta Múltipla</h2>
               
               {/* Adicionar Seleção */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Times/Evento</label>
                <input
                  type="text"
                  value={currentSelection.teams}
                  onChange={(e) => setCurrentSelection({ ...currentSelection, teams: e.target.value })}
                  placeholder="Ex: Flamengo vs Palmeiras"
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Mercado</label>
                <select
                  value={currentSelection.market}
                  onChange={(e) => setCurrentSelection({ ...currentSelection, market: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  <option value="">Selecione o mercado</option>
                  
                  {/* Mercados de Resultado */}
                  <optgroup label="🏆 Resultado da Partida">
                    <option value="Vitória Casa">Vitória Casa (1)</option>
                    <option value="Empate">Empate (X)</option>
                    <option value="Vitória Visitante">Vitória Visitante (2)</option>
                    <option value="Dupla Chance 1X">Dupla Chance 1X</option>
                    <option value="Dupla Chance 12">Dupla Chance 12</option>
                    <option value="Dupla Chance X2">Dupla Chance X2</option>
                  </optgroup>
                  
                  {/* Mercados de Gols */}
                  <optgroup label="⚽ Mercados de Gols">
                    <option value="Over 0.5">Over 0.5 gols</option>
                    <option value="Under 0.5">Under 0.5 gols</option>
                    <option value="Over 1.5">Over 1.5 gols</option>
                    <option value="Under 1.5">Under 1.5 gols</option>
                    <option value="Over 2.5">Over 2.5 gols</option>
                    <option value="Under 2.5">Under 2.5 gols</option>
                    <option value="Over 3.5">Over 3.5 gols</option>
                    <option value="Under 3.5">Under 3.5 gols</option>
                    <option value="Over 4.5">Over 4.5 gols</option>
                    <option value="Under 4.5">Under 4.5 gols</option>
                  </optgroup>
                  
                  {/* Ambas Marcam */}
                  <optgroup label="🥅 Ambas as Equipes Marcam">
                    <option value="Ambas marcam - Sim">Ambas marcam - Sim</option>
                    <option value="Ambas marcam - Não">Ambas marcam - Não</option>
                  </optgroup>
                  
                  {/* Primeiro Tempo */}
                  <optgroup label="⏰ Primeiro Tempo">
                    <option value="1T - Vitória Casa">1T - Vitória Casa</option>
                    <option value="1T - Empate">1T - Empate</option>
                    <option value="1T - Vitória Visitante">1T - Vitória Visitante</option>
                    <option value="1T - Over 0.5">1T - Over 0.5 gols</option>
                    <option value="1T - Under 0.5">1T - Under 0.5 gols</option>
                    <option value="1T - Over 1.5">1T - Over 1.5 gols</option>
                    <option value="1T - Under 1.5">1T - Under 1.5 gols</option>
                    <option value="1T - Ambas marcam">1T - Ambas marcam</option>
                  </optgroup>
                  
                  {/* Segundo Tempo */}
                  <optgroup label="⏱️ Segundo Tempo">
                    <option value="2T - Vitória Casa">2T - Vitória Casa</option>
                    <option value="2T - Empate">2T - Empate</option>
                    <option value="2T - Vitória Visitante">2T - Vitória Visitante</option>
                    <option value="2T - Over 0.5">2T - Over 0.5 gols</option>
                    <option value="2T - Under 0.5">2T - Under 0.5 gols</option>
                    <option value="2T - Over 1.5">2T - Over 1.5 gols</option>
                    <option value="2T - Under 1.5">2T - Under 1.5 gols</option>
                    <option value="2T - Ambas marcam">2T - Ambas marcam</option>
                  </optgroup>
                  
                  {/* Escanteios */}
                  <optgroup label="🚩 Escanteios">
                    <option value="Escanteios Over 8.5">Escanteios Over 8.5</option>
                    <option value="Escanteios Under 8.5">Escanteios Under 8.5</option>
                    <option value="Escanteios Over 9.5">Escanteios Over 9.5</option>
                    <option value="Escanteios Under 9.5">Escanteios Under 9.5</option>
                    <option value="Escanteios Over 10.5">Escanteios Over 10.5</option>
                    <option value="Escanteios Under 10.5">Escanteios Under 10.5</option>
                    <option value="Escanteios Over 11.5">Escanteios Over 11.5</option>
                    <option value="Escanteios Under 11.5">Escanteios Under 11.5</option>
                    <option value="Escanteios 1T Over 4.5">Escanteios 1T Over 4.5</option>
                    <option value="Escanteios 1T Under 4.5">Escanteios 1T Under 4.5</option>
                  </optgroup>
                  
                  {/* Cartões */}
                  <optgroup label="🟨 Cartões">
                    <option value="Cartões Over 2.5">Cartões Over 2.5</option>
                    <option value="Cartões Under 2.5">Cartões Under 2.5</option>
                    <option value="Cartões Over 3.5">Cartões Over 3.5</option>
                    <option value="Cartões Under 3.5">Cartões Under 3.5</option>
                    <option value="Cartões Over 4.5">Cartões Over 4.5</option>
                    <option value="Cartões Under 4.5">Cartões Under 4.5</option>
                  </optgroup>
                  
                  {/* Handicap Asiático */}
                  <optgroup label="⚖️ Handicap Asiático">
                    <option value="Handicap Casa -0.5">Handicap Casa -0.5</option>
                    <option value="Handicap Casa -1.0">Handicap Casa -1.0</option>
                    <option value="Handicap Casa -1.5">Handicap Casa -1.5</option>
                    <option value="Handicap Visitante -0.5">Handicap Visitante -0.5</option>
                    <option value="Handicap Visitante -1.0">Handicap Visitante -1.0</option>
                    <option value="Handicap Visitante -1.5">Handicap Visitante -1.5</option>
                  </optgroup>
                  
                  {/* Outros Mercados */}
                  <optgroup label="🎯 Outros Mercados">
                    <option value="Primeiro Gol Casa">Primeiro Gol - Casa</option>
                    <option value="Primeiro Gol Visitante">Primeiro Gol - Visitante</option>
                    <option value="Último Gol Casa">Último Gol - Casa</option>
                    <option value="Último Gol Visitante">Último Gol - Visitante</option>
                    <option value="Gol Ímpar/Par">Total de Gols Ímpar/Par</option>
                    <option value="Casa marca primeiro">Casa marca primeiro</option>
                    <option value="Visitante marca primeiro">Visitante marca primeiro</option>
                    <option value="Casa vence sem sofrer">Casa vence sem sofrer gol</option>
                    <option value="Visitante vence sem sofrer">Visitante vence sem sofrer gol</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Odd <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentSelection.odd}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setCurrentSelection({ ...currentSelection, odd: '' });
                      } else {
                        const numValue = Number(value);
                        setCurrentSelection({ ...currentSelection, odd: numValue });
                      }
                    }}
                    placeholder="Ex: 2.15"
                    step="0.01"
                    min="1.01"
                    max="50.00"
                    className="w-full rounded-lg px-3 py-2 focus:outline-none transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: `1px solid ${getCurrentSelectionOddValue() < 1.01 || getCurrentSelectionOddValue() > 50 ? 'var(--red-primary)' : 'var(--border-color)'}`,
                      color: 'var(--text-primary)',
                      boxShadow: getCurrentSelectionOddValue() >= 1.01 && getCurrentSelectionOddValue() <= 50 ? '0 0 0 2px rgba(34, 197, 94, 0.1)' : '0 0 0 2px rgba(239, 68, 68, 0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = getCurrentSelectionOddValue() < 1.01 || getCurrentSelectionOddValue() > 50 ? 'var(--red-primary)' : 'var(--green-primary)';
                      e.target.style.boxShadow = getCurrentSelectionOddValue() < 1.01 || getCurrentSelectionOddValue() > 50 ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : '0 0 0 3px rgba(34, 197, 94, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = getCurrentSelectionOddValue() < 1.01 || getCurrentSelectionOddValue() > 50 ? 'var(--red-primary)' : 'var(--border-color)';
                      e.target.style.boxShadow = getCurrentSelectionOddValue() < 1.01 || getCurrentSelectionOddValue() > 50 ? '0 0 0 2px rgba(239, 68, 68, 0.1)' : '0 0 0 2px rgba(34, 197, 94, 0.1)';
                    }}
                  />

                </div>
                {(getCurrentSelectionOddValue() < 1.01 || getCurrentSelectionOddValue() > 50) && (
                  <p className="text-xs mt-1" style={{ color: 'var(--red-primary)' }}>Odd deve estar entre 1.01 e 50.00</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  onClick={addSelectionToMultiple}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Adicionar Seleção</span>
                </button>
              </div>
            </div>

              {/* Seleções Adicionadas */}
              {currentMultipleBet.selections.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Seleções ({currentMultipleBet.selections.length})</h3>
                  <div className="space-y-2">
                    {currentMultipleBet.selections.map((selection) => (
                      <div key={selection.id} className="rounded-lg p-3 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div className="flex-1">
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selection.teams}</span>
                          <span className="mx-2" style={{ color: 'var(--text-secondary)' }}>•</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{selection.market}</span>
                           <span className="mx-2" style={{ color: 'var(--text-secondary)' }}>•</span>
                          <span className="text-green-primary font-mono">{(typeof selection.odd === 'string' ? parseFloat(selection.odd) : selection.odd).toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => removeSelectionFromMultiple(selection.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Odd Total */}
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-secondary)' }}>Odd Total:</span>
                      <span className="text-green-primary font-mono text-lg font-bold">
                        {calculateTotalOdd(currentMultipleBet.selections).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stake da Múltipla */}
              {currentMultipleBet.selections.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {useUnits ? (
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Unidades</label>
                      <input
                        type="number"
                        value={currentMultipleBet.unit}
                        onChange={(e) => setCurrentMultipleBet({ ...currentMultipleBet, unit: Number(e.target.value) })}
                        placeholder="Ex: 2"
                        min="0.5"
                        step="0.5"
                        className="w-full rounded-lg px-3 py-2 focus:border-green-primary focus:outline-none"
                        style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Stake: R$ {calculateStakeFromUnit(currentMultipleBet.unit).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Stake (R$)</label>
                      <input
                        type="number"
                        value={currentMultipleBet.stake}
                        onChange={(e) => setCurrentMultipleBet({ ...currentMultipleBet, stake: Number(e.target.value) })}
                        placeholder="Ex: 100"
                        className="w-full rounded-lg px-3 py-2 focus:border-green-primary focus:outline-none"
                        style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Retorno Potencial</label>
                    <div className="rounded-lg px-3 py-2 text-green-primary font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                      R$ {(
                        (useUnits ? calculateStakeFromUnit(currentMultipleBet.unit) : currentMultipleBet.stake) * 
                        calculateTotalOdd(currentMultipleBet.selections)
                      ).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={addMultipleBet}
                      className="w-full bg-green-primary text-dark-bg font-semibold py-2 px-4 rounded-lg hover:bg-green-primary/90 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Save size={18} />
                      <span>Salvar Múltipla</span>
                    </button>
                  </div>
                </div>
               )}
              </div>
            )}

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Apostado</h3>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>R$ {totalStaked.toFixed(2)}</p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Lucro/Prejuízo</h3>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-primary' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}R$ {totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>ROI</h3>
              <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-primary' : 'text-red-400'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Lista de Apostas Simples */}
          {bets.length > 0 && (
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Apostas Simples</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th className="text-left py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Evento</th>
                      <th className="text-left py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Mercado</th>
                      <th className="text-center py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Odd</th>
                      <th className="text-center py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Stake</th>
                      <th className="text-center py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Resultado</th>
                      <th className="text-center py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Lucro</th>
                      <th className="text-center py-3 px-4 font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map((bet) => (
                      <tr key={bet.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td className="py-4 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{bet.teams}</td>
                        <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{bet.market}</td>
                        <td className="py-4 px-4 text-center text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{(typeof bet.odd === 'string' ? parseFloat(bet.odd) : bet.odd).toFixed(2)}</td>
                        <td className="py-4 px-4 text-center text-sm font-mono" style={{ color: 'var(--text-primary)' }}>R$ {bet.stake.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={bet.result}
                            onChange={(e) => updateBetResult(bet.id, e.target.value as any)}
                            className="rounded px-2 py-1 text-sm focus:border-green-primary focus:outline-none"
                            style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="green">Green</option>
                            <option value="red">Red</option>
                            <option value="anulado">Anulado</option>
                          </select>
                        </td>
                        <td className={`py-4 px-4 text-center text-sm font-mono font-semibold ${
                          calculateProfit(bet) >= 0 ? 'text-green-primary' : 'text-red-400'
                        }`}>
                          {calculateProfit(bet) >= 0 ? '+' : ''}R$ {calculateProfit(bet).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => removeBet(bet.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lista de Apostas Múltiplas */}
          {multipleBets.length > 0 && (
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Apostas Múltiplas</h2>
              <div className="space-y-4">
                {multipleBets.map((bet) => (
                  <div key={bet.id} className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Múltipla ({bet.selections.length} seleções)
                        </span>
                        <span className="text-green-primary font-mono font-bold">
                          Odd: {bet.totalOdd.toFixed(2)}
                        </span>
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                          Stake: R$ {bet.stake.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select
                          value={bet.result}
                          onChange={(e) => updateMultipleBetResult(bet.id, e.target.value as MultipleBet['result'])}
                          className="rounded px-2 py-1 text-sm focus:border-green-primary focus:outline-none"
                          style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="green">Green</option>
                          <option value="red">Red</option>
                          <option value="anulado">Anulado</option>
                        </select>
                        <span className={`font-mono font-semibold ${
                          calculateMultipleBetProfit(bet) >= 0 ? 'text-green-primary' : 'text-red-400'
                        }`}>
                          {calculateMultipleBetProfit(bet) >= 0 ? '+' : ''}R$ {calculateMultipleBetProfit(bet).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeMultipleBet(bet.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {bet.selections.map((selection) => (
                        <div key={selection.id} className="rounded p-2 text-sm" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{selection.teams}</span>
                          <span className="mx-2" style={{ color: 'var(--text-secondary)' }}>•</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{selection.market}</span>
                          <span className="mx-2" style={{ color: 'var(--text-secondary)' }}>•</span>
                          <span className="text-green-primary font-mono">{(typeof selection.odd === 'string' ? parseFloat(selection.odd) : selection.odd).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </ResponsiveLayout>
  )
}

export default RegistroPage