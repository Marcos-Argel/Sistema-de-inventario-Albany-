import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { TIENDA } from '../config/tienda.js'
import { formatCOP, formatFechaTiquete, METODOS_PAGO } from '../utils/format.js'

// Anchos de papel de impresora termica mas comunes
const ANCHOS = { 80: '80 mm', 58: '58 mm' }

function leerAncho() {
  try {
    return localStorage.getItem('albany_ancho_tiquete') === '58' ? 58 : 80
  } catch {
    return 80
  }
}

export default function Factura() {
  const { id } = useParams()
  const [venta, setVenta] = useState(null)
  const [error, setError] = useState('')
  const [ancho, setAncho] = useState(leerAncho)
  const [altoMm, setAltoMm] = useState(200)
  const ticketRef = useRef(null)

  useEffect(() => {
    api.get(`/ventas/${id}`)
      .then((res) => setVenta(res.data))
      .catch(() => setError('No se pudo cargar la factura'))
  }, [id])

  // Alto del tiquete en mm (1px CSS = 25.4/96 mm), medido cuando cambia el contenido o el ancho
  useLayoutEffect(() => {
    if (ticketRef.current) {
      setAltoMm(Math.ceil((ticketRef.current.offsetHeight * 25.4) / 96) + 4)
    }
  }, [venta, ancho])

  const cambiarAncho = (valor) => {
    setAncho(valor)
    try { localStorage.setItem('albany_ancho_tiquete', String(valor)) } catch { /* sin almacenamiento */ }
  }

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

  const articulos = venta.detalles?.reduce((sum, d) => sum + d.cantidad, 0) ?? 0
  const cambio = venta.montoRecibido != null ? Number(venta.montoRecibido) - Number(venta.total) : null

  return (
    <div className="container">
      {/* El tamaño de pagina solo aplica al imprimir esta pantalla: ancho del rollo
          y alto exacto del tiquete, para que no salga una hoja carta con espacio en blanco */}
      <style>{`@page { size: ${ancho}mm ${altoMm}mm; margin: 0; }`}</style>

      <div className="factura-actions no-print">
        <button className="btn" onClick={() => window.print()}>🖨 Imprimir tiquete</button>
        <Link to="/venta" className="btn btn-secondary">Nueva venta</Link>
        <div className="ticket-ancho">
          <span className="text-muted text-sm">Papel:</span>
          {Object.entries(ANCHOS).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              className={`btn-chip${ancho === Number(valor) ? ' btn-chip-activo' : ''}`}
              onClick={() => cambiarAncho(Number(valor))}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      <div className={`ticket ticket-${ancho}`} ref={ticketRef}>
        <div className="ticket-centro">
          <div className="ticket-tienda">{TIENDA.nombre.toUpperCase()}</div>
          <div>{TIENDA.descripcion}</div>
          {TIENDA.nit && <div>NIT {TIENDA.nit}</div>}
          {TIENDA.direccion && <div>{TIENDA.direccion}</div>}
          <div>{TIENDA.ciudad}</div>
          {TIENDA.telefono && <div>Tel. {TIENDA.telefono}</div>}
        </div>

        <hr className="ticket-sep" />

        <div className="ticket-fila"><span>Factura de venta</span><strong>{venta.numeroFactura}</strong></div>
        <div className="ticket-fila"><span>Fecha</span><span>{formatFechaTiquete(venta.fecha)}</span></div>
        <div className="ticket-fila"><span>Cajero</span><span>{venta.usuario?.nombreCompleto}</span></div>
        <div className="ticket-fila"><span>Cliente</span><span>{venta.cliente || 'Consumidor final'}</span></div>
        {venta.clienteDocumento && (
          <div className="ticket-fila"><span>CC/NIT</span><span>{venta.clienteDocumento}</span></div>
        )}

        <hr className="ticket-sep" />

        {venta.detalles?.map((d) => (
          <div key={d.id} className="ticket-item">
            <div>{d.producto?.nombre}</div>
            <div className="ticket-fila ticket-item-detalle">
              <span>{d.cantidad} x {formatCOP(d.precioUnitario)} <span className="ticket-codigo">{d.producto?.codigo}</span></span>
              <span>{formatCOP(d.subtotal)}</span>
            </div>
          </div>
        ))}

        <hr className="ticket-sep" />

        <div className="ticket-fila"><span>Artículos</span><span>{articulos}</span></div>
        <div className="ticket-fila ticket-total"><span>TOTAL</span><span>{formatCOP(venta.total)}</span></div>

        <hr className="ticket-sep" />

        <div className="ticket-fila">
          <span>Pago</span>
          <span>{METODOS_PAGO[venta.metodoPago] || METODOS_PAGO.EFECTIVO}</span>
        </div>
        {cambio !== null && (
          <>
            <div className="ticket-fila"><span>Recibido</span><span>{formatCOP(venta.montoRecibido)}</span></div>
            <div className="ticket-fila"><span>Cambio</span><span>{formatCOP(cambio)}</span></div>
          </>
        )}

        <hr className="ticket-sep" />

        <div className="ticket-centro">
          <div>{TIENDA.mensajeTiquete}</div>
          <div className="ticket-pie">Atendido en {TIENDA.nombre} · {venta.numeroFactura}</div>
        </div>
      </div>
    </div>
  )
}
