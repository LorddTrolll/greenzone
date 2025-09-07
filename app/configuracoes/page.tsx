'use client'

import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, DollarSign, User, Save, Check } from 'lucide-react'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useSettings } from '../contexts/SettingsContext'

interface ConfigSettings {
  theme: 'light' | 'dark'
  initialBank: number
  displayName: string
}

const ConfiguracoesPage = () => {
  const { theme, initialBank, displayName, setTheme, setInitialBank, setDisplayName } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Simular salvamento automático para feedback visual
  useEffect(() => {
    const saveSettings = async () => {
      setIsSaving(true)
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsSaving(false)
      setLastSaved(new Date())
    }

    const timeoutId = setTimeout(saveSettings, 1000)
    return () => clearTimeout(timeoutId)
  }, [theme, initialBank, displayName])

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <Settings className="text-green-primary" size={32} />
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>Personalize sua experiência na plataforma</p>
          </div>

          {/* Status de salvamento */}
          {(isSaving || lastSaved) && (
            <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center space-x-2">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-primary"></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Salvando configurações...</span>
                  </>
                ) : (
                  <>
                    <Check className="text-green-primary" size={16} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Configurações salvas às {lastSaved?.toLocaleTimeString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Configuração de Tema */}
            <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center space-x-3 mb-4">
                {theme === 'dark' ? (
                  <Moon className="text-blue-400" size={24} />
                ) : (
                  <Sun className="text-yellow-400" size={24} />
                )}
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Tema da Interface</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Escolha entre o tema claro ou escuro para a interface</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    theme === 'dark'
                      ? 'border-green-primary bg-green-primary/10 text-green-primary'
                      : ''
                  }`}
                  style={{
                    borderColor: theme === 'dark' ? '' : 'var(--border-color)',
                    backgroundColor: theme === 'dark' ? '' : 'var(--bg-secondary)',
                    color: theme === 'dark' ? '' : 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== 'dark') {
                      e.currentTarget.style.borderColor = 'var(--green-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== 'dark') {
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Moon size={20} />
                    <span className="font-medium">Tema Escuro</span>
                  </div>
                  <p className="text-sm mt-2 opacity-80">Interface escura para reduzir o cansaço visual</p>
                </button>
                
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    theme === 'light'
                      ? 'border-green-primary bg-green-primary/10 text-green-primary'
                      : ''
                  }`}
                  style={{
                    borderColor: theme === 'light' ? '' : 'var(--border-color)',
                    backgroundColor: theme === 'light' ? '' : 'var(--bg-secondary)',
                    color: theme === 'light' ? '' : 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== 'light') {
                      e.currentTarget.style.borderColor = 'var(--green-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== 'light') {
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Sun size={20} />
                    <span className="font-medium">Tema Claro</span>
                  </div>
                  <p className="text-sm mt-2 opacity-80">Interface clara para melhor visibilidade</p>
                </button>
              </div>
            </div>

            {/* Configuração de Banca Inicial */}
            <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="text-green-primary" size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Banca Inicial Padrão</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Defina o valor padrão da banca que será aplicado em todas as abas</p>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Valor Inicial da Banca
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} size={20} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={initialBank}
                    onChange={(e) => setInitialBank(parseFloat(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--green-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-color)';
                    }}
                    placeholder="1000.00"
                  />
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Este valor será usado como referência em todos os cálculos de ROI e percentuais
                </p>
              </div>
            </div>

            {/* Configuração de Nome de Exibição */}
            <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center space-x-3 mb-4">
                <User className="text-purple-400" size={24} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Nome de Exibição</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Personalize como você será identificado na plataforma</p>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Seu Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} size={20} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--green-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-color)';
                    }}
                    placeholder="Digite seu nome"
                    maxLength={50}
                  />
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Este nome será exibido em toda a plataforma para personalizar sua experiência
                </p>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Informações</h3>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>• Todas as configurações são salvas automaticamente</p>
                <p>• As alterações são aplicadas em tempo real em toda a plataforma</p>
                <p>• Os dados são armazenados localmente no seu navegador</p>
                <p>• Para resetar as configurações, limpe os dados do navegador</p>
              </div>
            </div>
          </div>
      </div>
    </ResponsiveLayout>
  )
}

export default ConfiguracoesPage