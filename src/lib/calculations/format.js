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