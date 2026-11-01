package com.albany.inventory.dto;

import jakarta.validation.constraints.NotBlank;
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
    // Motivo del ajuste manual: DANADO, DEVOLUCION, CONTEO, REGALO, OTRO...
    @NotBlank(message = "Debe indicar el motivo del ajuste")
    private String motivo;
    private String observacion;
}
