package com.albany.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoRequest {
    @NotBlank
    private String codigo;
    @NotBlank
    private String nombre;
    @NotNull
    private Long categoriaId;
    @NotNull
    private Long rangoTallaId;
    private String colorPrenda;
    @PositiveOrZero
    private Integer cantidad;
    @PositiveOrZero
    private Integer stockMinimo;
    private String ubicacion;
    @NotNull
    @PositiveOrZero
    private BigDecimal precio;
}
