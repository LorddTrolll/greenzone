'use client'

import { useSidebar } from '../contexts/SidebarContext'
import Sidebar from './Sidebar'
import { ReactNode } from 'react'

interface ResponsiveLayoutProps {
  children: ReactNode
}

const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const { isMinimized } = useSidebar()

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isMinimized ? 'lg:ml-16' : 'lg:ml-64'
        } ml-0`}
        style={{
          background: 'var(--bg-primary)',
          minHeight: '100vh'
        }}
      >
        <div className="p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default ResponsiveLayout