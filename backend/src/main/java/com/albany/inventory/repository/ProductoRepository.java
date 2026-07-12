package com.albany.inventory.repository;

import com.albany.inventory.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    boolean existsByCodigo(String codigo);
    List<Producto> findByActivoTrue();
    List<Producto> findByCantidadLessThanEqualAndActivoTrue(Integer stockMinimo);
}
