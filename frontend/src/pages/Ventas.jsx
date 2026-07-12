import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Ventas() {
  const [ventas, setVentas] = useState([])

  useEffect(() => {
    api.get('/ventas').then((res) => setVentas(res.data))
  }, [])

  return (
    <div className="container">
      <h2>Historial de ventas</h2>
      <div className="card">
        <table>
          <thead>
            <tr><th>Factura</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id}>
                <td>{v.numeroFactura}</td>
                <td>{new Date(v.fecha).toLocaleString('es-CO')}</td>
                <td>{v.cliente || 'Consumidor final'}</td>
                <td>{v.usuario?.nombreCompleto}</td>
                <td>${Number(v.total).toLocaleString('es-CO')}</td>
                <td><Link className="btn btn-secondary" to={`/factura/${v.id}`}>Ver factura</Link></td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr><td colSpan={6} className="text-muted">Aún no hay ventas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
