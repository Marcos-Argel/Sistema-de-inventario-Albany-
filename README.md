# Albany - Sistema de Clasificación e Inventario Inteligente

Sistema para la tienda de ropa infantil/bebé **Albany**: codificación por colores según rango de tallas + control digital de inventario, con roles de usuario y reportes.

## Stack
- Backend: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, MySQL
- Frontend: React 18 (Vite), React Router, Axios
- Contenedores: Docker + docker-compose

## Estructura
```
albany-inventory/
├── backend/          # API REST Spring Boot
├── frontend/          # SPA React
└── docker-compose.yml
```

## Cómo correrlo

### Opción 1: Docker (recomendado)
```bash
docker-compose up --build
```
- Frontend: http://localhost:5174
- Backend: http://localhost:8081
- MySQL (host): puerto 3307

> Los puertos de host (5174, 8081, 3307) se eligieron para no chocar con tus otros proyectos corriendo en Docker Desktop (ExamWatch, Fast & Healthy, BibliotecaSys, etc). Si alguno vuelve a marcar "puerto no disponible", cambia el primer número de ese `ports:` en `docker-compose.yml` por otro libre — el segundo número (el interno) no se toca.

### Opción 2: Manual (desarrollo)

**Backend** (necesitas MySQL corriendo en localhost:3306, usuario root/root):
```bash
cd backend
mvn spring-boot:run
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173

## Usuarios de prueba (se crean automáticamente al iniciar)
| Usuario   | Contraseña   | Rol      |
|-----------|--------------|----------|
| admin     | admin123     | ADMIN    |
| vendedor  | vendedor123  | VENDEDOR |

**Cambia estas contraseñas antes de usar el sistema en producción.**

## Funcionalidades

### Rol ADMIN
- CRUD completo de productos
- Gestión de la tabla de codificación por colores (rangos de talla)
- Gestión de categorías
- Reportes: unidades por categoría, productos con stock bajo, valor total del inventario
- Registrar entradas y salidas

### Rol VENDEDOR
- Consultar productos y su ubicación/código de color
- Registrar salidas (y entradas) de inventario
- Ver historial de movimientos

## Sistema de codificación por colores
Cada rango de talla (0-3 meses, 3-6 meses, etc.) tiene asociado un color de marbete. Al registrar un producto, se le asigna su rango de talla y automáticamente hereda el color correspondiente, que se usa físicamente en la etiqueta y estantería para ubicar la prenda en segundos.

La tabla de codificación es editable desde el panel de administrador (`/codificacion`), así que se puede ajustar sin tocar código si Albany cambia sus rangos de tallas.

## Notas para la sustentación
- El endpoint `/api/reportes/resumen` entrega los datos para el dashboard (total de productos, unidades, valor de inventario, alertas de stock bajo).
- Los movimientos de inventario quedan con trazabilidad completa: producto, tipo, cantidad, usuario que lo registró y fecha/hora.
- La eliminación de productos es lógica (campo `activo`), para no perder el historial de movimientos asociado.
