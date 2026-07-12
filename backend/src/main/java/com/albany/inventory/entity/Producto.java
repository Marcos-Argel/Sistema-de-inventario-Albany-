package com.albany.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo; // codigo interno / etiqueta, ej: ALB-0001

    @Column(nullable = false, length = 120)
    private String nombre;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rango_talla_id", nullable = false)
    private RangoTalla rangoTalla;

    @Column(length = 40)
    private String colorPrenda; // color fisico de la prenda

    @Column(nullable = false)
    @Builder.Default
    private Integer cantidad = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockMinimo = 5;

    @Column(length = 60)
    private String ubicacion; // ej: "Estante A - Nivel 2"

    @Column(nullable = false)
    private Double precio;

    @Column(nullable = false)
    @Builder.Default
    private boolean activo = true;
}
