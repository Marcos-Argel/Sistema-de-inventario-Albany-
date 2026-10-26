// Lista de barras horizontales con etiqueta y valor siempre visibles.
// items: [{ key, label, value, color?, detalle? }]
export default function BarList({ items, formatValue = (v) => v, vacio = 'Sin datos todavía.' }) {
  if (items.length === 0) return <p className="empty-state">{vacio}</p>

  const max = Math.max(1, ...items.map((i) => i.value))
  const total = items.reduce((sum, i) => sum + i.value, 0)

  return (
    <div>
      {items.map((item) => {
        const porcentaje = total > 0 ? Math.round((item.value / total) * 100) : 0
        return (
          <div
            key={item.key}
            className="bar-row"
            title={`${item.label}: ${formatValue(item.value)} (${porcentaje}% del total)${item.detalle ? ` · ${item.detalle}` : ''}`}
          >
            <div className="bar-row-head">
              <span className="bar-row-label">
                {item.color && <span className="dot" style={{ background: item.color }} />}
                {item.label}
              </span>
              <span className="bar-row-value">{formatValue(item.value)}</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(item.value / max) * 100}%`, background: item.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
