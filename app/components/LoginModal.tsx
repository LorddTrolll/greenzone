'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LoginModalProps {
  onClose: () => void
  onSuccess: () => void
}

const LoginModal = ({ onClose, onSuccess }: LoginModalProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const { login } = useAuth()

  // Garantir que o componente está montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fechar modal com tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Foco automático no campo de email
  useEffect(() => {
    const emailInput = document.getElementById('email')
    if (emailInput) {
      emailInput.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      if (success) {
        onSuccess()
      } else {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.')
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Não renderizar no servidor
  if (!mounted) {
    return null
  }

  const modalContent = (
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        isolation: 'isolate'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="rounded-lg p-6 w-full max-w-md relative animate-in fade-in-0 zoom-in-95 duration-200" 
        style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 2147483647,
          position: 'relative',
          isolation: 'isolate',
          transform: 'translateZ(0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield style={{ color: 'var(--green-primary)' }} size={24} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Login Administrativo</h2>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--green-primary)'
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 102, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="admin@greenzone.com"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--green-primary)'
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 255, 102, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg p-3" style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)' 
            }}>
              <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="rounded-lg p-3" style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid rgba(59, 130, 246, 0.2)' 
          }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#60a5fa' }}>Credenciais de demonstração:</p>
            <p className="text-xs" style={{ color: '#93c5fd' }}>E-mail: admin@greenzone.com</p>
            <p className="text-xs" style={{ color: '#93c5fd' }}>Senha: admin123</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-medium py-2 px-4 rounded-lg transition-colors"
            style={{
              background: isLoading ? 'rgba(0, 255, 102, 0.5)' : 'var(--green-primary)',
              color: 'var(--bg-primary)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'rgba(0, 255, 102, 0.8)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--green-primary)'
              }
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Future Email Auth Notice */}
        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            💡 Em breve: Autenticação por e-mail para usuários autorizados
          </p>
        </div>
      </div>
    </div>
  )

  // Renderizar o modal usando portal diretamente no body
  return createPortal(modalContent, document.body)
}

export default LoginModal