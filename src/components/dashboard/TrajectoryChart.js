'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { formatCompact, formatNumber, formatDate } from '@/lib/calculations/format'

export function TrajectoryChart({ data, status, targetFollowers }) {
  const actualColor = status === 'AHEAD' ? '#22C55E' : status === 'BEHIND' ? '#EF4444' : '#F59E0B'

  return (
    <div className="h-[280px] md:h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={actualColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={actualColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            minTickGap={40}
          />
          <YAxis
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompact}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: '#111113',
              border: '1px solid #27272A',
              borderRadius: 8,
              fontSize: 12,
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#A1A1AA', fontSize: 11, marginBottom: 4 }}
            labelFormatter={(d) => formatDate(d, 'EEE, MMM d, yyyy')}
            formatter={(value, name) => [
              value == null ? '—' : formatNumber(value),
              name === 'required' ? 'Required' : 'Actual',
            ]}
          />
          <ReferenceLine y={targetFollowers} stroke="#FFD02B" strokeDasharray="2 4" strokeOpacity={0.5} />

          {/* required trajectory — yellow dashed */}
          <Line
            type="linear"
            dataKey="required"
            stroke="#FFD02B"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />

          {/* actual followers — bold, coloured by status */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke={actualColor}
            strokeWidth={2.5}
            dot={{ r: 2, fill: actualColor }}
            activeDot={{ r: 5 }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}