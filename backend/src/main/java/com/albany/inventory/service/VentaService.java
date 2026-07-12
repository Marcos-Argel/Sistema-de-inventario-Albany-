package com.albany.inventory.service;

import com.albany.inventory.dto.VentaItemRequest;
import com.albany.inventory.dto.VentaRequest;
import com.albany.inventory.entity.*;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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

        // Validar stock disponible de todos los items antes de descontar nada
        List<Producto> productosCache = new ArrayList<>();
        for (VentaItemRequest item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new ApiException("Producto no encontrado: id " + item.getProductoId()));
            if (!producto.isActivo()) {
                throw new ApiException("El producto '" + producto.getNombre() + "' ya no está disponible");
            }
            if (producto.getCantidad() < item.getCantidad()) {
                throw new ApiException("Stock insuficiente para '" + producto.getNombre()
                        + "'. Disponible: " + producto.getCantidad());
            }
            productosCache.add(producto);
        }

        Venta venta = Venta.builder()
                .numeroFactura(generarNumeroFactura())
                .cliente(request.getCliente())
                .clienteDocumento(request.getClienteDocumento())
                .usuario(usuario)
                .subtotal(0.0)
                .total(0.0)
                .build();

        double totalVenta = 0.0;

        for (int i = 0; i < request.getItems().size(); i++) {
            VentaItemRequest item = request.getItems().get(i);
            Producto producto = productosCache.get(i);

            double subtotalLinea = producto.getPrecio() * item.getCantidad();
            totalVenta += subtotalLinea;

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

    private String generarNumeroFactura() {
        long siguiente = ventaRepository.count() + 1;
        return String.format("FAC-%06d", siguiente);
    }

    public List<Venta> historial() {
        return ventaRepository.findAllByOrderByFechaDesc();
    }

    public Venta obtener(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venta no encontrada"));
    }
}
