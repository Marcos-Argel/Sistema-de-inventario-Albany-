package com.albany.inventory.dto;

import com.albany.inventory.entity.MetodoPago;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VentaRequest {
    private String cliente;
    private String clienteDocumento;

    // Si no se envia se asume EFECTIVO
    private MetodoPago metodoPago;
    @PositiveOrZero
    private BigDecimal montoRecibido;

    @NotEmpty
    @Valid
    private List<VentaItemRequest> items;
}
