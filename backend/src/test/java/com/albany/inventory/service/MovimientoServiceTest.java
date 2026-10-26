package com.albany.inventory.service;

import com.albany.inventory.dto.MovimientoRequest;
import com.albany.inventory.entity.*;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.MovimientoInventarioRepository;
import com.albany.inventory.repository.ProductoRepository;
import com.albany.inventory.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovimientoServiceTest {

    @Mock private MovimientoInventarioRepository movimientoRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private UsuarioRepository usuarioRepository;

    @InjectMocks private MovimientoService movimientoService;

    private Producto producto;

    @BeforeEach
    void setUp() {
        producto = Producto.builder().id(1L).nombre("Body").cantidad(10).precio(new BigDecimal("1000")).build();
        when(productoRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(producto));
        when(usuarioRepository.findByUsername("admin"))
                .thenReturn(Optional.of(Usuario.builder().id(1L).username("admin").rol(Rol.ADMIN).build()));
        lenient().when(movimientoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private MovimientoRequest movimiento(String tipo, int cantidad) {
        MovimientoRequest req = new MovimientoRequest();
        req.setProductoId(1L);
        req.setTipo(tipo);
        req.setCantidad(cantidad);
        return req;
    }

    @Test
    void entradaSumaStock() {
        movimientoService.registrar(movimiento("ENTRADA", 5), "admin");
        assertThat(producto.getCantidad()).isEqualTo(15);
    }

    @Test
    void salidaRestaStock() {
        MovimientoInventario m = movimientoService.registrar(movimiento("salida", 4), "admin");
        assertThat(producto.getCantidad()).isEqualTo(6);
        assertThat(m.getTipo()).isEqualTo(TipoMovimiento.SALIDA);
    }

    @Test
    void salidaMayorAlStockSeRechaza() {
        assertThatThrownBy(() -> movimientoService.registrar(movimiento("SALIDA", 11), "admin"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Stock insuficiente");
        assertThat(producto.getCantidad()).isEqualTo(10);
        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void tipoInvalidoSeRechaza() {
        assertThatThrownBy(() -> movimientoService.registrar(movimiento("PRESTAMO", 1), "admin"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Tipo de movimiento invalido");
    }
}
