package com.albany.inventory.service;

import com.albany.inventory.dto.MovimientoRequest;
import com.albany.inventory.entity.MovimientoInventario;
import com.albany.inventory.entity.Producto;
import com.albany.inventory.entity.Rol;
import com.albany.inventory.entity.TipoMovimiento;
import com.albany.inventory.entity.Usuario;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.MovimientoInventarioRepository;
import com.albany.inventory.repository.ProductoRepository;
import com.albany.inventory.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MovimientoInventario registrar(MovimientoRequest req, String username) {
        Producto producto = productoRepository.findByIdForUpdate(req.getProductoId())
                .orElseThrow(() -> new ApiException("Producto no encontrado"));
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Usuario no encontrado"));

        TipoMovimiento tipo;
        try {
            tipo = TipoMovimiento.valueOf(req.getTipo().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Tipo de movimiento invalido, use ENTRADA o SALIDA");
        }

        // La mercancia del proveedor se registra en Compras (deja factura, proveedor y costo).
        // Las entradas manuales son ajustes excepcionales y solo las hace el administrador.
        if (tipo == TipoMovimiento.ENTRADA && usuario.getRol() != Rol.ADMIN) {
            throw new ApiException("Solo el administrador puede registrar entradas manuales. La mercancia del proveedor se registra en Compras.");
        }

        if (tipo == TipoMovimiento.SALIDA && producto.getCantidad() < req.getCantidad()) {
            throw new ApiException("Stock insuficiente. Disponible: " + producto.getCantidad());
        }

        int nuevaCantidad = tipo == TipoMovimiento.ENTRADA
                ? producto.getCantidad() + req.getCantidad()
                : producto.getCantidad() - req.getCantidad();
        producto.setCantidad(nuevaCantidad);
        productoRepository.save(producto);

        MovimientoInventario movimiento = MovimientoInventario.builder()
                .producto(producto)
                .tipo(tipo)
                .cantidad(req.getCantidad())
                .usuario(usuario)
                .observacion(construirObservacion(req))
                .build();

        return movimientoRepository.save(movimiento);
    }

    /** Guarda el motivo dentro de la observacion para no cambiar la tabla existente. */
    private String construirObservacion(MovimientoRequest req) {
        String motivo = req.getMotivo() == null ? "" : req.getMotivo().trim();
        String detalle = req.getObservacion() == null ? "" : req.getObservacion().trim();
        String texto = "Ajuste: " + motivo + (detalle.isEmpty() ? "" : " - " + detalle);
        return texto.length() > 200 ? texto.substring(0, 200) : texto;
    }

    public List<MovimientoInventario> historial() {
        return movimientoRepository.findAllByOrderByFechaDesc();
    }

    public List<MovimientoInventario> historialPorProducto(Long productoId) {
        return movimientoRepository.findByProductoIdOrderByFechaDesc(productoId);
    }
}
