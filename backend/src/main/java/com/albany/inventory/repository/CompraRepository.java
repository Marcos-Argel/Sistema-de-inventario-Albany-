package com.albany.inventory.repository;

import com.albany.inventory.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompraRepository extends JpaRepository<Compra, Long> {
    List<Compra> findAllByOrderByFechaDesc();
}
