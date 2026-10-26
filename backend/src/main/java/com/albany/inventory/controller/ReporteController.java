package com.albany.inventory.controller;

import com.albany.inventory.entity.DetalleVenta;
import com.albany.inventory.entity.Producto;
import com.albany.inventory.entity.Venta;
import com.albany.inventory.repository.DetalleVentaRepository;
import com.albany.inventory.repository.ProductoRepository;
import com.albany.inventory.repository.VentaRepository;
import com.albany.inventory.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ProductoRepository productoRepository;
    private final ProductoService productoService;
    private final DetalleVentaRepository detalleVentaRepository;
    private final VentaRepository ventaRepository;

    // El resumen lo usa el Dashboard de todos los roles; el resto de reportes es solo ADMIN
    @GetMapping("/resumen")
    public Map<String, Object> resumen() {
        List<Producto> productos = productoRepository.findByActivoTrue();

        int totalUnidades = productos.stream().mapToInt(Producto::getCantidad).sum();
        BigDecimal valorTotal = productos.stream()
                .map(p -> p.getPrecio().multiply(BigDecimal.valueOf(p.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long productosStockBajo = productos.stream()
                .filter(p -> p.getCantidad() <= p.getStockMinimo())
                .count();

        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        List<Venta> ventasHoy = ventaRepository.findByFechaBetween(inicioDia, inicioDia.plusDays(1));
        BigDecimal ingresosHoy = ventasHoy.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalProductos", productos.size());
        resumen.put("totalUnidades", totalUnidades);
        resumen.put("valorTotalInventario", valorTotal);
        resumen.put("productosStockBajo", productosStockBajo);
        resumen.put("ventasHoy", ventasHoy.size());
        resumen.put("ingresosHoy", ingresosHoy);
        return resumen;
    }

    @GetMapping("/stock-bajo")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Producto> stockBajo() {
        return productoService.stockBajo();
    }

    @GetMapping("/por-categoria")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Long> porCategoria() {
        List<Producto> productos = productoRepository.findByActivoTrue();
        Map<String, Long> resultado = new HashMap<>();
        for (Producto p : productos) {
            String nombreCategoria = p.getCategoria().getNombre();
            resultado.merge(nombreCategoria, (long) p.getCantidad(), Long::sum);
        }
        return resultado;
    }

    @GetMapping("/top-productos")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> topProductos(@RequestParam(defaultValue = "5") int limite) {
        List<DetalleVenta> detalles = detalleVentaRepository.findAll();

        Map<Long, Producto> productoPorId = new HashMap<>();
        Map<Long, Integer> unidadesPorProducto = new HashMap<>();
        Map<Long, BigDecimal> ingresosPorProducto = new HashMap<>();

        for (DetalleVenta d : detalles) {
            Producto p = d.getProducto();
            productoPorId.put(p.getId(), p);
            unidadesPorProducto.merge(p.getId(), d.getCantidad(), Integer::sum);
            ingresosPorProducto.merge(p.getId(), d.getSubtotal(), BigDecimal::add);
        }

        return unidadesPorProducto.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(limite)
                .map(entry -> {
                    Producto p = productoPorId.get(entry.getKey());
                    Map<String, Object> fila = new LinkedHashMap<>();
                    fila.put("codigo", p.getCodigo());
                    fila.put("nombre", p.getNombre());
                    fila.put("categoria", p.getCategoria().getNombre());
                    fila.put("unidadesVendidas", entry.getValue());
                    fila.put("ingresosGenerados", ingresosPorProducto.get(entry.getKey()));
                    return fila;
                })
                .collect(Collectors.toList());
    }
}
