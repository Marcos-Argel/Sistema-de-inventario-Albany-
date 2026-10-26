// Sin decimales si el valor es entero; con exactamente dos si tiene centavos
export const formatCOP = (valor) => {
  const n = Number(valor || 0)
  const decimales = Number.isInteger(n) ? 0 : 2
  return `$${n.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })}`
}

export const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-CO', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
})
