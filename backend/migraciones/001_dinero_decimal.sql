-- Hibernate (ddl-auto=update) no cambia el tipo de columnas existentes,
-- asi que las columnas de dinero se pasan de DOUBLE a DECIMAL a mano.
-- Ejecutar una sola vez en bases de datos creadas antes de este cambio.
ALTER TABLE productos      MODIFY precio          DECIMAL(12,2) NOT NULL;
ALTER TABLE ventas         MODIFY subtotal        DECIMAL(12,2) NOT NULL;
ALTER TABLE ventas         MODIFY total           DECIMAL(12,2) NOT NULL;
ALTER TABLE detalle_ventas MODIFY precio_unitario DECIMAL(12,2) NOT NULL;
ALTER TABLE detalle_ventas MODIFY subtotal        DECIMAL(12,2) NOT NULL;
