import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'

export default function Factura() {
  const { id } = useParams()
  const [venta, setVenta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/ventas/${id}`)
      .then((res) => setVenta(res.data))
      .catch(() => setError('No se pudo cargar la factura'))
  }, [id])

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <Link to="/venta" className="btn">Volver al punto de venta</Link>
      </div>
    )
  }

  if (!venta) {
    return <div className="container"><p className="text-muted">Cargando factura...</p></div>
  }

  const fecha = new Date(venta.fecha)

  return (
    <div className="container">
      <div className="factura-actions no-print">
        <button className="btn" onClick={() => window.print()}>Imprimir / Guardar como PDF</button>
        <Link to="/venta" className="btn btn-secondary">Nueva venta</Link>
      </div>

      <div className="card factura-sheet">
        <div className="factura-header">
          <div>
            <h2 style={{ margin: 0 }}>Albany</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>
              Ropa y calzado infantil · Turbo, Antioquia
            </p>
          </div>
          <div className="factura-numero">
            <div className="factura-numero-label">FACTURA</div>
            <div className="factura-numero-valor">{venta.numeroFactura}</div>
          </div>
        </div>

        <div className="factura-meta">
          <div>
            <strong>Cliente:</strong> {venta.cliente || 'Consumidor final'}
            {venta.clienteDocumento && <span> · Doc: {venta.clienteDocumento}</span>}
          </div>
          <div>
            <strong>Fecha:</strong> {fecha.toLocaleString('es-CO')}
          </div>
          <div>
            <strong>Atendido por:</strong> {venta.usuario?.nombreCompleto}
          </div>
        </div>

        <table className="factura-table">
          <thead>
            <tr><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {venta.detalles?.map((d) => (
              <tr key={d.id}>
                <td>{d.producto?.nombre} <span className="text-muted">({d.producto?.codigo})</span></td>
                <td>{d.cantidad}</td>
                <td>${Number(d.precioUnitario).toLocaleString('es-CO')}</td>
                <td>${Number(d.subtotal).toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="factura-total">
          <span>Total a pagar</span>
          <span>${Number(venta.total).toLocaleString('es-CO')}</span>
        </div>

        <p className="text-muted factura-footer">¡Gracias por tu compra en Albany!</p>
      </div>
    </div>
  )
}
