package com.albany.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UsuarioRequest {
    @NotBlank
    private String username;

    // Opcional al editar: si viene vacio, no se cambia la contrasena
    private String password;

    @NotBlank
    private String nombreCompleto;

    @NotNull
    private String rol; // ADMIN o VENDEDOR

    private Boolean activo;
}
