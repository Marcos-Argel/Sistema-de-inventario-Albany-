package com.albany.inventory.service;

import com.albany.inventory.dto.VentaItemRequest;
import com.albany.inventory.dto.VentaRequest;
import com.albany.inventory.entity.*;
import com.albany.inventory.exception.ApiException;
import com.albany.inventory.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class VentaServiceTest {

    @Mock private VentaRepository ventaRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private MovimientoInventarioRepository movimientoRepository;

    @InjectMocks private VentaService ventaService;

    private Usuario vendedor;

    @BeforeEach
    void setUp() {
        vendedor = Usuario.builder().id(1L).username("vendedor").rol(Rol.VENDEDOR).build();
        lenient().when(usuarioRepository.findByUsername("vendedor")).thenReturn(Optional.of(vendedor));
        // Simula el INSERT: la base de datos asigna el id 42 a la venta
        lenient().when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> {
            Venta v = inv.getArgument(0);
            if (v.getId() == null) v.setId(42L);
            return v;
        });
    }

    private Producto producto(long id, int cantidad, String precio) {
        Producto p = Producto.builder()
                .id(id).codigo("ALB-" + id).nombre("Producto " + id)
                .cantidad(cantidad).precio(new BigDecimal(precio)).activo(true)
                .build();
        lenient().when(productoRepository.findByIdForUpdate(id)).thenReturn(Optional.of(p));
        return p;
    }

    private VentaItemRequest item(long productoId, int cantidad) {
        VentaItemRequest item = new VentaItemRequest();
        item.setProductoId(productoId);
        item.setCantidad(cantidad);
        return item;
    }

    private VentaRequest venta(VentaItemRequest... items) {
        VentaRequest req = new VentaRequest();
        req.setItems(List.of(items));
        return req;
    }

    @Test
    void ventaCorrectaDescuentaStockYCalculaTotal() {
        Producto body = producto(1L, 10, "25000");
        Producto pijama = producto(2L, 5, "39900.50");

        Venta resultado = ventaService.registrarVenta(venta(item(1L, 3), item(2L, 2)), "vendedor");

        assertThat(body.getCantidad()).isEqualTo(7);
        assertThat(pijama.getCantidad()).isEqualTo(3);
        assertThat(resultado.getDetalles()).hasSize(2);
        // 3 x 25000 + 2 x 39900.50 = 154801.00, sin errores de redondeo
        assertThat(resultado.getTotal()).isEqualByComparingTo("154801.00");
        verify(movimientoRepository, times(2)).save(any(MovimientoInventario.class));
    }

    @Test
    void numeroDeFacturaSeDerivaDelId() {
        producto(1L, 10, "1000");

        Venta resultado = ventaService.registrarVenta(venta(item(1L, 1)), "vendedor");

        assertThat(resultado.getNumeroFactura()).isEqualTo("FAC-000042");
    }

    @Test
    void stockInsuficienteNoDescuentaNada() {
        Producto conStock = producto(1L, 10, "1000");
        producto(2L, 1, "1000");

        assertThatThrownBy(() -> ventaService.registrarVenta(venta(item(1L, 2), item(2L, 5)), "vendedor"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Stock insuficiente");

        assertThat(conStock.getCantidad()).isEqualTo(10);
        verify(ventaRepository, never()).save(any());
        verify(movimientoRepository, never()).save(any());
    }

    @Test
    void mismoProductoEnVariasLineasSeValidaPorElTotal() {
        Producto p = producto(1L, 5, "1000");

        // 3 + 3 = 6 > 5: antes cada linea pasaba la validacion por separado
        assertThatThrownBy(() -> ventaService.registrarVenta(venta(item(1L, 3), item(1L, 3)), "vendedor"))
                .isInstanceOf(ApiException.class);

        assertThat(p.getCantidad()).isEqualTo(5);
    }

    @Test
    void productoInactivoNoSePuedeVender() {
        Producto p = producto(1L, 10, "1000");
        p.setActivo(false);

        assertThatThrownBy(() -> ventaService.registrarVenta(venta(item(1L, 1)), "vendedor"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("ya no está disponible");
    }

    @Test
    void ventaSinProductosFalla() {
        VentaRequest vacia = new VentaRequest();
        vacia.setItems(List.of());

        assertThatThrownBy(() -> ventaService.registrarVenta(vacia, "vendedor"))
                .isInstanceOf(ApiException.class);
    }
}
