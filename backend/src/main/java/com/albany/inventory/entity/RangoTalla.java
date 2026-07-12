package com.albany.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tabla de codificacion: asocia un rango de tallas a un color de marbete,
 * base del sistema de clasificacion inteligente de Albany.
 */
@Entity
@Table(name = "rangos_talla")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RangoTalla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String nombre; // Ej: "0-3 meses", "3-6 meses", "1-2 anos"

    @Column(nullable = false, length = 30)
    private String colorNombre; // Ej: "Rosado", "Azul", "Amarillo"

    @Column(nullable = false, length = 7)
    private String colorHex; // Ej: "#F5C4B3"

    @Column(nullable = false)
    private Integer orden; // orden de visualizacion en estantes
}
