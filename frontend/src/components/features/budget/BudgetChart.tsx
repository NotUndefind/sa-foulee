'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { BudgetMonthlyStat } from '@/types'

interface Props {
  data: BudgetMonthlyStat[]
}

function formatMonth(month: string) {
  const [year, m] = month.split('-')
  const d = new Date(parseInt(year), parseInt(m) - 1, 1)
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

function formatEuro(value: number) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`
}

export default function BudgetChart({ data }: Props) {
  if (!data.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7F7F7F', fontSize: '13px' }}>Aucune donnée à afficher.</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: formatMonth(d.month),
    Recettes: d.recettes,
    Dépenses: d.depenses,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        barCategoryGap="30%"
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,48,46,0.07)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#7F7F7F', fontFamily: "'Baloo 2', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: '#7F7F7F', fontFamily: "'Baloo 2', sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          formatter={(value) => formatEuro(Number(value))}
          contentStyle={{
            borderRadius: '10px',
            border: '1px solid rgba(192,48,46,0.12)',
            fontFamily: "'Baloo 2', sans-serif",
            fontSize: '13px',
          }}
        />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            fontFamily: "'Baloo 2', sans-serif",
            paddingTop: '8px',
          }}
        />
        <Bar dataKey="Recettes" fill="#059669" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Dépenses" fill="#FB3936" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
