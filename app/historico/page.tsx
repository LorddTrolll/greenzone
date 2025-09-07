'use client'

import BetsHistory from '../components/BetsHistory'
import ResponsiveLayout from '../components/ResponsiveLayout'

const HistoricoPage = () => {
  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Histórico de Apostas</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Visualize e analise seu histórico completo de apostas</p>
          </div>

          {/* Componente de Histórico */}
          <BetsHistory />
      </div>
    </ResponsiveLayout>
  )
}

export default HistoricoPage