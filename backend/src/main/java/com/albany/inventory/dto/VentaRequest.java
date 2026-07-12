package com.albany.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class VentaRequest {
    private String cliente;
    private String clienteDocumento;

    @NotEmpty
    @Valid
    private List<VentaItemRequest> items;
}
