# Spec: Planes de vacunación (Medicina)

Estado: MVP implementado (fases 1–7)  
Última actualización: 2026-07-21

## 1. Objetivo

Permitir a cada clínica definir protocolos de vacunación por especie, asignarlos a un paciente (con fecha de nacimiento) y gestionar una cronología de dosis — pendientes, aplicadas (en clínica o cargadas desde ficha en papel) y vencidas — sin citas ni recordatorios en esta fase.

## 2. Decisiones cerradas

### 2.1 Producto / catálogo

| # | Decisión |
|---|----------|
| A | Nueva implementación. Crear tipo de producto global **Vacunas** (`store_product_types`, `company_id` null), análogo a `Servicios`. |
| 1 | La vacuna del plan se vincula a un **producto** de tipo Vacunas. Campos específicos del producto-vacuna se pueden extender después. |
| 14 | Solo se consideran productos tipo Vacunas. |

### 2.2 Protocolos (plantillas)

| # | Decisión |
|---|----------|
| 6 | Una clínica puede tener varios protocolos por especie (ej. «Plan Canino 1», «Plan Canino 2»). |
| 7 | **No** hay protocolos globales Vetsap; se definen **por clínica**. |
| 2 | El protocolo es una **propuesta**: al asignar / gestionar el plan del paciente se pueden **agregar u omitir** vacunas. |
| 3 | Si un producto cubre dos ítems del plan, el médico puede **quitar esos dos** y **agregar** el producto que aplica (sin modelo formal de “cubre N antígenos” en MVP). |
| 6b | **Sin raza**: el filtro del protocolo es solo por **especie**. La clínica discrimina variantes por el nombre del plan. |

### 2.3 Paciente y asignación

| # | Decisión |
|---|----------|
| 5 / 15 | Para usar el módulo el paciente **debe tener `birth_date`**. |
| 9 / 16 | Una vez seleccionado un plan, **no se puede cambiar** de protocolo (revisar después). Los pacientes quedan en la versión asignada. |
| 17 | Al asignar, se guarda **snapshot** del protocolo (nombre, ítems, reglas) para auditoría e independencia de ediciones futuras a la plantilla. |
| D | Historial incompleto: se muestra el plan completo; el médico puede **cargar dosis y fechas pasadas** (ficha en papel). |

### 2.4 Programación y estados

| # | Decisión |
|---|----------|
| 4 | Reglas iniciales por edad: **semanas desde nacimiento**, **periódicas/anuales**, **únicas**. UX: cronología en el mismo timeline del historial del paciente. |
| E | Existen **estados** por ítem/dosis programada. |
| E2 | Si se atrasa una dosis de una **serie**, se **recalculan** las dosis siguientes de esa serie. |

### 2.5 Fuera de alcance (MVP)

| # | Decisión |
|---|----------|
| A (alcance) | No generar citas ni recordatorios. |
| 8 | Integraciones (agenda, stock/lote, atención, ventas, notificaciones) **después** de la primera parte. |
| 10 | Certificados, trazabilidad legal, etc.: **después**. |

## 3. Modelo conceptual (3 capas)

```text
1. Protocolo (plantilla por clínica + especie, versionable)
     └─ Ítems: producto (tipo Vacunas) + regla de programación

2. Plan del paciente (instancia inmutable de protocolo + snapshot)
     └─ Ítems del paciente (propuestos ± agregados/omitidos)

3. Cronología / dosis programadas + aplicaciones
     └─ Eventos en el tiempo con estado (pendiente, aplicada, vencida, omitida…) + origen clínica/externo
```

### 3.1 Capa 1 — Protocolo

- Pertenece a `company_id`.
- Filtrado por `species_id` (un protocolo → una especie; varios protocolos por especie permitidos).
- Campos sugeridos: `name`, `description`, `version`, `is_active`, timestamps.
- Ítems del protocolo:
  - `product_id` (tipo Vacunas).
  - Tipo de regla: `from_birth_weeks` | `unique` | `periodic`.
  - Parámetros según tipo (`week_number`, `min_age_weeks`/`max_age_weeks` para única, `interval_months`, `series_key` solo si no es única).
  - `sort_order`.

**Versionado:** editar un protocolo publicado puede crear nueva versión; planes ya asignados **no** migran.

### 3.2 Capa 2 — Plan del paciente

- Un paciente tiene **como máximo un** plan asignado (MVP).
- Al asignar: validar `birth_date`, misma especie, snapshot, generar cronología inicial.
- Post-asignación: agregar u omitir ítems.
- **No** se permite cambiar el protocolo vinculado.

### 3.3 Capa 3 — Cronología y aplicaciones

Cada dosis es un evento del timeline unificado del paciente.

**Estados (MVP):**

| Estado | Significado |
|--------|-------------|
| `scheduled` | Programada a futuro |
| `due` | Corresponde aplicarse (ventana actual) |
| `overdue` | Pasó la fecha planificada sin aplicación |
| `administered` | Aplicada (en esta clínica o externa) |
| `omitted` | Explicitamente omitida del plan |

**Origen de aplicación** (`administered_origin`, solo si `administered`):

| Valor | UI |
|-------|-----|
| `clinic` | Badge **Aplicada** |
| `external` | Badges **Aplicada** + **Externo** (cartilla / otra clínica) |

**Recálculo de serie:** al registrar una aplicación con fecha real distinta a la planificada, recalcular fechas de dosis **posteriores no aplicadas** de la misma `series_key`.

**Producto que reemplaza varios ítems:** flujo manual (omitir + agregar); sin matching automático en MVP.

## 4. Reglas de negocio

1. Módulo usable solo si `patient.birth_date` no es null.
2. Protocolo y paciente deben compartir la misma `species_id`.
3. Productos referenciados: tipo Vacunas (global).
4. Asignación de plan: una sola vez por paciente.
5. Snapshot inmutable respecto a ediciones posteriores de la plantilla.
6. Médico puede registrar dosis pasadas como `administered` + `administered_origin` (`clinic` o `external`) con fecha ≤ hoy.
7. Retraso en dosis de serie → recalcular siguientes no cerradas de esa serie.
8. Sin raza en reglas ni filtros del módulo.
9. Sin citas, recordatorios ni descuento de stock en MVP.

---

## 5. Fases de desarrollo

### Fase 1 — UI en la ficha del paciente (definición de representación)

**Objetivo:** definir cómo se ve y se usa el plan de vacunación **antes** de modelar backend completo. La superficie principal es el **mismo timeline del historial clínico** del paciente (`PatientClinicalTimeline` en la pestaña Historial), no un tab separado.

#### 5.1.1 Contexto actual

Hoy el timeline une:

- `attention` — atenciones clínicas (draft / cerradas)
- `appointment` — citas

Orden: más reciente primero. Cabecera: «Historial clínico» + conteo de registros + menú Acciones.

#### 5.1.2 Nuevo tipo de entrada en el timeline

Se agrega un tercer kind:

- `vaccination` — dosis del plan (programada, vencida, aplicada; si externa, badge Externo)

Misma estructura visual de fila (fecha | eje | tarjeta), con:

| Elemento | Contenido |
|----------|-----------|
| Fecha | `scheduled_on` si está pendiente/vencida; `administered_on` si aplicada |
| Icono | Distinto al de atención/cita (ej. jeringa / shield) |
| Título | Nombre del producto vacuna |
| Subtítulo | Plan («Plan Canino 1») · serie/dosis si aplica · origen del ítem (protocolo / manual) |
| Badge de estado | `Programada` / `Por aplicar` / `Vencida` / `Aplicada` (+ `Externo` si aplica fuera) / `Omitida` |
| Acción | Click abre detalle / registrar aplicación (diálogos posteriores en fases de implementación) |

Las dosis **omitidas** pueden ocultarse por defecto en el filtro «Todo» o mostrarse atenuadas (definir en implementación: preferencia MVP = ocultas salvo filtro «Vacunación»).

#### 5.1.3 Filtro del timeline

En la cabecera del historial (junto al título o junto a Acciones), un control de filtro (segmented / select / tabs compactos):

| Valor | Qué muestra |
|-------|-------------|
| **Todo** (default) | Atenciones + citas + vacunación |
| **Atenciones** | Solo `attention` |
| **Citas** | Solo `appointment` |
| **Vacunación** | Solo `vaccination` |

Al filtrar «Vacunación»:

- El subtítulo del bloque puede cambiar a «Plan de vacunación» + nombre del plan asignado (si existe).
- Acciones contextuales del plan (asignar, agregar vacuna, declarar dosis) viven aquí o en el menú Acciones cuando el filtro es Vacunación / Todo.

Conteo de registros: respeta el filtro activo.

#### 5.1.4 Estados vacíos y prerequisitos (UI)

| Situación | UI |
|-----------|-----|
| Sin `birth_date` | En filtro Vacunación (o al intentar asignar): mensaje claro + CTA a completar fecha de nacimiento en la ficha. No ofrecer asignar plan. |
| Con `birth_date`, sin plan | Empty state: «Este paciente no tiene plan de vacunación» + botón **Asignar plan** (lista protocolos de la especie). |
| Con plan, sin dosis visibles | Empty state según filtro; si hay solo omitidas, indicar que hay ítems omitidos. |
| Con plan y dosis | Timeline filtrable como arriba. |

#### 5.1.5 Acciones desde la UI del paciente (MVP, sin implementar aún en esta fase)

- Asignar plan (una sola vez).
- Registrar aplicación / declarar dosis pasada (desde la tarjeta o detalle).
- Agregar vacuna al plan.
- Omitir ítem.
- **No** mostrar «Cambiar de plan».

Estas acciones se diseñan en wireframe/copy en Fase 1; se implementan cuando existan APIs (fases siguientes).

#### 5.1.6 Entregable de la Fase 1

1. Este documento como contrato de UI (sección 5.1).
2. Extensión conceptual de `TimelineEntry` con `kind: 'vaccination'`.
3. Mock o props fake opcionales en el timeline **solo si** ayuda a validar el filtro visualmente antes del backend (no obligatorio si se prefiere ir directo a Fase 2+ con datos reales).
4. Copy de empty states y labels de filtro acordados.

**Criterio de salida Fase 1:** el equipo tiene claro cómo se ve el plan en el paciente (timeline unificado + filtro) sin ambigüedad de “tab aparte” vs “mismo historial”.

---

### Fase 2 — Prerrequisito Store: tipo de producto Vacunas

**Estado: implementada**

1. Tipo de producto global **Vacunas** (`company_id` null), seeder + constante en `ProductType` (como `GLOBAL_SERVICES_NAME`).
2. Permitir crear/editar productos de clínica con ese tipo.
3. Base para selectores del módulo de planes.

---

### Fase 3 — Protocolos de vacunación (CRUD clínica)

**Estado: implementada**

1. Migraciones, modelos, policies, form requests, actions, controller, rutas Medicina.
2. UI index/form: protocolo por especie + ítems (producto Vacunas + regla de programación).
3. Validaciones de especie y tipo de producto.
4. Versionado básico / snapshot-ready al guardar.

---

### Fase 4 — Plan del paciente: asignación, snapshot y generación de dosis

**Estado: implementada**

1. `AssignVaccinationPlanAction`: exige `birth_date`, misma especie, un solo plan.
2. Persistencia de snapshot del protocolo.
3. Generación inicial de dosis (`scheduled_on`) desde reglas + `birth_date`.
4. API/props Inertia hacia la ficha del paciente (`vaccinationPlan`, `vaccinationDoses`).

---

### Fase 5 — Timeline real + acciones sobre dosis

**Estado: implementada**

1. Integrar `vaccination` en `PatientClinicalTimeline` + filtro de la Fase 1 con datos reales.
2. Acciones: administer, declare, omit, add manual.
3. Diálogos de detalle / registro de dosis.
4. Empty states y bloqueo de cambio de plan en UI.

---

### Fase 6 — Estados derivados y recálculo de series

**Estado: implementada**

1. Derivación `due` / `overdue` al listar (MVP sin job).
2. Al atrasar/adelantar una dosis aplicada de una serie, recalcular siguientes no cerradas.
3. Ajustes de badges y orden en timeline tras recálculo.

---

### Fase 7 — Permisos, navegación y pulido

**Estado: implementada**

1. Permisos / módulo en administración si aplica.
2. Entrada de menú para CRUD de protocolos.
3. Pint + lint sobre archivos tocados.
4. Tests: **omitidos por ahora** (convención actual del repo).

---

## 6. Modelo de datos (borrador)

Nombres orientativos (`medic_*`):

- `medic_vaccination_protocols` — `company_id`, `species_id`, `name`, `description`, `version`, `is_active`
- `medic_vaccination_protocol_items` — `protocol_id`, `product_id`, `schedule_type`, params, `series_key`, `sort_order`
- `medic_patient_vaccination_plans` — `patient_id` unique, `protocol_id`, `protocol_snapshot` JSON, `assigned_at`, `assigned_by`
- `medic_patient_vaccination_doses` — timeline: `plan_id`, `product_id`, `series_key`, `sequence`, `scheduled_on`, `administered_on`, `status`, `administered_origin` (`clinic`|`external`|null), `source`, `notes`, `recorded_by`

## 7. Criterios de aceptación (MVP)

- [ ] Existe tipo de producto global «Vacunas».
- [ ] Clínica crea ≥2 protocolos para la misma especie.
- [ ] Paciente sin fecha de nacimiento no puede asignar plan.
- [ ] Paciente con plan ve dosis en el **mismo** timeline del historial.
- [ ] El filtro permite **Todo** / **Atenciones** / **Citas** / **Vacunación**.
- [ ] Médico declara dosis pasada y aparece en el timeline.
- [ ] Médico omite ítems y agrega otro producto; el timeline refleja el cambio.
- [ ] Al aplicar tarde una dosis de serie, las siguientes no aplicadas cambian de fecha.
- [ ] No hay UI ni API para cambiar de protocolo una vez asignado.
- [ ] Editar la plantilla no altera snapshot ni dosis de pacientes ya asignados.

## 8. Referencias en el codebase

- Timeline actual: `resources/js/pages/medic/patients/patient-clinical-timeline.tsx`
- Cabecera historial: `resources/js/pages/medic/patients/patient-edit-tab-panel.tsx`
- Paciente: `app/Models/Medic/Patient.php` (`species_id`, `birth_date`)
- Productos / tipos: `app/Models/Store/ProductType.php` (`GLOBAL_SERVICES_NAME`)
- Patrón plantilla por especie (referencia): `ClinicalTemplate`
