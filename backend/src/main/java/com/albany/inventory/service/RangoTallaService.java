package com.albany.inventory.service;

import com.albany.inventory.entity.RangoTalla;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.RangoTallaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RangoTallaService {
    private final RangoTallaRepository rangoTallaRepository;

    public List<RangoTalla> listar() {
        return rangoTallaRepository.findAll().stream()
                .sorted(Comparator.comparing(RangoTalla::getOrden))
                .toList();
    }

    public RangoTalla crear(RangoTalla rangoTalla) {
        return rangoTallaRepository.save(rangoTalla);
    }

    public RangoTalla actualizar(Long id, RangoTalla datos) {
        RangoTalla existente = rangoTallaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Rango de talla no encontrado"));
        existente.setNombre(datos.getNombre());
        existente.setColorNombre(datos.getColorNombre());
        existente.setColorHex(datos.getColorHex());
        existente.setOrden(datos.getOrden());
        return rangoTallaRepository.save(existente);
    }

    public void eliminar(Long id) {
        if (!rangoTallaRepository.existsById(id)) {
            throw new ApiException("Rango de talla no encontrado");
        }
        try {
            rangoTallaRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ApiException("No se puede eliminar: hay productos usando este rango de talla");
        }
    }
}
