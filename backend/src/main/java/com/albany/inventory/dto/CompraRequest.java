package com.albany.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CompraRequest {
    @NotBlank
    private String proveedor;
    private String proveedorNit;
    private String facturaProveedor;
    private LocalDate fechaFactura;
    private String observacion;

    @NotEmpty
    @Valid
    private List<CompraItemRequest> items;
}
