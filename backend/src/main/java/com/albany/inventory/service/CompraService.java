package com.albany.inventory.service;

import com.albany.inventory.dto.CompraItemRequest;
import com.albany.inventory.dto.CompraRequest;
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
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    @Transactional
    public Compra registrarCompra(CompraRequest request, String username) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApiException("La compra debe tener al menos un producto");
        }

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Usuario no encontrado"));

        // Bloquear los productos en orden de id, igual que en las ventas, para evitar deadlocks
        Map<Long, Producto> productos = new TreeMap<>();
        for (CompraItemRequest item : request.getItems()) {
            productos.put(item.getProductoId(), null);
        }
        for (Long id : productos.keySet()) {
            productos.put(id, productoRepository.findByIdForUpdate(id)
                    .orElseThrow(() -> new ApiException("Producto no encontrado: id " + id)));
        }

        // Numero temporal para obtener el id; el consecutivo se deriva del id
        Compra compra = compraRepository.save(Compra.builder()
                .numeroCompra("TMP-" + UUID.randomUUID().toString().substring(0, 16))
                .proveedor(request.getProveedor().trim())
                .proveedorNit(request.getProveedorNit())
                .facturaProveedor(request.getFacturaProveedor())
                .fechaFactura(request.getFechaFactura())
                .observacion(request.getObservacion())
                .usuario(usuario)
                .total(BigDecimal.ZERO)
                .build());
        compra.setNumeroCompra(String.format("COM-%06d", compra.getId()));

        BigDecimal totalCompra = BigDecimal.ZERO;

        for (CompraItemRequest item : request.getItems()) {
            Producto producto = productos.get(item.getProductoId());

            BigDecimal subtotalLinea = item.getCostoUnitario().multiply(BigDecimal.valueOf(item.getCantidad()));
            totalCompra = totalCompra.add(subtotalLinea);

            compra.getDetalles().add(DetalleCompra.builder()
                    .compra(compra)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .costoUnitario(item.getCostoUnitario())
                    .subtotal(subtotalLinea)
                    .build());

            // Sumar stock
            producto.setCantidad(producto.getCantidad() + item.getCantidad());
            productoRepository.save(producto);

            // Registrar movimiento de inventario para trazabilidad
            movimientoRepository.save(MovimientoInventario.builder()
                    .producto(producto)
                    .tipo(TipoMovimiento.ENTRADA)
                    .cantidad(item.getCantidad())
                    .usuario(usuario)
                    .observacion("Compra " + compra.getNumeroCompra() + " - " + compra.getProveedor())
                    .build());
        }

        compra.setTotal(totalCompra);

        return compraRepository.save(compra);
    }

    public List<Compra> historial() {
        return compraRepository.findAllByOrderByFechaDesc();
    }

    public Compra obtener(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new ApiException("Compra no encontrada"));
    }
}
