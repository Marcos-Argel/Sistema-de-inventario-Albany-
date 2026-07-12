package com.albany.inventory.controller;

import com.albany.inventory.entity.DetalleVenta;
import com.albany.inventory.entity.Producto;
import com.albany.inventory.repository.DetalleVentaRepository;
import com.albany.inventory.repository.ProductoRepository;
import com.albany.inventory.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ProductoRepository productoRepository;
    private final ProductoService productoService;
    private final DetalleVentaRepository detalleVentaRepository;

    @GetMapping("/resumen")
    public Map<String, Object> resumen() {
        List<Producto> productos = productoRepository.findByActivoTrue();

        int totalUnidades = productos.stream().mapToInt(Producto::getCantidad).sum();
        double valorTotal = productos.stream().mapToDouble(p -> p.getCantidad() * p.getPrecio()).sum();
        long productosStockBajo = productos.stream()
                .filter(p -> p.getCantidad() <= p.getStockMinimo())
                .count();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalProductos", productos.size());
        resumen.put("totalUnidades", totalUnidades);
        resumen.put("valorTotalInventario", valorTotal);
        resumen.put("productosStockBajo", productosStockBajo);
        return resumen;
    }

    @GetMapping("/stock-bajo")
    public List<Producto> stockBajo() {
        return productoService.stockBajo();
    }

    @GetMapping("/por-categoria")
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
    public List<Map<String, Object>> topProductos(@RequestParam(defaultValue = "5") int limite) {
        List<DetalleVenta> detalles = detalleVentaRepository.findAll();

        Map<Long, Producto> productoPorId = new HashMap<>();
        Map<Long, Integer> unidadesPorProducto = new HashMap<>();
        Map<Long, Double> ingresosPorProducto = new HashMap<>();

        for (DetalleVenta d : detalles) {
            Producto p = d.getProducto();
            productoPorId.put(p.getId(), p);
            unidadesPorProducto.merge(p.getId(), d.getCantidad(), Integer::sum);
            ingresosPorProducto.merge(p.getId(), d.getSubtotal(), Double::sum);
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
