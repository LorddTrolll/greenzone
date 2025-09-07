'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'

interface Game {
  id: number
  time: string
  teams: string
  league: string
  market: string
  odd: number
  confidence: 'alta' | 'média' | 'baixa'
  status: 'disponível' | 'finalizado'
  entryValue: number
  successRate: number
  result?: 'green' | 'red' | 'anulado' | 'pendente'
  category: string
}

interface RealtimeSyncContextType {
  games: Record<string, Game[]>
  addGame: (game: Omit<Game, 'id'>) => void
  updateGame: (gameId: number, updatedGame: Partial<Game>) => void
  deleteGame: (gameId: number, category: string) => void
  isConnected: boolean
  lastUpdate: Date | null
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(undefined)

interface RealtimeSyncProviderProps {
  children: ReactNode
}

export const RealtimeSyncProvider = ({ children }: RealtimeSyncProviderProps) => {
  const { user, isAdmin } = useAuth()
  const [games, setGames] = useState<Record<string, Game[]>>({
    'melhores-entradas': [
      {
        id: 1,
        time: '15:30',
        teams: 'Flamengo vs Palmeiras',
        league: 'Brasileirão',
        market: 'Ambas Marcam',
        odd: 1.85,
        confidence: 'alta',
        status: 'disponível',
        entryValue: 100,
        successRate: 85,
        result: 'pendente',
        category: 'melhores-entradas'
      }
    ],
    'apostas-do-dia': [],
    'alavancagem': [],
    'ambas-marcam': [],
    'brasileirao': [],
    'ligas-asiaticas': [],
    'over-15': [],
    'casa-vence': [],
    'escanteios': [],
    'chance-dupla': [],
    'gol-ht': [],
    'gol-st': []
  })
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  // Simular conexão em tempo real usando localStorage para demonstração
  // Em produção, isso seria substituído por WebSockets ou Server-Sent Events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'greenzone-games-sync') {
        try {
          const syncData = JSON.parse(e.newValue || '{}')
          if (syncData.games) {
            setGames(syncData.games)
            setLastUpdate(new Date(syncData.timestamp))
          }
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    setIsConnected(true)

    // Carregar dados iniciais do localStorage
    try {
      const storedData = localStorage.getItem('greenzone-games-sync')
      if (storedData) {
        const syncData = JSON.parse(storedData)
        if (syncData.games) {
          setGames(syncData.games)
          setLastUpdate(new Date(syncData.timestamp))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      setIsConnected(false)
    }
  }, [])

  const syncToStorage = useCallback((updatedGames: Record<string, Game[]>) => {
    try {
      const syncData = {
        games: updatedGames,
        timestamp: new Date().toISOString(),
        updatedBy: user?.email || 'unknown'
      }
      localStorage.setItem('greenzone-games-sync', JSON.stringify(syncData))
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao sincronizar para storage:', error)
    }
  }, [user?.email])

  const addGame = useCallback((game: Omit<Game, 'id'>) => {
    setGames(prevGames => {
      const newId = Math.max(
        ...Object.values(prevGames).flat().map(g => g.id),
        0
      ) + 1
      
      const newGame: Game = {
        ...game,
        id: newId
      }
      
      const updatedGames = {
        ...prevGames,
        [game.category]: [...(prevGames[game.category] || []), newGame]
      }
      
      // Sincronizar apenas se for admin
      if (isAdmin() || user?.email === 'admin@greenzone.com') {
        syncToStorage(updatedGames)
      }
      
      return updatedGames
    })
  }, [isAdmin, user?.email, syncToStorage])

  const updateGame = useCallback((gameId: number, updatedGame: Partial<Game>) => {
    setGames(prevGames => {
      const updatedGames = { ...prevGames }
      
      for (const category in updatedGames) {
        const gameIndex = updatedGames[category].findIndex(g => g.id === gameId)
        if (gameIndex !== -1) {
          updatedGames[category][gameIndex] = {
            ...updatedGames[category][gameIndex],
            ...updatedGame
          }
          break
        }
      }
      
      // Sincronizar apenas se for admin
      if (isAdmin() || user?.email === 'admin@greenzone.com') {
        syncToStorage(updatedGames)
      }
      
      return updatedGames
    })
  }, [isAdmin, user?.email, syncToStorage])

  const deleteGame = useCallback((gameId: number, category: string) => {
    setGames(prevGames => {
      const updatedGames = {
        ...prevGames,
        [category]: prevGames[category].filter(g => g.id !== gameId)
      }
      
      // Sincronizar apenas se for admin
      if (isAdmin() || user?.email === 'admin@greenzone.com') {
        syncToStorage(updatedGames)
      }
      
      return updatedGames
    })
  }, [isAdmin, user?.email, syncToStorage])

  const value: RealtimeSyncContextType = {
    games,
    addGame,
    updateGame,
    deleteGame,
    isConnected,
    lastUpdate
  }

  return (
    <RealtimeSyncContext.Provider value={value}>
      {children}
    </RealtimeSyncContext.Provider>
  )
}

export const useRealtimeSync = () => {
  const context = useContext(RealtimeSyncContext)
  if (context === undefined) {
    throw new Error('useRealtimeSync must be used within a RealtimeSyncProvider')
  }
  return context
}

export default RealtimeSyncContext