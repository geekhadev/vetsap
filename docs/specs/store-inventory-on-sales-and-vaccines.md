# Spec: Descuento de inventario — ventas (POS) y vacunas

Estado: **implementado** (fases A–D)  
Última actualización: 2026-07-23  
Relacionado:

- [`medic-vaccination-billing-and-appointments.md`](./medic-vaccination-billing-and-appointments.md) (Fase C: stock/lote)
- [`medic-vaccination-plans.md`](./medic-vaccination-plans.md) (MVP clínico; stock fuera de alcance original)

## 1. Objetivo

Definir **cuándo y cómo** se descuenta stock de `store_products` al vender productos en el POS (PTV) y, en el diseño, al **aplicar una vacuna en clínica**, de forma que:

1. Toda venta de producto con `product_id` real baje inventario al **emitir/cobrar** el documento.
2. Una unidad física **nunca se descuente dos veces** (aplicar vacuna + cobrar la misma dosis en POS).
3. Quede **auditoría** vía movimiento de inventario vinculado al origen (documento de venta o dosis aplicada).
4. Se pueda aplicar vacuna **sin** cobrarla en POS y aun así registrar la salida de stock (fase posterior al MVP POS).
5. Cada clínica pueda **activar/desactivar la validación** de stock suficiente (sin dejar de registrar movimientos).

**Terminología**

| Término | Significado en este spec |
|---------|--------------------------|
| Descuento (precio) | `%` / montos en `sale_documents` / detalles — **no** es inventario |
| Descuento / baja de stock | Salida de inventario (`decrement` de `product.stock` + movimiento) |
| PTV / POS | Punto de venta; cobro de borradores → documento `Issued` |
| Validar stock | Setting: bloquear operación si no hay unidades suficientes |

---

## 2. Situación actual (código)

| Área | Comportamiento hoy |
|------|--------------------|
| Cobro POS (`ChargePosSaleAction`) | Emite documento + pagos; **no toca stock** |
| Agregar producto a borrador | Sin validación de stock |
| Vacuna clinic → borrador (`SyncVaccinationDoseToDraftSaleAction`) | Línea `product` con `patient_vaccination_dose_id`; **sin stock** |
| Único cambio de stock | `CreateInventoryMovementAction` (UI manual Store) |
| Categoría seed salida **«Venta»** | Existe; **no** la usa el POS |
| Categoría **«Vacunación»** | **No existe** aún (se agrega global) |
| `store_inventory_movements` | Sin FK a venta ni a dosis |
| `store_products.stock` | `unsignedInteger` → **no admite negativos** hoy |
| Configuración Inventario | **No existe** |
| Eliminar documento de venta | Borra el documento; no hay movimiento ni stock que revertir |
| Clear aplicación de vacuna | Revierte acto clínico; **no** toca venta (v1 cobro) ni stock |

---

## 3. Casos de uso (diseño)

| # | Escenario | Efecto en stock | Movimiento asociado a | Categoría |
|---|-----------|-----------------|------------------------|-----------|
| **V1** | Producto cobrado en POS, con `product_id` válido | Baja stock al emitir | `SaleDocument` | **Venta** |
| **V2** | Vacuna vendida en POS **sin** aplicar en plan | Igual que V1 | `SaleDocument` | **Venta** |
| **V3** | Vacuna aplicada en clínica y luego cobrada en POS (misma dosis) | Baja **una sola vez** al aplicar; cobro POS no vuelve a descontar | Preferente: dosis | **Vacunación** |
| **V4** | Vacuna aplicada y **no** cobrada en POS | Baja al aplicar (fase B) | Dosis | **Vacunación** |
| **V5** | Línea custom / sin `product_id` | **No** afecta stock | — | — |
| **V6** | Aplicación **externa** | **No** afecta stock | — | — |

> **MVP de implementación (§7):** solo **V1 / V2 / V5** vía cobro POS. **V3 / V4** diseñados para Fase B.

---

## 4. Decisiones cerradas

### 4.1 Momento del descuento en POS — **al guardar/emitir el documento**

Al cobrar (`ChargePosSaleAction` → documento `Issued`):

1. Considerar solo detalles con **`product_id` no nulo** y producto existente de la clínica.
2. Agregar cantidades por `product_id`.
3. Crear **movimiento de salida** vinculado al **documento de venta**.
4. Categoría: salida **«Venta»** (seed global existente).

No se descuenta al agregar al borrador ni al sincronizar atención/vacuna al draft (MVP POS).

### 4.2 Qué líneas descuentan

- Sí: líneas con `product_id` de un `store_products` de la compañía.
- No: servicios, custom sin producto, `product_id` inválido.
- Todos los tipos de producto (incl. Vacunas) con la salvedad de **no doble descuento** (§4.3).

### 4.3 Vacunas — dos caminos, un solo descuento físico

```text
Opción A — Aplicar en plan → (opcional) cobrar en POS
  Aplicar clinic  →  salida + movimiento ↔ dosis (categoría «Vacunación»)
  Cobrar en POS   →  NO vuelve a salir stock por esa dosis

Opción B — Vender en POS sin aplicar en el plan
  Cobrar en POS   →  salida + movimiento ↔ SaleDocument (categoría «Venta»)
```

**Idempotencia:** si la línea tiene `patient_vaccination_dose_id` y esa dosis **ya** tiene movimiento de salida, el cobro **omite** esa cantidad. Si aún no (MVP sin Fase B), el cobro POS **sí** descuenta.

### 4.4 Trazabilidad — movimiento siempre con origen

Cada baja automática crea un `InventoryMovement` (nunca solo `decrement` silencioso).

| Origen | Cuándo | Categoría |
|--------|--------|-----------|
| `SaleDocument` | Cobro POS (MVP) | **Venta** |
| `PatientVaccinationDose` | Aplicación clinic (Fase B) | **Vacunación** |

Un movimiento por documento (o por dosis) con N detalles producto/cantidad.

### 4.5 Validación de stock — setting por clínica

#### Config UI

Nueva sección de configuración **«Inventario»** (mismo patrón que calendario: `CompanySetting` + página Inertia bajo `configuration/`).

- Switch: **«Validar stock en ventas»** (label a afinar en UI).
- **Default: activo** (`true`) si no hay valor guardado.
- **Vacunas heredan el mismo setting** (cobro POS y, en Fase B, aplicar dosis).

Clave sugerida (estilo calendario): `inventory.validate_stock_on_sales` → `'1'` / `'0'`.

#### Comportamiento

| Setting | ¿Hay stock suficiente? | Resultado |
|---------|------------------------|-----------|
| **ON** (default) | Sí | Emite + crea movimiento de salida + baja stock |
| **ON** | No | **Bloquea**: no emite venta / no aplica vacuna; no crea movimiento |
| **OFF** | Sí o No | Emite / aplica **igual**; **siempre crea movimiento** y actualiza `stock` (puede quedar **negativo**) |

#### Opinión de diseño: ¿registrar movimientos si el stock pasa a negativo?

**Sí — siempre registrar el movimiento**, también con validación OFF.

Motivo: el número de stock es un **saldo**, no un inventario “solo positivo”. Si se vende sin stock y **no** se registra la salida:

1. Stock queda en `0` aunque ya se entregaron unidades.
2. Una entrada posterior (compra) **infla** el saldo: se cargan 10 y el sistema muestra 10, pero en realidad solo quedan 8 → stock **mentiroso al alza**.
3. Con movimiento + saldo negativo (`-2`) y luego entrada `+10` → saldo `8`: el negativo “se come” el positivo **y eso es correcto**; refleja unidades ya consumidas.

Conclusión:

- Setting OFF = **no bloquear**, no = **no llevar inventario**.
- Inventario siempre se mueve; solo cambia si la operación **falla** por falta de unidades.

#### Implicación técnica

Hoy `stock` es `unsignedInteger`. Para permitir negativos hace falta migrar a **entero con signo** (`integer` / signed). Sin eso, MySQL no puede representar el caso OFF + sobregiro.

### 4.6 Reversión al eliminar — **movimiento compensatorio (R2)**

Al eliminar un documento de venta que ya generó salida, o al clear de una dosis que ya bajó stock (aunque la dosis ya estuviera cobrada en POS):

1. **Hard delete** de venta se mantiene como hoy.
2. **No borrar** el movimiento histórico de salida.
3. Crear **un movimiento de entrada por cada salida** a revertir (espejo 1:1 de productos/cantidades).
4. Vincular con `reversed_movement_id` en la entrada → apunta al exit original (auditoría y gestión posterior).
5. Categorías globales nuevas de **entrada**:
   - **«Anulación de venta»** — al eliminar documento de venta.
   - **«Anulación de vacunación»** — al clear de dosis aplicada.
6. Idempotencia: si el exit ya tiene entrada con ese `reversed_movement_id`, no crear otra.

### 4.7 Categorías globales nuevas (seed)

`company_id = null`, mismas para todas las clínicas:

```text
Exit globals:
  Venta
  Uso interno
  Ajuste de salida
  Vacunación              ← nueva (Fase B: apply clinic)

Entry globals:
  Compra
  Ajuste de entrada
  Anulación de venta      ← nueva (Fase D: delete SaleDocument)
  Anulación de vacunación ← nueva (Fase D: clear dosis)
```

### 4.8 Alcance MVP de código

**Fase A:** cobro POS + setting Inventario + origen en movimientos + stock signed + categoría Vacunación en seed (aunque aún no se use).

Fuera del primer corte:

- Descuento al aplicar vacuna (V3/V4) — Fase B.
- Lotes / trazabilidad legal.
- Nota de crédito / anulación formal SII.
- Reversión al delete/clear — Fase D (diseño R2 cerrado; detalle §8.2).

---

## 5. Modelo de datos (borrador)

### 5.1 Movimientos

```text
store_inventory_movements
  + origin_type              nullable string
  + origin_id                nullable uuid
  + reversed_movement_id     nullable uuid FK → store_inventory_movements  -- compensación R2
  -- índices: (company_id, origin_type, origin_id)
  -- unique parcial opcional: un exit automático no-revertido por origen
```

### 5.2 Producto

```text
store_products.stock
  unsignedInteger → integer (signed), default 0
```

### 5.3 Settings

```text
configuration_company_settings
  key: inventory.validate_stock_on_sales
  value: '1' | '0'
  ausencia de fila ⇒ tratar como '1' (ON)
```

### 5.4 Categorías

`MovementCategoriesSeeder`:

- Exit: **Vacunación**
- Entry: **Anulación de venta**, **Anulación de vacunación**

### 5.5 Señal “dosis ya bajó stock”

1. Inferir: movimiento con `origin = dose` no revertido, o  
2. Columna en dosis: `inventory_movement_id`.

Preferencia: **(1) o (2)**; implementar en Fase B/C.

---

## 6. Flujos

### 6.1 MVP — Cobro POS

```text
1. Cajero cobra → ChargePosSaleAction
2. Misma transacción DB:
   a. Emitir documento(s) + pagos
   b. Recolectar líneas con product_id válido
   c. Excluir cantidades ya descontadas por dosis (cuando exista señal)
   d. Si validate_stock ON y stock insuficiente → ValidationException + rollback
   e. Si hay cantidad a salir:
        CreateInventoryMovement (exit, «Venta», origin = SaleDocument)
        → stock puede quedar negativo solo si validate_stock OFF
3. Respuesta OK / errores
```

### 6.2 Fase vacunas — Aplicar en clínica

```text
1. Administer clinic (no externa)
2. Sync línea a borrador POS (como hoy)
3. Si validate_stock ON y sin stock → bloquear apply
4. Movimiento exit origin = dosis, categoría «Vacunación»
```

### 6.3 Fase vacunas — Luego cobrar en POS

```text
1. Charge con patient_vaccination_dose_id
2. Dosis ya con salida → omitir en movimiento de venta
3. Resto de productos: reglas normales
```

### 6.4 Eliminar venta / clear dosis (Fase D)

```text
1. Resolver salida(s) del origen (SaleDocument o dosis)
2. Por cada exit sin reversed_movement_id apuntándole:
     crear entry 1:1 (mismas líneas), reversed_movement_id = exit.id
     categoría «Anulación de venta» | «Anulación de vacunación»
3. Si ya compensado → skip idempotente
4. Luego hard-delete venta / clear dosis
   (clear dosis ya cobrada: igual compensa stock; la línea de venta no se toca en v1 cobro)
```

---

## 7. Fases de implementación sugeridas

| Fase | Qué |
|------|-----|
| **A — POS + config** | Setting Inventario; cobro crea movimiento ↔ SaleDocument; stock signed; bloquear según setting; seed categorías nuevas |
| **B — Vacunas apply** | Apply clinic → movimiento ↔ dosis, categoría Vacunación; mismo setting |
| **C — Idempotencia** | Cobro omite dosis ya descontadas |
| **D — Reversiones** | Delete venta / clear dosis → entry 1:1 con `reversed_movement_id` + cats. anulación |
| **E — Lotes** | Spec aparte |

---

## 8. Flecos menores (no bloquean Fase A)

1. Merge de borradores al cobrar → **un movimiento por documento emitido**.
2. Unique por origen para no duplicar salidas en doble submit.
3. Ventas históricas: **sin backfill**; solo hacia adelante.
4. Label UX del switch y copy de ayuda.
5. Movimientos **manuales** UI: propuesta **mismas reglas** de validación vía `CreateInventoryMovementAction` (confirmar al implementar).

---

## 9. Criterios de aceptación (Fase A)

- [ ] Existe configuración **Inventario** con switch validar stock; default **ON**.
- [ ] Al cobrar con productos válidos: movimiento salida «Venta» ligado al `SaleDocument` y baja `stock`.
- [ ] Setting ON + stock insuficiente → no emite ni crea movimiento.
- [ ] Setting OFF + stock insuficiente → emite, crea movimiento, `stock` puede ser negativo.
- [ ] `stock` es entero con signo.
- [ ] Seed incluye globales: exit **Vacunación**; entry **Anulación de venta** y **Anulación de vacunación**.
- [ ] Líneas sin `product_id` no generan salida.
- [ ] Vacunas en cobro POS (sin apply stock aún) se comportan como producto; mismo setting.
- [ ] Movimientos manuales siguen funcionando.
- [ ] (Fase D) Delete venta / clear dosis → entry 1:1 con `reversed_movement_id` y categoría de anulación.

---

## 10. Referencias en el codebase

| Área | Ruta |
|------|------|
| Cobro POS | `app/Actions/Sale/SaleDocuments/ChargePosSaleAction.php` |
| Crear movimiento / stock | `app/Actions/Store/InventoryMovements/CreateInventoryMovementAction.php` |
| Categorías seed | `database/seeders/Store/MovementCategoriesSeeder.php` |
| Company settings | `app/Models/CompanySetting.php`, `app/Actions/Configuration/CompanySettings/*` |
| Patrón UI settings | `resources/js/pages/configuration/calendar-settings/` |
| Sync vacuna → draft | `app/Actions/Medic/PatientVaccinations/SyncVaccinationDoseToDraftSaleAction.php` |
| Apply / clear vacuna | `app/Actions/Medic/PatientVaccinations/*` |
| Delete venta | `app/Actions/Sale/SaleDocuments/DeleteSaleDocumentAction.php` |

---

## 11. Resumen de decisiones

| # | Tema | Estado | Decisión |
|---|------|--------|----------|
| D1 | Momento POS | **Cerrado** | Al emitir/cobrar el documento |
| D2 | Qué líneas | **Cerrado** | Solo con `product_id` existente |
| D3 | Vacuna plan + POS | **Cerrado (diseño)** | Un solo descuento; no duplicar |
| D4 | Vacuna solo POS | **Cerrado** | Como producto normal (cat. Venta) |
| D5 | Vacuna apply sin cobro | **Cerrado (diseño)** | Movimiento ↔ dosis, cat. **Vacunación** |
| D6 | Trazabilidad | **Cerrado** | Movimiento con origen siempre |
| D7 | Validar stock | **Cerrado** | Config Inventario, switch, default **ON**; vacunas heredan |
| D7b | Setting OFF | **Cerrado (opinión adoptada)** | No bloquear; **sí** crear movimiento; stock puede ser negativo |
| D8 | Reversión | **Cerrado** | Entry compensatoria 1:1 + `reversed_movement_id` |
| D8b | Hard delete venta | **Cerrado** | Se mantiene como hoy |
| D8c | Clear dosis ya cobrada | **Cerrado** | Sí compensa stock (venta no se toca en v1 cobro) |
| D8d | Cats. anulación | **Cerrado** | Globales **«Anulación de venta»** y **«Anulación de vacunación»** |
| D9 | Categoría vacunación | **Cerrado** | Global **«Vacunación»** (seed) |
| D10 | MVP código | **Cerrado** | Fase A = POS + config + stock signed + seed cats. |
