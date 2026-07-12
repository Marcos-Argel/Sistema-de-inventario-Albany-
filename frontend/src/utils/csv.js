function escapeCsvValue(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Convierte un arreglo de objetos planos a CSV y dispara la descarga.
 * @param {Array<Object>} rows - filas de datos
 * @param {Array<{key: string, label: string}>} columns - columnas a exportar, en orden
 * @param {string} filename - nombre del archivo (sin extensión)
 */
export function exportToCsv(rows, columns, filename) {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeCsvValue(row[c.key])).join(','))
    .join('\n')

  const csvContent = '\uFEFF' + header + '\n' + body // BOM para que Excel reconozca acentos/UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
