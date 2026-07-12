package com.albany.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class MovimientoRequest {
    @NotNull
    private Long productoId;
    @NotNull
    private String tipo; // ENTRADA o SALIDA
    @Positive
    private Integer cantidad;
    private String observacion;
}
