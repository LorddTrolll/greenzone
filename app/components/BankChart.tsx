'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BankChart = () => {
  // Dados de exemplo para evolução da banca
  const data = [
    { date: '01/01', value: 2000 },
    { date: '05/01', value: 2150 },
    { date: '10/01', value: 2080 },
    { date: '15/01', value: 2300 },
    { date: '20/01', value: 2250 },
    { date: '25/01', value: 2400 },
    { date: '30/01', value: 2450 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg p-3 shadow-lg" style={{ 
          background: 'var(--bg-tertiary)', 
          border: '1px solid var(--border-color)' 
        }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{`Data: ${label}`}</p>
          <p className="font-semibold" style={{ color: 'var(--green-primary)' }}>
            {`Banca: R$ ${payload[0].value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border-color)" 
            horizontal={true}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-secondary)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="var(--green-primary)" 
            strokeWidth={3}
            dot={{ fill: 'var(--green-primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'var(--green-primary)', strokeWidth: 2, fill: 'var(--bg-primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BankChart