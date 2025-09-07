'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SettingsContextType {
  theme: 'light' | 'dark'
  initialBank: number
  displayName: string
  setTheme: (theme: 'light' | 'dark') => void
  setInitialBank: (bank: number) => void
  setDisplayName: (name: string) => void
  loadSettings: () => void
}

interface SettingsProviderProps {
  children: ReactNode
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark')
  const [initialBank, setInitialBankState] = useState<number>(1000)
  const [displayName, setDisplayNameState] = useState<string>('Usuário')

  // Carregar configurações do localStorage
  const loadSettings = () => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('greenzone-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setThemeState(settings.theme || 'dark')
        setInitialBankState(settings.initialBank || 1000)
        setDisplayNameState(settings.displayName || 'Usuário')
        
        // Aplicar tema imediatamente
        document.documentElement.setAttribute('data-theme', settings.theme || 'dark')
      }
    }
  }

  // Salvar configurações no localStorage
  const saveSettings = (newSettings: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('greenzone-settings', JSON.stringify(newSettings))
    }
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    const settings = { theme: newTheme, initialBank, displayName }
    saveSettings(settings)
    
    // Aplicar tema imediatamente
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  const setInitialBank = (newBank: number) => {
    setInitialBankState(newBank)
    const settings = { theme, initialBank: newBank, displayName }
    saveSettings(settings)
  }

  const setDisplayName = (newName: string) => {
    setDisplayNameState(newName)
    const settings = { theme, initialBank, displayName: newName }
    saveSettings(settings)
  }

  // Carregar configurações na inicialização
  useEffect(() => {
    loadSettings()
  }, [])

  const value: SettingsContextType = {
    theme,
    initialBank,
    displayName,
    setTheme,
    setInitialBank,
    setDisplayName,
    loadSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}