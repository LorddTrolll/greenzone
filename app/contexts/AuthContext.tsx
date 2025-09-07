'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  isAuthenticated: boolean
  isVip?: boolean
  vipExpiresAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
  isAuthenticated: () => boolean
  isVip: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Simular dados de usuários para demonstração
  // Em produção, isso viria de uma API/banco de dados
  const adminCredentials = {
    email: 'admin@greenzone.com',
    password: 'admin123',
    userData: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Administrador',
      email: 'admin@greenzone.com',
      role: 'admin' as const,
      isAuthenticated: true
    }
  }

  // Usuário de teste para checkout
  const testUserCredentials = {
    email: 'teste@greenzone.com',
    password: 'teste123',
    userData: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Usuário Teste',
      email: 'teste@greenzone.com',
      role: 'user' as const,
      isAuthenticated: true,
      isVip: false,
      vipExpiresAt: null
    }
  }

  // Função para validar UUID
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  // Verificar se há sessão salva no localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    try {
      const savedUser = localStorage.getItem('greenzone_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        // Validar se o ID do usuário é um UUID válido
        if (userData.id && !isValidUUID(userData.id)) {
          console.warn('ID de usuário inválido detectado, limpando dados...')
          localStorage.removeItem('greenzone_user')
          removeCookie('greenzone_user')
          setUser(null)
        } else {
          setUser(userData)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('greenzone_user')
        removeCookie('greenzone_user')
      }
    } finally {
      setLoading(false)
    }
  }, [mounted])

  // Função para definir cookie
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
  }

  // Função para remover cookie
  const removeCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Simular autenticação - Admin
      if (email === adminCredentials.email && password === adminCredentials.password) {
        const userData = adminCredentials.userData
        setUser(userData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('greenzone_user', JSON.stringify(userData))
          setCookie('greenzone_user', JSON.stringify(userData))
        }
        return true
      }
      
      // Simular autenticação - Usuário de teste
      if (email === testUserCredentials.email && password === testUserCredentials.password) {
        const userData = testUserCredentials.userData
        setUser(userData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('greenzone_user', JSON.stringify(userData))
          setCookie('greenzone_user', JSON.stringify(userData))
        }
        return true
      }
      
      // TODO: Implementar autenticação por e-mail no futuro
      // Aqui será adicionada a lógica para verificar usuários autorizados por e-mail
      
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('greenzone_user')
      localStorage.clear() // Limpa todo o localStorage
      removeCookie('greenzone_user')
      // Força reload da página para garantir estado limpo
      window.location.reload()
    }
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin' && user?.isAuthenticated === true
  }

  const isAuthenticated = (): boolean => {
    return user?.isAuthenticated === true
  }

  const isVip = (): boolean => {
    if (!user?.isVip) return false
    if (!user?.vipExpiresAt) return user?.isVip === true
    return new Date(user.vipExpiresAt) > new Date()
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    isVip
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default AuthContext