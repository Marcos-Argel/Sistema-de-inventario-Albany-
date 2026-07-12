package com.albany.inventory.controller;

import com.albany.inventory.dto.MovimientoRequest;
import com.albany.inventory.entity.MovimientoInventario;
import com.albany.inventory.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;

    @GetMapping
    public List<MovimientoInventario> historial() {
        return movimientoService.historial();
    }

    @GetMapping("/producto/{productoId}")
    public List<MovimientoInventario> historialPorProducto(@PathVariable Long productoId) {
        return movimientoService.historialPorProducto(productoId);
    }

    @PostMapping
    public MovimientoInventario registrar(@Valid @RequestBody MovimientoRequest request, Authentication authentication) {
        return movimientoService.registrar(request, authentication.getName());
    }
}
