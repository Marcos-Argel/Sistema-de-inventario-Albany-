package com.albany.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class VentaItemRequest {
    @NotNull
    private Long productoId;
    @Positive
    private Integer cantidad;
}
