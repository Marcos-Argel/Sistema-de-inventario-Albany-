package com.albany.inventory.config;

import com.albany.inventory.entity.*;
import com.albany.inventory.repository.CategoriaRepository;
import com.albany.inventory.repository.RangoTallaRepository;
import com.albany.inventory.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final RangoTallaRepository rangoTallaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsuarios();
        seedRangosTalla();
        seedCategorias();
    }

    private void seedUsuarios() {
        if (!usuarioRepository.existsByUsername("admin")) {
            usuarioRepository.save(Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador Albany")
                    .rol(Rol.ADMIN)
                    .activo(true)
                    .build());
        }
        if (!usuarioRepository.existsByUsername("vendedor")) {
            usuarioRepository.save(Usuario.builder()
                    .username("vendedor")
                    .password(passwordEncoder.encode("vendedor123"))
                    .nombreCompleto("Vendedor Albany")
                    .rol(Rol.VENDEDOR)
                    .activo(true)
                    .build());
        }
    }

    private void seedRangosTalla() {
        if (rangoTallaRepository.count() > 0) return;

        rangoTallaRepository.save(RangoTalla.builder().nombre("0-3 meses").colorNombre("Rosado").colorHex("#F5C4B3").orden(1).build());
        rangoTallaRepository.save(RangoTalla.builder().nombre("3-6 meses").colorNombre("Morado").colorHex("#AFA9EC").orden(2).build());
        rangoTallaRepository.save(RangoTalla.builder().nombre("6-9 meses").colorNombre("Verde agua").colorHex("#5DCAA5").orden(3).build());
        rangoTallaRepository.save(RangoTalla.builder().nombre("9-12 meses").colorNombre("Rosa fuerte").colorHex("#ED93B1").orden(4).build());
        rangoTallaRepository.save(RangoTalla.builder().nombre("1-2 anos").colorNombre("Amarillo").colorHex("#FAC775").orden(5).build());
        rangoTallaRepository.save(RangoTalla.builder().nombre("2-4 anos").colorNombre("Azul").colorHex("#85B7EB").orden(6).build());
    }

    private void seedCategorias() {
        if (categoriaRepository.count() > 0) return;

        categoriaRepository.save(Categoria.builder().nombre("Body").descripcion("Bodies de bebe").build());
        categoriaRepository.save(Categoria.builder().nombre("Pijama").descripcion("Pijamas infantiles").build());
        categoriaRepository.save(Categoria.builder().nombre("Vestido").descripcion("Vestidos infantiles").build());
        categoriaRepository.save(Categoria.builder().nombre("Conjunto").descripcion("Conjuntos de ropa").build());
        categoriaRepository.save(Categoria.builder().nombre("Calzado").descripcion("Zapatos y zapatillas").build());
    }
}
