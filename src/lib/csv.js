export function toCSV(rows, columns) {
    const header = columns.map((c) => escapeCell(c.label)).join(',')
    const body = rows.map((row) =>
      columns.map((c) => escapeCell(row[c.key])).join(',')
    ).join('\n')
    return header + '\n' + body
  }
  
  export function parseCSV(text) {
    const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
    const lines = clean.split('\n').filter((l) => l.trim().length > 0)
    if (!lines.length) return { headers: [], rows: [] }
  
    const headers = parseLine(lines[0]).map((h) => h.trim())
    const rows = lines.slice(1).map((line) => {
      const cells = parseLine(line)
      const obj = {}
      headers.forEach((h, i) => { obj[h] = cells[i] ?? '' })
      return obj
    })
    return { headers, rows }
  }
  
  export function downloadCSV(filename, csvText) {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  function escapeCell(v) {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  
  function parseLine(line) {
    const out = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++ }
          else inQuotes = false
        } else cur += ch
      } else {
        if (ch === '"') inQuotes = true
        else if (ch === ',') { out.push(cur); cur = '' }
        else cur += ch
      }
    }
    out.push(cur)
    return out
  }