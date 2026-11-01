package com.albany.inventory.service;

import com.albany.inventory.dto.CompraItemRequest;
import com.albany.inventory.dto.CompraRequest;
import com.albany.inventory.entity.*;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompraServiceTest {

    @Mock private CompraRepository compraRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private MovimientoInventarioRepository movimientoRepository;

    @InjectMocks private CompraService compraService;

    @BeforeEach
    void setUp() {
        lenient().when(usuarioRepository.findByUsername("admin"))
                .thenReturn(Optional.of(Usuario.builder().id(1L).username("admin").rol(Rol.ADMIN).build()));
        // Simula el INSERT: la base de datos asigna el id 7 a la compra
        lenient().when(compraRepository.save(any(Compra.class))).thenAnswer(inv -> {
            Compra c = inv.getArgument(0);
            if (c.getId() == null) c.setId(7L);
            return c;
        });
    }

    private Producto producto(long id, int cantidad) {
        Producto p = Producto.builder().id(id).nombre("Producto " + id)
                .cantidad(cantidad).precio(new BigDecimal("50000")).activo(true).build();
        lenient().when(productoRepository.findByIdForUpdate(id)).thenReturn(Optional.of(p));
        return p;
    }

    private CompraItemRequest item(long productoId, int cantidad, String costo) {
        CompraItemRequest item = new CompraItemRequest();
        item.setProductoId(productoId);
        item.setCantidad(cantidad);
        item.setCostoUnitario(new BigDecimal(costo));
        return item;
    }

    private CompraRequest compra(CompraItemRequest... items) {
        CompraRequest req = new CompraRequest();
        req.setProveedor("  Textiles Uraba  ");
        req.setFacturaProveedor("FV-889");
        req.setItems(List.of(items));
        return req;
    }

    @Test
    void compraSumaStockYCalculaTotal() {
        Producto a = producto(1L, 2);
        Producto b = producto(2L, 0);

        Compra resultado = compraService.registrarCompra(compra(item(1L, 10, "18000"), item(2L, 4, "22500.50")), "admin");

        assertThat(a.getCantidad()).isEqualTo(12);
        assertThat(b.getCantidad()).isEqualTo(4);
        // 10 x 18000 + 4 x 22500.50 = 270002.00
        assertThat(resultado.getTotal()).isEqualByComparingTo("270002.00");
        assertThat(resultado.getNumeroCompra()).isEqualTo("COM-000007");
        assertThat(resultado.getProveedor()).isEqualTo("Textiles Uraba");
        assertThat(resultado.getFacturaProveedor()).isEqualTo("FV-889");
    }

    @Test
    void cadaLineaGeneraMovimientoDeEntrada() {
        producto(1L, 0);

        compraService.registrarCompra(compra(item(1L, 5, "1000")), "admin");

        ArgumentCaptor<MovimientoInventario> captor = ArgumentCaptor.forClass(MovimientoInventario.class);
        verify(movimientoRepository).save(captor.capture());
        assertThat(captor.getValue().getTipo()).isEqualTo(TipoMovimiento.ENTRADA);
        assertThat(captor.getValue().getCantidad()).isEqualTo(5);
        assertThat(captor.getValue().getObservacion()).contains("COM-000007");
    }

    @Test
    void productoInexistenteNoModificaNada() {
        Producto a = producto(1L, 3);
        when(productoRepository.findByIdForUpdate(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> compraService.registrarCompra(compra(item(1L, 5, "1000"), item(99L, 1, "1000")), "admin"))
                .isInstanceOf(ApiException.class);

        assertThat(a.getCantidad()).isEqualTo(3);
        verify(compraRepository, never()).save(any());
    }
}
