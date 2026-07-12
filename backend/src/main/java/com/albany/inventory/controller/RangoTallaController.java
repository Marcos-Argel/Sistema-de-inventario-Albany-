package com.albany.inventory.controller;

import com.albany.inventory.entity.RangoTalla;
import com.albany.inventory.service.RangoTallaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rangos-talla")
@RequiredArgsConstructor
public class RangoTallaController {

    private final RangoTallaService rangoTallaService;

    @GetMapping
    public List<RangoTalla> listar() {
        return rangoTallaService.listar();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RangoTalla crear(@RequestBody RangoTalla rangoTalla) {
        return rangoTallaService.crear(rangoTalla);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public RangoTalla actualizar(@PathVariable Long id, @RequestBody RangoTalla rangoTalla) {
        return rangoTallaService.actualizar(id, rangoTalla);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        rangoTallaService.eliminar(id);
    }
}
