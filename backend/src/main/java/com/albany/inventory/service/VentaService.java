package com.albany.inventory.service;

import com.albany.inventory.dto.VentaItemRequest;
import com.albany.inventory.dto.VentaRequest;
import com.albany.inventory.entity.*;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    @Transactional
    public Venta registrarVenta(VentaRequest request, String username) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApiException("La venta debe tener al menos un producto");
        }

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Usuario no encontrado"));

        // Cantidad total pedida por producto (por si el mismo producto viene en varias lineas).
        // TreeMap para bloquear siempre en el mismo orden y evitar deadlocks entre ventas.
        Map<Long, Integer> cantidadPorProducto = new TreeMap<>();
        for (VentaItemRequest item : request.getItems()) {
            cantidadPorProducto.merge(item.getProductoId(), item.getCantidad(), Integer::sum);
        }

        // Validar stock disponible de todos los items antes de descontar nada
        Map<Long, Producto> productos = new TreeMap<>();
        for (Map.Entry<Long, Integer> entry : cantidadPorProducto.entrySet()) {
            Producto producto = productoRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ApiException("Producto no encontrado: id " + entry.getKey()));
            if (!producto.isActivo()) {
                throw new ApiException("El producto '" + producto.getNombre() + "' ya no está disponible");
            }
            if (producto.getCantidad() < entry.getValue()) {
                throw new ApiException("Stock insuficiente para '" + producto.getNombre()
                        + "'. Disponible: " + producto.getCantidad());
            }
            productos.put(producto.getId(), producto);
        }

        // Se guarda primero con un numero temporal para obtener el id,
        // y el numero de factura se deriva del id (unico y sin carreras)
        Venta venta = ventaRepository.save(Venta.builder()
                .numeroFactura("TMP-" + UUID.randomUUID().toString().substring(0, 16))
                .cliente(request.getCliente())
                .clienteDocumento(request.getClienteDocumento())
                .usuario(usuario)
                .subtotal(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build());
        venta.setNumeroFactura(String.format("FAC-%06d", venta.getId()));

        BigDecimal totalVenta = BigDecimal.ZERO;

        for (VentaItemRequest item : request.getItems()) {
            Producto producto = productos.get(item.getProductoId());

            BigDecimal subtotalLinea = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            totalVenta = totalVenta.add(subtotalLinea);

            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecio())
                    .subtotal(subtotalLinea)
                    .build();
            venta.getDetalles().add(detalle);

            // Descontar stock
            producto.setCantidad(producto.getCantidad() - item.getCantidad());
            productoRepository.save(producto);

            // Registrar movimiento de inventario para trazabilidad
            MovimientoInventario movimiento = MovimientoInventario.builder()
                    .producto(producto)
                    .tipo(TipoMovimiento.SALIDA)
                    .cantidad(item.getCantidad())
                    .usuario(usuario)
                    .observacion("Venta " + venta.getNumeroFactura())
                    .build();
            movimientoRepository.save(movimiento);
        }

        venta.setSubtotal(totalVenta);
        venta.setTotal(totalVenta);

        return ventaRepository.save(venta);
    }

    public List<Venta> historial() {
        return ventaRepository.findAllByOrderByFechaDesc();
    }

    public Venta obtener(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venta no encontrada"));
    }
}
