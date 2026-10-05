import { format as formatDateFns } from 'date-fns'

export function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('en-US')
}

export function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (abs >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

export function formatPercent(n, digits = 1) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toFixed(digits) + '%'
}

export function formatDelta(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return (n > 0 ? '+' : '') + formatNumber(n)
}

export function formatDecimal(n, digits = 2) {
  if (n == null || Number.isNaN(n)) return '—'
  return Number(n).toFixed(digits)
}

export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDateFns(d, fmt)
}

const PILLAR_COLORS = {
  'Founder Journey': '#FFD02B',
  'Business': '#38BDF8',
  'Experiments / Challenges': '#A78BFA',
  'Personal Story': '#F472B6',
  'Founder Lifestyle': '#22C55E',
}
const FALLBACK_COLORS = ['#F59E0B', '#EF4444', '#38BDF8', '#A78BFA', '#22C55E', '#FFD02B']

export function pillarColor(name) {
  if (!name) return '#A1A1AA'
  if (PILLAR_COLORS[name]) return PILLAR_COLORS[name]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}