'use client'

import { Home, TrendingUp, History, Settings, BarChart3, Wallet, LogIn, LogOut, Shield, PenTool, Clipboard, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { useSidebar } from '../contexts/SidebarContext'
import { useState } from 'react'
import LoginModal from './LoginModal'

const Sidebar = () => {
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const { displayName } = useSettings()
  const { isMinimized, toggleSidebar } = useSidebar()
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: PenTool, label: 'Registro de Apostas', href: '/registro' },
    { icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
          <path d="M2 12a10 10 0 0 1 10-10"/>
          <path d="M8 12h8"/>
          <path d="M12 8v8"/>
        </svg>
      ), label: 'Jogos do Dia', href: '/jogos-do-dia' },
    { icon: History, label: 'Histórico', href: '/historico' },
    { icon: Clipboard, label: 'Relatórios', href: '/relatorios' },
    { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  ]

  return (
    <div 
      className={`fixed left-0 top-0 h-full flex flex-col transition-all duration-300 ease-in-out z-50 ${isMinimized ? 'w-16' : 'w-64'} hidden lg:flex`} 
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}
    >
      {/* Header com toggle */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {!isMinimized && (
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--green-primary)' }}>
              Green<span style={{ color: 'var(--text-primary)' }}>Zone</span>
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Dashboard de Apostas</p>
          </div>
        )}
        <button
           onClick={toggleSidebar}
           className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10"
          style={{ 
            color: 'var(--text-secondary)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {isMinimized ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center ${isMinimized ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-lg transition-all duration-200`}
                  style={{
                    backgroundColor: pathname === item.href ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: pathname === item.href ? 'var(--green-primary)' : 'var(--text-secondary)',
                    border: pathname === item.href ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                  title={isMinimized ? item.label : undefined}
                >
                  <Icon size={20} />
                  {!isMinimized && <span className="font-medium transition-opacity duration-200">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>



      {/* Footer da sidebar */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        {user ? (
          <div className="space-y-3">
            {!isMinimized && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-primary)' }}>
                  {isAdmin() ? (
                    <Shield size={16} style={{ color: 'var(--bg-primary)' }} />
                  ) : (
                    <span className="font-bold text-sm" style={{ color: 'var(--bg-primary)' }}>U</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {isAdmin() ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className={`w-full flex items-center ${isMinimized ? 'justify-center px-2' : 'space-x-2 px-3'} py-2 text-sm rounded-lg transition-colors`}
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={isMinimized ? 'Sair' : undefined}
            >
              <LogOut size={16} />
              {!isMinimized && <span>Sair</span>}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className={`w-full flex items-center ${isMinimized ? 'justify-center px-2' : 'space-x-2 px-3'} py-2 text-sm rounded-lg transition-colors`}
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isMinimized ? 'Login Admin' : undefined}
          >
            <LogIn size={16} />
            {!isMinimized && <span>Login Admin</span>}
          </button>
        )}
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}

export default Sidebar