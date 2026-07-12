package com.albany.inventory.controller;

import com.albany.inventory.dto.VentaRequest;
import com.albany.inventory.entity.Venta;
import com.albany.inventory.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    public List<Venta> historial() {
        return ventaService.historial();
    }

    @GetMapping("/{id}")
    public Venta obtener(@PathVariable Long id) {
        return ventaService.obtener(id);
    }

    @PostMapping
    public Venta registrar(@Valid @RequestBody VentaRequest request, Authentication authentication) {
        return ventaService.registrarVenta(request, authentication.getName());
    }
}
