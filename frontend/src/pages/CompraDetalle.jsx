import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import { TIENDA } from '../config/tienda.js'
import { formatCOP } from '../utils/format.js'

export default function CompraDetalle() {
  const { id } = useParams()
  const [compra, setCompra] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/compras/${id}`)
      .then((res) => setCompra(res.data))
      .catch(() => setError('No se pudo cargar la compra'))
  }, [id])

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <Link to="/compras" className="btn">Volver a compras</Link>
      </div>
    )
  }

  if (!compra) {
    return <div className="container"><p className="text-muted">Cargando compra...</p></div>
  }

  const unidades = compra.detalles?.reduce((sum, d) => sum + d.cantidad, 0) ?? 0

  return (
    <div className="container">
      <div className="factura-actions no-print">
        <button className="btn" onClick={() => window.print()}>🖨 Imprimir / Guardar PDF</button>
        <Link to="/compras" className="btn btn-secondary">Volver a compras</Link>
        <Link to="/compras/nueva" className="btn btn-secondary">Nueva compra</Link>
      </div>

      <div className="card factura-sheet">
        <div className="factura-header">
          <div>
            <h2>{TIENDA.nombre}</h2>
            <p className="text-muted text-sm">Registro de compra a proveedor</p>
          </div>
          <div className="factura-numero">
            <div className="factura-numero-label">COMPRA</div>
            <div className="factura-numero-valor">{compra.numeroCompra}</div>
          </div>
        </div>

        <div className="factura-meta">
          <div>
            <strong>Proveedor:</strong> {compra.proveedor}
            {compra.proveedorNit && <span> · NIT {compra.proveedorNit}</span>}
          </div>
          <div>
            <strong>Factura del proveedor:</strong> {compra.facturaProveedor || 'No registrada'}
            {compra.fechaFactura && (
              <span> · {new Date(`${compra.fechaFactura}T00:00`).toLocaleDateString('es-CO')}</span>
            )}
          </div>
          <div><strong>Registrada:</strong> {new Date(compra.fecha).toLocaleString('es-CO')}</div>
          <div><strong>Registrada por:</strong> {compra.usuario?.nombreCompleto}</div>
          {compra.observacion && <div><strong>Observación:</strong> {compra.observacion}</div>}
        </div>

        <table className="factura-table">
          <thead>
            <tr><th>Producto</th><th>Cant.</th><th>Costo unit.</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {compra.detalles?.map((d) => (
              <tr key={d.id}>
                <td>{d.producto?.nombre} <span className="text-muted">({d.producto?.codigo})</span></td>
                <td>{d.cantidad}</td>
                <td>{formatCOP(d.costoUnitario)}</td>
                <td>{formatCOP(d.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="factura-total">
          <span>Total compra <span className="text-muted text-sm">({unidades} und.)</span></span>
          <span>{formatCOP(compra.total)}</span>
        </div>

        <p className="text-muted factura-footer">
          Las {unidades} unidades de esta compra se sumaron al inventario al registrarla.
        </p>
      </div>
    </div>
  )
}
