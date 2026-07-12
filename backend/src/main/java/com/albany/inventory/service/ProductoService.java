package com.albany.inventory.service;

import com.albany.inventory.dto.ProductoRequest;
import com.albany.inventory.entity.Categoria;
import com.albany.inventory.entity.Producto;
import com.albany.inventory.entity.RangoTalla;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.CategoriaRepository;
import com.albany.inventory.repository.ProductoRepository;
import com.albany.inventory.repository.RangoTallaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final RangoTallaRepository rangoTallaRepository;

    public List<Producto> listar() {
        return productoRepository.findByActivoTrue();
    }

    public Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Producto no encontrado"));
    }

    public List<Producto> stockBajo() {
        Producto ref = new Producto();
        return productoRepository.findByActivoTrue().stream()
                .filter(p -> p.getCantidad() <= p.getStockMinimo())
                .toList();
    }

    public Producto crear(ProductoRequest req) {
        if (productoRepository.existsByCodigo(req.getCodigo())) {
            throw new ApiException("Ya existe un producto con ese codigo");
        }
        Categoria categoria = categoriaRepository.findById(req.getCategoriaId())
                .orElseThrow(() -> new ApiException("Categoria no encontrada"));
        RangoTalla rango = rangoTallaRepository.findById(req.getRangoTallaId())
                .orElseThrow(() -> new ApiException("Rango de talla no encontrado"));

        Producto producto = Producto.builder()
                .codigo(req.getCodigo())
                .nombre(req.getNombre())
                .categoria(categoria)
                .rangoTalla(rango)
                .colorPrenda(req.getColorPrenda())
                .cantidad(req.getCantidad() == null ? 0 : req.getCantidad())
                .stockMinimo(req.getStockMinimo() == null ? 5 : req.getStockMinimo())
                .ubicacion(req.getUbicacion())
                .precio(req.getPrecio())
                .activo(true)
                .build();

        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, ProductoRequest req) {
        Producto producto = obtener(id);
        Categoria categoria = categoriaRepository.findById(req.getCategoriaId())
                .orElseThrow(() -> new ApiException("Categoria no encontrada"));
        RangoTalla rango = rangoTallaRepository.findById(req.getRangoTallaId())
                .orElseThrow(() -> new ApiException("Rango de talla no encontrado"));

        producto.setNombre(req.getNombre());
        producto.setCategoria(categoria);
        producto.setRangoTalla(rango);
        producto.setColorPrenda(req.getColorPrenda());
        producto.setStockMinimo(req.getStockMinimo() == null ? producto.getStockMinimo() : req.getStockMinimo());
        producto.setUbicacion(req.getUbicacion());
        producto.setPrecio(req.getPrecio());

        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        Producto producto = obtener(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }
}
