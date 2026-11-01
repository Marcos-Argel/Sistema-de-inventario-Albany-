package com.albany.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CompraItemRequest {
    @NotNull
    private Long productoId;
    @NotNull
    @Positive
    private Integer cantidad;
    @NotNull
    @PositiveOrZero
    private BigDecimal costoUnitario;
}
