package com.albany.inventory.repository;

import com.albany.inventory.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findAllByOrderByFechaDesc();
    List<Venta> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
    long count();
}
