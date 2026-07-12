package com.albany.inventory.service;

import com.albany.inventory.dto.UsuarioRequest;
import com.albany.inventory.entity.Rol;
import com.albany.inventory.entity.Usuario;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Usuario crear(UsuarioRequest req) {
        if (usuarioRepository.existsByUsername(req.getUsername())) {
            throw new ApiException("Ya existe un usuario con ese nombre de usuario");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new ApiException("La contraseña es obligatoria para un usuario nuevo");
        }

        Usuario usuario = Usuario.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .nombreCompleto(req.getNombreCompleto())
                .rol(parseRol(req.getRol()))
                .activo(req.getActivo() == null || req.getActivo())
                .build();

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, UsuarioRequest req) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ApiException("Usuario no encontrado"));

        usuario.setNombreCompleto(req.getNombreCompleto());
        usuario.setRol(parseRol(req.getRol()));
        if (req.getActivo() != null) {
            usuario.setActivo(req.getActivo());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }

    public void cambiarEstado(Long id, boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ApiException("Usuario no encontrado"));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }

    private Rol parseRol(String rol) {
        try {
            return Rol.valueOf(rol.toUpperCase());
        } catch (Exception e) {
            throw new ApiException("Rol inválido, use ADMIN o VENDEDOR");
        }
    }
}
