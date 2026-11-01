package com.albany.inventory.controller;

import com.albany.inventory.dto.CompraRequest;
import com.albany.inventory.entity.Compra;
import com.albany.inventory.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Las compras muestran costos de proveedor, por eso son solo para ADMIN
@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    public List<Compra> historial() {
        return compraService.historial();
    }

    @GetMapping("/{id}")
    public Compra obtener(@PathVariable Long id) {
        return compraService.obtener(id);
    }

    @PostMapping
    public Compra registrar(@Valid @RequestBody CompraRequest request, Authentication authentication) {
        return compraService.registrarCompra(request, authentication.getName());
    }
}
